import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// This script expects environment variables to be present when running:
// SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
// Run with: npx ts-node src/tools/checkSupabaseHealth.ts

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Set SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_* equivalents).');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function run() {
  try {
    console.log('Calling RPC: public.check_schema_health');
    const { data: rpcData, error: rpcError } = await supabase.rpc('check_schema_health');
    if (rpcError) {
      console.error('RPC error:', rpcError.message || rpcError);
    } else {
      console.log('RPC result:', rpcData);
    }

    console.log('Selecting from public.health_check');
    const { data: rows, error: selError } = await supabase
      .from('health_check')
      .select('*')
      .limit(5);

    if (selError) {
      console.error('Select error:', selError.message || selError);
    } else {
      console.log('health_check rows:', rows);
    }

    // Additional sanity: try a simple users count (read-only)
    console.log('Counting users (if table exists)');
    const { count, error: countError } = await supabase
      .from('users')
      .select('id', { head: true, count: 'estimated' });

    if (countError) {
      console.warn('Users count failed (table may not exist):', countError.message || countError);
    } else {
      console.log('Estimated users count:', count ?? '(no count)');
    }

    process.exit(0);
  } catch (err: any) {
    console.error('Health check failed:', err.message || err);
    process.exit(2);
  }
}

run();
