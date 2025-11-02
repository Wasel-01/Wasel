/**
 * Application health monitoring system
 */

import { supabase } from './supabase/client';
import { performanceMonitor } from './performance';
import { getConfig } from '../config/app';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: HealthCheck;
    auth: HealthCheck;
    performance: HealthCheck;
    memory: HealthCheck;
    network: HealthCheck;
  };
  overall: {
    score: number;
    issues: string[];
  };
}

export interface HealthCheck {
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  message?: string;
  details?: any;
}

class HealthMonitor {
  private config = getConfig();
  private lastCheck: HealthStatus | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  async performHealthCheck(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkAuth(),
      this.checkPerformance(),
      this.checkMemory(),
      this.checkNetwork()
    ]);

    const healthChecks = {
      database: this.getCheckResult(checks[0]),
      auth: this.getCheckResult(checks[1]),
      performance: this.getCheckResult(checks[2]),
      memory: this.getCheckResult(checks[3]),
      network: this.getCheckResult(checks[4])
    };

    const overall = this.calculateOverallHealth(healthChecks);
    
    const status: HealthStatus = {
      status: overall.score >= 80 ? 'healthy' : overall.score >= 60 ? 'degraded' : 'unhealthy',
      timestamp,
      checks: healthChecks,
      overall
    };

    this.lastCheck = status;
    return status;
  }

  private getCheckResult(result: PromiseSettledResult<HealthCheck>): HealthCheck {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      status: 'fail',
      message: result.reason?.message || 'Check failed'
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseTime = performance.now() - start;

      if (error) {
        return {
          status: 'fail',
          responseTime,
          message: 'Database connection failed',
          details: { error: error.message }
        };
      }

      return {
        status: responseTime < 1000 ? 'pass' : 'warn',
        responseTime,
        message: responseTime < 1000 ? 'Database healthy' : 'Database slow response'
      };
    } catch (error: any) {
      return {
        status: 'fail',
        responseTime: performance.now() - start,
        message: 'Database check failed',
        details: { error: error?.message }
      };
    }
  }

  private async checkAuth(): Promise<HealthCheck> {
    const start = performance.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      const responseTime = performance.now() - start;

      if (error) {
        return {
          status: 'fail',
          responseTime,
          message: 'Auth service failed',
          details: { error: error.message }
        };
      }

      return {
        status: 'pass',
        responseTime,
        message: 'Auth service healthy'
      };
    } catch (error: any) {
      return {
        status: 'fail',
        responseTime: performance.now() - start,
        message: 'Auth check failed',
        details: { error: error?.message }
      };
    }
  }

  private async checkPerformance(): Promise<HealthCheck> {
    try {
      const metrics = performanceMonitor.getAllMetrics();
      const apiMetrics = Object.entries(metrics).filter(([key]) => key.startsWith('api_'));
      
      if (apiMetrics.length === 0) {
        return {
          status: 'warn',
          message: 'No performance data available'
        };
      }

      const avgResponseTime = apiMetrics.reduce((sum, [, metric]) => sum + (metric?.avg || 0), 0) / apiMetrics.length;
      
      return {
        status: avgResponseTime < 1000 ? 'pass' : avgResponseTime < 3000 ? 'warn' : 'fail',
        responseTime: avgResponseTime,
        message: `Average API response time: ${avgResponseTime.toFixed(2)}ms`,
        details: { metrics: Object.fromEntries(apiMetrics) }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Performance check failed',
        details: { error: error?.message }
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    try {
      if (typeof window === 'undefined' || !('memory' in performance)) {
        return {
          status: 'warn',
          message: 'Memory monitoring not available'
        };
      }

      const memory = (performance as any).memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      return {
        status: usagePercent < 70 ? 'pass' : usagePercent < 90 ? 'warn' : 'fail',
        message: `Memory usage: ${usagePercent.toFixed(1)}%`,
        details: {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Memory check failed',
        details: { error: error?.message }
      };
    }
  }

  private async checkNetwork(): Promise<HealthCheck> {
    const start = performance.now();
    try {
      // Simple connectivity check
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = performance.now() - start;
      
      return {
        status: response.ok && responseTime < 2000 ? 'pass' : 'warn',
        responseTime,
        message: response.ok ? 'Network connectivity good' : 'Network issues detected'
      };
    } catch (error: any) {
      return {
        status: 'fail',
        responseTime: performance.now() - start,
        message: 'Network connectivity failed',
        details: { error: error?.message }
      };
    }
  }

  private calculateOverallHealth(checks: HealthStatus['checks']) {
    const weights = {
      database: 30,
      auth: 25,
      performance: 20,
      memory: 15,
      network: 10
    };

    let totalScore = 0;
    let totalWeight = 0;
    const issues: string[] = [];

    Object.entries(checks).forEach(([key, check]) => {
      const weight = weights[key as keyof typeof weights];
      let score = 0;

      switch (check.status) {
        case 'pass':
          score = 100;
          break;
        case 'warn':
          score = 60;
          issues.push(`${key}: ${check.message || 'Warning'}`);
          break;
        case 'fail':
          score = 0;
          issues.push(`${key}: ${check.message || 'Failed'}`);
          break;
      }

      totalScore += score * weight;
      totalWeight += weight;
    });

    return {
      score: Math.round(totalScore / totalWeight),
      issues
    };
  }

  startMonitoring(intervalMs: number = 60000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getLastCheck(): HealthStatus | null {
    return this.lastCheck;
  }

  isHealthy(): boolean {
    return this.lastCheck?.status === 'healthy';
  }
}

export const healthMonitor = new HealthMonitor();

// Auto-start monitoring in production
if (typeof window !== 'undefined' && getConfig().isProduction) {
  healthMonitor.startMonitoring(300000); // 5 minutes
}

export default healthMonitor;