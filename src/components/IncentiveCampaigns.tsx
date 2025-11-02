import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Gift, Target, TrendingUp, Users } from 'lucide-react';
interface IncentiveCampaign {
  id: string;
  name: string;
  description: string;
  campaign_type: string;
  target_audience: string;
  reward_type: string;
  reward_amount: number;
  referrer_reward?: number;
  referred_reward?: number;
  trigger_condition: string;
  starts_at: string;
  ends_at: string;
  max_participants?: number;
  current_participants: number;
}

export default function IncentiveCampaigns() {
  const [campaigns, setCampaigns] = useState<IncentiveCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(false);
    setCampaigns([]);
  };

  const createDefaultCampaigns = async () => {
    const defaultCampaigns = [
      {
        name: 'Driver Referral Bonus',
        description: 'Earn 75 AED for each driver you refer who completes 5 rides',
        campaign_type: 'referral' as const,
        target_audience: 'drivers' as const,
        reward_type: 'cash' as const,
        reward_amount: 75,
        referrer_reward: 75,
        referred_reward: 50,
        trigger_condition: 'referred_user_completes_5_rides',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        max_participants: 1000
      },
      {
        name: 'Rider Welcome Bonus',
        description: 'Get 25 AED credit for your first ride',
        campaign_type: 'first_ride' as const,
        target_audience: 'riders' as const,
        reward_type: 'credit' as const,
        reward_amount: 25,
        trigger_condition: 'first_ride_completed',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Peak Hours Incentive',
        description: 'Extra 20 AED for rides during peak hours (7-9 AM, 5-7 PM)',
        campaign_type: 'seasonal' as const,
        target_audience: 'drivers' as const,
        reward_type: 'cash' as const,
        reward_amount: 20,
        trigger_condition: 'ride_during_peak_hours',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Loyalty Rewards',
        description: '10% cashback after 10 completed rides this month',
        campaign_type: 'loyalty' as const,
        target_audience: 'both' as const,
        reward_type: 'cash' as const,
        reward_amount: 0, // Percentage-based
        trigger_condition: '10_rides_completed_monthly',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setCampaigns(defaultCampaigns.map((c, i) => ({ ...c, id: `campaign-${i}`, current_participants: 0 })));
  };

  const getCampaignsByType = (type: string) => {
    return campaigns.filter(c => c.campaign_type === type);
  };

  const getStatusColor = (campaign: IncentiveCampaign) => {
    const now = new Date();
    const start = new Date(campaign.starts_at);
    const end = new Date(campaign.ends_at);
    
    if (now < start) return 'secondary';
    if (now > end) return 'destructive';
    return 'default';
  };

  const getStatusText = (campaign: IncentiveCampaign) => {
    const now = new Date();
    const start = new Date(campaign.starts_at);
    const end = new Date(campaign.ends_at);
    
    if (now < start) return 'Upcoming';
    if (now > end) return 'Expired';
    return 'Active';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Incentive Campaigns</h2>
        {campaigns.length === 0 && (
          <Button onClick={createDefaultCampaigns}>
            Create Default Campaigns
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => getStatusText(c) === 'Active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.current_participants, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.reward_amount * c.current_participants), 0)} AED
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Participation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0 
                ? Math.round(campaigns.reduce((sum, c) => sum + c.current_participants, 0) / campaigns.length)
                : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referral">Referral</TabsTrigger>
          <TabsTrigger value="first_ride">Welcome</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        </TabsList>

        <TabsContent value="referral" className="space-y-4">
          <div className="grid gap-4">
            {getCampaignsByType('referral').map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.description}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(campaign)}>
                      {getStatusText(campaign)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Target</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {campaign.target_audience}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Referrer Reward</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.referrer_reward} AED
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Referred Reward</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.referred_reward} AED
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Participants</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.current_participants}
                        {campaign.max_participants && ` / ${campaign.max_participants}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="first_ride" className="space-y-4">
          <div className="grid gap-4">
            {getCampaignsByType('first_ride').map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.description}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(campaign)}>
                      {getStatusText(campaign)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Reward</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.reward_amount} AED {campaign.reward_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Target</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {campaign.target_audience}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Participants</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.current_participants}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="grid gap-4">
            {getCampaignsByType('loyalty').map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.description}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(campaign)}>
                      {getStatusText(campaign)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium">Reward Type</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {campaign.reward_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Target</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {campaign.target_audience}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Participants</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.current_participants}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <div className="grid gap-4">
            {getCampaignsByType('seasonal').map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.description}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(campaign)}>
                      {getStatusText(campaign)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Reward</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.reward_amount} AED
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Target</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {campaign.target_audience}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.ceil((new Date(campaign.ends_at).getTime() - new Date(campaign.starts_at).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Participants</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.current_participants}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}