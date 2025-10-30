import { supabase } from '../utils/supabase/client';

export interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  expires_at: string | null;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed' | 'expired';
  referrer_reward_amount: number;
  referred_reward_amount: number;
}

export interface UserReward {
  id: string;
  reward_type: 'cash' | 'credit' | 'discount' | 'free_ride';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'paid' | 'expired' | 'cancelled';
  created_at: string;
}

export const referralService = {
  // Get user's referral code
  async getReferralCode(userId: string): Promise<ReferralCode | null> {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Apply referral code during signup
  async applyReferralCode(referralCode: string, newUserId: string): Promise<void> {
    const { data: code, error: codeError } = await supabase
      .from('referral_codes')
      .select('user_id, max_uses, uses_count')
      .eq('code', referralCode.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (codeError || !code) throw new Error('Invalid referral code');
    if (code.max_uses && code.uses_count >= code.max_uses) {
      throw new Error('Referral code limit reached');
    }

    // Create referral record
    const { error: refError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: code.user_id,
        referred_id: newUserId,
        referral_code: referralCode.toUpperCase(),
        referrer_reward_amount: 50, // AED
        referred_reward_amount: 25  // AED
      });
    
    if (refError) throw refError;

    // Update code usage
    await supabase
      .from('referral_codes')
      .update({ uses_count: code.uses_count + 1 })
      .eq('code', referralCode.toUpperCase());
  },

  // Get user's referrals
  async getUserReferrals(userId: string) {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred:profiles!referrals_referred_id_fkey(full_name, avatar_url)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get user rewards
  async getUserRewards(userId: string): Promise<UserReward[]> {
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get active campaigns
  async getActiveCampaigns() {
    const { data, error } = await supabase
      .from('incentive_campaigns')
      .select('*')
      .eq('is_active', true)
      .gte('ends_at', new Date().toISOString())
      .lte('starts_at', new Date().toISOString());
    
    if (error) throw error;
    return data;
  }
};
