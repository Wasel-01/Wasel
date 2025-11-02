const sanitizeLogInput = (input: any): string => {
  try {
    return String(input || '')
      .replace(/[\r\n\t<>"'&\x00-\x1f\x7f-\x9f]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .substring(0, 200);
  } catch {
    return 'invalid';
  }
};

export const analyticsService = {
  track: (event: string, data?: any) => {
    if (typeof window !== 'undefined') {
      const sanitizedEvent = sanitizeLogInput(event);
      const sanitizedData = data ? sanitizeLogInput(JSON.stringify(data)) : undefined;
      console.log('Analytics:', sanitizedEvent, sanitizedData);
    }
  },
  
  isHealthy: async () => true,
  
  trackPageView: (page: string) => {
    const sanitizedPage = sanitizeLogInput(page);
    console.log('Page view:', sanitizedPage);
  },
  
  trackEvent: (category: string, action: string, label?: string) => {
    const sanitizedCategory = sanitizeLogInput(category);
    const sanitizedAction = sanitizeLogInput(action);
    const sanitizedLabel = label ? sanitizeLogInput(label) : undefined;
    console.log('Event:', { category: sanitizedCategory, action: sanitizedAction, label: sanitizedLabel });
  },

  getMockTripHistory: () => [],

  calculateAnalytics: (trips: any[]) => ({
    totalTrips: trips.length,
    totalDistance: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalSpent: 0,
    carbonSaved: 0,
    totalDrives: 0,
    totalEarned: 0,
    totalRides: 0,
    categoryBreakdown: { work: 0, personal: 0, shopping: 0, other: 0 },
    monthlyData: [],
    topRoutes: []
  }),

  generateExpenseReport: (startDate: string, endDate: string) => 
    JSON.stringify({ totalExpenses: 0, trips: [], startDate, endDate })
};