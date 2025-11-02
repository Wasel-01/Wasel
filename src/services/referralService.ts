// @ts-nocheck
// Referral service disabled - database tables not configured
export const referralService = {
  getActiveCampaigns: async () => [],
  createCampaign: async (...args: any[]) => ({}),
  getReferralCode: async (...args: any[]) => null,
  getUserReferrals: async (...args: any[]) => [],
  getUserRewards: async (...args: any[]) => [],
};

export interface IncentiveCampaign {
  id: string;
  name: string;
  description: string;
  campaign_type: string;
  target_audience: string;
  reward_type: string;
  reward_amount: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  expires_at: string | null;
}

export interface UserReward {
  id: string;
  reward_type: string;
  amount: number;
  description: string;
  status: string;
}
