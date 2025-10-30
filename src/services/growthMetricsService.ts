import { supabase } from '../utils/supabase/client';

export interface GrowthMetrics {
  cpa: number; // Cost Per Acquisition
  ltv: number; // Lifetime Value
  supplyDemandRatio: number;
  fulfillmentRate: number;
}

export interface DailyMetrics {
  metric_date: string;
  new_users_total: number;
  new_drivers: number;
  new_riders: number;
  avg_cpa: number;
  avg_ltv: number;
  avg_supply_demand_ratio: number;
  avg_fulfillment_rate: number;
  total_revenue: number;
}

export interface SupplyDemandMetrics {
  active_drivers: number;
  active_riders: number;
  supply_demand_ratio: number;
  fulfillment_rate: number;
  avg_wait_time_minutes: number;
}

export const growthMetricsService = {
  // Get daily growth metrics
  async getDailyMetrics(startDate: string, endDate: string): Promise<DailyMetrics[]> {
    const { data, error } = await supabase
      .from('daily_growth_metrics')
      .select('*')
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get current supply/demand balance
  async getSupplyDemandBalance(city?: string): Promise<SupplyDemandMetrics> {
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    
    let query = supabase
      .from('supply_demand_metrics')
      .select('*')
      .eq('metric_date', today)
      .eq('metric_hour', currentHour);
    
    if (city) query = query.eq('city', city);
    
    const { data, error } = await query.single();
    
    if (error || !data) {
      return {
        active_drivers: 0,
        active_riders: 0,
        supply_demand_ratio: 0,
        fulfillment_rate: 0,
        avg_wait_time_minutes: 0
      };
    }
    
    return data;
  },

  // Calculate user LTV
  async calculateUserLTV(userId: string): Promise<number> {
    const { data: metrics, error } = await supabase
      .from('user_ltv_metrics')
      .select('total_revenue, days_active')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !metrics) return 0;
    
    // Simple LTV calculation: (total_revenue / days_active) * 365
    if (metrics.days_active > 0) {
      return (metrics.total_revenue / metrics.days_active) * 365;
    }
    
    return metrics.total_revenue;
  },

  // Get user acquisition cost
  async getUserCPA(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('user_acquisition_metrics')
      .select('acquisition_cost')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return 0;
    return data.acquisition_cost;
  },

  // Get cohort analysis
  async getCohortAnalysis(cohortMonth: string) {
    const { data, error } = await supabase
      .from('user_ltv_metrics')
      .select('*')
      .eq('cohort_month', cohortMonth);
    
    if (error) throw error;
    
    const totalUsers = data?.length || 0;
    const avgLTV = data?.reduce((sum, u) => sum + u.total_revenue, 0) / totalUsers || 0;
    const avgTrips = data?.reduce((sum, u) => sum + u.total_trips, 0) / totalUsers || 0;
    
    return { totalUsers, avgLTV, avgTrips, cohortMonth };
  },

  // Track user acquisition
  async trackAcquisition(userId: string, channel: string, cost: number = 0) {
    const { error } = await supabase
      .from('user_acquisition_metrics')
      .update({
        acquisition_channel: channel,
        acquisition_cost: cost
      })
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  // Update LTV metrics (should be run periodically)
  async updateLTVMetrics(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_spent, total_earned, total_trips, created_at')
      .eq('id', userId)
      .single();
    
    if (!profile) return;
    
    const daysActive = Math.floor(
      (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const totalRevenue = profile.total_spent + profile.total_earned;
    const avgTripValue = profile.total_trips > 0 ? totalRevenue / profile.total_trips : 0;
    
    const cohortMonth = new Date(profile.created_at).toISOString().slice(0, 7);
    
    await supabase
      .from('user_ltv_metrics')
      .insert({
        user_id: userId,
        total_revenue: totalRevenue,
        total_trips: profile.total_trips,
        avg_trip_value: avgTripValue,
        days_active: daysActive,
        months_active: Math.floor(daysActive / 30),
        cohort_month: cohortMonth,
        predicted_ltv_30d: avgTripValue * 4,
        predicted_ltv_90d: avgTripValue * 12,
        predicted_ltv_365d: avgTripValue * 48
      });
  },

  // Get key metrics summary
  async getMetricsSummary(): Promise<GrowthMetrics> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: dailyMetrics } = await supabase
      .from('daily_growth_metrics')
      .select('avg_cpa, avg_ltv')
      .eq('metric_date', today)
      .single();
    
    const supplyDemand = await this.getSupplyDemandBalance();
    
    return {
      cpa: dailyMetrics?.avg_cpa || 0,
      ltv: dailyMetrics?.avg_ltv || 0,
      supplyDemandRatio: supplyDemand.supply_demand_ratio,
      fulfillmentRate: supplyDemand.fulfillment_rate
    };
  }
};
