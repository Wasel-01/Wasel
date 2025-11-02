import { supabase } from '../utils/supabase/client';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export const paymentService = {
  // Initialize Stripe payment
  async createPaymentIntent(amount: number, bookingId: string): Promise<PaymentIntent> {
    if (!supabase) throw new Error('Payment system not configured');

    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount, bookingId, currency: 'AED' }
    });

    if (error) throw error;
    return data;
  },

  // Process wallet payment
  async processWalletPayment(fromUserId: string, toUserId: string, amount: number, bookingId: string) {
    if (!supabase) throw new Error('Payment system not configured');

    const { data, error } = await supabase.rpc('process_wallet_payment', {
      p_from_user_id: fromUserId,
      p_to_user_id: toUserId,
      p_amount: amount,
      p_booking_id: bookingId
    });

    if (error) throw error;
    return data;
  },

  // Add funds to wallet
  async addFundsToWallet(userId: string, amount: number, paymentMethodId: string) {
    if (!supabase) throw new Error('Payment system not configured');

    const { data, error } = await supabase.from('transactions').insert({
      to_user_id: userId,
      amount,
      currency: 'AED',
      payment_method: 'card',
      payment_status: 'completed',
      gateway_transaction_id: paymentMethodId,
      gateway_name: 'stripe',
      description: 'Wallet top-up'
    }).select().single();

    if (error) throw error;
    return data;
  },

  // Request refund
  async requestRefund(transactionId: string, amount: number, reason: string) {
    if (!supabase) throw new Error('Payment system not configured');

    const { data, error } = await supabase.from('transactions').update({
      payment_status: 'refunded',
      refund_amount: amount,
      refund_reason: reason,
      refunded_at: new Date().toISOString()
    }).eq('id', transactionId).select().single();

    if (error) throw error;
    return data;
  },

  // Get transaction history
  async getTransactions(userId: string, limit = 50) {
    if (!supabase) throw new Error('Payment system not configured');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Escrow: Hold payment until trip completion
  async holdPaymentInEscrow(bookingId: string, amount: number, fromUserId: string, toUserId: string) {
    if (!supabase) throw new Error('Payment system not configured');

    const { data, error } = await supabase.from('transactions').insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      booking_id: bookingId,
      amount,
      currency: 'AED',
      payment_method: 'wallet',
      payment_status: 'pending',
      description: 'Payment held in escrow'
    }).select().single();

    if (error) throw error;
    return data;
  },

  // Release escrow payment
  async releaseEscrowPayment(transactionId: string) {
    if (!supabase) throw new Error('Payment system not configured');

    const { data, error } = await supabase.from('transactions').update({
      payment_status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', transactionId).select().single();

    if (error) throw error;
    return data;
  }
};
