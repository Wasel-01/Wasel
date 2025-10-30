import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation, MapPin, Route, Zap, Eye, Volume2, VolumeX, Settings, Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';

interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: 'straight' | 'left' | 'right' | 'slight-left' | 'slight-right' | 'sharp-left' | 'sharp-right' | 'u-turn';
  coordinates: [number, number];
}

interface AdvancedMapNavigationProps {
  origin: [number, number];
  destination: [number, number];
  waypoints?: [number, number][];
  isActive?: boolean;
  onNavigationUpdate?: (step: NavigationStep) => void;
}

export default function AdvancedMapNavigation({
  origin,
  destination,
  waypoints = [],
  isActive = false,
  onNavigationUpdate
}: AdvancedMapNavigationProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [arMode, setArMode] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'dark'>('standard');
  const [zoom, setZoom] = useState([15]);
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialize advanced map with Mapbox GL JS
  useEffect(() => {
    if (!mapRef.current) return;

    // Create advanced 3D map
    const initMap = async () => {
      const mapboxgl = await import('mapbox-gl');
      
      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: getMapStyle(mapStyle),
        center: origin,
        zoom: zoom[0],
        pitch: 60, // 3D perspective
        bearing: heading,
        antialias: true
      });

      // Add 3D buildings
      map.on('style.load', () => {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        });
        
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
        
        // Add 3D buildings layer
        map.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });
      });

      // Add route visualization
      addRouteVisualization(map);
      
      // Add real-time location tracking
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            const newLocation: [number, number] = [
              position.coords.longitude,
              position.coords.latitude
            ];
            setUserLocation(newLocation);
            setSpeed(position.coords.speed || 0);
            
            // Update map center to follow user
            if (isNavigating) {
              map.easeTo({
                center: newLocation,
                bearing: heading,
                duration: 1000
              });
            }
          },
          (error) => console.error('Location error:', error),
          { enableHighAccuracy: true, maximumAge: 1000 }
        );
      }

      // Add device orientation for compass
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
          if (event.alpha !== null) {
            setHeading(event.alpha);
            if (isNavigating) {
              map.setBearing(event.alpha);
            }
          }
        });
      }
    };

    initMap();
  }, [mapStyle, isNavigating]);

  const getMapStyle = (style: string) => {
    switch (style) {
      case 'satellite': return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'dark': return 'mapbox://styles/mapbox/dark-v11';
      default: return 'mapbox://styles/mapbox/streets-v12';
    }
  };

  const addRouteVisualization = (map: any) => {
    // Add animated route line
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [origin, ...waypoints, destination]
        }
      }
    });

    // Animated route line
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#00ff88',
        'line-width': 8,
        'line-opacity': 0.8,
        'line-gradient': [
          'interpolate',
          ['linear'],
          ['line-progress'],
          0, '#00ff88',
          0.5, '#0088ff',
          1, '#ff0088'
        ]
      }
    });

    // Add turn-by-turn markers
    navigationSteps.forEach((step, index) => {
      const el = document.createElement('div');
      el.className = 'navigation-marker';
      el.innerHTML = getManeuverIcon(step.maneuver);
      
      new (map as any).Marker(el)
        .setLngLat(step.coordinates)
        .addTo(map);
    });
  };

  const getManeuverIcon = (maneuver: string) => {
    const icons = {
      'straight': '↑',
      'left': '←',
      'right': '→',
      'slight-left': '↖',
      'slight-right': '↗',
      'sharp-left': '↙',
      'sharp-right': '↘',
      'u-turn': '↩'
    };
    return `<div class="maneuver-icon">${icons[maneuver as keyof typeof icons] || '●'}</div>`;
  };

  const speakInstruction = (instruction: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const startNavigation = () => {
    setIsNavigating(true);
    // Generate mock navigation steps
    const mockSteps: NavigationStep[] = [
      {
        instruction: "Head north on Sheikh Zayed Road",
        distance: 500,
        duration: 60,
        maneuver: 'straight',
        coordinates: origin
      },
      {
        instruction: "Turn right onto Dubai Marina Walk",
        distance: 300,
        duration: 45,
        maneuver: 'right',
        coordinates: [origin[0] + 0.001, origin[1] + 0.001]
      },
      {
        instruction: "Continue straight for 2 km",
        distance: 2000,
        duration: 180,
        maneuver: 'straight',
        coordinates: [origin[0] + 0.002, origin[1] + 0.002]
      }
    ];
    setNavigationSteps(mockSteps);
    speakInstruction(mockSteps[0].instruction);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentStep(0);
    window.speechSynthesis.cancel();
  };

  const formatDistance = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes} min` : `${seconds} sec`;
  };

  return (
    <div className="space-y-4">
      {/* Navigation Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              Advanced Navigation
            </CardTitle>
            <div className="flex items-center gap-2">
              {isNavigating && (
                <Badge variant="default" className="bg-green-500">
                  <Zap className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
              <Button
                onClick={isNavigating ? stopNavigation : startNavigation}
                variant={isNavigating ? "destructive" : "default"}
                size="sm"
              >
                {isNavigating ? "Stop" : "Start"} Navigation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Instruction */}
          {isNavigating && navigationSteps[currentStep] && (
            <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {getManeuverIcon(navigationSteps[currentStep].maneuver)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {navigationSteps[currentStep].instruction}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>📍 {formatDistance(navigationSteps[currentStep].distance)}</span>
                    <span>⏱️ {formatDuration(navigationSteps[currentStep].duration)}</span>
                    {speed > 0 && <span>🚗 {Math.round(speed * 3.6)} km/h</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Guidance</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={voiceEnabled}
                  onCheckedChange={setVoiceEnabled}
                />
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">AR Mode</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={arMode}
                  onCheckedChange={setArMode}
                />
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Map Style</label>
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="standard">Standard</option>
                <option value="satellite">Satellite</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom Level</label>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                max={20}
                min={10}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Compass */}
          <div className="flex items-center justify-center">
            <div className="relative w-16 h-16">
              <Compass 
                className="w-16 h-16 text-primary"
                style={{ transform: `rotate(${heading}deg)` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{Math.round(heading)}°</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="w-full h-[600px] rounded-lg overflow-hidden"
            style={{ minHeight: '600px' }}
          />
        </CardContent>
      </Card>

      {/* AR Overlay (when AR mode is enabled) */}
      {arMode && (
        <Card className="bg-black/90 text-white">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl">🔍 AR Navigation Mode</div>
              <p className="text-sm opacity-80">
                Point your camera forward to see navigation overlays
              </p>
              <div className="flex justify-center items-center gap-4 mt-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Camera Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Steps */}
      {isNavigating && navigationSteps.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {navigationSteps.slice(currentStep + 1, currentStep + 4).map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg">
                    {getManeuverIcon(step.maneuver)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.instruction}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistance(step.distance)} • {formatDuration(step.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}