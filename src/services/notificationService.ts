import { supabase } from '../utils/supabase/client';

export type NotificationType = 
  | 'trip_request' | 'trip_accepted' | 'trip_rejected' | 'trip_cancelled'
  | 'driver_arrived' | 'trip_started' | 'trip_completed'
  | 'payment_received' | 'payment_sent' | 'message'
  | 'rating_reminder' | 'verification_approved' | 'verification_rejected'
  | 'safety_alert';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export const notificationService = {
  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Send browser notification
  async sendBrowserNotification(title: string, body: string, icon?: string, url?: string) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const notification = new Notification(title, {
      body,
      icon: icon || '/logo.svg',
      badge: '/logo.svg',
      tag: 'wasel-notification',
      requireInteraction: false
    });

    if (url) {
      notification.onclick = () => {
        window.focus();
        window.location.href = url;
        notification.close();
      };
    }

    setTimeout(() => notification.close(), 5000);
  },

  // Create notification in database
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    tripId?: string,
    bookingId?: string
  ) {
    if (!supabase) return;

    const { data, error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      action_url: actionUrl,
      trip_id: tripId,
      booking_id: bookingId,
      priority: type.includes('safety') ? 'high' : 'medium'
    }).select().single();

    if (error) throw error;

    // Also send browser notification
    await this.sendBrowserNotification(title, message, undefined, actionUrl);

    return data;
  },

  // Get user notifications
  async getNotifications(userId: string, unreadOnly = false) {
    if (!supabase) return [];

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    if (!supabase) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Mark all as read
  async markAllAsRead(userId: string) {
    if (!supabase) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    if (!supabase) return null;

    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload: any) => {
          if (payload.new) {
            callback(payload.new as Notification);
            // Send browser notification
            this.sendBrowserNotification(
              payload.new.title,
              payload.new.message,
              undefined,
              payload.new.action_url
            );
          }
        }
      )
      .subscribe();
  },

  // Notification templates
  templates: {
    tripRequest: (driverName: string) => ({
      title: 'New Trip Request',
      message: `${driverName} wants to book your ride`
    }),
    tripAccepted: (driverName: string) => ({
      title: 'Trip Accepted!',
      message: `${driverName} accepted your booking`
    }),
    driverArrived: (driverName: string) => ({
      title: 'Driver Arrived',
      message: `${driverName} is waiting for you`
    }),
    tripStarted: () => ({
      title: 'Trip Started',
      message: 'Your trip has begun. Have a safe journey!'
    }),
    tripCompleted: () => ({
      title: 'Trip Completed',
      message: 'Please rate your experience'
    }),
    paymentReceived: (amount: number) => ({
      title: 'Payment Received',
      message: `You received AED ${amount}`
    }),
    safetyAlert: () => ({
      title: '⚠️ Safety Alert',
      message: 'Emergency contacts have been notified'
    })
  }
};
