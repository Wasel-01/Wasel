import { useState, useEffect } from 'react';
import { growthMetricsService } from '../services/growthMetricsService';

export function useGrowthMetrics(autoRefresh = false, refreshInterval = 60000) {
  const [metrics, setMetrics] = useState<any>(null);
  const [dailyMetrics, setDailyMetrics] = useState<any[]>([]);
  const [supplyDemand, setSupplyDemand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadMetrics = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [summary, daily, sd] = await Promise.all([
        growthMetricsService.getMetricsSummary(),
        growthMetricsService.getDailyMetrics(startDate, endDate),
        growthMetricsService.getSupplyDemandBalance()
      ]);
      
      setMetrics(summary);
      setDailyMetrics(daily);
      setSupplyDemand(sd);
    } catch (error) {
      // Failed to load growth metrics
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    dailyMetrics,
    supplyDemand,
    loading,
    refresh: loadMetrics
  };
}
