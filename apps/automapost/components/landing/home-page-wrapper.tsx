import HeroSection from '@/components/landing/hero-section'
import LazyLoadedSections from '@/components/landing/lazy-loaded-sections'

export default async function HomePageWrapper() {
  return (
    <main id="main-content">
      {/* Critical above-the-fold content - Server Component */}
      <HeroSection />
      
      {/* Below-the-fold content - Client Component with lazy loading */}
      <LazyLoadedSections />
    </main>
  )
}