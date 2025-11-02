import { supabase, isSupabaseConfigured } from './supabase/client';

export async function validateBackendConfiguration(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  try {
    // Test basic connection
    const { data, error } = await supabase.rpc('check_schema_health');
    
    if (error) {
      throw new Error(`Backend health check failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Backend health check returned no data');
    }

    console.log('✅ Backend validation successful');
  } catch (error: any) {
    console.error('❌ Backend validation failed:', error);
    throw new Error(`Backend connection failed: ${error.message || 'Unknown error'}`);
  }
}