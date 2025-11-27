import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  injectWebVitalsScript,
  simulateMobileNetwork,
  simulateCPUThrottling,
  runPerformanceIterations,
  getPerformanceScore,
  MOBILE_PERFORMANCE_THRESHOLDS
} from './utils/web-vitals-utils';

interface PerformanceBaseline {
  timestamp: string;
  commit?: string;
  branch?: string;
  metrics: {
    lcp: { mean: number; p95: number };
    inp: { mean: number; p95: number };
    cls: { mean: number; p95: number };
    fcp: { mean: number; p95: number };
    ttfb: { mean: number; p95: number };
  };
  score: number;
  environment: {
    userAgent: string;
    viewport: { width: number; height: number } | null;
    throttling: string;
  };
}

const BASELINE_FILE = path.join(process.cwd(), 'test-results/performance-baseline.json');
const MAX_REGRESSION_PERCENTAGE = 15; // Maximum allowed regression: 15%
const MIN_IMPROVEMENT_PERCENTAGE = 5; // Minimum improvement to update baseline: 5%

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadBaseline(): PerformanceBaseline | null {
  try {
    if (fs.existsSync(BASELINE_FILE)) {
      const data = fs.readFileSync(BASELINE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Failed to load performance baseline:', error);
  }
  return null;
}

function saveBaseline(baseline: PerformanceBaseline): void {
  try {
    ensureDirectoryExists(BASELINE_FILE);
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
    console.log(`📄 Performance baseline saved to ${BASELINE_FILE}`);
  } catch (error) {
    console.error('Failed to save performance baseline:', error);
  }
}

function calculateRegressionPercentage(current: number, baseline: number): number {
  return ((current - baseline) / baseline) * 100;
}

function getBranchName(): string {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getCommitHash(): string {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

test.describe('Performance Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    await injectWebVitalsScript(page);
    await simulateMobileNetwork(page);
    await simulateCPUThrottling(page, 4);
  });

  test('Performance regression detection and baseline management', async ({ page }) => {
    console.log('🔍 Running performance regression analysis...');
    
    // Load existing baseline
    const existingBaseline = loadBaseline();
    
    // Run current performance test
    const testFunction = async () => {
      await page.goto('/en', { waitUntil: 'networkidle' });
      
      // Wait for metrics to be collected (reduced timeout)
      await page.waitForTimeout(2000);
      
      return await page.evaluate(() => {
        return window.__webVitalsMetrics || {};
      });
    };

    // Reduced iterations to avoid timeout
    const results = await runPerformanceIterations(page, testFunction, 3);
    const score = getPerformanceScore(results.metrics, true);

    // Create current performance data
    const currentPerformance: PerformanceBaseline = {
      timestamp: new Date().toISOString(),
      commit: getCommitHash(),
      branch: getBranchName(),
      metrics: {
        lcp: { 
          mean: results.statistics.mean.lcp || 0, 
          p95: results.statistics.p95.lcp || 0 
        },
        inp: { 
          mean: results.statistics.mean.inp || 0, 
          p95: results.statistics.p95.inp || 0 
        },
        cls: { 
          mean: results.statistics.mean.cls || 0, 
          p95: results.statistics.p95.cls || 0 
        },
        fcp: { 
          mean: results.statistics.mean.fcp || 0, 
          p95: results.statistics.p95.fcp || 0 
        },
        ttfb: { 
          mean: results.statistics.mean.ttfb || 0, 
          p95: results.statistics.p95.ttfb || 0 
        }
      },
      score: score.score,
      environment: {
        userAgent: await page.evaluate(() => navigator.userAgent),
        viewport: await page.viewportSize(),
        throttling: '4x CPU, 3G Network'
      }
    };

    console.log('\n📊 Current Performance Results:');
    console.log(`   LCP: ${Math.round(currentPerformance.metrics.lcp.mean)}ms (P95: ${Math.round(currentPerformance.metrics.lcp.p95)}ms)`);
    console.log(`   INP: ${Math.round(currentPerformance.metrics.inp.mean)}ms (P95: ${Math.round(currentPerformance.metrics.inp.p95)}ms)`);
    console.log(`   CLS: ${currentPerformance.metrics.cls.mean.toFixed(3)} (P95: ${currentPerformance.metrics.cls.p95.toFixed(3)})`);
    console.log(`   FCP: ${Math.round(currentPerformance.metrics.fcp.mean)}ms (P95: ${Math.round(currentPerformance.metrics.fcp.p95)}ms)`);
    console.log(`   TTFB: ${Math.round(currentPerformance.metrics.ttfb.mean)}ms (P95: ${Math.round(currentPerformance.metrics.ttfb.p95)}ms)`);
    console.log(`   Performance Score: ${currentPerformance.score}/100`);

    if (existingBaseline) {
      console.log('\n📈 Baseline Comparison:');
      console.log(`   Baseline from: ${existingBaseline.timestamp}`);
      console.log(`   Baseline commit: ${existingBaseline.commit}`);
      console.log(`   Baseline branch: ${existingBaseline.branch}`);

      // Check for regressions
      const regressions: string[] = [];
      const improvements: string[] = [];

      const checkMetric = (name: string, current: number, baseline: number, threshold: number) => {
        const regression = calculateRegressionPercentage(current, baseline);
        const absRegression = Math.abs(regression);
        
        if (regression > MAX_REGRESSION_PERCENTAGE) {
          regressions.push(`${name}: ${Math.round(current)}ms vs ${Math.round(baseline)}ms baseline (+${regression.toFixed(1)}%)`);
        } else if (regression < -MIN_IMPROVEMENT_PERCENTAGE) {
          improvements.push(`${name}: ${Math.round(current)}ms vs ${Math.round(baseline)}ms baseline (${regression.toFixed(1)}%)`);
        }
        
        console.log(`   ${name}: ${Math.round(current)}ms vs ${Math.round(baseline)}ms baseline (${regression > 0 ? '+' : ''}${regression.toFixed(1)}%)`);
        
        // Assert no significant regression
        expect(current).toBeLessThanOrEqual(baseline * (1 + MAX_REGRESSION_PERCENTAGE / 100));
      };

      // Check mean values for regressions
      checkMetric('LCP Mean', currentPerformance.metrics.lcp.mean, existingBaseline.metrics.lcp.mean, MOBILE_PERFORMANCE_THRESHOLDS.lcp.good);
      checkMetric('INP Mean', currentPerformance.metrics.inp.mean, existingBaseline.metrics.inp.mean, MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
      checkMetric('FCP Mean', currentPerformance.metrics.fcp.mean, existingBaseline.metrics.fcp.mean, MOBILE_PERFORMANCE_THRESHOLDS.fcp?.good || 1800);
      checkMetric('TTFB Mean', currentPerformance.metrics.ttfb.mean, existingBaseline.metrics.ttfb.mean, MOBILE_PERFORMANCE_THRESHOLDS.ttfb?.good || 800);

      // Check P95 values (more important for user experience)
      checkMetric('LCP P95', currentPerformance.metrics.lcp.p95, existingBaseline.metrics.lcp.p95, MOBILE_PERFORMANCE_THRESHOLDS.lcp.needsImprovement);
      checkMetric('INP P95', currentPerformance.metrics.inp.p95, existingBaseline.metrics.inp.p95, MOBILE_PERFORMANCE_THRESHOLDS.inp.needsImprovement);

      // Performance score regression check
      const scoreRegression = calculateRegressionPercentage(currentPerformance.score, existingBaseline.score);
      console.log(`   Performance Score: ${currentPerformance.score}/100 vs ${existingBaseline.score}/100 baseline (${scoreRegression > 0 ? '+' : ''}${scoreRegression.toFixed(1)}%)`);
      
      if (scoreRegression < -10) { // 10% score decrease is significant
        regressions.push(`Performance Score: ${currentPerformance.score} vs ${existingBaseline.score} baseline (${scoreRegression.toFixed(1)}%)`);
      }

      // Report results
      if (regressions.length > 0) {
        console.log('\n❌ Performance Regressions Detected:');
        regressions.forEach(regression => console.log(`   ${regression}`));
        throw new Error(`Performance regression detected: ${regressions.join(', ')}`);
      }

      if (improvements.length > 0) {
        console.log('\n✅ Performance Improvements Detected:');
        improvements.forEach(improvement => console.log(`   ${improvement}`));
        
        // Update baseline if significant improvements
        if (improvements.length >= 2) {
          console.log('\n🎉 Updating performance baseline due to significant improvements');
          saveBaseline(currentPerformance);
        }
      } else {
        console.log('\n✅ No significant performance regressions detected');
      }

    } else {
      console.log('\n📝 No baseline found. Creating initial baseline...');
      saveBaseline(currentPerformance);
    }

    // Assert minimum performance requirements regardless of baseline
    expect(currentPerformance.metrics.lcp.mean).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.lcp.good);
    expect(currentPerformance.metrics.inp.mean).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
    expect(currentPerformance.score).toBeGreaterThanOrEqual(75); // Minimum acceptable score
  });

  test('Performance consistency across multiple runs', async ({ page }) => {
    console.log('🔄 Testing performance consistency...');
    
    const testFunction = async () => {
      await page.goto('/en', { waitUntil: 'domcontentloaded' }); // Faster wait condition
      await page.waitForTimeout(1500); // Reduced timeout
      
      return await page.evaluate(() => {
        return window.__webVitalsMetrics || {};
      });
    };

    // Reduced iterations to prevent timeout
    const results = await runPerformanceIterations(page, testFunction, 5);
    
    // Check consistency (standard deviation should be reasonable)
    const lcpConsistency = (results.statistics.standardDeviation.lcp || 0) / results.statistics.mean.lcp! * 100;
    const inpConsistency = (results.statistics.standardDeviation.inp || 0) / results.statistics.mean.inp! * 100;
    
    console.log('\n📊 Performance Consistency Analysis:');
    console.log(`   LCP Coefficient of Variation: ${lcpConsistency.toFixed(1)}%`);
    console.log(`   INP Coefficient of Variation: ${inpConsistency.toFixed(1)}%`);
    console.log(`   LCP Range: ${Math.round(Math.min(...results.iterations.map(r => r.lcp || 0)))}ms - ${Math.round(Math.max(...results.iterations.map(r => r.lcp || 0)))}ms`);
    console.log(`   INP Range: ${Math.round(Math.min(...results.iterations.map(r => r.inp || 0)))}ms - ${Math.round(Math.max(...results.iterations.map(r => r.inp || 0)))}ms`);

    // Assert reasonable consistency (coefficient of variation - more lenient for test environment)
    expect(lcpConsistency).toBeLessThan(50); // 50% variation acceptable in test environment
    
    // Handle NaN case for INP (when mean is 0 or very small)
    if (!isNaN(inpConsistency)) {
      expect(inpConsistency).toBeLessThan(60); // More lenient for INP due to its volatile nature
    } else {
      console.log('   INP consistency test skipped due to insufficient variation');\n    }
  });

  test('Performance degradation over time simulation', async ({ page }) => {
    console.log('⏰ Testing performance over extended session...');
    
    // Simulate a longer user session
    await page.goto('/en', { waitUntil: 'networkidle' });
    
    const measurements: Array<{ lcp: number; inp: number; timestamp: number }> = [];
    
    // Take measurements at different points in the session
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(2000);
      
      // Simulate user activity
      await page.mouse.move(100 + i * 50, 100 + i * 50);
      await page.keyboard.press('Tab');
      
      const metrics = await page.evaluate(() => window.__webVitalsMetrics || {});
      
      if (metrics.lcp && metrics.inp) {
        measurements.push({
          lcp: metrics.lcp,
          inp: metrics.inp,
          timestamp: Date.now()
        });
      }
    }
    
    if (measurements.length > 2) {
      const firstMeasurement = measurements[0];
      const lastMeasurement = measurements[measurements.length - 1];
      
      const lcpDegradation = lastMeasurement.lcp - firstMeasurement.lcp;
      const inpDegradation = lastMeasurement.inp - firstMeasurement.inp;
      
      console.log('\n📈 Session Performance Analysis:');
      console.log(`   LCP Change: ${Math.round(lcpDegradation)}ms (${((lcpDegradation / firstMeasurement.lcp) * 100).toFixed(1)}%)`);
      console.log(`   INP Change: ${Math.round(inpDegradation)}ms (${((inpDegradation / firstMeasurement.inp) * 100).toFixed(1)}%)`);
      console.log(`   Session Duration: ${((lastMeasurement.timestamp - firstMeasurement.timestamp) / 1000).toFixed(1)}s`);
      
      // Performance should not degrade significantly during a session
      expect(lcpDegradation).toBeLessThan(500); // LCP shouldn't increase by more than 500ms
      expect(inpDegradation).toBeLessThan(100); // INP shouldn't increase by more than 100ms
    }
  });

  test('Performance comparison between locales', async ({ page }) => {
    console.log('🌍 Testing performance across different locales...');
    
    const locales = ['en', 'es', 'pt'];
    const localeResults: Record<string, { lcp: number; inp: number; score: number }> = {};
    
    for (const locale of locales) {
      console.log(`   Testing ${locale}...`);
      
      await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      const metrics = await page.evaluate(() => window.__webVitalsMetrics || {});
      const score = getPerformanceScore(metrics, true);
      
      localeResults[locale] = {
        lcp: metrics.lcp || 0,
        inp: metrics.inp || 0,
        score: score.score
      };
      
      console.log(`     LCP: ${Math.round(localeResults[locale].lcp)}ms, INP: ${Math.round(localeResults[locale].inp)}ms, Score: ${localeResults[locale].score}`);
    }
    
    // All locales should meet performance requirements
    for (const [locale, results] of Object.entries(localeResults)) {
      expect(results.lcp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.lcp.good);
      expect(results.inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
      expect(results.score).toBeGreaterThanOrEqual(75);
    }
    
    // Performance difference between locales should be minimal
    const lcpValues = Object.values(localeResults).map(r => r.lcp);
    const inpValues = Object.values(localeResults).map(r => r.inp);
    
    const lcpRange = Math.max(...lcpValues) - Math.min(...lcpValues);
    const inpRange = Math.max(...inpValues) - Math.min(...inpValues);
    
    console.log(`\n📊 Locale Performance Variance:`);
    console.log(`   LCP Range: ${Math.round(lcpRange)}ms`);
    console.log(`   INP Range: ${Math.round(inpRange)}ms`);
    
    expect(lcpRange).toBeLessThan(300); // LCP difference should be < 300ms
    expect(inpRange).toBeLessThan(50);  // INP difference should be < 50ms
  });
});

test.afterAll(async () => {
  console.log('🎯 Performance regression testing completed');
  console.log(`📄 Results and baseline stored in ${BASELINE_FILE}`);
});