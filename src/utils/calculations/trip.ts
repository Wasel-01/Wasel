/**
 * Trip-related calculation utilities
 */

// Calculate trip price based on distance and capacity
export const calculateTripPrice = (
  distanceKm: number,
  passengers: number,
  isExpressRoute: boolean = false
): number => {
  const basePrice = 5; // Base price in AED
  const perKmRate = 0.5; // AED per kilometer
  const expressMultiplier = isExpressRoute ? 1.2 : 1;
  const volumeDiscount = passengers > 2 ? 0.9 : 1; // 10% discount for 3+ passengers

  const price = (basePrice + (distanceKm * perKmRate)) * passengers * expressMultiplier * volumeDiscount;
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

// Calculate estimated trip duration based on distance and traffic
export const calculateTripDuration = (
  distanceKm: number,
  trafficMultiplier: number = 1
): number => {
  const avgSpeedKmh = 60; // Average speed in km/h
  const baseMinutes = (distanceKm / avgSpeedKmh) * 60;
  return Math.round(baseMinutes * trafficMultiplier);
};

// Calculate cancellation fee based on time until trip
export const calculateCancellationFee = (
  bookingAmount: number,
  hoursUntilTrip: number
): number => {
  if (hoursUntilTrip > 24) {
    return 0;
  }
  if (hoursUntilTrip > 12) {
    return bookingAmount * 0.3; // 30% fee
  }
  if (hoursUntilTrip > 6) {
    return bookingAmount * 0.5; // 50% fee
  }
  return bookingAmount * 0.8; // 80% fee
};