import { supabase } from '../utils/supabase/client';

type CircleType = 'commute' | 'corporate' | 'university' | 'women_only' | 'family' | 'professional';

interface Circle {
  id: string;
  name: string;
  type: CircleType;
  description: string;
  route: { from: string; to: string };
  schedule: string[];
  members: number;
  isPrivate: boolean;
  adminId: string;
}

export const socialCirclesService = {
  // Create a new circle
  async createCircle(data: {
    name: string;
    type: CircleType;
    description: string;
    route: { from: string; to: string };
    schedule: string[];
    isPrivate: boolean;
    adminId: string;
  }) {
    if (!supabase) throw new Error('Service not available');

    const { data: circle, error } = await supabase.from('social_circles').insert({
      name: data.name,
      type: data.type,
      description: data.description,
      route_from: data.route.from,
      route_to: data.route.to,
      schedule: data.schedule,
      is_private: data.isPrivate,
      admin_id: data.adminId,
      created_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;

    // Auto-join creator
    await this.joinCircle(circle.id, data.adminId);

    return circle;
  },

  // Join a circle
  async joinCircle(circleId: string, userId: string) {
    if (!supabase) return;

    await supabase.from('circle_members').insert({
      circle_id: circleId,
      user_id: userId,
      joined_at: new Date().toISOString()
    });
  },

  // Leave a circle
  async leaveCircle(circleId: string, userId: string) {
    if (!supabase) return;

    await supabase.from('circle_members')
      .delete()
      .eq('circle_id', circleId)
      .eq('user_id', userId);
  },

  // Get user's circles
  async getUserCircles(userId: string) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('circle_members')
      .select('circle_id, social_circles(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(m => m.social_circles) || [];
  },

  // Search circles
  async searchCircles(filters: {
    type?: CircleType;
    route?: { from: string; to: string };
    keyword?: string;
  }) {
    if (!supabase) return [];

    let query = supabase.from('social_circles').select('*').eq('is_private', false);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.route) {
      query = query
        .ilike('route_from', `%${filters.route.from}%`)
        .ilike('route_to', `%${filters.route.to}%`);
    }

    if (filters.keyword) {
      query = query.or(`name.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;
    return data || [];
  },

  // Get circle details with members
  async getCircleDetails(circleId: string) {
    if (!supabase) throw new Error('Service not available');

    const [circleData, membersData] = await Promise.all([
      supabase.from('social_circles').select('*').eq('id', circleId).single(),
      supabase.from('circle_members')
        .select('user_id, joined_at, profiles(full_name, avatar_url, rating_as_driver)')
        .eq('circle_id', circleId)
    ]);

    if (circleData.error) throw circleData.error;

    return {
      ...circleData.data,
      members: membersData.data || []
    };
  },

  // Post message to circle
  async postToCircle(circleId: string, userId: string, message: string) {
    if (!supabase) return;

    await supabase.from('circle_messages').insert({
      circle_id: circleId,
      user_id: userId,
      message,
      created_at: new Date().toISOString()
    });
  },

  // Get circle messages
  async getCircleMessages(circleId: string, limit = 50) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('circle_messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.reverse() || [];
  },

  // Create recurring trip for circle
  async createCircleTrip(circleId: string, driverId: string, date: string, time: string) {
    if (!supabase) throw new Error('Service not available');

    const circle = await this.getCircleDetails(circleId);

    const { data, error } = await supabase.from('trips').insert({
      driver_id: driverId,
      from_location: circle.route_from,
      to_location: circle.route_to,
      departure_date: date,
      departure_time: time,
      trip_type: 'wasel',
      status: 'published',
      circle_id: circleId,
      available_seats: 4,
      price_per_seat: 0 // Free for circle members
    }).select().single();

    if (error) throw error;
    return data;
  },

  // Get recommended circles for user
  async getRecommendedCircles(userId: string) {
    if (!supabase) return [];

    // Get user's common routes
    const { data: userTrips } = await supabase
      .from('bookings')
      .select('trip:trips(from_location, to_location)')
      .eq('passenger_id', userId)
      .limit(10);

    if (!userTrips || userTrips.length === 0) return [];

    // Find circles matching user's routes
    const routes = userTrips.map(t => t.trip);
    const circles = await this.searchCircles({});

    return circles.filter(circle => 
      routes.some(route => 
        route.from_location?.includes(circle.route_from) ||
        route.to_location?.includes(circle.route_to)
      )
    );
  }
};
