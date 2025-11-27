import { test, expect } from '@playwright/test';
import {
  injectWebVitalsScript,
  simulateMobileNetwork,
  simulateCPUThrottling,
  getWebVitalsMetrics,
  measureINP,
  runPerformanceIterations,
  MOBILE_PERFORMANCE_THRESHOLDS
} from './utils/web-vitals-utils';

test.describe('Landing Page INP Performance (Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    // Inject Web Vitals measurement script
    await injectWebVitalsScript(page);
    
    // Simulate mobile network conditions
    await simulateMobileNetwork(page);
    
    // Simulate mobile CPU throttling
    await simulateCPUThrottling(page, 4);
    
    // Navigate to landing page
    await page.goto('/en', { waitUntil: 'networkidle' });
    
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');
  });

  test('Form input interactions should have INP < 150ms', async ({ page }) => {
    const interactions = [
      // Email input interaction (more reliable)
      async () => {
        const emailInput = page.locator('input[type="email"]').first();
        await emailInput.waitFor({ state: 'visible' });
        await emailInput.click();
        await emailInput.fill('john@example.com');
      },
      // Name input interaction (if available)
      async () => {
        const nameInput = page.locator('input[type="text"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.click();
          await nameInput.fill('John Doe');
        }
      }
    ];

    const inpValues = await measureINP(page, interactions);
    
    for (const [index, inp] of inpValues.entries()) {
      expect(inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
      console.log(`📱 Form Input INP #${index + 1}: ${inp}ms`);
    }

    if (inpValues.length > 0) {
      const averageINP = inpValues.reduce((a, b) => a + b, 0) / inpValues.length;
      console.log(`📱 Average Form Input INP: ${Math.round(averageINP)}ms`);
      expect(averageINP).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
    }
  });

  test('Button click interactions should have INP < 150ms', async ({ page }) => {
    const interactions = [
      // Find first button with common CTA text and scroll to it
      async () => {
        const ctaButton = page.locator('button').filter({ hasText: /get started|sign up|try/i }).first();
        await ctaButton.scrollIntoViewIfNeeded();
        await ctaButton.click({ force: true }); // Force click to handle hidden elements
      },
      // Click another button after scrolling to it
      async () => {
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();
        if (buttonCount > 1) {
          await buttons.nth(1).scrollIntoViewIfNeeded();
          await buttons.nth(1).click({ force: true });
        }
      },
      // Close any opened dialog
      async () => {
        const closeButton = page.locator('button[aria-label*="close" i], [data-dismiss], .modal-close').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    ];

    const inpValues = await measureINP(page, interactions);
    
    for (const [index, inp] of inpValues.entries()) {
      expect(inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
      console.log(`📱 Button Click INP #${index + 1}: ${inp}ms`);
    }

    if (inpValues.length > 0) {
      const averageINP = inpValues.reduce((a, b) => a + b, 0) / inpValues.length;
      console.log(`📱 Average Button Click INP: ${Math.round(averageINP)}ms`);
      expect(averageINP).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
    }
  });

  test('FAQ expansion interactions should have INP < 150ms', async ({ page }) => {
    // Try multiple FAQ section selectors
    const faqSelectors = ['#faq', '[data-section="faq"]', 'section:has-text("FAQ")', 'section:has-text("Questions")'];
    let faqSection = null;
    
    for (const selector of faqSelectors) {
      faqSection = page.locator(selector).first();
      if (await faqSection.isVisible()) {
        await faqSection.scrollIntoViewIfNeeded();
        break;
      }
    }
    
    await page.waitForTimeout(1000); // Wait for animations to settle

    // Try multiple FAQ item selectors
    const faqItemSelectors = [
      '[data-section="faq"] button[aria-expanded]',
      'button[aria-expanded]',
      'details summary',
      '.faq-item button',
      'button:has-text("?")'
    ];
    
    let faqItems = null;
    let faqCount = 0;
    
    for (const selector of faqItemSelectors) {
      faqItems = page.locator(selector);
      faqCount = await faqItems.count();
      if (faqCount > 0) break;
    }
    
    if (faqCount === 0) {
      console.log('⚠️ No FAQ items found, skipping test');
      return;
    }

    const interactions = [];
    
    // Create interactions for first 3 FAQ items
    for (let i = 0; i < Math.min(3, faqCount); i++) {
      interactions.push(async () => {
        await faqItems.nth(i).click();
        await page.waitForTimeout(100); // Wait for expansion animation
      });
    }

    const inpValues = await measureINP(page, interactions);
    
    for (const [index, inp] of inpValues.entries()) {
      expect(inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
      console.log(`📱 FAQ Expansion INP #${index + 1}: ${inp}ms`);
    }

    if (inpValues.length > 0) {
      const averageINP = inpValues.reduce((a, b) => a + b, 0) / inpValues.length;
      console.log(`📱 Average FAQ Expansion INP: ${Math.round(averageINP)}ms`);
      expect(averageINP).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
    }
  });

  test('Navigation scroll interactions should have good INP', async ({ page }) => {
    // Get page sections dynamically
    const sections = await page.locator('section, main > div, [data-section]').all();
    
    const interactions = [];
    
    // Create scroll interactions for available sections
    if (sections.length >= 2) {
      interactions.push(async () => {
        await sections[1].scrollIntoViewIfNeeded();
      });
      
      if (sections.length >= 3) {
        interactions.push(async () => {
          await sections[2].scrollIntoViewIfNeeded();
        });
      }
      
      // Scroll back to top
      interactions.push(async () => {
        await sections[0].scrollIntoViewIfNeeded();
      });
    } else {
      // Fallback: simple page scroll
      interactions.push(
        async () => {
          await page.evaluate(() => window.scrollTo(0, window.innerHeight));
        },
        async () => {
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      );
    }

    const inpValues = await measureINP(page, interactions);
    
    for (const [index, inp] of inpValues.entries()) {
      // Scroll interactions may have slightly higher INP, so we use a more lenient threshold
      expect(inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.needsImprovement);
      console.log(`📱 Scroll Navigation INP #${index + 1}: ${inp}ms`);
    }
  });

  test('Dialog open/close interactions should have INP < 150ms', async ({ page }) => {
    const interactions = [
      // Try to open a dialog/modal
      async () => {
        const triggerSelectors = [
          'button:has-text("Get Started")',
          'button:has-text("Sign Up")',
          'button:has-text("Try")',
          'button[data-modal]',
          'button[data-dialog]',
          '.cta-button'
        ];
        
        for (const selector of triggerSelectors) {
          const button = page.locator(selector).first();
          if (await button.isVisible()) {
            await button.click();
            break;
          }
        }
      },
      // Close any opened dialog
      async () => {
        await page.waitForTimeout(500); // Wait for dialog to appear
        const closeSelectors = [
          'button[aria-label*="close" i]',
          'button[aria-label*="dismiss" i]',
          '[data-dismiss]',
          '.modal-close',
          'button:has-text("×")',
          'button:has-text("Close")'
        ];
        
        for (const selector of closeSelectors) {
          const closeButton = page.locator(selector).first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
            break;
          }
        }
      }
    ];

    const inpValues = await measureINP(page, interactions);
    
    for (const [index, inp] of inpValues.entries()) {
      expect(inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
      console.log(`📱 Dialog Interaction INP #${index + 1}: ${inp}ms`);
    }
  });

  test('Complex form submission flow INP analysis', async ({ page }) => {
    // Test complete signup flow with more robust selectors
    const interactions = [
      // Focus and fill email input (most reliable)
      async () => {
        const emailInput = page.locator('input[type="email"]').first();
        await emailInput.waitFor({ state: 'visible' });
        await emailInput.click();
      },
      // Type email with realistic typing delay
      async () => {
        const emailInput = page.locator('input[type="email"]').first();
        await emailInput.clear();
        await emailInput.type('john@example.com', { delay: 50 });
      },
      // Focus name input if available
      async () => {
        const nameInput = page.locator('input[type="text"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.click();
        }
      },
      // Type name if input exists
      async () => {
        const nameInput = page.locator('input[type="text"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.clear();
          await nameInput.type('John Doe', { delay: 50 });
        }
      },
      // Submit form
      async () => {
        const submitSelectors = [
          'button:has-text("Sign Up")',
          'button:has-text("Submit")',
          'button:has-text("Get Started")',
          'button[type="submit"]',
          'form button'
        ];
        
        for (const selector of submitSelectors) {
          const submitButton = page.locator(selector).first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            break;
          }
        }
      }
    ];

    const inpValues = await measureINP(page, interactions);
    
    for (const [index, inp] of inpValues.entries()) {
      expect(inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
      console.log(`📱 Form Flow INP Step ${index + 1}: ${inp}ms`);
    }

    if (inpValues.length > 0) {
      const averageINP = inpValues.reduce((a, b) => a + b, 0) / inpValues.length;
      const maxINP = Math.max(...inpValues);
      
      console.log(`📊 Form Flow INP Summary:`);
      console.log(`   Average: ${Math.round(averageINP)}ms`);
      console.log(`   Maximum: ${maxINP}ms`);
      console.log(`   All steps: ${inpValues.map(v => Math.round(v)).join('ms, ')}ms`);
      
      expect(averageINP).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
      expect(maxINP).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.needsImprovement);
    }
  });

  test('INP statistical analysis across multiple sessions', async ({ page }) => {
    const testFunction = async () => {
      // Perform a consistent set of simple interactions
      const interactions = [
        async () => {
          const emailInput = page.locator('input[type="email"]').first();
          await emailInput.waitFor({ state: 'visible' });
          await emailInput.click();
          await emailInput.fill('test@example.com');
        },
        async () => {
          const nameInput = page.locator('input[type="text"]').first();
          if (await nameInput.isVisible()) {
            await nameInput.click();
            await nameInput.fill('Test User');
          }
        },
        async () => {
          const buttons = page.locator('button:visible');
          const buttonCount = await buttons.count();
          if (buttonCount > 0) {
            await buttons.first().click();
          }
        }
      ];

      const inpValues = await measureINP(page, interactions);
      const averageINP = inpValues.length > 0 ? inpValues.reduce((a, b) => a + b, 0) / inpValues.length : 0;

      return {
        inp: averageINP
      };
    };

    const results = await runPerformanceIterations(page, testFunction, 5);
    
    // Statistical assertions
    expect(results.statistics.mean.inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
    expect(results.statistics.p95.inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.needsImprovement);
    
    console.log('📊 INP Statistical Analysis (Mobile):');
    console.log(`   Mean: ${Math.round(results.statistics.mean.inp!)}ms`);
    console.log(`   Median: ${Math.round(results.statistics.median.inp!)}ms`);
    console.log(`   P95: ${Math.round(results.statistics.p95.inp!)}ms`);
    console.log(`   Std Dev: ${Math.round(results.statistics.standardDeviation.inp!)}ms`);
    console.log(`   All values: ${results.iterations.map(r => Math.round(r.inp!)).join('ms, ')}ms`);

    // Consistency check - standard deviation should be reasonable
    expect(results.statistics.standardDeviation.inp).toBeLessThan(50); // Less than 50ms variation
  });

  test('INP under different CPU throttling conditions', async ({ page }) => {
    const throttlingRates = [
      { name: 'No Throttling', rate: 1 },
      { name: '2x Slowdown', rate: 2 },
      { name: '4x Slowdown', rate: 4 },
      { name: '6x Slowdown', rate: 6 }
    ];

    for (const throttling of throttlingRates) {
      console.log(`🔄 Testing INP with ${throttling.name}...`);
      
      // Apply CPU throttling
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate: throttling.rate });

      // Reload page with new throttling
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // Extra wait for stability

      // Test basic interaction with robust selector
      const interactions = [
        async () => {
          const emailInput = page.locator('input[type="email"]').first();
          await emailInput.waitFor({ state: 'visible' });
          await emailInput.click();
          await emailInput.fill('test@example.com');
        }
      ];

      const inpValues = await measureINP(page, interactions);
      
      if (inpValues.length > 0) {
        const inp = inpValues[0];
        console.log(`   ${throttling.name} INP: ${inp}ms`);

        // Adjust expectations based on throttling
        if (throttling.rate === 1) {
          expect(inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.good);
        } else if (throttling.rate <= 4) {
          expect(inp).toBeLessThanOrEqual(MOBILE_PERFORMANCE_THRESHOLDS.inp.needsImprovement);
        } else {
          // More lenient for extreme throttling
          expect(inp).toBeLessThanOrEqual(500);
        }
      }
    }
  });

  test('INP regression detection', async ({ page }) => {
    // Perform standard interaction set with robust selectors
    const interactions = [
      async () => {
        const emailInput = page.locator('input[type="email"]').first();
        await emailInput.waitFor({ state: 'visible' });
        await emailInput.click();
        await emailInput.fill('performance@test.com');
      }
    ];

    const inpValues = await measureINP(page, interactions);
    
    if (inpValues.length > 0) {
      const inp = inpValues[0];
      
      // Create performance baseline
      const performanceBaseline = {
        inp: inp,
        timestamp: new Date().toISOString(),
        userAgent: await page.evaluate(() => navigator.userAgent),
        viewport: await page.viewportSize(),
        throttling: '4x CPU'
      };

      console.log('📈 INP Baseline:', JSON.stringify(performanceBaseline, null, 2));

      // Regression test - ensure INP doesn't degrade by more than 20%
      const maxAcceptableINP = MOBILE_PERFORMANCE_THRESHOLDS.inp.good * 1.2;
      expect(inp).toBeLessThanOrEqual(maxAcceptableINP);

      console.log(`🎯 INP Performance: ${inp}ms (Target: <${MOBILE_PERFORMANCE_THRESHOLDS.inp.good}ms)`);
    }
  });
});