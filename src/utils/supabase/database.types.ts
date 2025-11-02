export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_category: string | null
          event_data: Json | null
          event_name: string
          id: string
          ip_address: string | null
          platform: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: string | null
          platform?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: string | null
          platform?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          completed_at: string | null
          created_at: string | null
          dropoff_lat: number | null
          dropoff_lng: number | null
          dropoff_location: string | null
          id: string
          notes: string | null
          passenger_id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_location: string | null
          rejected_at: string | null
          seats_requested: number
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          trip_id: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          dropoff_location?: string | null
          id?: string
          notes?: string | null
          passenger_id: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location?: string | null
          rejected_at?: string | null
          seats_requested?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          trip_id: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          dropoff_location?: string | null
          id?: string
          notes?: string | null
          passenger_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location?: string | null
          rejected_at?: string | null
          seats_requested?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          metadata: Json | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_check: {
        Row: {
          created_at: string | null
          id: number
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          status?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          image_url: string | null
          location_lat: number | null
          location_lng: number | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          read_at: string | null
          read_by: string[] | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          read_at?: string | null
          read_by?: string[] | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          read_at?: string | null
          read_by?: string[] | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_data: Json | null
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          message_id: string | null
          priority: string | null
          read: boolean | null
          read_at: string | null
          title: string
          trip_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          message_id?: string | null
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title: string
          trip_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          message_id?: string | null
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          trip_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bio_ar: string | null
          city: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          full_name_ar: string | null
          gender: string | null
          id: string
          is_verified: boolean | null
          language: string | null
          last_active_at: string | null
          location_sharing_enabled: boolean | null
          notification_enabled: boolean | null
          pets_allowed: boolean | null
          phone: string | null
          phone_verified: boolean | null
          preferred_temperature: string | null
          rating_as_driver: number | null
          rating_as_passenger: number | null
          smoking_allowed: boolean | null
          total_earned: number | null
          total_ratings_received: number | null
          total_spent: number | null
          total_trips: number | null
          total_trips_as_driver: number | null
          total_trips_as_passenger: number | null
          updated_at: string | null
          verification_level: number | null
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bio_ar?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          full_name_ar?: string | null
          gender?: string | null
          id: string
          is_verified?: boolean | null
          language?: string | null
          last_active_at?: string | null
          location_sharing_enabled?: boolean | null
          notification_enabled?: boolean | null
          pets_allowed?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_temperature?: string | null
          rating_as_driver?: number | null
          rating_as_passenger?: number | null
          smoking_allowed?: boolean | null
          total_earned?: number | null
          total_ratings_received?: number | null
          total_spent?: number | null
          total_trips?: number | null
          total_trips_as_driver?: number | null
          total_trips_as_passenger?: number | null
          updated_at?: string | null
          verification_level?: number | null
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bio_ar?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          full_name_ar?: string | null
          gender?: string | null
          id?: string
          is_verified?: boolean | null
          language?: string | null
          last_active_at?: string | null
          location_sharing_enabled?: boolean | null
          notification_enabled?: boolean | null
          pets_allowed?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_temperature?: string | null
          rating_as_driver?: number | null
          rating_as_passenger?: number | null
          smoking_allowed?: boolean | null
          total_earned?: number | null
          total_ratings_received?: number | null
          total_spent?: number | null
          total_trips?: number | null
          total_trips_as_driver?: number | null
          total_trips_as_passenger?: number | null
          updated_at?: string | null
          verification_level?: number | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      recurring_trips: {
        Row: {
          available_seats: number
          created_at: string | null
          days_of_week: number[]
          departure_time: string
          driver_id: string
          from_lat: number
          from_lng: number
          from_location: string
          id: string
          is_active: boolean | null
          name: string
          paused_at: string | null
          price_per_seat: number
          to_lat: number
          to_lng: number
          to_location: string
          total_bookings: number | null
          total_trips_created: number | null
          trip_type: Database["public"]["Enums"]["trip_type"]
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          vehicle_id: string | null
        }
        Insert: {
          available_seats: number
          created_at?: string | null
          days_of_week: number[]
          departure_time: string
          driver_id: string
          from_lat: number
          from_lng: number
          from_location: string
          id?: string
          is_active?: boolean | null
          name: string
          paused_at?: string | null
          price_per_seat: number
          to_lat: number
          to_lng: number
          to_location: string
          total_bookings?: number | null
          total_trips_created?: number | null
          trip_type: Database["public"]["Enums"]["trip_type"]
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vehicle_id?: string | null
        }
        Update: {
          available_seats?: number
          created_at?: string | null
          days_of_week?: number[]
          departure_time?: string
          driver_id?: string
          from_lat?: number
          from_lng?: number
          from_location?: string
          id?: string
          is_active?: boolean | null
          name?: string
          paused_at?: string | null
          price_per_seat?: number
          to_lat?: number
          to_lng?: number
          to_location?: string
          total_bookings?: number | null
          total_trips_created?: number | null
          trip_type?: Database["public"]["Enums"]["trip_type"]
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          cleanliness_rating: number | null
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          driving_rating: number | null
          id: string
          is_visible: boolean | null
          overall_rating: number
          punctuality_rating: number | null
          quick_tags: string[] | null
          reviewee_id: string
          reviewer_id: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          cleanliness_rating?: number | null
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          driving_rating?: number | null
          id?: string
          is_visible?: boolean | null
          overall_rating: number
          punctuality_rating?: number | null
          quick_tags?: string[] | null
          reviewee_id: string
          reviewer_id: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          cleanliness_rating?: number | null
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          driving_rating?: number | null
          id?: string
          is_visible?: boolean | null
          overall_rating?: number
          punctuality_rating?: number | null
          quick_tags?: string[] | null
          reviewee_id?: string
          reviewer_id?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          id: string
          incident_type: string
          location_lat: number | null
          location_lng: number | null
          reported_by: string
          resolution: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          trip_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          id?: string
          incident_type: string
          location_lat?: number | null
          location_lng?: number | null
          reported_by: string
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          trip_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          id?: string
          incident_type?: string
          location_lat?: number | null
          location_lng?: number | null
          reported_by?: string
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          trip_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incidents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incidents_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          from_location: string
          id: string
          name: string
          notification_enabled: boolean | null
          preferences: Json | null
          to_location: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_location: string
          id?: string
          name: string
          notification_enabled?: boolean | null
          preferences?: Json | null
          to_location: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_location?: string
          id?: string
          name?: string
          notification_enabled?: boolean | null
          preferences?: Json | null
          to_location?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          failed_at: string | null
          from_user_id: string | null
          gateway_name: string | null
          gateway_transaction_id: string | null
          id: string
          metadata: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          refunded_at: string | null
          refund_amount: number | null
          refund_reason: string | null
          to_user_id: string | null
          trip_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          failed_at?: string | null
          from_user_id?: string | null
          gateway_name?: string | null
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          refunded_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          to_user_id?: string | null
          trip_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          failed_at?: string | null
          from_user_id?: string | null
          gateway_name?: string | null
          gateway_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          refunded_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          to_user_id?: string | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stops: {
        Row: {
          created_at: string | null
          estimated_arrival_time: string | null
          id: string
          lat: number
          lng: number
          location: string
          location_geom: unknown | null
          stop_order: number
          trip_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_arrival_time?: string | null
          id?: string
          lat: number
          lng: number
          location: string
          location_geom?: unknown | null
          stop_order: number
          trip_id: string
        }
        Update: {
          created_at?: string | null
          estimated_arrival_time?: string | null
          id?: string
          lat?: number
          lng?: number
          location?: string
          location_geom?: unknown | null
          stop_order?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          actual_arrival_time: string | null
          actual_departure_time: string | null
          available_seats: number
          cancelled_at: string | null
          cancellation_reason: string | null
          created_at: string | null
          departure_date: string
          departure_time: string
          driver_id: string
          estimated_arrival_time: string | null
          from_lat: number
          from_lng: number
          from_location: string
          from_location_geom: unknown | null
          id: string
          luggage_allowed: boolean | null
          notes: string | null
          price_per_seat: number
          published_at: string | null
          recurring_trip_id: string | null
          seats_booked: number | null
          status: Database["public"]["Enums"]["trip_status"] | null
          to_lat: number
          to_lng: number
          to_location: string
          to_location_geom: unknown | null
          trip_type: Database["public"]["Enums"]["trip_type"]
          tsv_from: unknown | null
          tsv_to: unknown | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          actual_arrival_time?: string | null
          actual_departure_time?: string | null
          available_seats: number
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          departure_date: string
          departure_time: string
          driver_id: string
          estimated_arrival_time?: string | null
          from_lat: number
          from_lng: number
          from_location: string
          from_location_geom?: unknown | null
          id?: string
          luggage_allowed?: boolean | null
          notes?: string | null
          price_per_seat: number
          published_at?: string | null
          recurring_trip_id?: string | null
          seats_booked?: number | null
          status?: Database["public"]["Enums"]["trip_status"] | null
          to_lat: number
          to_lng: number
          to_location: string
          to_location_geom?: unknown | null
          trip_type: Database["public"]["Enums"]["trip_type"]
          tsv_from?: unknown | null
          tsv_to?: unknown | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          actual_arrival_time?: string | null
          actual_departure_time?: string | null
          available_seats?: number
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          departure_date?: string
          departure_time?: string
          driver_id?: string
          estimated_arrival_time?: string | null
          from_lat?: number
          from_lng?: number
          from_location?: string
          from_location_geom?: unknown | null
          id?: string
          luggage_allowed?: boolean | null
          notes?: string | null
          price_per_seat?: number
          published_at?: string | null
          recurring_trip_id?: string | null
          seats_booked?: number | null
          status?: Database["public"]["Enums"]["trip_status"] | null
          to_lat?: number
          to_lng?: number
          to_location?: string
          to_location_geom?: unknown | null
          trip_type?: Database["public"]["Enums"]["trip_type"]
          tsv_from?: unknown | null
          tsv_to?: unknown | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_recurring_trip_id_fkey"
            columns: ["recurring_trip_id"]
            isOneToOne: false
            referencedRelation: "recurring_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string
          created_at: string | null
          has_ac: boolean | null
          has_wifi: boolean | null
          id: string
          insurance_expiry: string | null
          is_active: boolean | null
          is_verified: boolean | null
          license_plate: string
          make: string
          model: string
          registration_expiry: string | null
          seats: number
          updated_at: string | null
          user_id: string
          vehicle_type: string | null
          wheelchair_accessible: boolean | null
          year: number
        }
        Insert: {
          color: string
          created_at?: string | null
          has_ac?: boolean | null
          has_wifi?: boolean | null
          id?: string
          insurance_expiry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          license_plate: string
          make: string
          model: string
          registration_expiry?: string | null
          seats: number
          updated_at?: string | null
          user_id: string
          vehicle_type?: string | null
          wheelchair_accessible?: boolean | null
          year: number
        }
        Update: {
          color?: string
          created_at?: string | null
          has_ac?: boolean | null
          has_wifi?: boolean | null
          id?: string
          insurance_expiry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          license_plate?: string
          make?: string
          model?: string
          registration_expiry?: string | null
          seats?: number
          updated_at?: string | null
          user_id?: string
          vehicle_type?: string | null
          wheelchair_accessible?: boolean | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          approved_at: string | null
          created_at: string | null
          document_number: string | null
          document_url: string | null
          expires_at: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_type: Database["public"]["Enums"]["verification_type"]
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          document_number?: string | null
          document_url?: string | null
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_type: Database["public"]["Enums"]["verification_type"]
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          document_number?: string | null
          document_url?: string | null
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_type?: Database["public"]["Enums"]["verification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_schema_health: { Args: never; Returns: boolean }
      get_conversation_messages_for_summary: {
        Args: { c_id: string; limit_arg?: number }
        Returns: {
          content: string
          content_json: Json
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }[]
      }
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_trips_count: number
          as_driver: number
          as_passenger: number
          total_distance_km: number
          carbon_saved_kg: number
        }[]
      }
      search_nearby_trips: {
        Args: {
          from_lat: number
          from_lng: number
          to_lat: number
          to_lng: number
          max_distance_km?: number
          departure_date?: string
        }
        Returns: {
          trip_id: string
          driver_name: string
          distance_from_km: number
          distance_to_km: number
        }[]
      }
    }
    Enums: {
      booking_status: "pending" | "accepted" | "rejected" | "cancelled" | "completed"
      message_type: "text" | "image" | "location" | "system"
      notification_type:
        | "trip_request"
        | "trip_accepted"
        | "trip_rejected"
        | "trip_cancelled"
        | "driver_arrived"
        | "trip_started"
        | "trip_completed"
        | "payment_received"
        | "payment_sent"
        | "message"
        | "rating_reminder"
        | "verification_approved"
        | "verification_rejected"
        | "safety_alert"
      payment_method: "cash" | "card" | "wallet" | "bank_transfer"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      trip_status: "draft" | "published" | "active" | "completed" | "cancelled"
      trip_type: "wasel" | "raje3"
      user_role: "passenger" | "driver" | "admin"
      verification_status: "not_started" | "pending" | "approved" | "rejected"
      verification_type: "phone" | "email" | "national_id" | "drivers_license" | "selfie"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
