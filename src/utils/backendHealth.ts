import { supabase, isSupabaseConfigured } from './supabase/client';

export async function validateBackendConfiguration(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('⚠️ Supabase not configured - running in demo mode');
    return;
  }

  try {
    // Test basic connection with a simple query
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ Backend connection issue:', error.message);
    } else {
      console.log('✅ Backend validation successful');
    }
  } catch (error: any) {
    console.warn('⚠️ Backend validation warning:', error.message || 'Unknown error');
  }
}