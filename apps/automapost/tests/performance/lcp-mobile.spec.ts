import { test, expect } from '@playwright/test';
import {
  injectWebVitalsScript,
  waitForLCP,
  simulateMobileNetwork,
  simulateCPUThrottling,
  runPerformanceIterations,
  getWebVitalsMetrics,
  getPerformanceScore,
  MOBILE_PERFORMANCE_THRESHOLDS
} from './utils/web-vitals-utils';

test.describe('Landing Page LCP Performance (Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    // Inject Web Vitals measurement script
    await injectWebVitalsScript(page);
    
    // Simulate mobile network conditions
    await simulateMobileNetwork(page);
    
    // Simulate mobile CPU throttling
    await simulateCPUThrottling(page, 4);
  });

  test('LCP should be under 1.8s on mobile (English)', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'networkidle' });
    
    // Wait for LCP to be measured
    const lcp = await waitForLCP(page, 30000);
    
    expect(lcp).not.toBeNull();
    expect(lcp!).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.lcp.good);
    
    console.log(`📱 Mobile LCP (EN): ${lcp}ms`);
  });

  test('LCP should be under 1.8s on mobile (Spanish)', async ({ page }) => {
    await page.goto('/es', { waitUntil: 'networkidle' });
    
    const lcp = await waitForLCP(page, 30000);
    
    expect(lcp).not.toBeNull();
    expect(lcp!).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.lcp.good);
    
    console.log(`📱 Mobile LCP (ES): ${lcp}ms`);
  });

  test('LCP should be under 1.8s on mobile (Portuguese)', async ({ page }) => {
    await page.goto('/pt', { waitUntil: 'networkidle' });
    
    const lcp = await waitForLCP(page, 30000);
    
    expect(lcp).not.toBeNull();
    expect(lcp!).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.lcp.good);
    
    console.log(`📱 Mobile LCP (PT): ${lcp}ms`);
  });

  test('LCP multiple iterations statistical analysis (Mobile)', async ({ page }) => {
    const testFunction = async () => {
      await page.goto('/en', { waitUntil: 'networkidle' });
      const lcp = await waitForLCP(page, 30000);
      
      return {
        lcp: lcp || 0
      };
    };

    const results = await runPerformanceIterations(page, testFunction, 5);
    
    // Statistical assertions
    expect(results.statistics.mean.lcp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.lcp.good);
    expect(results.statistics.p95.lcp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.lcp.needsImprovement);
    
    // Log detailed statistics
    console.log('📊 LCP Statistical Analysis (Mobile):');
    console.log(`   Mean: ${Math.round(results.statistics.mean.lcp!)}ms`);
    console.log(`   Median: ${Math.round(results.statistics.median.lcp!)}ms`);
    console.log(`   P95: ${Math.round(results.statistics.p95.lcp!)}ms`);
    console.log(`   Std Dev: ${Math.round(results.statistics.standardDeviation.lcp!)}ms`);
    console.log(`   All values: ${results.iterations.map(r => Math.round(r.lcp!)).join('ms, ')}ms`);
  });

  test('LCP elements identification and optimization validation', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'networkidle' });
    
    // Identify LCP candidates
    const lcpCandidates = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const textBlocks = Array.from(document.querySelectorAll('h1, h2, p'));
      
      return {
        images: images.map(img => ({
          src: img.src,
          alt: img.alt,
          loading: img.loading,
          width: img.offsetWidth,
          height: img.offsetHeight,
          isVisible: img.offsetParent !== null
        })).filter(img => img.isVisible && img.width > 0 && img.height > 0),
        textBlocks: textBlocks.map(el => ({
          tagName: el.tagName,
          text: el.textContent?.substring(0, 100),
          width: el.offsetWidth,
          height: el.offsetHeight,
          isVisible: el.offsetParent !== null
        })).filter(el => el.isVisible && el.width > 0 && el.height > 0)
      };
    });

    // Wait for LCP
    const lcp = await waitForLCP(page, 30000);
    expect(lcp).not.toBeNull();

    console.log('🎯 LCP Candidates Analysis:');
    console.log(`   Images found: ${lcpCandidates.images.length}`);
    console.log(`   Text blocks found: ${lcpCandidates.textBlocks.length}`);
    console.log(`   Final LCP: ${lcp}ms`);

    // Verify optimizations are in place
    const imageOptimizations = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return {
        totalImages: images.length,
        lazyLoadedImages: images.filter(img => img.loading === 'lazy').length,
        eagerLoadedImages: images.filter(img => img.loading === 'eager').length,
        nextjsOptimizedImages: images.filter(img => 
          img.src.includes('/_next/image') || 
          img.getAttribute('data-nimg') !== null
        ).length
      };
    });

    console.log('🔧 Image Optimization Status:');
    console.log(`   Total images: ${imageOptimizations.totalImages}`);
    console.log(`   Lazy loaded: ${imageOptimizations.lazyLoadedImages}`);
    console.log(`   Eager loaded: ${imageOptimizations.eagerLoadedImages}`);
    console.log(`   Next.js optimized: ${imageOptimizations.nextjsOptimizedImages}`);

    // Verify that critical images are eagerly loaded
    expect(imageOptimizations.eagerLoadedImages).toBeGreaterThan(0);
  });

  test('LCP under different network conditions', async ({ page }) => {
    const networkConditions = [
      {
        name: '3G',
        downloadThroughput: 1.5 * 1024 * 1024 / 8,
        uploadThroughput: 750 * 1024 / 8,
        latency: 40
      },
      {
        name: 'Slow 3G',
        downloadThroughput: 500 * 1024 / 8,
        uploadThroughput: 500 * 1024 / 8,
        latency: 400
      },
      {
        name: '4G',
        downloadThroughput: 4 * 1024 * 1024 / 8,
        uploadThroughput: 3 * 1024 * 1024 / 8,
        latency: 20
      }
    ];

    for (const network of networkConditions) {
      console.log(`🌐 Testing LCP on ${network.name}...`);
      
      // Apply network conditions
      const client = await page.context().newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: network.downloadThroughput,
        uploadThroughput: network.uploadThroughput,
        latency: network.latency
      });

      await page.goto('/en', { waitUntil: 'networkidle' });
      const lcp = await waitForLCP(page, 45000); // Extended timeout for slow networks

      expect(lcp).not.toBeNull();
      
      console.log(`   ${network.name} LCP: ${lcp}ms`);

      // More lenient thresholds for slower networks
      if (network.name === 'Slow 3G') {
        expect(lcp!).toBeLessThanOrEqual(4000); // 4s for slow 3G
      } else if (network.name === '3G') {
        expect(lcp!).toBeLessThanOrEqual(2500); // 2.5s for 3G
      } else {
        expect(lcp!).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.lcp.good);
      }
    }
  });

  test('LCP regression prevention', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'networkidle' });
    
    const metrics = await getWebVitalsMetrics(page);
    const lcp = await waitForLCP(page, 30000);
    
    expect(lcp).not.toBeNull();
    
    // Create performance baseline
    const performanceBaseline = {
      lcp: lcp!,
      timestamp: new Date().toISOString(),
      userAgent: await page.evaluate(() => navigator.userAgent),
      viewport: await page.viewportSize()
    };

    // Store baseline for CI comparison
    console.log('📈 Performance Baseline:', JSON.stringify(performanceBaseline, null, 2));

    // Regression test - ensure performance doesn't degrade by more than 10%
    const maxAcceptableLCP = MOBILE_PERFORMANCE_THRESHOLDS.lcp.good * 1.1;
    expect(lcp).toBeLessThanOrEqual(maxAcceptableLCP);

    // Performance score calculation
    const score = getPerformanceScore(metrics, true);
    expect(score.score).toBeGreaterThanOrEqual(80); // Good performance score

    console.log(`🏆 Performance Score: ${score.score}/100`);
    console.log(`   LCP: ${lcp}ms (${score.details.lcp?.score || 'not measured'})`);
  });
});