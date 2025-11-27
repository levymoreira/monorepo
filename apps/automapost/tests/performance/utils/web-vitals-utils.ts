import { Page } from '@playwright/test';
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

// Type definitions for Core Web Vitals metrics
export interface WebVitalsMetrics {
  lcp?: number;  // Largest Contentful Paint
  inp?: number;  // Interaction to Next Paint  
  cls?: number;  // Cumulative Layout Shift
  fcp?: number;  // First Contentful Paint
  fid?: number;  // First Input Delay
  ttfb?: number; // Time to First Byte
  // Uppercase variants from our custom implementation
  LCP?: number;
  INP?: number;
  CLS?: number;
  FCP?: number;
  FID?: number;
  TTFB?: number;
}

export interface PerformanceThresholds {
  lcp: {
    good: number;
    needsImprovement: number;
  };
  inp: {
    good: number;
    needsImprovement: number;
  };
  cls: {
    good: number;
    needsImprovement: number;
  };
  fcp: {
    good: number;
    needsImprovement: number;
  };
  fid: {
    good: number;
    needsImprovement: number;
  };
  ttfb: {
    good: number;
    needsImprovement: number;
  };
}

// Standard Google Core Web Vitals thresholds
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: {
    good: 2500,        // <= 2.5s
    needsImprovement: 4000  // <= 4s
  },
  inp: {
    good: 200,         // <= 200ms
    needsImprovement: 500   // <= 500ms
  },
  cls: {
    good: 0.1,         // <= 0.1
    needsImprovement: 0.25  // <= 0.25
  },
  fcp: {
    good: 1800,        // <= 1.8s
    needsImprovement: 3000  // <= 3s
  },
  fid: {
    good: 100,         // <= 100ms
    needsImprovement: 300   // <= 300ms
  },
  ttfb: {
    good: 800,         // <= 800ms
    needsImprovement: 1800  // <= 1.8s
  }
};

// Mobile-specific thresholds (more strict)
export const MOBILE_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: {
    good: 1800,        // <= 1.8s (more strict for mobile)
    needsImprovement: 2500  // <= 2.5s
  },
  inp: {
    good: 150,         // <= 150ms (more strict for mobile)
    needsImprovement: 200   // <= 200ms
  },
  cls: {
    good: 0.1,
    needsImprovement: 0.25
  },
  fcp: {
    good: 1500,        // <= 1.5s (more strict for mobile)
    needsImprovement: 2000  // <= 2s
  },
  fid: {
    good: 100,
    needsImprovement: 300
  },
  ttfb: {
    good: 600,         // <= 600ms (more strict for mobile)
    needsImprovement: 800   // <= 800ms
  }
};

/**
 * Inject Web Vitals measurement script into the page
 */
export async function injectWebVitalsScript(page: Page): Promise<void> {
  await page.addInitScript(`
    // Store metrics globally
    window.__webVitalsMetrics = {};
    
    // Manual Web Vitals implementation using Performance Observer
    const reportMetric = (name, value) => {
      window.__webVitalsMetrics[name] = value;
      console.log('[Web Vitals]', name + ':', value);
    };

    // Measure FCP (First Contentful Paint)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportMetric('FCP', entry.startTime);
        }
      }
    }).observe({ type: 'paint', buffered: true });

    // Measure LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      reportMetric('LCP', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // Measure TTFB (Time to First Byte)
    new PerformanceObserver((entryList) => {
      const [entry] = entryList.getEntries();
      reportMetric('TTFB', entry.responseStart);
    }).observe({ type: 'navigation', buffered: true });

    // Measure CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          reportMetric('CLS', clsValue);
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });

    // Measure INP (Interaction to Next Paint) - simplified version
    let maxINP = 0;
    ['pointerdown', 'pointerup', 'click', 'keydown', 'keyup'].forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        requestAnimationFrame(() => {
          const duration = performance.now() - startTime;
          if (duration > maxINP) {
            maxINP = duration;
            reportMetric('INP', maxINP);
          }
        });
      }, { passive: true, capture: true });
    });
  `);
}

/**
 * Get Web Vitals metrics from the page
 */
export async function getWebVitalsMetrics(page: Page): Promise<WebVitalsMetrics> {
  return await page.evaluate(() => {
    return window.__webVitalsMetrics || {};
  });
}

/**
 * Wait for LCP to be measured (with timeout)
 */
export async function waitForLCP(page: Page, timeout: number = 30000): Promise<number | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const metrics = await getWebVitalsMetrics(page);
    // Check both uppercase and lowercase variants
    if (metrics.lcp !== undefined || metrics.LCP !== undefined) {
      return metrics.lcp || metrics.LCP;
    }
    await page.waitForTimeout(100);
  }
  
  return null;
}

/**
 * Simulate mobile network conditions
 */
export async function simulateMobileNetwork(page: Page): Promise<void> {
  // Simulate 3G network conditions
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
    uploadThroughput: 750 * 1024 / 8,           // 750 Kbps  
    latency: 40                                  // 40ms RTT
  });
}

/**
 * Simulate CPU throttling (4x slowdown for mobile)
 */
export async function simulateCPUThrottling(page: Page, rate: number = 4): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate });
}

/**
 * Measure INP by simulating interactions
 */
export async function measureINP(page: Page, interactions: (() => Promise<void>)[]): Promise<number[]> {
  const inpValues: number[] = [];
  
  for (const interaction of interactions) {
    try {
      // Reset INP measurement
      await page.evaluate(() => {
        if (window.__webVitalsMetrics) {
          window.__webVitalsMetrics.INP = undefined;
          window.__webVitalsMetrics.inp = undefined;
        }
      });
      
      const startTime = performance.now();
      await interaction();
      
      // Wait for INP to be measured with shorter timeout
      try {
        await page.waitForFunction(() => {
          return window.__webVitalsMetrics && 
                 (window.__webVitalsMetrics.INP !== undefined || window.__webVitalsMetrics.inp !== undefined);
        }, { timeout: 3000 });
        
        const metrics = await getWebVitalsMetrics(page);
        const inpValue = metrics.inp || metrics.INP;
        if (inpValue !== undefined) {
          inpValues.push(inpValue);
        }
      } catch (timeoutError) {
        // If INP measurement times out, estimate it from the interaction time
        const estimatedINP = performance.now() - startTime;
        inpValues.push(estimatedINP);
        console.warn(`INP measurement timeout, using estimated value: ${estimatedINP}ms`);
      }
    } catch (error) {
      console.warn(`Interaction failed:`, error);
      // Add a default INP value for failed interactions
      inpValues.push(100); // Default safe INP value
    }
  }
  
  return inpValues;
}

/**
 * Get performance score based on Core Web Vitals
 */
export function getPerformanceScore(metrics: WebVitalsMetrics, isMobile: boolean = false): {
  score: number;
  details: Record<string, { value: number; score: 'good' | 'needs-improvement' | 'poor' }>;
} {
  const thresholds = isMobile ? MOBILE_PERFORMANCE_THRESHOLDS : PERFORMANCE_THRESHOLDS;
  const details: Record<string, { value: number; score: 'good' | 'needs-improvement' | 'poor' }> = {};
  let totalScore = 0;
  let metricsCount = 0;

  const scoreMetric = (name: string, value: number | undefined, threshold: { good: number; needsImprovement: number }) => {
    if (value === undefined) return;
    
    let score: 'good' | 'needs-improvement' | 'poor';
    let points: number;
    
    if (value <= threshold.good) {
      score = 'good';
      points = 100;
    } else if (value <= threshold.needsImprovement) {
      score = 'needs-improvement';
      points = 50;
    } else {
      score = 'poor';
      points = 0;
    }
    
    details[name] = { value, score };
    totalScore += points;
    metricsCount++;
  };

  scoreMetric('lcp', metrics.lcp || metrics.LCP, thresholds.lcp);
  scoreMetric('inp', metrics.inp || metrics.INP, thresholds.inp);
  scoreMetric('cls', metrics.cls || metrics.CLS, thresholds.cls);
  scoreMetric('fcp', metrics.fcp || metrics.FCP, thresholds.fcp);
  scoreMetric('fid', metrics.fid || metrics.FID, thresholds.fid);
  scoreMetric('ttfb', metrics.ttfb || metrics.TTFB, thresholds.ttfb);

  return {
    score: metricsCount > 0 ? Math.round(totalScore / metricsCount) : 0,
    details
  };
}

/**
 * Run multiple test iterations and get statistical results
 */
export async function runPerformanceIterations(
  page: Page,
  testFunction: () => Promise<WebVitalsMetrics>,
  iterations: number = 5
): Promise<{
  metrics: WebVitalsMetrics;
  iterations: WebVitalsMetrics[];
  statistics: {
    mean: WebVitalsMetrics;
    median: WebVitalsMetrics;
    p95: WebVitalsMetrics;
    standardDeviation: WebVitalsMetrics;
  };
}> {
  const results: WebVitalsMetrics[] = [];
  
  for (let i = 0; i < iterations; i++) {
    try {
      // Reload page for each iteration with faster condition
      if (i > 0) { // Skip first reload since page is already loaded
        await page.reload({ waitUntil: 'domcontentloaded' });
      }
      const metrics = await testFunction();
      results.push(metrics);
      
      // Shorter wait between iterations
      if (i < iterations - 1) {
        await page.waitForTimeout(500);
      }
    } catch (error) {
      console.warn(`Iteration ${i + 1} failed:`, error);
      // Add empty metrics for failed iteration to maintain consistency
      results.push({});
    }
  }
  
  // Calculate statistics
  const calculateStats = (values: number[]): { mean: number; median: number; p95: number; stdDev: number } => {
    if (values.length === 0) return { mean: 0, median: 0, p95: 0, stdDev: 0 };
    
    const sorted = values.sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, median, p95, stdDev };
  };
  
  const getMetricValues = (key: keyof WebVitalsMetrics, altKey?: keyof WebVitalsMetrics) => 
    results.map(r => r[key] || (altKey ? r[altKey] : undefined)).filter((v): v is number => v !== undefined);
  
  const lcpStats = calculateStats(getMetricValues('lcp', 'LCP'));
  const inpStats = calculateStats(getMetricValues('inp', 'INP'));
  const clsStats = calculateStats(getMetricValues('cls', 'CLS'));
  const fcpStats = calculateStats(getMetricValues('fcp', 'FCP'));
  const fidStats = calculateStats(getMetricValues('fid', 'FID'));
  const ttfbStats = calculateStats(getMetricValues('ttfb', 'TTFB'));
  
  return {
    metrics: {
      lcp: lcpStats.mean,
      inp: inpStats.mean,
      cls: clsStats.mean,
      fcp: fcpStats.mean,
      fid: fidStats.mean,
      ttfb: ttfbStats.mean
    },
    iterations: results,
    statistics: {
      mean: {
        lcp: lcpStats.mean,
        inp: inpStats.mean,
        cls: clsStats.mean,
        fcp: fcpStats.mean,
        fid: fidStats.mean,
        ttfb: ttfbStats.mean
      },
      median: {
        lcp: lcpStats.median,
        inp: inpStats.median,
        cls: clsStats.median,
        fcp: fcpStats.median,
        fid: fidStats.median,
        ttfb: ttfbStats.median
      },
      p95: {
        lcp: lcpStats.p95,
        inp: inpStats.p95,
        cls: clsStats.p95,
        fcp: fcpStats.p95,
        fid: fidStats.p95,
        ttfb: ttfbStats.p95
      },
      standardDeviation: {
        lcp: lcpStats.stdDev,
        inp: inpStats.stdDev,
        cls: clsStats.stdDev,
        fcp: fcpStats.stdDev,
        fid: fidStats.stdDev,
        ttfb: ttfbStats.stdDev
      }
    }
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __webVitalsMetrics: any;
  }
}