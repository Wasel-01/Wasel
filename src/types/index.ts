export * from './database';
export * from './components';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  origin: any;
  destination: any;
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
  status: string;
}