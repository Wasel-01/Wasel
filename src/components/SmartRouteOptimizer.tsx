import { useState, useEffect } from 'react';
import { Zap, Clock, Fuel, Route, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface RouteOption {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuelCost: number;
  trafficLevel: 'low' | 'medium' | 'high';
  tollCost: number;
  co2Emissions: number;
  coordinates: [number, number][];
  highlights: string[];
  warnings: string[];
}

interface SmartRouteOptimizerProps {
  origin: [number, number];
  destination: [number, number];
  preferences: {
    priority: 'fastest' | 'shortest' | 'cheapest' | 'eco';
    avoidTolls: boolean;
    avoidHighways: boolean;
    vehicleType: 'car' | 'motorcycle' | 'electric';
  };
  onRouteSelect: (route: RouteOption) => void;
}

export default function SmartRouteOptimizer({
  origin,
  destination,
  preferences,
  onRouteSelect
}: SmartRouteOptimizerProps) {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    trafficUpdates: true,
    weatherConditions: 'clear',
    roadClosures: 0,
    accidents: 1
  });

  useEffect(() => {
    generateSmartRoutes();
  }, [origin, destination, preferences]);

  const generateSmartRoutes = async () => {
    setLoading(true);
    
    // Simulate AI-powered route generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockRoutes: RouteOption[] = [
      {
        id: 'fastest',
        name: 'AI Optimized - Fastest',
        distance: 25.4,
        duration: 28,
        fuelCost: 12.50,
        trafficLevel: 'medium',
        tollCost: 5.00,
        co2Emissions: 4.2,
        coordinates: [[55.2708, 25.2048], [55.2808, 25.2148], [55.2908, 25.2248]],
        highlights: ['Dynamic traffic avoidance', 'Real-time optimization', 'Fastest arrival'],
        warnings: ['Moderate traffic expected', 'Toll road included']
      },
      {
        id: 'eco',
        name: 'Eco-Friendly Route',
        distance: 28.1,
        duration: 35,
        fuelCost: 10.20,
        trafficLevel: 'low',
        tollCost: 0,
        co2Emissions: 2.8,
        coordinates: [[55.2708, 25.2048], [55.2758, 25.2098], [55.2858, 25.2198]],
        highlights: ['33% less emissions', 'Scenic route', 'No tolls'],
        warnings: ['Slightly longer duration']
      },
      {
        id: 'balanced',
        name: 'Smart Balance',
        distance: 26.8,
        duration: 31,
        fuelCost: 11.30,
        trafficLevel: 'low',
        tollCost: 2.50,
        co2Emissions: 3.5,
        coordinates: [[55.2708, 25.2048], [55.2778, 25.2118], [55.2878, 25.2218]],
        highlights: ['Best overall value', 'Predictable timing', 'Moderate costs'],
        warnings: []
      }
    ];

    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes[0].id);
    setLoading(false);
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrafficProgress = (level: string) => {
    switch (level) {
      case 'low': return 25;
      case 'medium': return 60;
      case 'high': return 90;
      default: return 0;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'fastest': return <Zap className="w-4 h-4" />;
      case 'shortest': return <Route className="w-4 h-4" />;
      case 'cheapest': return <Fuel className="w-4 h-4" />;
      case 'eco': return <TrendingUp className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="font-semibold">AI Route Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing traffic patterns, weather, and road conditions...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Real-time Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🌤️</div>
              <p className="text-sm font-medium">Clear Weather</p>
              <p className="text-xs text-muted-foreground">Perfect driving</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🚦</div>
              <p className="text-sm font-medium">Traffic Updates</p>
              <p className="text-xs text-green-600">Active monitoring</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🚧</div>
              <p className="text-sm font-medium">Road Closures</p>
              <p className="text-xs text-muted-foreground">None detected</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚠️</div>
              <p className="text-sm font-medium">Incidents</p>
              <p className="text-xs text-yellow-600">1 minor accident</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Options */}
      <Tabs value={selectedRoute || ''} onValueChange={setSelectedRoute}>
        <TabsList className="grid w-full grid-cols-3">
          {routes.map((route) => (
            <TabsTrigger key={route.id} value={route.id} className="text-xs">
              {route.name.split(' - ')[1] || route.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {routes.map((route) => (
          <TabsContent key={route.id} value={route.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getPriorityIcon(preferences.priority)}
                    {route.name}
                  </CardTitle>
                  <Button
                    onClick={() => onRouteSelect(route)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Select Route
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Route Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{route.duration}</p>
                    <p className="text-sm text-muted-foreground">minutes</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Route className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{route.distance}</p>
                    <p className="text-sm text-muted-foreground">km</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Fuel className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{route.fuelCost}</p>
                    <p className="text-sm text-muted-foreground">AED fuel</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">{route.co2Emissions}</p>
                    <p className="text-sm text-muted-foreground">kg CO₂</p>
                  </div>
                </div>

                {/* Traffic Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Traffic Level</span>
                    <span className={`text-sm font-medium capitalize ${getTrafficColor(route.trafficLevel)}`}>
                      {route.trafficLevel}
                    </span>
                  </div>
                  <Progress 
                    value={getTrafficProgress(route.trafficLevel)} 
                    className="h-2"
                  />
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium">Cost Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fuel Cost</span>
                      <span>{route.fuelCost} AED</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Toll Cost</span>
                      <span>{route.tollCost} AED</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total Cost</span>
                      <span>{(route.fuelCost + route.tollCost).toFixed(2)} AED</span>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                {route.highlights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600">Route Highlights</h4>
                    <div className="space-y-1">
                      {route.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {route.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Considerations
                    </h4>
                    <div className="space-y-1">
                      {route.warnings.map((warning, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Environmental Impact */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Environmental Impact</span>
                  </div>
                  <p className="text-sm text-green-700">
                    This route will produce {route.co2Emissions} kg of CO₂ emissions.
                    {route.co2Emissions < 3.5 && " Great choice for the environment! 🌱"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}