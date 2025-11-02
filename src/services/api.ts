import { supabase } from '../utils/supabase/client';

const API_URL = `https://${(import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || 'your-project-id'}.supabase.co/functions/v1/make-server-cdfdab65`;

// Use auth token from Supabase client
export const getAuthToken = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

// ============ AUTH API ============

export const authAPI = {
  async signUp(email: string, password: string, firstName: string, lastName: string, phone: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        }
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  async getProfile() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    if (error) throw error;
    return data;
  }
};

// ============ TRIPS API ============

export const tripsAPI = {
  async createTrip(tripData: any) {
    const { data, error } = await supabase
      .from('trips')
      .insert(tripData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async searchTrips(from?: string, to?: string, date?: string) {
    let query = supabase.from('trips').select('*');

    if (from) query = query.ilike('pickup_location', `%${from}%`);
    if (to) query = query.ilike('dropoff_location', `%${to}%`);
    if (date) query = query.gte('departure_time', `${date}T00:00:00`);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getTripById(tripId: string) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error) throw error;
    return data;
  },

  async getDriverTrips() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('driver_id', user.user.id);

    if (error) throw error;
    return data;
  }
};

// ============ BOOKINGS API ============

export const bookingsAPI = {
  async createBooking(tripId: string, seatsBooked: number) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        trip_id: tripId,
        passenger_id: user.user.id,
        seats_booked: seatsBooked
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserBookings() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (*)
      `)
      .eq('passenger_id', user.user.id);

    if (error) throw error;
    return data;
  }
};

// ============ MESSAGES API ============

export const messagesAPI = {
  async sendMessage(recipientId: string, tripId: string, message: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.user.id,
        recipient_id: recipientId,
        trip_id: tripId,
        content: message
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversations() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(full_name, avatar_url),
        recipient:profiles!recipient_id(full_name, avatar_url)
      `)
      .or(`sender_id.eq.${user.user.id},recipient_id.eq.${user.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// ============ WALLET API ============

export const walletAPI = {
  async getWallet() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async addFunds(amount: number) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // First get current balance
    const { data: wallet, error: fetchError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!wallet) throw new Error('Wallet not found');

    // Update balance
    const newBalance = (wallet.balance || 0) + amount;
    const { data, error } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
