import { useState, useEffect } from 'react';
import { growthMetricsService, type GrowthMetrics } from '../services/growthMetricsService';

export function useGrowthMetrics() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await growthMetricsService.getMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    loading,
    error,
    refresh: loadMetrics
  };
}