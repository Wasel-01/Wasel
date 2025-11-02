import { supabase } from '../utils/supabase/client';
import { handleApiError, ValidationError, AuthenticationError, NotFoundError, validateInput } from '../utils/errorHandler';
import { getConfig } from '../config/app';
import { sanitize, secureValidate } from '../utils/security';

const config = getConfig();

// Performance tracking wrapper
function withPerformanceTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      console.debug(`${operationName} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
}

// Use auth token from Supabase client
export const getAuthToken = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

// ============ AUTH API ============

export const authAPI = {
  signUp: withPerformanceTracking(async (email: string, password: string, firstName: string, lastName: string, phone: string) => {
    // Input validation
    if (!validateInput.email(email)) {
      throw new ValidationError('Valid email is required', 'email');
    }
    if (!validateInput.password(password)) {
      throw new ValidationError('Password must be at least 8 characters', 'password');
    }
    if (!validateInput.name(firstName) || !validateInput.name(lastName)) {
      throw new ValidationError('First and last name are required', 'name');
    }
    
    const sanitizedData = {
      first_name: secureValidate.userInput(firstName, 50),
      last_name: secureValidate.userInput(lastName, 50),
      phone: sanitize.phone(phone).substring(0, 20)
    };

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: sanitizedData
      }
    });

    if (error) throw error;
    return data;
  }, 'signUp'),

  signIn: withPerformanceTracking(async (email: string, password: string) => {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) throw error;
    return data;
  }, 'signIn'),

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  async getProfile() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ValidationError('Valid email is required', 'email');
      }
      
      const redirectTo = `${window.location.origin}/reset-password`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo
      });
      if (error) {
        throw handleApiError(error, 'Failed to send password reset email');
      }
      return data;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw handleApiError(error, 'Password reset failed');
    }
  }
};

// ============ TRIPS API ============

export const tripsAPI = {
  async createTrip(tripData: any) {
    if (!tripData || typeof tripData !== 'object') {
      throw new Error('Valid trip data is required');
    }
    
    // Validate required fields
    const requiredFields = ['from_location', 'to_location', 'departure_time', 'available_seats', 'price_per_seat'];
    for (const field of requiredFields) {
      if (!tripData[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    const { data, error } = await supabase
      .from('trips')
      .insert(tripData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async searchTrips(from?: string, to?: string, date?: string) {
    let query = supabase.from('trips').select('*');

    if (from) query = query.ilike('from_location', `%${from}%`);
    if (to) query = query.ilike('to_location', `%${to}%`);
    if (date) query = query.gte('departure_time', `${date}T00:00:00`);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getTripById(tripId: string) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error) throw error;
    return data;
  },

  async getDriverTrips() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('driver_id', user.user.id);

    if (error) throw error;
    return data;
  }
};

// ============ BOOKINGS API ============

export const bookingsAPI = {
  async createBooking(tripId: string, seatsRequested: number) {
    if (!tripId || typeof tripId !== 'string') {
      throw new Error('Valid trip ID is required');
    }
    if (!seatsRequested || seatsRequested < 1 || seatsRequested > config.validation.trip.maxSeats) {
      throw new ValidationError(`Seats requested must be between 1 and ${config.validation.trip.maxSeats}`, 'seats');
    }
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Fetch trip to get price_per_seat and validate availability
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('price_per_seat, available_seats')
      .eq('id', tripId)
      .single();

    if (tripError) throw tripError;
    if (!trip) throw new Error('Trip not found');
    if (trip.available_seats < seatsRequested) {
      throw new Error('Not enough seats available');
    }

    const totalPrice = trip.price_per_seat * seatsRequested;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        trip_id: tripId,
        passenger_id: user.user.id,
        seats_requested: seatsRequested,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserBookings() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (*)
      `)
      .eq('passenger_id', user.user.id);

    if (error) throw error;
    return data;
  }
};

// ============ MESSAGES API ============

export const messagesAPI = {
  async sendMessage(recipientId: string, tripId: string, message: string) {
    if (!recipientId || !tripId || !message?.trim()) {
      throw new Error('Recipient ID, trip ID, and message are required');
    }
    if (message.length > 1000) {
      throw new Error('Message too long (max 1000 characters)');
    }
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const sanitizedMessage = secureValidate.userInput(message, config.validation.message.maxLength);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.user.id,
        conversation_id: tripId,
        content: sanitizedMessage
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversations() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(full_name, avatar_url),
        recipient:profiles!recipient_id(full_name, avatar_url)
      `)
      .or(`sender_id.eq.${user.user.id},recipient_id.eq.${user.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// ============ WALLET API ============

export const walletAPI = {
  async getWallet() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, wallet_balance, total_earned, total_spent')
      .eq('id', user.user.id)
      .single();

    if (error) throw error;
    return {
      user_id: data.id,
      balance: data.wallet_balance || 0,
      total_earned: data.total_earned || 0,
      total_spent: data.total_spent || 0
    };
  },

  async addFunds(amount: number) {
    try {
      if (!amount || amount < config.validation.wallet.minAmount || amount > config.validation.wallet.maxAmount) {
        throw new ValidationError(`Amount must be between ${config.validation.wallet.minAmount} and ${config.validation.wallet.maxAmount}`, 'amount');
      }
      
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw new AuthenticationError('Failed to get user session');
      if (!user.user) throw new AuthenticationError('Not authenticated');

      // Validate amount is a valid number
      const validAmount = Math.round(Number(amount) * 100) / 100; // Round to 2 decimal places
      if (isNaN(validAmount) || validAmount <= 0) {
        throw new ValidationError('Invalid amount provided', 'amount');
      }

      // First get current balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.user.id)
        .single();

      if (fetchError) {
        throw handleApiError(fetchError, 'Failed to fetch user profile');
      }
      if (!profile) throw new NotFoundError('User profile not found');

      // Update balance
      const newBalance = (profile.wallet_balance || 0) + validAmount;
      const { data, error } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.user.id)
        .select('id, wallet_balance, total_earned, total_spent')
        .single();

      if (error) {
        throw handleApiError(error, 'Failed to update wallet balance');
      }
      
      return {
        user_id: data.id,
        balance: data.wallet_balance || 0,
        total_earned: data.total_earned || 0,
        total_spent: data.total_spent || 0
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof NotFoundError) {
        throw error;
      }
      throw handleApiError(error, 'Failed to add funds to wallet');
    }
  }
};
