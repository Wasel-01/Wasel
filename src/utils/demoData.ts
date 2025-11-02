// Demo data for running the app without Supabase backend

export const demoUser = {
  id: 'demo-user-123',
  email: 'demo@wasel.app',
  full_name: 'Demo User',
  avatar_url: null,
  phone: '+966 50 123 4567',
  rating_as_driver: 4.8,
  rating_as_passenger: 4.9,
  total_trips: 42,
  wallet_balance: 150.50,
  total_earned: 850.00,
  total_spent: 450.00,
  created_at: new Date().toISOString(),
};

export const demoTrips = [
  {
    id: 'trip-1',
    from_location: 'Riyadh',
    to_location: 'Jeddah',
    departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    departure_time: '08:00',
    available_seats: 3,
    price_per_seat: 120,
    status: 'published',
    driver_id: 'demo-user-123',
    trip_type: 'wasel',
  },
  {
    id: 'trip-2',
    from_location: 'Dammam',
    to_location: 'Riyadh',
    departure_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    departure_time: '14:00',
    available_seats: 2,
    price_per_seat: 100,
    status: 'published',
    driver_id: 'other-driver',
    trip_type: 'wasel',
  },
];

export const demoBookings = [
  {
    id: 'booking-1',
    trip_id: 'trip-1',
    passenger_id: 'demo-user-123',
    seats_requested: 1,
    total_price: 120,
    status: 'accepted',
    pickup_location: 'Riyadh City Center',
    dropoff_location: 'Jeddah Marina',
    created_at: new Date().toISOString(),
  },
];

export const demoMessages = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'other-user',
    content: 'Hi! Is the trip still available?',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    sender_id: 'demo-user-123',
    content: 'Yes, still available! Feel free to book.',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const demoNotifications = [
  {
    id: 'notif-1',
    user_id: 'demo-user-123',
    title: 'Welcome to Wasel!',
    message: 'Start your journey by finding or offering a ride.',
    type: 'trip_request' as const,
    read: false,
    created_at: new Date().toISOString(),
  },
];
