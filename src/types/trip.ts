// Types for the trip-related features
export interface Trip {
  id: string;
  type: 'fixed-route' | 'long-distance';
  driver: Driver;
  origin: string;
  destination: string;
  departureTime: string;
  distance: number;
  duration: number;
  pricePerSeat: number;
  seatsAvailable: number;
  paymentMethods: string[];
  vehicle: Vehicle;
  stops?: TripStop[];
  frequency?: string;
  additionalInfo?: string;
  status: TripStatus;
}

export interface Driver {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  tripsCompleted: number;
  verified: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  seatingCapacity: number;
}

export interface TripStop {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  arrivalTime: string;
  departureTime: string;
  type: 'pickup' | 'dropoff' | 'both';
}

export interface TripBooking {
  id: string;
  tripId: string;
  userId: string;
  seats: number;
  pickup: TripStop;
  dropoff: TripStop;
  status: BookingStatus;
  price: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export type TripStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';