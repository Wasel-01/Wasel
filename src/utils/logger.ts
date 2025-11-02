/**
 * Simple logger utility for production-safe logging
 */

const isDevelopment = (import.meta as any).env?.DEV;

const sanitizeMessage = (message: string): string => {
  try {
    return String(message || '')
      .replace(/[\r\n\t<>"'&\x00-\x1f\x7f-\x9f]/g, ' ')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
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