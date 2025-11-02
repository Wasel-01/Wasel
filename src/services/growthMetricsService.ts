export interface GrowthMetrics {
  userGrowth: number;
  revenueGrowth: number;
  retentionRate: number;
  conversionRate: number;
}

export const growthMetricsService = {
  getMetrics: async (): Promise<GrowthMetrics> => {
    // Mock data for demo
    return {
      userGrowth: 15.2,
      revenueGrowth: 23.8,
      retentionRate: 87.5,
      conversionRate: 12.3
    };
  },
  
  trackConversion: (userId: string, event: string) => {
    const sanitizedUserId = String(userId || '').replace(/[\r\n\t<>"'&]/g, '').substring(0, 100);
    const sanitizedEvent = String(event || '').replace(/[\r\n\t<>"'&]/g, '').substring(0, 100);
    console.log('Conversion tracked:', { userId: sanitizedUserId, event: sanitizedEvent });
  },
  
  calculateRetention: (cohort: string) => {
    const sanitizedCohort = String(cohort || '').replace(/[\r\n\t<>"'&]/g, '').substring(0, 100);
    console.log('Calculating retention for cohort:', sanitizedCohort);
    return 85.0;
  },

  getMetricsSummary: async () => ({
    cpa: 25.5,
    ltv: 450.0,
    supplyDemandRatio: 1.2,
    fulfillmentRate: 92.5,
    active_drivers: 150,
    total_seats_offered: 600,
    active_riders: 180,
    total_seats_requested: 500
  }),

  getDailyMetrics: async () => [],

  getSupplyDemandBalance: async () => ({
    supplyDemandRatio: 1.2,
    fulfillmentRate: 92.5,
    active_drivers: 150,
    total_seats_offered: 600,
    active_riders: 180,
    total_seats_requested: 500
  })
};