import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { locationService } from '../services/locationService';
import { realtimeMessaging } from '../services/realtimeMessaging';
import { notificationService } from '../services/notificationService';
import { cancellationService } from '../services/cancellationService';

export function usePayments() {
  const { user } = useAuth();

  return {
    processPayment: (toUserId: string, amount: number, bookingId: string) =>
      paymentService.processWalletPayment(user!.id, toUserId, amount, bookingId),
    
    holdInEscrow: (bookingId: string, amount: number, toUserId: string) =>
      paymentService.holdPaymentInEscrow(bookingId, amount, user!.id, toUserId),
    
    releasePayment: (transactionId: string) =>
      paymentService.releaseEscrowPayment(transactionId),
    
    addFunds: (amount: number, paymentMethodId: string) =>
      paymentService.addFundsToWallet(user!.id, amount, paymentMethodId),
    
    getTransactions: () =>
      paymentService.getTransactions(user!.id)
  };
}

export function useLocationTracking(tripId: string) {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<any>(null);

  useEffect(() => {
    // Subscribe to driver location
    const channel = locationService.subscribeToDriverLocation(tripId, setDriverLocation);
    
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [tripId]);

  const startTracking = () => {
    return locationService.startTracking(tripId, setCurrentLocation);
  };

  const stopTracking = (watchId: number) => {
    locationService.stopTracking(watchId);
  };

  return { currentLocation, driverLocation, startTracking, stopTracking };
}

export function useRealtimeChat(conversationId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
    
    const channel = realtimeMessaging.subscribeToConversation(conversationId, (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (channel) realtimeMessaging.unsubscribe(channel);
    };
  }, [conversationId]);

  const loadMessages = async () => {
    setLoading(true);
    const msgs = await realtimeMessaging.getMessages(conversationId);
    setMessages(msgs);
    setLoading(false);
  };

  const sendMessage = async (content: string) => {
    if (!user) return;
    await realtimeMessaging.sendMessage(conversationId, user.id, content);
  };

  const markAsRead = async (messageIds: string[]) => {
    if (!user) return;
    await realtimeMessaging.markAsRead(messageIds, user.id);
  };

  return { messages, loading, sendMessage, markAsRead };
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = notificationService.subscribeToNotifications(user.id, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const notifs = await notificationService.getNotifications(user.id);
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead, refresh: loadNotifications };
}

export function useCancellation() {
  const { user } = useAuth();

  const calculateFee = (tripDate: string, tripTime: string, amount: number) =>
    cancellationService.calculateCancellationFee(tripDate, tripTime, amount);

  const cancelBooking = async (bookingId: string, reason: string, isDriver = false) => {
    if (!user) throw new Error('Not authenticated');
    return cancellationService.cancelBooking(bookingId, user.id, reason, isDriver);
  };

  const getCancellationRate = async () => {
    if (!user) return 0;
    return cancellationService.getCancellationRate(user.id);
  };

  return { calculateFee, cancelBooking, getCancellationRate };
}
