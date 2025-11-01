import { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';

export function useTrips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripsAPI.getDriverTrips();
      setTrips(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const searchTrips = async (from?: string, to?: string, date?: string) => {
    try {
      setLoading(true);
      const data = await tripsAPI.searchTrips(from, to, date);
      setTrips(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search trips');
    } finally {
      setLoading(false);
    }
  };

  return {
    trips,
    loading,
    error,
    refresh: loadTrips,
    searchTrips
  };
}