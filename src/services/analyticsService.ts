export const analyticsService = {
  track: (event: string, data?: any) => {
    if (typeof window !== 'undefined') {
      console.log('Analytics:', event, data);
    }
  },
  
  isHealthy: async () => true,
  
  trackPageView: (page: string) => {
    console.log('Page view:', page);
  },
  
  trackEvent: (category: string, action: string, label?: string) => {
    console.log('Event:', { category, action, label });
  }
};