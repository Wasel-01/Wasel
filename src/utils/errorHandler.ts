/**
 * Centralized error handling utility
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export const handleApiError = (error: any, context?: string): AppError => {
  // Sanitize error message to prevent log injection
  const sanitizeMessage = (msg: string): string => {
    return String(msg || 'Unknown error')
      .replace(/[\r\n\t<>"'&\x00-\x1f\x7f-\x9f]/g, ' ')
      .substring(0, 500);
  };

  if (error instanceof ValidationError) {
    return {
      message: sanitizeMessage(error.message),
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: { field: error.field }
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      message: sanitizeMessage(error.message),
      code: 'AUTH_ERROR',
      statusCode: 401
    };
  }

  if (error instanceof NotFoundError) {
    return {
      message: sanitizeMessage(error.message),
      code: 'NOT_FOUND',
      statusCode: 404
    };
  }

  // Supabase errors
  if (error?.code) {
    return {
      message: sanitizeMessage(error.message || 'Database error'),
      code: String(error.code).replace(/[^A-Z0-9_]/g, ''),
      statusCode: 500
    };
  }

  // Network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return {
      message: 'Network connection error. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      statusCode: 503
    };
  }

  // Generic error
  const errorMessage = context 
    ? `${context}: ${sanitizeMessage(error?.message || 'An unexpected error occurred')}`
    : sanitizeMessage(error?.message || 'An unexpected error occurred');
    
  return { message: errorMessage };
};

export const validateInput = {
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  },
  
  password: (password: string): boolean => {
    return String(password || '').length >= 8;
  },
  
  phone: (phone: string): boolean => {
    return /^\+?[0-9\s-]{7,20}$/.test(String(phone || '').trim());
  },
  
  name: (name: string): boolean => {
    const trimmed = String(name || '').trim();
    return trimmed.length >= 1 && trimmed.length <= 50;
  },
  
  uuid: (id: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ''));
  }
};