import { supabase } from './supabase/client';
import { authAPI } from '../services/api';

interface HealthCheckResult {
  database: boolean;
  api: boolean;
  auth: boolean;
  realtime: boolean;
}

export async function checkBackendHealth(): Promise<HealthCheckResult> {
  try {
    // Check database connection
    const dbHealth = await checkDatabaseHealth();
    
    // Check API connection
    const apiHealth = await checkApiHealth();
    
    // Check auth service
    const authHealth = await checkAuthHealth();
    
    // Check realtime service
    const realtimeHealth = await checkRealtimeHealth();
    
    return {
      database: dbHealth,
      api: apiHealth,
      auth: authHealth,
      realtime: realtimeHealth
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      database: false,
      api: false,
      auth: false,
      realtime: false
    };
  }
}

async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_schema_health');
    return !error && data;
  } catch {
    return false;
  }
}

async function checkAuthHealth(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session !== null;
  } catch {
    return false;
  }
}

async function checkApiHealth(): Promise<boolean> {
  try {
    await authAPI.getSession();
    return true;
  } catch {
    return false;
  }
}

async function checkRealtimeHealth(): Promise<boolean> {
  if (!(import.meta as any).env?.VITE_ENABLE_REALTIME) {
    return true; // Skip if realtime is not enabled
  }
  
  try {
    const subscription = supabase.channel('health_check')
      .subscribe((status: string) => status === 'SUBSCRIBED');
    
    return subscription !== null;
  } catch {
    return false;
  }
}

// Run health check on app startup
export async function validateBackendConfiguration(): Promise<void> {
  const health = await checkBackendHealth();
  
  // Log health status
  console.log('Backend Health Status:', health);
  
  // Validate environment variables
  validateEnvironmentVariables();
  
  // Check for critical services
  if (!health.database || !health.auth) {
    throw new Error('Critical backend services are not available');
  }
  
  console.log('Backend configuration validated successfully');
}

function validateEnvironmentVariables(): void {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_API_URL',
    'VITE_API_VERSION'
  ];
  
  const missing = requiredVars.filter(
    varName => !(import.meta as any).env?.[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}