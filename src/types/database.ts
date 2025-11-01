export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'rider' | 'driver' | 'admin'
          status: 'active' | 'inactive' | 'suspended'
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'rider' | 'driver' | 'admin'
          status?: 'active' | 'inactive' | 'suspended'
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'rider' | 'driver' | 'admin'
          status?: 'active' | 'inactive' | 'suspended'
        }
      }
      trips: {
        Row: {
          id: string
          created_at: string
          driver_id: string
          status: 'scheduled' | 'active' | 'completed' | 'cancelled'
          origin: Json
          destination: Json
          departure_time: string
          seats_available: number
          price_per_seat: number
          vehicle_id: string | null
          route_type: 'fixed' | 'flexible'
          stops: Json[]
        }
        Insert: {
          id?: string
          created_at?: string
          driver_id: string
          status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
          origin: Json
          destination: Json
          departure_time: string
          seats_available: number
          price_per_seat: number
          vehicle_id?: string | null
          route_type?: 'fixed' | 'flexible'
          stops?: Json[]
        }
        Update: {
          id?: string
          created_at?: string
          driver_id?: string
          status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
          origin?: Json
          destination?: Json
          departure_time?: string
          seats_available?: number
          price_per_seat?: number
          vehicle_id?: string | null
          route_type?: 'fixed' | 'flexible'
          stops?: Json[]
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          trip_id: string
          rider_id: string
          seats_booked: number
          status: 'pending' | 'confirmed' | 'cancelled'
          pickup_location: Json
          dropoff_location: Json
          amount: number
        }
        Insert: {
          id?: string
          created_at?: string
          trip_id: string
          rider_id: string
          seats_booked: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          pickup_location: Json
          dropoff_location: Json
          amount: number
        }
        Update: {
          id?: string
          created_at?: string
          trip_id?: string
          rider_id?: string
          seats_booked?: number
          status?: 'pending' | 'confirmed' | 'cancelled'
          pickup_location?: Json
          dropoff_location?: Json
          amount?: number
        }
      }
      vehicles: {
        Row: {
          id: string
          created_at: string
          driver_id: string
          make: string
          model: string
          year: number
          color: string
          plate_number: string
          seat_capacity: number
          status: 'active' | 'inactive'
        }
        Insert: {
          id?: string
          created_at?: string
          driver_id: string
          make: string
          model: string
          year: number
          color: string
          plate_number: string
          seat_capacity: number
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          created_at?: string
          driver_id?: string
          make?: string
          model?: string
          year?: number
          color?: string
          plate_number?: string
          seat_capacity?: number
          status?: 'active' | 'inactive'
        }
      }
      referral_codes: {
        Row: {
          id: string
          created_at: string
          user_id: string
          code: string
          uses_count: number
          max_uses: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          code: string
          uses_count?: number
          max_uses?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          code?: string
          uses_count?: number
          max_uses?: number | null
          is_active?: boolean
        }
      }
      incentive_campaigns: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          campaign_type: string
          target_audience: 'both' | 'drivers' | 'riders'
          reward_type: 'cash' | 'credit' | 'discount' | 'free_ride'
          reward_amount: number
          starts_at: string
          ends_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          campaign_type: string
          target_audience?: 'both' | 'drivers' | 'riders'
          reward_type: 'cash' | 'credit' | 'discount' | 'free_ride'
          reward_amount: number
          starts_at: string
          ends_at: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          campaign_type?: string
          target_audience?: 'both' | 'drivers' | 'riders'
          reward_type?: 'cash' | 'credit' | 'discount' | 'free_ride'
          reward_amount?: number
          starts_at?: string
          ends_at?: string
          is_active?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          message: string
          read: boolean
          read_at: string | null
          type: 'info' | 'success' | 'warning' | 'error'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          message: string
          read?: boolean
          read_at?: string | null
          type?: 'info' | 'success' | 'warning' | 'error'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean
          read_at?: string | null
          type?: 'info' | 'success' | 'warning' | 'error'
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          phone: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_referral_performance: {
        Args: { user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}