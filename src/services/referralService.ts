import { supabase } from '../utils/supabase/client';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  referrer_reward_amount: number;
  referred_reward_amount: number;
  referrer_reward_paid: boolean;
  referred_reward_paid: boolean;
  created_at: string;
}

export interface UserReward {
  id: string;
  reward_type: 'cash' | 'credit' | 'discount' | 'free_ride';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'paid' | 'expired' | 'cancelled';
  campaign_id?: string;
  created_at: string;
}

export interface IncentiveCampaign {
  id: string;
  name: string;
  description: string;
  campaign_type: 'referral' | 'first_ride' | 'milestone' | 'seasonal' | 'surge';
  target_user_type: 'driver' | 'rider' | 'both';
  target_new_users: boolean;
  reward_type: 'fixed' | 'percentage' | 'tiered';
  reward_amount: number;
  reward_percentage: number;
  reward_tiers: any;
  min_trip_value: number;
  min_trips_count: number;
  valid_routes: any;
  total_budget: number;
  spent_amount: number;
  max_rewards_per_user: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const referralService = {
  // Get or create user's referral code
  async getReferralCode(userId: string): Promise<ReferralCode | null> {
    let { data, error } = await (supabase as any)
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code === 'parts116') {
      // Create new referral code
      const code = this.generateReferralCode();
      const { data: newCode, error: createError } = await (supabase as any)
        .from('referral_codes')
        .insert({
          user_id: userId,
          code,
          uses_count: 0,
          max_uses: null,
          is_active: true
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return newCode;
    }
    
    if (error) throw error;
    return data;
  },

  // Generate unique referral code
  generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  // Apply referral code during signup
  async applyReferralCode(referralCode: string, newUserId: string): Promise<void> {
    const { data: code, error: codeError } = await (supabase as any)
      .from('referral_codes')
      .select('user_id, max_uses, uses_count')
      .eq('code', referralCode.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (codeError || !code) throw new Error('Invalid referral code');
    if (code.max_uses && code.uses_count >= code.max_uses) {
      throw new Error('Referral code limit reached');
    }

    // Get active referral campaign
    const campaigns = await this.getActiveCampaigns();
    const referralCampaign = campaigns?.find(c => c.campaign_type === 'referral');
    
    const referrerReward = referralCampaign?.reward_amount || 50;
    const referredReward = referralCampaign?.reward_amount || 25;

    // Create referral record
    const { error: refError } = await (supabase as any)
      .from('referrals')
      .insert({
        referrer_id: code.user_id,
        referred_id: newUserId,
        referral_code: referralCode.toUpperCase(),
        referrer_reward_amount: referrerReward,
        referred_reward_amount: referredReward
      });
    
    if (refError) throw refError;

    // Update code usage
    await (supabase as any)
      .from('referral_codes')
      .update({ uses_count: code.uses_count + 1 })
      .eq('code', referralCode.toUpperCase());

    // Award welcome bonus to new user
    await this.awardIncentive(
      newUserId,
      referralCampaign?.id || '',
      referredReward,
      'Welcome bonus for joining via referral'
    );
  },

  // Get user's referrals
  async getUserReferrals(userId: string) {
    const { data, error } = await (supabase as any)
      .from('referrals')
      .select(`
        *,
        referred:profiles!referrals_referred_id_fley(full_name, avatar_url)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get user rewards
  async getUserRewards(userId: string): Promise<UserReward[]> {
    const { data, error } = await (supabase as any)
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get active campaigns
  async getActiveCampaigns() {
    const { data, error } = await (supabase as any)
      .from('incentive_campaigns')
      .select('*')
      .eq('is_active', true)
      .gte('ends_at', new Date().toISOString())
      .lte('starts_at', new Date().toISOString());
    
    if (error) throw error;
    return data;
  },

  // Create incentive campaign
  async createCampaign(campaign: {
    name: string;
    description: string;
    campaign_type: 'referral' | 'first_ride' | 'milestone' | 'seasonal' | 'surge';
    target_user_type: 'driver' | 'rider' | 'both';
    target_new_users: boolean;
    reward_type: 'fixed' | 'percentage' | 'tiered';
    reward_amount: number;
    reward_percentage: number;
    reward_tiers: any;
    min_trip_value: number;
    min_trips_count: number;
    valid_routes: any;
    total_budget: number;
    spent_amount: number;
    max_rewards_per_user: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  }) {
    const { data, error } = await (supabase as any)
      .from('incentive_campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Track campaign participation
  async participateInCampaign(userId: string, campaignId: string) {
    const { error } = await (supabase as any)
      .from('campaign_participants')
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        participated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // Award incentive
  async awardIncentive(userId: string, campaignId: string, amount: number, description: string) {
    const { error } = await (supabase as any)
      .from('user_rewards')
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        reward_type: 'cash',
        amount,
        description,
        status: 'approved'
      });

    if (error) throw error;
  },

  // Get referral performance
  async getReferralPerformance(userId: string) {
    const { data: referrals, error: refError } = await (supabase as any)
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);
    
    if (refError) throw refError;
    
    const completed = referrals?.filter((r: any) => r.status === 'completed').length || 0;
    const pending = referrals?.filter((r: any) => r.status === 'pending').length || 0;
    const totalRewards = referrals?.reduce((sum: number, r: any) => 
      sum + (r.referrer_reward_paid ? r.referrer_reward_amount : 0), 0) || 0;
    
    return {
      total_referrals: referrals?.length || 0,
      completed_referrals: completed,
      pending_referrals: pending,
      total_rewards_earned: totalRewards
    };
  }
};
