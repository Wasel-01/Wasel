import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';

export function useBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsAPI.getUserBookings();
      setBookings(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (tripId: string, seatsBooked: number) => {
    try {
      const booking = await bookingsAPI.createBooking(tripId, seatsBooked);
      setBookings(prev => [booking, ...prev]);
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    }
  };

  return {
    bookings,
    loading,
    error,
    refresh: loadBookings,
    createBooking
  };
}