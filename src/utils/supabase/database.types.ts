export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string
          avatar_url: string | null
          phone_verified: boolean
          email_verified: boolean
          is_verified: boolean
          verification_level: number
          wallet_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone_verified?: boolean
          email_verified?: boolean
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      verifications: {
        Row: {
          id: string
          user_id: string
          verification_type: string
          status: string
          document_url: string | null
          document_number: string | null
          submitted_at: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          verification_type: string
          status?: string
          document_url?: string
          document_number?: string
          submitted_at?: string
        }
        Update: Partial<Database['public']['Tables']['verifications']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
          action_url: string | null
        }
        Insert: {
          user_id: string
          type: string
          title: string
          message: string
          action_url?: string
          trip_id?: string
          booking_id?: string
          priority?: string
        }
        Update: {
          read?: boolean
          read_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string | null
          booking_id: string | null
          amount: number
          currency: string
          payment_method: string
          payment_status: string
          created_at: string
        }
        Insert: {
          from_user_id?: string
          to_user_id?: string
          booking_id?: string
          amount: number
          currency?: string
          payment_method: string
          payment_status?: string
          description?: string
          completed_at?: string
          gateway_transaction_id?: string
          gateway_name?: string
        }
        Update: {
          payment_status?: string
          refund_amount?: number
          refund_reason?: string
          refunded_at?: string
          completed_at?: string
        }
      }
      trip_locations: {
        Row: {
          id: string
          trip_id: string
          lat: number
          lng: number
          heading: number | null
          speed: number | null
          updated_at: string
        }
        Insert: {
          trip_id: string
          lat: number
          lng: number
          heading?: number
          speed?: number
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['trip_locations']['Insert']>
      }
      disputes: {
        Row: {
          id: string
          booking_id: string | null
          reported_by: string
          dispute_type: string
          description: string
          evidence_url: string | null
          status: string
          resolution: string | null
          created_at: string
        }
        Insert: {
          booking_id?: string
          reported_by: string
          dispute_type: string
          description: string
          evidence_url?: string
          status?: string
        }
        Update: Partial<Database['public']['Tables']['disputes']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: string
          created_at: string
          read_by: string[] | null
        }
        Insert: {
          conversation_id: string
          sender_id: string
          content: string
          message_type?: string
          read_by?: string[]
        }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          trip_id: string
          passenger_id: string
          status: string
          total_price: number
          created_at: string
        }
        Insert: {
          trip_id: string
          passenger_id: string
          total_price: number
          status?: string
        }
        Update: {
          status?: string
          cancelled_at?: string
          cancelled_by?: string
          cancellation_reason?: string
        }
      }
      trips: {
        Row: {
          id: string
          driver_id: string
          departure_date: string
          departure_time: string
          status: string
          created_at: string
        }
        Insert: {
          driver_id: string
          departure_date: string
          departure_time: string
          status?: string
        }
        Update: Partial<Database['public']['Tables']['trips']['Insert']>
      }
    }
    Functions: {
      process_wallet_payment: {
        Args: {
          p_from_user_id: string
          p_to_user_id: string
          p_amount: number
          p_booking_id: string
        }
        Returns: boolean
      }
      add_user_to_read_by: {
        Args: {
          message_id: string
          user_id: string
        }
        Returns: void
      }
    }
  }
}
