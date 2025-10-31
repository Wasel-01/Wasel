import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { growthMetricsService } from '../services/growthMetricsService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GrowthMetricsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [supplyDemand, setSupplyDemand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [summary, daily, sd] = await Promise.all([
        growthMetricsService.getMetricsSummary(),
        growthMetricsService.getDailyMetrics(startDate, endDate),
        growthMetricsService.getSupplyDemandBalance()
      ]);
      
      setMetrics(summary);
      setDailyData(daily.reverse());
      setSupplyDemand(sd);
    } catch (error) {
      // Failed to load metrics
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Acquisition</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cpa?.toFixed(2) || 0} AED</div>
            <p className="text-xs text-muted-foreground">Average CPA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.ltv?.toFixed(2) || 0} AED</div>
            <p className="text-xs text-muted-foreground">Average LTV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Supply/Demand Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.supplyDemandRatio?.toFixed(2) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.supplyDemandRatio > 1 ? 'Oversupply' : 'High demand'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fulfillment Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.fulfillmentRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Bookings accepted</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="acquisition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="acquisition">User Acquisition</TabsTrigger>
          <TabsTrigger value="revenue">Revenue & LTV</TabsTrigger>
          <TabsTrigger value="supply">Supply & Demand</TabsTrigger>
        </TabsList>

        <TabsContent value="acquisition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric_date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="new_drivers" fill="#8884d8" name="Drivers" />
                  <Bar dataKey="new_riders" fill="#82ca9d" name="Riders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Per Acquisition Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric_date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg_cpa" stroke="#8884d8" name="Avg CPA" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric_date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total_revenue" stroke="#82ca9d" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Lifetime Value</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric_date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg_ltv" stroke="#ffc658" name="Avg LTV" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supply" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Supply</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Drivers</span>
                    <span className="font-bold">{supplyDemand?.active_drivers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Available Seats</span>
                    <span className="font-bold">{supplyDemand?.total_seats_offered || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Demand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Riders</span>
                    <span className="font-bold">{supplyDemand?.active_riders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Seats Requested</span>
                    <span className="font-bold">{supplyDemand?.total_seats_requested || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Supply/Demand Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric_date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg_supply_demand_ratio" stroke="#8884d8" name="S/D Ratio" />
                  <Line type="monotone" dataKey="avg_fulfillment_rate" stroke="#82ca9d" name="Fulfillment %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
