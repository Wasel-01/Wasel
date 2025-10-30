import { useState, useEffect } from 'react';
import { Navigation, Map, Route, Zap, Eye, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import AdvancedMapNavigation from './AdvancedMapNavigation';
import SmartRouteOptimizer from './SmartRouteOptimizer';
import ARNavigationOverlay from './ARNavigationOverlay';
import { MapComponent } from './MapComponent';

interface NavigationHubProps {
  origin: [number, number];
  destination: [number, number];
  waypoints?: [number, number][];
}

export default function NavigationHub({
  origin,
  destination,
  waypoints = []
}: NavigationHubProps) {
  const [activeMode, setActiveMode] = useState<'standard' | 'advanced' | 'ar'>('standard');
  const [preferences, setPreferences] = useState({
    priority: 'fastest' as 'fastest' | 'shortest' | 'cheapest' | 'eco',
    avoidTolls: false,
    avoidHighways: false,
    vehicleType: 'car' as 'car' | 'motorcycle' | 'electric'
  });
  const [navigationSettings, setNavigationSettings] = useState({
    voiceGuidance: true,
    realTimeTraffic: true,
    show3D: false,
    arMode: false,
    mapStyle: 'standard' as 'standard' | 'satellite' | 'dark' | 'terrain'
  });
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(origin);
  const [heading, setHeading] = useState(0);

  // Mock AR instructions
  const arInstructions = [
    {
      type: 'turn' as const,
      direction: 'right' as const,
      distance: 200,
      instruction: 'Turn right onto Sheikh Zayed Road',
      confidence: 95,
      position: { x: 300, y: 200 }
    },
    {
      type: 'straight' as const,
      direction: 'straight' as const,
      distance: 500,
      instruction: 'Continue straight for 500m',
      confidence: 88,
      position: { x: 400, y: 150 }
    }
  ];

  // Mock locations for map
  const mapLocations = [
    { lat: origin[1], lng: origin[0], label: 'Starting Point', type: 'start' as const },
    ...waypoints.map((wp, index) => ({
      lat: wp[1], lng: wp[0], label: `Stop ${index + 1}`, type: 'stop' as const
    })),
    { lat: destination[1], lng: destination[0], label: 'Destination', type: 'destination' as const },
    { lat: currentLocation[1], lng: currentLocation[0], label: 'Your Location', type: 'current' as const }
  ];

  const handleRouteSelect = (route: any) => {
    console.log('Selected route:', route);
    // Handle route selection logic
  };

  return (
    <div className="space-y-6">
      {/* Navigation Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Navigation Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={activeMode === 'standard' ? 'default' : 'outline'}
              onClick={() => setActiveMode('standard')}
              className="h-20 flex flex-col gap-2"
            >
              <Map className="w-6 h-6" />
              <span>Standard Map</span>
            </Button>
            <Button
              variant={activeMode === 'advanced' ? 'default' : 'outline'}
              onClick={() => setActiveMode('advanced')}
              className="h-20 flex flex-col gap-2"
            >
              <Zap className="w-6 h-6" />
              <span>Advanced 3D</span>
            </Button>
            <Button
              variant={activeMode === 'ar' ? 'default' : 'outline'}
              onClick={() => setActiveMode('ar')}
              className="h-20 flex flex-col gap-2"
            >
              <Eye className="w-6 h-6" />
              <span>AR Navigation</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Navigation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Guidance</label>
              <Switch
                checked={navigationSettings.voiceGuidance}
                onCheckedChange={(checked) => 
                  setNavigationSettings(prev => ({ ...prev, voiceGuidance: checked }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Real-time Traffic</label>
              <Switch
                checked={navigationSettings.realTimeTraffic}
                onCheckedChange={(checked) => 
                  setNavigationSettings(prev => ({ ...prev, realTimeTraffic: checked }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">3D View</label>
              <Switch
                checked={navigationSettings.show3D}
                onCheckedChange={(checked) => 
                  setNavigationSettings(prev => ({ ...prev, show3D: checked }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Map Style</label>
              <select
                value={navigationSettings.mapStyle}
                onChange={(e) => 
                  setNavigationSettings(prev => ({ ...prev, mapStyle: e.target.value as any }))
                }
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="standard">Standard</option>
                <option value="satellite">Satellite</option>
                <option value="dark">Dark</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Navigation Interface */}
      <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="ar">AR Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Route Optimizer */}
            <SmartRouteOptimizer
              origin={origin}
              destination={destination}
              preferences={preferences}
              onRouteSelect={handleRouteSelect}
            />
            
            {/* Standard Map */}
            <Card>
              <CardHeader>
                <CardTitle>Route Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <MapComponent
                  locations={mapLocations}
                  showRoute={true}
                  height="500px"
                  style={navigationSettings.mapStyle}
                  showTraffic={navigationSettings.realTimeTraffic}
                  show3D={navigationSettings.show3D}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedMapNavigation
            origin={origin}
            destination={destination}
            waypoints={waypoints}
            isActive={activeMode === 'advanced'}
            onNavigationUpdate={(step) => console.log('Navigation update:', step)}
          />
        </TabsContent>

        <TabsContent value="ar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Augmented Reality Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <ARNavigationOverlay
                isActive={activeMode === 'ar'}
                currentLocation={currentLocation}
                heading={heading}
                instructions={arInstructions}
                onToggle={(active) => setActiveMode(active ? 'ar' : 'standard')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Route Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Route Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={preferences.priority}
                onChange={(e) => 
                  setPreferences(prev => ({ ...prev, priority: e.target.value as any }))
                }
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="fastest">Fastest Route</option>
                <option value="shortest">Shortest Distance</option>
                <option value="cheapest">Most Economical</option>
                <option value="eco">Eco-Friendly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Type</label>
              <select
                value={preferences.vehicleType}
                onChange={(e) => 
                  setPreferences(prev => ({ ...prev, vehicleType: e.target.value as any }))
                }
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="electric">Electric Vehicle</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Avoid Tolls</label>
              <Switch
                checked={preferences.avoidTolls}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, avoidTolls: checked }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Avoid Highways</label>
              <Switch
                checked={preferences.avoidHighways}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, avoidHighways: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}