import { useState, useEffect } from 'react';
import { Activity, Signal, Clock, Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface RealTimeWidgetsProps {
  userId: string;
}

export default function RealTimeWidgets({ userId }: RealTimeWidgetsProps) {
  const [liveData, setLiveData] = useState({
    systemStatus: {
      api: 'online',
      database: 'online',
      payments: 'online',
      notifications: 'degraded'
    },
    networkStats: {
      latency: 45,
      bandwidth: 'High',
      connectionQuality: 95
    },
    marketData: {
      activeDrivers: 1247,
      activeRiders: 3891,
      completedTripsToday: 892,
      averageWaitTime: 4.2,
      demandLevel: 'High',
      supplyLevel: 'Medium'
    },
    userActivity: {
      onlineUsers: 5234,
      newSignups: 47,
      activeTrips: 156,
      completionRate: 94.7
    },
    alerts: [
      {
        id: 1,
        type: 'info',
        title: 'Peak Hours Active',
        message: 'High demand detected in Dubai Marina area',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        priority: 'medium'
      },
      {
        id: 2,
        type: 'success',
        title: 'System Update',
        message: 'Navigation system updated with latest traffic data',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        priority: 'low'
      },
      {
        id: 3,
        type: 'warning',
        title: 'Weather Alert',
        message: 'Light rain expected in Abu Dhabi - drive safely',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'high'
      }
    ]
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        networkStats: {
          ...prev.networkStats,
          latency: Math.floor(Math.random() * 50) + 30,
          connectionQuality: Math.floor(Math.random() * 20) + 80
        },
        marketData: {
          ...prev.marketData,
          activeDrivers: prev.marketData.activeDrivers + Math.floor(Math.random() * 20) - 10,
          activeRiders: prev.marketData.activeRiders + Math.floor(Math.random() * 50) - 25,
          averageWaitTime: Math.max(1, prev.marketData.averageWaitTime + (Math.random() - 0.5) * 0.5)
        },
        userActivity: {
          ...prev.userActivity,
          onlineUsers: prev.userActivity.onlineUsers + Math.floor(Math.random() * 10) - 5,
          activeTrips: prev.userActivity.activeTrips + Math.floor(Math.random() * 6) - 3
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'offline': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Activity;
      default: return Activity;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* System Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(liveData.systemStatus).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'online' ? 'bg-green-500' : 
                  status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                } animate-pulse`}></div>
                <span className="font-medium capitalize">{service}</span>
              </div>
              <Badge className={getStatusColor(status)}>
                {status}
              </Badge>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Network Quality</span>
              <span className="text-sm font-medium">{liveData.networkStats.connectionQuality}%</span>
            </div>
            <Progress value={liveData.networkStats.connectionQuality} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Latency: {liveData.networkStats.latency}ms</span>
              <span>Bandwidth: {liveData.networkStats.bandwidth}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{liveData.marketData.activeDrivers.toLocaleString()}</div>
              <div className="text-xs text-blue-600">Active Drivers</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{liveData.marketData.activeRiders.toLocaleString()}</div>
              <div className="text-xs text-green-600">Active Riders</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trips Today</span>
              <span className="font-bold">{liveData.marketData.completedTripsToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Wait Time</span>
              <span className="font-bold">{liveData.marketData.averageWaitTime.toFixed(1)} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Demand Level</span>
              <Badge className={
                liveData.marketData.demandLevel === 'High' ? 'text-red-600 bg-red-50' :
                liveData.marketData.demandLevel === 'Medium' ? 'text-yellow-600 bg-yellow-50' :
                'text-green-600 bg-green-50'
              }>
                {liveData.marketData.demandLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-purple-600">{liveData.userActivity.onlineUsers.toLocaleString()}</div>
              <div className="text-xs text-purple-600">Users Online</div>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Signups</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{liveData.userActivity.newSignups}</span>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  +12%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Trips</span>
              <span className="font-bold">{liveData.userActivity.activeTrips}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-bold text-green-600">{liveData.userActivity.completionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Alerts */}
      <Card className="border-0 shadow-lg lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Real-time Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {liveData.alerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start gap-3">
                    <AlertIcon className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {alert.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm opacity-80">{alert.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="border-0 shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signal className="w-5 h-5 text-indigo-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'API Response', value: `${liveData.networkStats.latency}ms`, status: 'good' },
              { label: 'Uptime', value: '99.9%', status: 'excellent' },
              { label: 'Error Rate', value: '0.1%', status: 'good' },
              { label: 'Throughput', value: '1.2K/s', status: 'excellent' }
            ].map((metric, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-xl font-bold ${
                  metric.status === 'excellent' ? 'text-green-600' :
                  metric.status === 'good' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-600 mt-1">{metric.label}</div>
                <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                  metric.status === 'excellent' ? 'bg-green-500' :
                  metric.status === 'good' ? 'bg-blue-500' :
                  'bg-yellow-500'
                } animate-pulse`}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Peak Hours', value: '5-7 PM', trend: 'Active' },
            { label: 'Busiest Route', value: 'Dubai-Abu Dhabi', trend: '+25%' },
            { label: 'Avg Trip Duration', value: '45 min', trend: '-5%' },
            { label: 'Customer Satisfaction', value: '4.8/5', trend: '+0.2' }
          ].map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{stat.label}</div>
                <div className="text-lg font-bold">{stat.value}</div>
              </div>
              <Badge variant="secondary" className={
                stat.trend.startsWith('+') ? 'text-green-600 bg-green-50' :
                stat.trend.startsWith('-') ? 'text-red-600 bg-red-50' :
                'text-blue-600 bg-blue-50'
              }>
                {stat.trend}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}