const sanitizeLogInput = (input: any): string => {
  try {
    return String(input || '').replace(/[\r\n\t<>"'&]/g, '').substring(0, 200);
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
  }
};