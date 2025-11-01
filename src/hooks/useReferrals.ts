import { useState, useEffect } from 'react';
import { referralService } from '../services/referralService';

export function useReferrals(userId?: string) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadReferralData();
    }
  }, [userId]);

  const loadReferralData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const [code, refs, rwds] = await Promise.all([
        referralService.getReferralCode(userId),
        referralService.getUserReferrals(userId),
        referralService.getUserRewards(userId)
      ]);
      
      if (code) setReferralCode(code.code);
      setReferrals(refs || []);
      setRewards(rwds || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  return {
    referralCode,
    referrals,
    rewards,
    loading,
    error,
    refresh: loadReferralData
  };
}