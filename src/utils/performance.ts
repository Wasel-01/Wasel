/**
 * Performance monitoring and optimization utilities
 */

// Performance metrics collector
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    try {
      // Monitor navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordMetric('page_load', entry.duration);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.recordMetric(`resource_${entry.name.split('/').pop()}`, entry.duration);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Monitor user interactions
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.recordMetric(entry.name, entry.duration);
          }
        }
      });
      measureObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(measureObserver);
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  recordMetric(name: string, value: number) {
    const sanitizedName = String(name || '').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
    if (!this.metrics.has(sanitizedName)) {
      this.metrics.set(sanitizedName, []);
    }
    
    const values = this.metrics.get(sanitizedName)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    return result;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// API performance wrapper
export const withPerformanceTracking = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T => {
  return (async (...args: any[]) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      performanceMonitor.recordMetric(`api_${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      performanceMonitor.recordMetric(`api_${name}_error`, duration);
      throw error;
    }
  }) as T;
};

// Component performance wrapper
export const measureComponentRender = (componentName: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const duration = performance.now() - start;
      performanceMonitor.recordMetric(`component_${componentName}`, duration);
      return result;
    };
    
    return descriptor;
  };
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
    usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) // %
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return null;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(r => r.name.endsWith('.js'));
  const cssResources = resources.filter(r => r.name.endsWith('.css'));

  return {
    totalJS: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
    totalCSS: cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
    jsFiles: jsResources.length,
    cssFiles: cssResources.length,
    largestJS: Math.max(...jsResources.map(r => r.transferSize || 0)),
    largestCSS: Math.max(...cssResources.map(r => r.transferSize || 0))
  };
};

// Core Web Vitals monitoring
export const measureCoreWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    performanceMonitor.recordMetric('lcp', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as any;
      const fid = fidEntry.processingStart - entry.startTime;
      performanceMonitor.recordMetric('fid', fid);
    }
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    performanceMonitor.recordMetric('cls', clsValue);
  }).observe({ entryTypes: ['layout-shift'] });
};

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize Core Web Vitals monitoring
if (typeof window !== 'undefined') {
  measureCoreWebVitals();
}

export default {
  PerformanceMonitor,
  withPerformanceTracking,
  measureComponentRender,
  getMemoryUsage,
  analyzeBundleSize,
  measureCoreWebVitals,
  performanceMonitor
};