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
    console.log('Conversion tracked:', { userId, event });
  },
  
  calculateRetention: (cohort: string) => {
    console.log('Calculating retention for cohort:', cohort);
    return 85.0;
  }
};