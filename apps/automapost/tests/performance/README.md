# Performance Testing Suite

This directory contains comprehensive performance testing tools for measuring and validating Core Web Vitals (LCP, INP, CLS, FCP, TTFB) on mobile devices.

## Overview

The performance testing suite includes:
- **Playwright Tests**: Real browser testing with mobile emulation
- **Lighthouse CI**: Automated performance audits
- **Real User Monitoring (RUM)**: Production performance tracking
- **Regression Testing**: Automated baseline comparison and alerts

## Quick Start

```bash
# Run all performance tests
yarn test:performance

# Run specific tests
yarn test:performance:lcp    # LCP tests only
yarn test:performance:inp    # INP tests only

# Run Lighthouse CI
yarn lighthouse:mobile       # Mobile-optimized audit
yarn lighthouse:all         # All locales

# Generate performance report
yarn performance:report      # Playwright + Lighthouse
```

## Test Files

### Core Test Files
- `lcp-mobile.spec.ts` - LCP (Largest Contentful Paint) tests for mobile
- `inp-mobile.spec.ts` - INP (Interaction to Next Paint) tests for mobile  
- `regression.spec.ts` - Performance regression detection and baseline management

### Utilities
- `utils/web-vitals-utils.ts` - Core Web Vitals measurement utilities
- `../performance/rum.ts` - Real User Monitoring implementation

## Performance Thresholds

### Mobile Thresholds (Stricter)
- **LCP**: ≤ 1.8s (good), ≤ 2.5s (needs improvement)
- **INP**: ≤ 150ms (good), ≤ 200ms (needs improvement)
- **FCP**: ≤ 1.5s (good), ≤ 2.0s (needs improvement)
- **CLS**: ≤ 0.1 (good), ≤ 0.25 (needs improvement)
- **TTFB**: ≤ 600ms (good), ≤ 800ms (needs improvement)

### Desktop Thresholds
- **LCP**: ≤ 2.5s (good), ≤ 4.0s (needs improvement)
- **INP**: ≤ 200ms (good), ≤ 500ms (needs improvement)

## Test Coverage

### LCP Tests (`lcp-mobile.spec.ts`)
- ✅ Basic LCP measurement across locales (en, es, pt)
- ✅ Statistical analysis with multiple iterations
- ✅ LCP element identification and optimization validation
- ✅ Testing under different network conditions (3G, Slow 3G, 4G)
- ✅ Performance regression prevention
- ✅ Image optimization verification

### INP Tests (`inp-mobile.spec.ts`)
- ✅ Form input interaction testing
- ✅ Button click response times
- ✅ FAQ expansion interactions
- ✅ Navigation scroll performance
- ✅ Dialog open/close interactions
- ✅ Complex form submission flows
- ✅ Statistical analysis across sessions
- ✅ Testing under CPU throttling conditions

### Regression Tests (`regression.spec.ts`)
- ✅ Automated baseline management
- ✅ Performance regression detection (15% threshold)
- ✅ Performance consistency validation
- ✅ Session performance degradation testing
- ✅ Cross-locale performance comparison

## Network Conditions

Tests simulate realistic mobile conditions:
- **3G Network**: 1.5 Mbps down, 750 Kbps up, 40ms latency
- **Slow 3G**: 500 Kbps down/up, 400ms latency
- **4G Network**: 4 Mbps down, 3 Mbps up, 20ms latency

## CPU Throttling
- **Mobile**: 4x CPU slowdown (default)
- **Testing**: 1x, 2x, 4x, 6x slowdown scenarios

## Real User Monitoring

### Setup
Add `RUMProvider` to your app layout:

```tsx
import RUMProvider from '@/components/performance/rum-provider'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <RUMProvider />
    </>
  )
}
```

### Features
- ✅ Automatic Core Web Vitals collection
- ✅ Device and connection information
- ✅ Custom metric tracking
- ✅ Performance analytics endpoint
- ✅ Google Analytics integration
- ✅ Error tracking and alerts

### API Endpoint
Performance metrics are sent to `/api/analytics/performance` with:
- Session ID and timestamp
- All Core Web Vitals metrics
- Device information (mobile detection, memory, CPU cores)
- Connection information (type, speed, latency)
- User agent and viewport data

## Lighthouse CI

### Configuration Files
- `.lighthouserc.json` - Standard configuration for all locales
- `.lighthouserc.mobile.json` - Mobile-optimized configuration

### Assertions
- Performance score ≥ 85%
- LCP ≤ 1.8s
- Interactive ≤ 2.5s
- FCP ≤ 1.2s
- TBT ≤ 150ms
- CLS ≤ 0.1

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Performance Tests
  run: |
    yarn install
    yarn performance:ci
    
- name: Upload Performance Results
  uses: actions/upload-artifact@v3
  with:
    name: performance-results
    path: test-results/
```

### Performance Budgets
Tests will fail if:
- LCP > 1.8s on mobile
- INP > 150ms on mobile
- Performance score < 85%
- Regression > 15% from baseline

## Regression Testing

### Baseline Management
- Baselines stored in `test-results/performance-baseline.json`
- Automatic baseline updates on significant improvements (>5%)
- Git commit and branch tracking
- 15% regression threshold (configurable)

### Regression Detection
- Mean and P95 metric comparison
- Performance score tracking
- Statistical significance testing
- Automatic alerts on regressions

## Debugging

### Debug Mode
```bash
# Run tests with browser visible
yarn test:performance:headed

# Run with debugger
yarn test:performance:debug

# Get performance debug info
yarn dev
# Open browser console and run:
window.debugPerformance()
```

### Common Issues
1. **Inconsistent results**: Increase test iterations or check for background processes
2. **High variability**: Ensure stable network conditions and disable browser extensions
3. **Baseline mismatches**: Check if tests are running with consistent environment settings

## Monitoring Dashboard

### Metrics Collection
All performance data includes:
- Timestamp and session ID
- URL and user agent
- Device capabilities
- Network conditions
- Git commit information

### Alerts
Automatic alerts for:
- LCP > 2.5s
- INP > 200ms
- Performance score < 70%
- Regression > 20%

## Best Practices

### Writing Performance Tests
1. **Use consistent conditions**: Always apply the same network and CPU throttling
2. **Multiple iterations**: Run tests multiple times for statistical significance
3. **Wait for stability**: Allow metrics to stabilize before measuring
4. **Environment isolation**: Control for external factors

### Interpreting Results
1. **Focus on P95**: 95th percentile metrics represent worst-case user experience
2. **Statistical significance**: Look at mean, median, and standard deviation
3. **Real-world conditions**: Mobile with 3G network is most representative
4. **Regression thresholds**: 10-15% regression is typically significant

### Optimization Validation
1. **Before/after comparison**: Measure impact of each optimization
2. **Multiple metrics**: Don't optimize one metric at the expense of others  
3. **Real user data**: Validate lab results with RUM data
4. **Cross-device testing**: Test on different devices and browsers

## Contributing

When adding new performance tests:
1. Follow existing naming conventions
2. Include statistical analysis for consistency
3. Add appropriate assertions and thresholds
4. Update this README with new test coverage
5. Ensure tests work in CI environment