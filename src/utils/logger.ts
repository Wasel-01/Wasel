/**
 * Simple logger utility for production-safe logging
 */

const isDevelopment = import.meta.env.DEV;

const sanitizeMessage = (message: string): string => {
  try {
    return String(message || '')
      .replace(/[\r\n\t<>"'&]/g, ' ')
      .substring(0, 1000);
  } catch {
    return 'Invalid message';
  }
};

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${sanitizeMessage(message)}`, error);
    }
  },

  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${sanitizeMessage(message)}`, data);
    }
  },

  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`[INFO] ${sanitizeMessage(message)}`, data);
    }
  },

  debug: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${sanitizeMessage(message)}`, data);
    }
  },
};