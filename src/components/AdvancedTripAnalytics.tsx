import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Target, Zap, Award, AlertCircle,
  ArrowUpRight, ArrowDownRight, Percent, Clock, Users, Sparkles
} from 'lucide-react';

interface DriverInsights {
  currentEarnings: number;
  potentialEarnings: number;
  earningsGap: number;
  optimizationScore: number;
  peakHours: { hour: string; multiplier: number }[];
  routeEfficiency: number;
  acceptanceRate: number;
  completionRate: number;
  avgRating: number;
  stickiness: number;
}

interface PassengerSavings {
  totalSaved: number;
  vsUber: number;
  vsCareem: number;
  vsTaxi: number;
  vsOwnership: number;
  savingsRate: number;
  costPerKm: number;
  monthlyProjection: number;
}

export function AdvancedTripAnalytics() {
  const [view, setView] = useState<'driver' | 'passenger'>('driver');

  // Driver Intelligence
  const driverInsights: DriverInsights = useMemo(() => ({
    currentEarnings: 3250,
    potentialEarnings: 8500,
    earningsGap: 5250,
    optimizationScore: 68,
    peakHours: [
      { hour: '7-9 AM', multiplier: 2.3 },
      { hour: '5-7 PM', multiplier: 2.8 },
      { hour: '12-2 PM', multiplier: 1.6 }
    ],
    routeEfficiency: 72,
    acceptanceRate: 85,
    completionRate: 96,
    avgRating: 4.7,
    stickiness: 78
  }), []);

  // Passenger Savings Intelligence
  const passengerSavings: PassengerSavings = useMemo(() => ({
    totalSaved: 1850,
    vsUber: 45,
    vsCareem: 42,
    vsTaxi: 38,
    vsOwnership: 65,
    savingsRate: 48,
    costPerKm: 1.2,
    monthlyProjection: 2400
  }), []);

  const earningsOptimization = [
    { metric: 'Current', value: driverInsights.currentEarnings, target: driverInsights.potentialEarnings },
    { metric: 'Week 1', value: 3800, target: 8500 },
    { metric: 'Week 2', value: 4500, target: 8500 },
    { metric: 'Week 3', value: 5400, target: 8500 },
    { metric: 'Week 4', value: 6800, target: 8500 },
    { metric: 'Target', value: 8500, target: 8500 }
  ];

  const savingsComparison = [
    { platform: 'Wasel', cost: 100, savings: 0 },
    { platform: 'Uber', cost: 182, savings: 45 },
    { platform: 'Careem', cost: 177, savings: 42 },
    { platform: 'Taxi', cost: 163, savings: 38 },
    { platform: 'Own Car', cost: 294, savings: 65 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strategic Analytics</h1>
          <p className="text-muted-foreground">Data-driven insights for exponential growth</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={view === 'driver' ? 'default' : 'outline'}
            onClick={() => setView('driver')}
          >
            Driver Intelligence
          </Button>
          <Button 
            variant={view === 'passenger' ? 'default' : 'outline'}
            onClick={() => setView('passenger')}
          >
            Passenger Savings
          </Button>
        </div>
      </div>

      {/* DRIVER VIEW */}
      {view === 'driver' && (
        <>
          {/* Critical Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="size-5 text-red-500" />
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="text-3xl font-bold text-red-600">
                {driverInsights.earningsGap} AED
              </div>
              <p className="text-sm text-muted-foreground">Monthly Earnings Gap</p>
              <p className="text-xs text-red-600 mt-2">
                You're leaving {Math.round((driverInsights.earningsGap / driverInsights.potentialEarnings) * 100)}% on the table
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-2">
                <Target className="size-5 text-amber-500" />
                <Badge variant="outline">{driverInsights.optimizationScore}%</Badge>
              </div>
              <div className="text-3xl font-bold">
                {driverInsights.potentialEarnings} AED
              </div>
              <p className="text-sm text-muted-foreground">Potential Earnings</p>
              <p className="text-xs text-amber-600 mt-2">
                +{Math.round(((driverInsights.potentialEarnings - driverInsights.currentEarnings) / driverInsights.currentEarnings) * 100)}% increase possible
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between mb-2">
                <Zap className="size-5 text-green-500" />
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {driverInsights.stickiness}%
              </div>
              <p className="text-sm text-muted-foreground">Stickiness Score</p>
              <p className="text-xs text-green-600 mt-2">
                Top {100 - driverInsights.stickiness}% of drivers
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-2">
                <Award className="size-5 text-blue-500" />
                <Badge variant="outline" className="gap-1">
                  <ArrowUpRight className="size-3" />
                  12%
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                {driverInsights.avgRating}
              </div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
              <p className="text-xs text-blue-600 mt-2">
                {driverInsights.completionRate}% completion rate
              </p>
            </Card>
          </div>

          {/* Earnings Optimization Path */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-500" />
                  Exponential Growth Path
                </h3>
                <p className="text-sm text-muted-foreground">
                  Strategic roadmap to {driverInsights.potentialEarnings} AED/month
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                +{Math.round(((driverInsights.potentialEarnings - driverInsights.currentEarnings) / driverInsights.currentEarnings) * 100)}% Growth
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earningsOptimization}>
                <defs>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorTarget)" 
                  name="Target Earnings"
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorCurrent)" 
                  name="Your Earnings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Strategic Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                Peak Hour Multipliers
              </h3>
              <div className="space-y-3">
                {driverInsights.peakHours.map((peak, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="font-semibold">{peak.hour}</p>
                      <p className="text-xs text-muted-foreground">High demand window</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        {peak.multiplier}x
                      </Badge>
                      <p className="text-xs text-amber-600 mt-1">
                        +{Math.round((peak.multiplier - 1) * 100)}% earnings
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Route Efficiency</span>
                    <span className="text-sm font-semibold">{driverInsights.routeEfficiency}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${driverInsights.routeEfficiency}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: 90% for +15% earnings
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Acceptance Rate</span>
                    <span className="text-sm font-semibold">{driverInsights.acceptanceRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${driverInsights.acceptanceRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Excellent! Keep above 80%
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Completion Rate</span>
                    <span className="text-sm font-semibold">{driverInsights.completionRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${driverInsights.completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Outstanding performance!
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Items */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <h3 className="text-lg font-bold mb-4">🎯 This Week's Action Plan</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-lg">1</span>
                  </div>
                  <Badge className="bg-amber-500">+850 AED</Badge>
                </div>
                <p className="font-semibold">Drive Peak Hours</p>
                <p className="text-sm text-muted-foreground">
                  Focus on 7-9 AM & 5-7 PM for 2.5x earnings
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg">2</span>
                  </div>
                  <Badge className="bg-green-500">+620 AED</Badge>
                </div>
                <p className="font-semibold">Optimize Routes</p>
                <p className="text-sm text-muted-foreground">
                  Reduce empty miles by 15% = +620 AED
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg">3</span>
                  </div>
                  <Badge className="bg-blue-500">+480 AED</Badge>
                </div>
                <p className="font-semibold">Increase Acceptance</p>
                <p className="text-sm text-muted-foreground">
                  Accept 5% more rides = +480 AED
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* PASSENGER VIEW */}
      {view === 'passenger' && (
        <>
          {/* Savings Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="size-5 text-green-500" />
                <Badge className="bg-green-500">Saved</Badge>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {passengerSavings.totalSaved} AED
              </div>
              <p className="text-sm text-muted-foreground">Total Savings</p>
              <p className="text-xs text-green-600 mt-2">
                vs traditional alternatives
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-2">
                <Percent className="size-5 text-blue-500" />
                <Badge variant="outline">{passengerSavings.savingsRate}%</Badge>
              </div>
              <div className="text-3xl font-bold">
                {passengerSavings.savingsRate}%
              </div>
              <p className="text-sm text-muted-foreground">Average Savings Rate</p>
              <p className="text-xs text-blue-600 mt-2">
                Industry leading value
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="size-5 text-purple-500" />
                <Badge variant="outline" className="gap-1">
                  <ArrowUpRight className="size-3" />
                  Monthly
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                {passengerSavings.monthlyProjection} AED
              </div>
              <p className="text-sm text-muted-foreground">Projected Savings</p>
              <p className="text-xs text-purple-600 mt-2">
                Based on current usage
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-2">
                <Users className="size-5 text-amber-500" />
                <Badge className="bg-amber-500">Best Value</Badge>
              </div>
              <div className="text-3xl font-bold">
                {passengerSavings.costPerKm} AED
              </div>
              <p className="text-sm text-muted-foreground">Cost per KM</p>
              <p className="text-xs text-amber-600 mt-2">
                Lowest in market
              </p>
            </Card>
          </div>

          {/* Savings Comparison */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="size-5 text-green-500" />
                Your Savings vs Alternatives
              </h3>
              <p className="text-sm text-muted-foreground">
                Real data comparison - See how much you save
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" fill="#3b82f6" name="Cost (AED)" />
                <Bar dataKey="savings" fill="#10b981" name="Your Savings (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Detailed Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Platform Comparison</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Wasel (You)</span>
                    <Badge className="bg-green-500">Best Choice</Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-600">100 AED</div>
                  <p className="text-xs text-green-600 mt-1">Base cost</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>Uber</span>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">182 AED</div>
                      <Badge variant="destructive" className="text-xs">+{passengerSavings.vsUber}%</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>Careem</span>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">177 AED</div>
                      <Badge variant="destructive" className="text-xs">+{passengerSavings.vsCareem}%</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>Traditional Taxi</span>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">163 AED</div>
                      <Badge variant="destructive" className="text-xs">+{passengerSavings.vsTaxi}%</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>Own Car</span>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">294 AED</div>
                      <Badge variant="destructive" className="text-xs">+{passengerSavings.vsOwnership}%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Annual Impact</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground mb-1">Annual Savings</p>
                  <div className="text-3xl font-bold text-green-600">
                    {passengerSavings.totalSaved * 12} AED
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    That's {Math.round((passengerSavings.totalSaved * 12) / 100)} months of free rides!
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">What You Could Buy:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✈️ Round trip flight to Europe</li>
                    <li>📱 Latest smartphone</li>
                    <li>🏖️ Weekend staycation (4x)</li>
                    <li>🍽️ Fine dining (20x)</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Smart Money Moves:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>💰 Invest savings: +8% returns</li>
                    <li>📚 Education fund</li>
                    <li>🎯 Emergency savings</li>
                    <li>🌟 Quality of life upgrade</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Value Proposition */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-lg font-bold mb-4">💚 Why Wasel Saves You Money</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">🤝</div>
                <p className="font-semibold mb-1">Peer-to-Peer</p>
                <p className="text-sm text-muted-foreground">
                  No corporate markup. Direct connection = lower costs
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">🚗</div>
                <p className="font-semibold mb-1">Shared Rides</p>
                <p className="text-sm text-muted-foreground">
                  Split costs with others going your way
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-semibold mb-1">Smart Matching</p>
                <p className="text-sm text-muted-foreground">
                  AI finds the most efficient routes
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}