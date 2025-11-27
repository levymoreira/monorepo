import { getCLS, getFCP, getFID, getLCP, getTTFB, onINP } from 'web-vitals';

// Types for performance data
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  deviceInfo?: {
    isMobile: boolean;
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
}

interface PerformanceReport {
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: PerformanceMetric[];
  errors?: string[];
}

// Generate unique session ID
function generateSessionId(): string {
  return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get device and connection information
function getDeviceInfo(): PerformanceMetric['deviceInfo'] {
  const nav = navigator as any;
  
  return {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    deviceMemory: nav.deviceMemory || undefined,
    hardwareConcurrency: nav.hardwareConcurrency || undefined,
  };
}

function getConnectionInfo(): PerformanceMetric['connection'] {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  if (!connection) return undefined;
  
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

// Send metrics to analytics endpoint
async function sendMetrics(metrics: PerformanceMetric[]): Promise<void> {
  const report: PerformanceReport = {
    sessionId: generateSessionId(),
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    metrics,
  };

  try {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      metrics.forEach(metric => {
        window.gtag('event', 'web_vitals', {
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.value),
          custom_map: {
            metric_rating: metric.rating,
            metric_delta: metric.delta,
            metric_id: metric.id,
            is_mobile: getDeviceInfo().isMobile,
            connection_type: getConnectionInfo()?.effectiveType
          }
        });
      });
    }

    // Send to custom analytics endpoint (if available)
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      }).catch(error => {
        console.warn('Failed to send performance metrics:', error);
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics:', report);
    }

  } catch (error) {
    console.warn('Failed to send performance metrics:', error);
  }
}

// Buffer to collect metrics before sending
let metricsBuffer: PerformanceMetric[] = [];
let bufferTimeout: NodeJS.Timeout | null = null;

// Add metric to buffer and schedule send
function bufferMetric(metric: PerformanceMetric): void {
  metricsBuffer.push(metric);
  
  // Clear existing timeout
  if (bufferTimeout) {
    clearTimeout(bufferTimeout);
  }
  
  // Send metrics after 2 seconds of inactivity or when buffer is full
  bufferTimeout = setTimeout(() => {
    if (metricsBuffer.length > 0) {
      sendMetrics([...metricsBuffer]);
      metricsBuffer = [];
    }
  }, 2000);
  
  // Send immediately if buffer is full
  if (metricsBuffer.length >= 10) {
    sendMetrics([...metricsBuffer]);
    metricsBuffer = [];
    if (bufferTimeout) {
      clearTimeout(bufferTimeout);
      bufferTimeout = null;
    }
  }
}

// Create metric object with common properties
function createMetric(metric: any): PerformanceMetric {
  return {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    connection: getConnectionInfo(),
    deviceInfo: getDeviceInfo(),
  };
}

// Initialize Real User Monitoring
export function initRUM(): void {
  // Only run in browser
  if (typeof window === 'undefined') return;

  console.log('🔍 Initializing Real User Monitoring...');

  // Track Core Web Vitals
  getCLS((metric) => {
    bufferMetric(createMetric(metric));
  });

  getFCP((metric) => {
    bufferMetric(createMetric(metric));
  });

  getFID((metric) => {
    bufferMetric(createMetric(metric));
  });

  getLCP((metric) => {
    bufferMetric(createMetric(metric));
  });

  getTTFB((metric) => {
    bufferMetric(createMetric(metric));
  });

  onINP((metric) => {
    bufferMetric(createMetric(metric));
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && metricsBuffer.length > 0) {
      // Send remaining metrics when page becomes hidden
      sendMetrics([...metricsBuffer]);
      metricsBuffer = [];
    }
  });

  // Track page unload
  window.addEventListener('beforeunload', () => {
    if (metricsBuffer.length > 0) {
      // Use sendBeacon for reliable sending during page unload
      const report: PerformanceReport = {
        sessionId: generateSessionId(),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics: metricsBuffer,
      };
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(report));
      }
    }
  });

  console.log('✅ Real User Monitoring initialized');
}

// Manual metric tracking for custom events
export function trackCustomMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor' = 'good'): void {
  const metric: PerformanceMetric = {
    name: `custom_${name}`,
    value,
    rating,
    delta: 0,
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    connection: getConnectionInfo(),
    deviceInfo: getDeviceInfo(),
  };
  
  bufferMetric(metric);
}

// Track interaction metrics manually
export function trackInteraction(element: string, duration: number): void {
  const rating = duration <= 100 ? 'good' : duration <= 300 ? 'needs-improvement' : 'poor';
  trackCustomMetric(`interaction_${element}`, duration, rating);
}

// Get current performance metrics snapshot
export function getPerformanceSnapshot(): Promise<Record<string, number>> {
  return new Promise((resolve) => {
    const snapshot: Record<string, number> = {};
    
    // Get current metrics
    getCLS((metric) => { snapshot.cls = metric.value; });
    getFCP((metric) => { snapshot.fcp = metric.value; });
    getFID((metric) => { snapshot.fid = metric.value; });
    getLCP((metric) => { snapshot.lcp = metric.value; });
    getTTFB((metric) => { snapshot.ttfb = metric.value; });
    onINP((metric) => { snapshot.inp = metric.value; });
    
    // Resolve after a short delay to allow metrics to be captured
    setTimeout(() => resolve(snapshot), 100);
  });
}

// Performance debugging utilities
export function debugPerformance(): void {
  if (typeof window === 'undefined') return;
  
  console.group('🔧 Performance Debug Info');
  
  // Device info
  console.log('Device Info:', getDeviceInfo());
  
  // Connection info
  console.log('Connection Info:', getConnectionInfo());
  
  // Performance entries
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    console.log('Navigation Timing:', {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      firstByte: navigation.responseStart - navigation.requestStart,
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.requestStart - navigation.secureConnectionStart,
    });
  }
  
  // Resource timing
  const resources = performance.getEntriesByType('resource');
  console.log('Resource Count:', resources.length);
  
  const resourcesByType = resources.reduce((acc: Record<string, number>, resource) => {
    const type = (resource as PerformanceResourceTiming).initiatorType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  console.log('Resources by Type:', resourcesByType);
  
  // Memory info (if available)
  const memory = (performance as any).memory;
  if (memory) {
    console.log('Memory Info:', {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB',
    });
  }
  
  console.groupEnd();
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}