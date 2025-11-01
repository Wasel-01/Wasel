import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Copy, Gift, Users, TrendingUp } from 'lucide-react';
import { referralService } from '../services/referralService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

export const ReferralProgram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    const [code, refs, rwds] = await Promise.all([
      referralService.getReferralCode(user.id),
      referralService.getUserReferrals(user.id),
      referralService.getUserRewards(user.id)
    ]);
    
    if (code) setReferralCode(code.code);
    setReferrals(refs || []);
    setRewards(rwds || []);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast('Referral code copied!', { type: 'success' });
      setTimeout(() => setCopied(false), 2000);
0    } catch (error) {
      toast('Failed to copy code', { type: 'error' });
    }
  };

  const totalEarned = rewards
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingRewards = rewards
    .filter(r => r.status === 'pending' || r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground">
              {referrals.filter(r => r.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEarned} AED</div>
            <p className="text-xs text-muted-foreground">
              {pendingRewards} AED pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rewards.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to claim</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralCode} readOnly className="font-mono text-lg" />
            <Button onClick={copyCode} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your code with friends. You'll earn 50 AED when they complete their first ride,
            and they'll get 25 AED as a welcome bonus!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No referrals yet. Start sharing your code!
            </p>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {ref.referred?.full_name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{ref.referred?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={ref.status === 'completed' ? 'default' : 'secondary'}>
                    {ref.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rewards History</CardTitle>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No rewards yet
            </p>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{reward.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reward.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{reward.amount} AED</p>
                    <Badge variant={reward.status === 'paid' ? 'default' : 'secondary'}>
                      {reward.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
