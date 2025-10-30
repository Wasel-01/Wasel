import { useState, useEffect } from 'react';
import { referralService } from '../services/referralService';
import { useAuth } from '../contexts/AuthContext';

export function useReferrals() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;
    
    try {
      const [code, refs, rwds] = await Promise.all([
        referralService.getReferralCode(user.id),
        referralService.getUserReferrals(user.id),
        referralService.getUserRewards(user.id)
      ]);
      
      if (code) setReferralCode(code.code);
      setReferrals(refs || []);
      setRewards(rwds || []);
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyReferralCode = async (code: string) => {
    if (!user) throw new Error('User not authenticated');
    await referralService.applyReferralCode(code, user.id);
    await loadReferralData();
  };

  const stats = {
    totalReferrals: referrals.length,
    completedReferrals: referrals.filter(r => r.status === 'completed').length,
    totalEarned: rewards.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0),
    pendingRewards: rewards.filter(r => r.status === 'pending' || r.status === 'approved').reduce((sum, r) => sum + r.amount, 0)
  };

  return {
    referralCode,
    referrals,
    rewards,
    stats,
    loading,
    applyReferralCode,
    refresh: loadReferralData
  };
}
