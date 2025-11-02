import { supabase } from '../utils/supabase/client';

export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export const locationService = {
  // Start tracking user location
  startTracking(tripId: string, onLocationUpdate: (location: Location) => void): number | null {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        };

        onLocationUpdate(location);
        this.updateTripLocation(tripId, location);
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  },

  // Stop tracking
  stopTracking(watchId: number) {
    navigator.geolocation.clearWatch(watchId);
  },

  // Update trip location in real-time
  async updateTripLocation(tripId: string, location: Location) {
    if (!supabase) return;

    await supabase.from('trip_locations').upsert({
      trip_id: tripId,
      lat: location.lat,
      lng: location.lng,
      heading: location.heading,
      speed: location.speed,
      updated_at: new Date().toISOString()
    });
  },

  // Subscribe to driver location updates
  subscribeToDriverLocation(tripId: string, callback: (location: Location) => void) {
    if (!supabase) return null;

    return supabase
      .channel(`trip:${tripId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trip_locations', filter: `trip_id=eq.${tripId}` },
        (payload: any) => {
          if (payload.new) {
            callback({
              lat: payload.new.lat,
              lng: payload.new.lng,
              timestamp: Date.now(),
              heading: payload.new.heading,
              speed: payload.new.speed
            });
          }
        }
      )
      .subscribe();
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Calculate ETA based on current location and destination
  calculateETA(currentLat: number, currentLng: number, destLat: number, destLng: number, avgSpeed = 60): number {
    const distance = this.calculateDistance(currentLat, currentLng, destLat, destLng);
    return Math.round((distance / avgSpeed) * 60); // minutes
  },

  // Get current position once
  async getCurrentPosition(): Promise<Location> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy
        }),
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
};
