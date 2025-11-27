# Performance Optimization Plan - LCP & INP Fixes

## Current Issues
- **LCP (Largest Contentful Paint)**: 2.5s (Target: <2.5s for good, <4s for needs improvement)
- **INP (Interaction to Next Paint)**: 200ms (Target: <200ms for good, <500ms for needs improvement)

## Root Cause Analysis

### LCP Issues (2.5s)
1. **Heavy JavaScript Bundle**: Multiple UI component libraries loaded upfront
2. **Unoptimized Hero Section**: Large hero section with complex animations
3. **Client-Side Rendering**: Heavy use of `'use client'` directive in main landing page
4. **No Image Optimization**: `images.unoptimized: true` in next.config.mjs
5. **Multiple Font Loading**: No font optimization strategy
6. **No Critical CSS**: All styles loaded synchronously

### INP Issues (200ms)
1. **Heavy Event Handlers**: Multiple gtag tracking events on interactions
2. **Complex State Management**: Multiple useState hooks in HomePage component
3. **Animation Overhead**: CSS animations triggered on scroll and hover
4. **Dialog Rendering**: Heavy modal component rendered conditionally

## Implementation Plan

### Phase 1: Quick Wins (1-2 days)

#### 1.1 Enable Next.js Image Optimization
```javascript
// next.config.mjs - Remove unoptimized flag
images: {
  domains: ['automapost.com'],
  deviceSizes: [640, 750, 828, 1080, 1200],
  imageSizes: [16, 32, 48, 64, 96],
}
```

#### 1.2 Implement Font Optimization
```javascript
// app/[locale]/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system'],
})
```

#### 1.3 Add Resource Hints
```html
<!-- In layout.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
```

### Phase 2: Component Optimization (2-3 days)

#### 2.1 Convert Hero to Server Component
- Split hero into server/client components
- Move static content to server component
- Keep only interactive elements as client components

```typescript
// components/landing/hero-section.tsx (Server Component)
export default function HeroSection() {
  // Static content only
}

// components/landing/hero-interactive.tsx (Client Component)
'use client'
export function HeroInteractive() {
  // Forms and interactive elements only
}
```

#### 2.2 Lazy Load Below-the-Fold Content
```typescript
import dynamic from 'next/dynamic'

const StatsSection = dynamic(() => import('@/components/stats'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
})

const TestimonialsSection = dynamic(
  () => import('@/components/landing/testimonials'),
  { ssr: false }
)
```

#### 2.3 Optimize Dialog/Modal Loading
```typescript
// Lazy load dialog component
const SignupDialog = dynamic(
  () => import('@/components/landing/signup-dialog'),
  { ssr: false }
)

// Use React.lazy for client-side only
const Dialog = lazy(() => import('@/components/ui/dialog'))
```

### Phase 3: JavaScript Optimization (2-3 days)

#### 3.1 Debounce Event Handlers
```typescript
import { useDebouncedCallback } from 'use-debounce'

const handleEmailChange = useDebouncedCallback((value: string) => {
  setSignupEmail(value)
  // Validation logic
}, 300)
```

#### 3.2 Optimize Animation Triggers
```typescript
// Use CSS containment and will-change
.card {
  contain: layout style paint;
  will-change: transform;
}

// Use Intersection Observer with rootMargin
const observer = new IntersectionObserver(callback, {
  rootMargin: '50px',
  threshold: 0.01
})
```

#### 3.3 Implement Virtual Scrolling for Long Lists
```typescript
import { Virtuoso } from 'react-virtuoso'

// For testimonials and other lists
<Virtuoso
  data={testimonials}
  itemContent={(index, testimonial) => <TestimonialCard {...testimonial} />}
/>
```

### Phase 4: Bundle Optimization (1-2 days)

#### 4.1 Code Splitting Strategy
```javascript
// next.config.mjs
experimental: {
  optimizeCss: true,
  optimizePackageImports: ['lucide-react', '@radix-ui/*'],
}

splitChunks: {
  chunks: 'all',
  cacheGroups: {
    default: false,
    vendors: false,
    framework: {
      name: 'framework',
      chunks: 'all',
      test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom)[\\/]/,
      priority: 40,
    },
    lib: {
      test: /[\\/]node_modules[\\/]/,
      name(module) {
        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([[\\/]|$)/)[1];
        return `npm.${packageName.replace('@', '')}`;
      },
      priority: 30,
      minChunks: 1,
      reuseExistingChunk: true,
    },
  },
}
```

#### 4.2 Remove Unused Dependencies
- Audit and remove unused Radix UI components
- Tree-shake lucide-react icons
- Use dynamic imports for heavy libraries

### Phase 5: Critical Rendering Path (2-3 days)

#### 5.1 Inline Critical CSS
```typescript
// lib/critical-css.ts
export async function getCriticalCSS() {
  // Extract above-the-fold CSS
  // Inline in <head>
}
```

#### 5.2 Implement Progressive Enhancement
```typescript
// components/landing/progressive-hero.tsx
export function ProgressiveHero() {
  return (
    <>
      {/* Minimal HTML/CSS version */}
      <noscript>
        <div className="hero-static">...</div>
      </noscript>
      
      {/* Enhanced version loads progressively */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroEnhanced />
      </Suspense>
    </>
  )
}
```

#### 5.3 Preload LCP Element
```typescript
// Identify and preload the LCP image
<link
  rel="preload"
  as="image"
  href="/hero-image.webp"
  type="image/webp"
/>
```

### Phase 6: Server-Side Optimizations (1-2 days)

#### 6.1 Implement Static Generation
```typescript
// app/[locale]/(landing)/page.tsx
export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale.code,
  }))
}

export const revalidate = 3600 // Revalidate every hour
```

#### 6.2 Add Caching Headers
```javascript
// next.config.mjs
headers: [
  {
    source: '/:locale',
    headers: [
      {
        key: 'Cache-Control',
        value: 's-maxage=3600, stale-while-revalidate',
      },
    ],
  },
  {
    source: '/api/public-data/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=3600',
      },
    ],
  },
]
```

### Phase 7: Mobile-Specific Optimizations (1-2 days)

#### 7.1 Adaptive Loading
```typescript
// hooks/use-network-quality.ts
export function useNetworkQuality() {
  const [quality, setQuality] = useState('4g')
  
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setQuality(connection.effectiveType)
    }
  }, [])
  
  return quality
}

// Load different assets based on network
const quality = useNetworkQuality()
const imageQuality = quality === '4g' ? 'high' : 'low'
```

#### 7.2 Touch Event Optimization
```typescript
// Passive event listeners for better scrolling
useEffect(() => {
  document.addEventListener('touchstart', handler, { passive: true })
  document.addEventListener('wheel', handler, { passive: true })
}, [])
```

#### 7.3 Reduce JavaScript for Mobile
```typescript
// Conditionally load features
const isMobile = useIsMobile()
if (!isMobile) {
  // Load desktop-only features
  import('@/components/desktop-features')
}
```

## Performance Budget

### Target Metrics
- **LCP**: <1.8s (mobile), <1.2s (desktop)
- **INP**: <150ms (mobile), <100ms (desktop)
- **FID**: <100ms
- **CLS**: <0.1
- **TTFB**: <600ms

### Bundle Size Targets
- Initial JS: <100KB (gzipped)
- Initial CSS: <20KB (gzipped)
- Total Page Weight: <500KB (mobile), <1MB (desktop)

## Monitoring & Testing

### Tools Setup
1. **Lighthouse CI**: Automated performance testing in CI/CD
2. **Web Vitals Monitoring**: Real user monitoring with analytics
3. **Bundle Analyzer**: Track bundle size changes

### Testing Checklist
- [ ] Test on real devices (not just Chrome DevTools)
- [ ] Test on 3G/slow connections
- [ ] Test with CPU throttling (4x slowdown)
- [ ] Test on low-end Android devices
- [ ] Verify improvements with Google PageSpeed Insights

## Implementation Priority

### Week 1
1. Enable image optimization
2. Implement font optimization
3. Add resource hints
4. Convert hero to server component
5. Lazy load below-the-fold content

### Week 2
1. Optimize dialog/modal loading
2. Debounce event handlers
3. Implement code splitting
4. Add critical CSS
5. Setup performance monitoring

## Success Metrics
- **LCP improvement**: From 2.5s to <1.8s (28% improvement)
- **INP improvement**: From 200ms to <150ms (25% improvement)
- **Google PageSpeed Score**: Target 90+ for mobile
- **Bounce Rate**: Reduce by 15-20%
- **Conversion Rate**: Increase by 10-15%

## Rollback Plan
- Keep current version in a separate branch
- A/B test performance changes
- Monitor real user metrics for regressions
- Have feature flags for each optimization

## Next Steps
1. Start with Phase 1 quick wins immediately
2. Set up performance monitoring
3. Create performance budget enforcement in CI
4. Schedule weekly performance reviews
5. Document improvements and learnings