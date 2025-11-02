/**
 * Security utilities for input sanitization and validation
 */

// Comprehensive input sanitization
export const sanitize = {
  // Remove all potentially dangerous characters
  text: (input: any): string => {
    return String(input || '')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Control characters
      .replace(/[<>\"'&]/g, '') // HTML/XML characters
      .replace(/javascript:/gi, '') // JavaScript protocol
      .replace(/data:/gi, '') // Data protocol
      .replace(/vbscript:/gi, '') // VBScript protocol
      .replace(/on\w+=/gi, '') // Event handlers
      .trim();
  },

  // Sanitize for HTML display (more permissive)
  html: (input: any): string => {
    return String(input || '')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/&/g, '&amp;')
      .trim();
  },

  // Sanitize for CSS (very restrictive)
  css: (input: any): string => {
    return String(input || '')
      .replace(/[^a-zA-Z0-9#\-_().,%\s]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/expression\(/gi, '')
      .replace(/url\(/gi, '')
      .replace(/import/gi, '')
      .replace(/@/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .trim();
  },

  // Sanitize for SQL-like queries (basic protection)
  query: (input: any): string => {
    return String(input || '')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .replace(/['"\\;]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .trim();
  },

  // Sanitize phone numbers
  phone: (input: any): string => {
    return String(input || '')
      .replace(/[^+0-9\s\-()]/g, '')
      .trim();
  },

  // Sanitize email addresses
  email: (input: any): string => {
    return String(input || '')
      .toLowerCase()
      .replace(/[^a-z0-9@._\-]/g, '')
      .trim();
  },

  // Sanitize file names
  filename: (input: any): string => {
    return String(input || '')
      .replace(/[^a-zA-Z0-9._\-]/g, '')
      .replace(/\.{2,}/g, '.')
      .trim();
  }
};

// Rate limiting utilities
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }
}

// Content Security Policy helpers
export const CSP = {
  // Generate nonce for inline scripts/styles
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Validate URLs for redirects
  isValidRedirectUrl: (url: string, allowedDomains: string[] = []): boolean => {
    try {
      const parsed = new URL(url);
      
      // Only allow HTTPS in production
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return false;
      }

      // Check against allowed domains
      if (allowedDomains.length > 0) {
        return allowedDomains.some(domain => 
          parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );
      }

      return true;
    } catch {
      return false;
    }
  }
};

// Input validation with security focus
export const secureValidate = {
  // Validate and sanitize user input
  userInput: (input: any, maxLength: number = 1000): string => {
    const sanitized = sanitize.text(input);
    if (sanitized.length > maxLength) {
      throw new Error(`Input too long (max ${maxLength} characters)`);
    }
    return sanitized;
  },

  // Validate file uploads
  fileUpload: (file: File, allowedTypes: string[] = [], maxSize: number = 5 * 1024 * 1024): boolean => {
    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File too large (max ${maxSize / 1024 / 1024}MB)`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file name
    const sanitizedName = sanitize.filename(file.name);
    if (sanitizedName !== file.name) {
      throw new Error('Invalid file name');
    }

    return true;
  },

  // Validate JSON input
  jsonInput: (input: string, maxSize: number = 1024 * 1024): any => {
    if (input.length > maxSize) {
      throw new Error(`JSON too large (max ${maxSize} bytes)`);
    }

    try {
      return JSON.parse(input);
    } catch {
      throw new Error('Invalid JSON format');
    }
  }
};

// Security headers for API responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

export default {
  sanitize,
  RateLimiter,
  CSP,
  secureValidate,
  securityHeaders
};