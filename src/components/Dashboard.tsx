import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SmartDashboard from './SmartDashboard';
import PersonalizedInsights from './PersonalizedInsights';
import RealTimeWidgets from './RealTimeWidgets';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface UserStats {
  totalTrips: number;
  totalEarnings: number;
  averageRating: number;
  preferredRoutes: string[];
  travelPatterns: any[];
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user stats for personalized insights
  const userStats: UserStats = {
    totalTrips: 47,
    totalEarnings: 2450,
    averageRating: 4.9,
    preferredRoutes: ['Dubai-Abu Dhabi', 'Riyadh-Jeddah'],
    travelPatterns: []
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="live">Live Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SmartDashboard onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <PersonalizedInsights
            userId="user-123"
            userStats={userStats}
          />
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <RealTimeWidgets userId="user-123" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
