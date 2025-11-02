/**
 * Application configuration
 */

export const APP_CONFIG = {
  // App metadata
  name: 'Wasel',
  version: '1.0.0',
  description: 'Modern ride-sharing platform for the Middle East',
  
  // API configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Validation limits
  validation: {
    password: {
      minLength: 8,
      maxLength: 128,
    },
    name: {
      minLength: 1,
      maxLength: 50,
    },
    message: {
      maxLength: 1000,
    },
    phone: {
      minLength: 7,
      maxLength: 20,
    },
    trip: {
      maxSeats: 8,
      maxPricePerSeat: 1000,
    },
    wallet: {
      minAmount: 0.01,
      maxAmount: 10000,
    }
  },
  
  // Feature flags
  features: {
    notifications: true,
    realTimeChat: true,
    walletSystem: true,
    analytics: true,
  },
  
  // Security settings
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  
  // UI settings
  ui: {
    theme: 'light',
    language: 'en',
    currency: 'AED',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  }
} as const;

// Environment-specific overrides
export const getConfig = () => {
  const isDev = (import.meta as any).env?.DEV;
  const isProd = (import.meta as any).env?.PROD;
  
  return {
    ...APP_CONFIG,
    isDevelopment: isDev,
    isProduction: isProd,
    apiUrl: getApiUrl(),
    supabase: {
      url: (import.meta as any).env?.VITE_SUPABASE_URL,
      anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY,
      projectId: (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID,
    }
  };
};

const getApiUrl = (): string => {
  const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
  if (!projectId || projectId === 'your-project-id') {
    if ((import.meta as any).env?.PROD) {
      throw new Error('VITE_SUPABASE_PROJECT_ID must be configured for production');
    }
    return 'http://localhost:54321/functions/v1'; // Local development fallback
  }
  return `https://${projectId}.supabase.co/functions/v1`;
};

export type AppConfig = ReturnType<typeof getConfig>;