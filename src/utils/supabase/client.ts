import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

/**
 * Universal environment loader:
 * - Works in Vite (`import.meta.env`)
 * - Works in Node (e.g., SSR, Cloud Functions)
 * - Works with dotenv files in local dev
 */
const getEnvVar = (key: string): string => {
  // Try import.meta.env (Vite or browser build)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }

  // Try process.env (Node.js / server)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  // Fallback for dotenv-loaded environments
  try {
    // Dynamically load dotenv only if available
    const dotenv = require('dotenv');
    dotenv.config();
    return process.env[key] || '';
  } catch {
    // dotenv not available (browser or restricted env)
  }

  // Return empty string if not found
  return '';
};

// Load variables (from Vite or Node)
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create Supabase client if configured
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
      },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;

/**
 * Handle Supabase errors gracefully
 */
export function handleSupabaseError(error: unknown): string {
  if (typeof error === 'object' && error && 'message' in error) {
    const msg = String((error as any).message);
    if (msg.includes('Invalid login credentials'))
      return 'Invalid email or password. Please try again.';
    if (msg.includes('Email not confirmed'))
      return 'Please verify your email before logging in.';
    if (msg.includes('User already registered'))
      return 'An account with this email already exists.';
    return msg;
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(userId?: string) {
  if (!supabase) return null;
  const uid = userId || (await getCurrentUser())?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error) {
    console.error('Error fetching profile:', {
      code: error.code,
      message: String(error.message || 'Unknown error').substring(0, 200),
    });
    return null;
  }

  return data;
}
