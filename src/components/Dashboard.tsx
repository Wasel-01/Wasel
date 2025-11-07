import { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const SmartDashboard = lazy(() => import('./SmartDashboard'));
const PersonalizedInsights = lazy(() => import('./PersonalizedInsights'));
const RealTimeWidgets = lazy(() => import('./RealTimeWidgets'));

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
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
            <SmartDashboard onNavigate={onNavigate} />
          </Suspense>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
            <PersonalizedInsights userId="user-123" userStats={userStats} />
          </Suspense>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
            <RealTimeWidgets userId="user-123" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
