/**
 * Booking-related calculation utilities
 */

// Generates a unique booking reference
export const generateBookingReference = (): string => {
  const prefix = 'WAS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};