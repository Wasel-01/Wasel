import { toast as sonnerToast } from 'sonner';

export const useToast = () => {
  return {
    toast: (message: string, options?: { type?: 'success' | 'error' | 'info' }) => {
      const { type = 'info' } = options || {};
      
      switch (type) {
        case 'success':
          sonnerToast.success(message);
          break;
        case 'error':
          sonnerToast.error(message);
          break;
        default:
          sonnerToast(message);
      }
    }
  };
};