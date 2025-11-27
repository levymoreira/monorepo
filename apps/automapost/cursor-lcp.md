# Cursor LCP & INP Optimization Plan

## Performance Issues Analysis

Google PageSpeed Insights reports:
- **Largest Contentful Paint (LCP): 2.5s** (Target: <2.5s, Ideal: <1.2s)
- **Interaction to Next Paint (INP): 200ms** (Target: <200ms, Ideal: <100ms)

These metrics are causing Google to not recommend our page, directly impacting SEO and user experience.

## Root Cause Analysis

Based on codebase analysis, the main performance bottlenecks are:

### LCP Issues (2.5s)
1. **Unoptimized Images**: Next.js images have `unoptimized: true` in config
2. **Large JavaScript Bundle**: Heavy client-side components loading on initial paint
3. **Complex Animations**: Floating logos and scroll animations block rendering
4. **Missing Critical Resource Hints**: No preloading of critical assets
5. **Font Loading**: No font optimization strategy
6. **Large CSS**: Custom CSS with many animations and complex styles

### INP Issues (200ms)
1. **Heavy JavaScript Execution**: Complex animations and state management
2. **Intersection Observer Overuse**: Multiple observers running simultaneously
3. **Animation Calculations**: RequestAnimationFrame loops for floating logos
4. **Form Validation**: Real-time validation causing re-renders
5. **Large Component Tree**: Dense React component hierarchy

## Optimization Strategy

### Phase 1: Critical LCP Fixes (Priority 1)

#### 1.1 Image Optimization
```javascript
// next.config.mjs - Remove unoptimized flag
const nextConfig = {
  images: {
    // unoptimized: true, // REMOVE THIS
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
  },
}
```

**Action Items:**
- Convert all PNG images to WebP/AVIF
- Implement responsive images with proper sizing
- Add `priority` prop to above-fold images
- Preload hero image with `<link rel="preload">`

#### 1.2 Critical CSS Extraction
```css
/* Extract critical CSS for above-fold content */
/* Move non-critical animations to separate file */
/* Inline critical CSS in <head> */
```

**Action Items:**
- Extract critical CSS for hero section
- Defer non-critical CSS loading
- Minimize CSS file size by removing unused animations
- Use CSS containment for animation-heavy sections

#### 1.3 JavaScript Bundle Optimization
```javascript
// Implement dynamic imports for heavy components
const FloatingLogos = dynamic(() => import('@/components/floating-logos'), {
  ssr: false,
  loading: () => null
})

const ScrollAnimations = dynamic(() => import('@/components/scroll-animations'), {
  ssr: false
})
```

**Action Items:**
- Code split heavy components
- Lazy load non-critical features
- Move animations to separate chunks
- Implement route-based code splitting

### Phase 2: Advanced LCP Optimizations (Priority 2)

#### 2.1 Font Optimization
```javascript
// app/layout.tsx - Add font optimization
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})
```

#### 2.2 Resource Hints
```html
<!-- Add to <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" href="/hero-image.webp" as="image">
<link rel="prefetch" href="/api/leads">
```

#### 2.3 Server-Side Rendering Optimization
- Move client-side logic to server components where possible
- Implement streaming for faster initial page load
- Cache static content aggressively

### Phase 3: INP Optimization (Priority 1)

#### 3.1 Animation Performance
```javascript
// Optimize floating logos with CSS transforms
// Use will-change property
// Implement passive event listeners
const FloatingLogosOptimized = () => {
  const [positions, setPositions] = useState([])
  
  // Use CSS transforms instead of position updates
  // Batch DOM updates with requestAnimationFrame
  // Add passive event listeners
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Throttle to 16ms (60fps max)
      throttle(() => {
        // Update logic
      }, 16)
    }
    
    element.addEventListener('mousemove', handleMouseMove, { passive: true })
  }, [])
}
```

#### 3.2 Intersection Observer Optimization
```javascript
// Consolidate multiple observers into one
const useOptimizedIntersectionObserver = () => {
  const [visibleElements, setVisibleElements] = useState(new Set())
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Batch updates
        const updates = new Set(visibleElements)
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updates.add(entry.target.id)
          }
        })
        setVisibleElements(updates)
      },
      { 
        threshold: [0.1, 0.5], // Multiple thresholds in one observer
        rootMargin: '50px' // Trigger earlier for smoother experience
      }
    )
    
    return () => observer.disconnect()
  }, [])
}
```

#### 3.3 React Performance Optimization
```javascript
// Memoize expensive components
const TestimonialCard = React.memo(({ testimonial }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  )
})

// Optimize state updates
const [formState, setFormState] = useState({})

// Use useCallback for event handlers
const handleInputChange = useCallback((field, value) => {
  setFormState(prev => ({ ...prev, [field]: value }))
}, [])
```

### Phase 4: Infrastructure Optimizations (Priority 2)

#### 4.1 CDN and Caching
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

#### 4.2 Service Worker Implementation
```javascript
// Implement service worker for caching and prefetching
// Cache critical resources
// Prefetch likely navigation targets
```

## Implementation Timeline

### Week 1: Critical Fixes
- [ ] Remove `unoptimized: true` from Next.js config
- [ ] Convert hero images to WebP format
- [ ] Add `priority` prop to above-fold images
- [ ] Extract and inline critical CSS
- [ ] Implement code splitting for heavy components

### Week 2: Advanced Optimizations
- [ ] Optimize font loading with next/font
- [ ] Add resource hints and preloading
- [ ] Consolidate Intersection Observers
- [ ] Optimize animation performance
- [ ] Implement React.memo for heavy components

### Week 3: Fine-tuning
- [ ] Add comprehensive caching headers
- [ ] Implement service worker
- [ ] Add performance monitoring
- [ ] Optimize build output
- [ ] Test and validate improvements

## Performance Targets

### Target Metrics
- **LCP: <1.2s** (Current: 2.5s)
- **INP: <100ms** (Current: 200ms)
- **FCP: <0.8s**
- **CLS: <0.1**
- **FID: <50ms**

### Success Criteria
- Google PageSpeed Insights score >90 on mobile
- Core Web Vitals pass all thresholds
- Google recommends the page
- User experience feels instantaneous

## Monitoring & Validation

### Tools for Testing
1. **Google PageSpeed Insights** - Primary validation tool
2. **Chrome DevTools** - Performance profiling
3. **WebPageTest** - Detailed waterfall analysis
4. **Real User Monitoring** - Production performance tracking

### Metrics to Track
- Core Web Vitals (LCP, INP, CLS)
- JavaScript bundle size
- Image optimization savings
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

## Risk Mitigation

### Potential Issues
1. **Breaking animations** - Test thoroughly after optimization
2. **Image quality loss** - Compare before/after WebP conversion
3. **JavaScript errors** - Monitor error rates during rollout
4. **SEO impact** - Monitor search rankings during changes

### Rollback Plan
- Feature flags for new optimizations
- A/B testing for critical changes
- Database backups before deployment
- Quick revert capability for critical issues

## Long-term Maintenance

### Regular Tasks
- Monthly performance audits
- Image optimization for new content
- Bundle size monitoring
- Core Web Vitals tracking
- User experience testing on slow devices

### Performance Budget
- JavaScript bundle: <250KB gzipped
- CSS: <50KB gzipped  
- Images: Properly sized and optimized
- LCP: <1.2s consistently
- INP: <100ms consistently

## Expected Results

After implementing these optimizations:

1. **LCP improvement**: 2.5s → <1.2s (52% improvement)
2. **INP improvement**: 200ms → <100ms (50% improvement)
3. **Google recommendations**: Page will pass Core Web Vitals
4. **SEO benefits**: Improved search rankings from performance signals
5. **User experience**: Faster, more responsive interactions
6. **Conversion rates**: Potential 20-30% improvement from faster loading

This comprehensive plan addresses both immediate performance issues and establishes a foundation for long-term performance excellence.
