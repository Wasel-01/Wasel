/**
 * Consolidated calculations module
 * Exports all calculation utilities organized by domain
 */

// Trip calculations
export {
  calculateTripPrice,
  calculateTripDuration,
  calculateCancellationFee,
} from './trip';

// Booking calculations
export {
  generateBookingReference,
} from './booking';