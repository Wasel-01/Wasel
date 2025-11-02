import { supabase } from '../utils/supabase/client';

export interface CancellationPolicy {
  canCancel: boolean;
  fee: number;
  feePercentage: number;
  reason: string;
  hoursBeforeTrip: number;
}

export const cancellationService = {
  // Calculate cancellation fee based on time before trip
  calculateCancellationFee(
    tripDate: string,
    tripTime: string,
    bookingAmount: number
  ): CancellationPolicy {
    const tripDateTime = new Date(`${tripDate}T${tripTime}`);
    const now = new Date();
    const hoursUntilTrip = (tripDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Free cancellation if more than 24 hours before trip
    if (hoursUntilTrip > 24) {
      return {
        canCancel: true,
        fee: 0,
        feePercentage: 0,
        reason: 'Free cancellation (more than 24 hours before trip)',
        hoursBeforeTrip: hoursUntilTrip
      };
    }

    // 50% fee if 12-24 hours before trip
    if (hoursUntilTrip > 12) {
      return {
        canCancel: true,
        fee: bookingAmount * 0.5,
        feePercentage: 50,
        reason: '50% cancellation fee (12-24 hours before trip)',
        hoursBeforeTrip: hoursUntilTrip
      };
    }

    // 75% fee if 6-12 hours before trip
    if (hoursUntilTrip > 6) {
      return {
        canCancel: true,
        fee: bookingAmount * 0.75,
        feePercentage: 75,
        reason: '75% cancellation fee (6-12 hours before trip)',
        hoursBeforeTrip: hoursUntilTrip
      };
    }

    // 100% fee if less than 6 hours before trip
    if (hoursUntilTrip > 0) {
      return {
        canCancel: true,
        fee: bookingAmount,
        feePercentage: 100,
        reason: '100% cancellation fee (less than 6 hours before trip)',
        hoursBeforeTrip: hoursUntilTrip
      };
    }

    // Cannot cancel after trip has started
    return {
      canCancel: false,
      fee: bookingAmount,
      feePercentage: 100,
      reason: 'Cannot cancel - trip has already started',
      hoursBeforeTrip: hoursUntilTrip
    };
  },

  // Cancel booking
  async cancelBooking(
    bookingId: string,
    userId: string,
    reason: string,
    isDriver: boolean = false
  ) {
    if (!supabase) throw new Error('Service not available');

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, trip:trips(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError) throw bookingError;
    if (!booking) throw new Error('Booking not found');

    // Calculate cancellation fee
    const policy = this.calculateCancellationFee(
      booking.trip.departure_date,
      booking.trip.departure_time,
      booking.total_price
    );

    if (!policy.canCancel) {
      throw new Error(policy.reason);
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: reason
      })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    // Process refund if applicable
    const refundAmount = booking.total_price - policy.fee;
    if (refundAmount > 0) {
      await this.processRefund(bookingId, booking.passenger_id, refundAmount, policy.reason);
    }

    // Charge cancellation fee to the cancelling party
    if (policy.fee > 0) {
      const feeRecipient = isDriver ? booking.passenger_id : booking.trip.driver_id;
      await this.chargeCancellationFee(bookingId, userId, feeRecipient, policy.fee);
    }

    // Send notifications
    await this.sendCancellationNotifications(booking, userId, isDriver, policy);

    return { policy, refundAmount };
  },

  // Process refund
  async processRefund(bookingId: string, userId: string, amount: number, reason: string) {
    if (!supabase) return;

    await supabase.from('transactions').insert({
      to_user_id: userId,
      booking_id: bookingId,
      amount,
      currency: 'AED',
      payment_method: 'wallet',
      payment_status: 'completed',
      description: `Refund: ${reason}`,
      completed_at: new Date().toISOString()
    });
  },

  // Charge cancellation fee
  async chargeCancellationFee(
    bookingId: string,
    fromUserId: string,
    toUserId: string,
    amount: number
  ) {
    if (!supabase) return;

    await supabase.from('transactions').insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      booking_id: bookingId,
      amount,
      currency: 'AED',
      payment_method: 'wallet',
      payment_status: 'completed',
      description: 'Cancellation fee',
      completed_at: new Date().toISOString()
    });
  },

  // Send cancellation notifications
  async sendCancellationNotifications(
    booking: any,
    cancelledBy: string,
    isDriver: boolean,
    policy: CancellationPolicy
  ) {
    if (!supabase) return;

    const recipientId = isDriver ? booking.passenger_id : booking.trip.driver_id;
    const cancellerRole = isDriver ? 'driver' : 'passenger';

    await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'trip_cancelled',
      title: 'Trip Cancelled',
      message: `The ${cancellerRole} cancelled the trip. ${policy.reason}`,
      booking_id: booking.id,
      priority: 'high'
    });
  },

  // Get cancellation history
  async getCancellationHistory(userId: string) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('bookings')
      .select('*, trip:trips(*)')
      .eq('status', 'cancelled')
      .or(`passenger_id.eq.${userId},cancelled_by.eq.${userId}`)
      .order('cancelled_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  // Get cancellation rate for user
  async getCancellationRate(userId: string): Promise<number> {
    if (!supabase) return 0;

    const { data: allBookings } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('passenger_id', userId);

    if (!allBookings || allBookings.length === 0) return 0;

    const cancelled = allBookings.filter(b => b.status === 'cancelled').length;
    return (cancelled / allBookings.length) * 100;
  }
};
