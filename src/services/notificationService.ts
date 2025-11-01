export const notificationService = {
  send: async (userId: string, title: string, message: string) => {
    console.log('Notification:', { userId, title, message });
    return { success: true };
  },
  
  requestPermission: async () => {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  },
  
  showNotification: (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, options);
    }
    return null;
  }
};