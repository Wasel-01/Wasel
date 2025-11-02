export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'trip_request' | 'trip_accepted' | 'trip_rejected' | 'trip_cancelled' | 'driver_arrived' | 'trip_started' | 'trip_completed' | 'payment_received' | 'payment_sent' | 'message' | 'rating_reminder' | 'verification_approved' | 'verification_rejected' | 'safety_alert';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  priority?: string;
  timestamp?: string;
  actionUrl?: string;
}

export const notificationService = {
  send: async (userId: string, title: string, message: string) => {
    console.log('Notification:', { userId, title, message });
    return { success: true };
  },
  
  requestPermission: async () => {
    if ('Notification' in window) {
      return await window.Notification.requestPermission();
    }
    return 'denied';
  },
  
  showNotification: (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && window.Notification.permission === 'granted') {
      return new window.Notification(title, options);
    }
    return null;
  },

  subscribe: (callback: (notification: Notification) => void) => {
    return () => {};
  },

  markAsRead: async (notificationId: string) => {
    console.log('Mark as read:', notificationId);
  },

  deleteNotification: async (notificationId: string) => {
    console.log('Delete notification:', notificationId);
  },

  markAllAsRead: async () => {
    console.log('Mark all as read');
  },

  clearAll: async () => {
    console.log('Clear all notifications');
  }
};