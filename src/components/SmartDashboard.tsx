import { useState, useEffect } from 'react';
import { 
  TrendingUp, MapPin, Users, Zap, Clock, Star, Award, 
  Navigation, Wallet, MessageCircle, Calendar, Target,
  Activity, BarChart3, ArrowUpRight, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface SmartDashboardProps {
  onNavigate: (page: string) => void;
}

export default function SmartDashboard({ onNavigate }: SmartDashboardProps) {
  const [timeOfDay, setTimeOfDay] = useState('');
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');
  const [dashboardData, setDashboardData] = useState({
    user: {
      name: 'Ahmed',
      level: 'Gold Member',
      points: 2450,
      nextLevelPoints: 3000,
      completedTrips: 47,
      rating: 4.9,
      savings: 1250,
      co2Saved: 320
    },
    quickStats: {
      upcomingTrips: 3,
      activeBookings: 2,
      unreadMessages: 5,
      walletBalance: 450
    },
    insights: {
      weeklyTrips: [12, 18, 15, 22, 19, 25, 20],
      monthlyEarnings: [320, 450, 380, 520, 480, 650, 580],
      routePopularity: [
        { name: 'Dubai-Abu Dhabi', value: 35, color: '#0088ff' },
        { name: 'Riyadh-Jeddah', value: 28, color: '#00ff88' },
        { name: 'Cairo-Alexandria', value: 22, color: '#ff8800' },
        { name: 'Others', value: 15, color: '#8888ff' }
      ]
    }
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    const greetings = {
      morning: ['Ready to start your day?', 'Great morning for a journey!', 'Let\'s make today productive!'],
      afternoon: ['How\'s your day going?', 'Perfect time for a trip!', 'Afternoon adventures await!'],
      evening: ['Winding down?', 'Evening travels ahead?', 'Time to head home?']
    };
    
    const randomGreeting = greetings[timeOfDay as keyof typeof greetings]?.[Math.floor(Math.random() * 3)] || 'Welcome back!';
    setPersonalizedGreeting(randomGreeting);
  }, [timeOfDay]);

  const levelProgress = (dashboardData.user.points / dashboardData.user.nextLevelPoints) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* AI-Powered Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Good {timeOfDay}, {dashboardData.user.name}! 
                </h1>
                <p className="text-white/80 text-lg">{personalizedGreeting}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                {dashboardData.user.level}
              </Badge>
              <div className="text-sm">
                <span className="text-white/80">Level Progress: </span>
                <span className="font-semibold">{dashboardData.user.points}/{dashboardData.user.nextLevelPoints} XP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{dashboardData.user.completedTrips}</div>
              <div className="text-white/80 text-sm">Trips Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {dashboardData.user.rating} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-white/80 text-sm">Your Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">${dashboardData.user.savings}</div>
              <div className="text-white/80 text-sm">Money Saved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{dashboardData.user.co2Saved}kg</div>
              <div className="text-white/80 text-sm">CO₂ Saved</div>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Level Progress</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
          <Progress value={levelProgress} className="h-2 bg-white/20" />
        </div>
      </div>

      {/* Smart Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Find Ride', 
            icon: Navigation, 
            color: 'from-blue-500 to-blue-600', 
            action: 'find-ride',
            subtitle: '500+ available',
            trend: '+12%'
          },
          { 
            title: 'Offer Ride', 
            icon: Users, 
            color: 'from-green-500 to-green-600', 
            action: 'offer-ride',
            subtitle: 'Earn $25-50',
            trend: '+8%'
          },
          { 
            title: 'Smart Navigation', 
            icon: MapPin, 
            color: 'from-purple-500 to-purple-600', 
            action: 'navigation',
            subtitle: 'AI-powered',
            trend: 'New!'
          },
          { 
            title: 'Trip Analytics', 
            icon: BarChart3, 
            color: 'from-orange-500 to-orange-600', 
            action: 'analytics',
            subtitle: 'View insights',
            trend: '+15%'
          }
        ].map((item, index) => (
          <Card 
            key={index}
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 hover:scale-105"
            onClick={() => onNavigate(item.action)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.trend}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Stats Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Analytics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Your Journey Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="trips" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="trips">Weekly Trips</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  <TabsTrigger value="routes">Popular Routes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="trips" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData.insights.weeklyTrips.map((trips, index) => ({
                      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
                      trips
                    }))}>
                      <defs>
                        <linearGradient id="tripsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="trips" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fill="url(#tripsGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="earnings" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.insights.monthlyEarnings.map((earnings, index) => ({
                      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][index],
                      earnings
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="routes" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={dashboardData.insights.routePopularity}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dashboardData.insights.routePopularity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4">
                    {dashboardData.insights.routePopularity.map((route, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: route.color }}
                        ></div>
                        <div>
                          <p className="font-medium text-sm">{route.name}</p>
                          <p className="text-xs text-gray-600">{route.value}% of trips</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Smart Sidebar */}
        <div className="space-y-6">
          {/* Live Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Live Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { 
                  icon: Calendar, 
                  label: 'Upcoming Trips', 
                  value: dashboardData.quickStats.upcomingTrips, 
                  change: '+2',
                  color: 'text-blue-600'
                },
                { 
                  icon: Target, 
                  label: 'Active Bookings', 
                  value: dashboardData.quickStats.activeBookings, 
                  change: '+1',
                  color: 'text-green-600'
                },
                { 
                  icon: MessageCircle, 
                  label: 'Messages', 
                  value: dashboardData.quickStats.unreadMessages, 
                  change: '+3',
                  color: 'text-purple-600'
                },
                { 
                  icon: Wallet, 
                  label: 'Wallet', 
                  value: `$${dashboardData.quickStats.walletBalance}`, 
                  change: '+$50',
                  color: 'text-orange-600'
                }
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    {stat.change}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: 'Peak Hour Opportunity',
                  description: 'Offer rides during 5-7 PM for 40% higher earnings',
                  action: 'Create Offer',
                  priority: 'high'
                },
                {
                  title: 'Route Optimization',
                  description: 'Dubai-Sharjah route has 85% booking rate',
                  action: 'Explore Route',
                  priority: 'medium'
                },
                {
                  title: 'Referral Bonus',
                  description: 'Invite friends and earn 75 AED per referral',
                  action: 'Share Code',
                  priority: 'low'
                }
              ].map((rec, index) => (
                <div key={index} className="p-4 bg-white rounded-xl border border-indigo-100">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity with Enhanced UI */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: 'trip',
                title: 'Trip to Abu Dhabi',
                subtitle: 'Completed successfully',
                time: '2 hours ago',
                amount: '+$45',
                status: 'completed',
                icon: MapPin,
                color: 'text-green-600 bg-green-50'
              },
              {
                type: 'booking',
                title: 'New booking received',
                subtitle: 'Dubai to Sharjah',
                time: '4 hours ago',
                amount: '$35',
                status: 'pending',
                icon: Users,
                color: 'text-blue-600 bg-blue-50'
              },
              {
                type: 'payment',
                title: 'Payment received',
                subtitle: 'From Ahmed K.',
                time: '1 day ago',
                amount: '+$28',
                status: 'completed',
                icon: Wallet,
                color: 'text-purple-600 bg-purple-50'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{activity.title}</h4>
                  <p className="text-xs text-gray-600">{activity.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{activity.amount}</p>
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}