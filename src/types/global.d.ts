declare global {
  interface Window {
    Notification: typeof Notification;
  }
}

export {};