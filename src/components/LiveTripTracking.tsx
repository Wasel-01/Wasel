import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Navigation, Clock, Phone, MessageSquare } from 'lucide-react';
import { useLocationTracking, useRealtimeChat, useNotifications } from '../hooks/useCriticalFeatures';
import { toast } from 'sonner';

interface LiveTripTrackingProps {
  tripId: string;
  bookingId: string;
  driverName: string;
  driverPhone: string;
  isDriver: boolean;
}

export function LiveTripTracking({ tripId, bookingId, driverName, driverPhone, isDriver }: LiveTripTrackingProps) {
  const { currentLocation, driverLocation, startTracking, stopTracking } = useLocationTracking(tripId);
  const { messages, sendMessage } = useRealtimeChat(tripId);
  const { notifications } = useNotifications();
  const [watchId, setWatchId] = useState<number | null>(null);
  const [eta, setEta] = useState<number>(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Start tracking when component mounts
    if (isDriver) {
      const id = startTracking();
      if (id) setWatchId(id);
    }

    return () => {
      if (watchId) stopTracking(watchId);
    };
  }, []);

  useEffect(() => {
    // Calculate ETA when driver location updates
    if (driverLocation && currentLocation) {
      const distance = calculateDistance(
        driverLocation.lat,
        driverLocation.lng,
        currentLocation.lat,
        currentLocation.lng
      );
      setEta(Math.round((distance / 60) * 60)); // Assuming 60 km/h average speed
    }
  }, [driverLocation, currentLocation]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage('');
    toast.success('Message sent');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Trip Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Trip Tracking</CardTitle>
            <Badge variant="default" className="animate-pulse">
              <Navigation className="size-3 mr-1" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Driver Info */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">{driverName}</p>
              <p className="text-sm text-muted-foreground">Driver</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Phone className="size-4" />
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="size-4" />
              </Button>
            </div>
          </div>

          {/* Location Info */}
          {driverLocation && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="size-4 text-primary" />
                  <p className="text-sm font-medium">Driver Location</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-primary" />
                  <p className="text-sm font-medium">ETA</p>
                </div>
                <p className="text-2xl font-bold">{eta} min</p>
              </div>
            </div>
          )}

          {/* Map Placeholder */}
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="size-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Map view would display here</p>
              <p className="text-xs text-muted-foreground">Integrate with Mapbox/Google Maps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {messages.slice(-5).map((msg) => (
              <div key={msg.id} className={`p-2 rounded-lg ${msg.sender_id === tripId ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trip Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
