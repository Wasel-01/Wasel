/// <reference types="https://deno.land/x/types/deno.d.ts" />

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  rpcResult: boolean;
  error?: string;
  timestamp: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Create Supabase client using runtime env vars
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Call the health check RPC
    const { data: rpcResult, error: rpcError } = await supabaseClient
      .rpc('check_schema_health');

    if (rpcError) throw rpcError;

    const response: HealthResponse = {
      status: rpcResult ? 'healthy' : 'unhealthy',
      rpcResult,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      status: rpcResult ? 200 : 503
    });

  } catch (error) {
    const response: HealthResponse = {
      status: 'unhealthy',
      rpcResult: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      status: 503
    });
  }
});