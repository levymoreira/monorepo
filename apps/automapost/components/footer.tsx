'use client'

// Footer component for site-wide reuse

import Link from 'next/link'

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export default function Footer() {
  // Helper function to handle analytics safely
  const trackEvent = (eventName: string, category: string, label: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: category,
        event_label: label,
        value: 1
      })
    }
  }
  return (
    <footer className="py-16 text-white bg-[#213130]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: Brand + Link groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center">
              <Link 
                href="/" 
                aria-label="AutomaPost home" 
                className="inline-flex items-center"
                onClick={() => trackEvent('link_click', 'Footer', 'Home Logo')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="160" height="36" viewBox="0 0 160 36" className="h-9">
                  <style>
                    {`text { font-family: 'Figtree', sans-serif; font-weight: 700; }`}
                  </style>
                  <g transform="translate(0, -2) scale(0.4)">
                    <g>
                      <path d="M70,57c-4.8,0-8.9,3.4-9.8,8H47c-0.6,0-1,0.5-1,1.1c0,0.3,0,0.6,0,0.9c0,1-0.1,1.9-0.3,2.8 c-0.1,0.6,0.4,1.2,1,1.2h14.1c1.5,3.5,5.1,6,9.2,6c5.5,0,10-4.5,10-10C80,61.5,75.5,57,70,57z" fill="white"/>
                    </g>
                    <g>
                      <path d="M43.3,45.5c-1.2-0.5-2.3-1.2-3.3-2c-0.5-0.4-1.2-0.2-1.5,0.3l-7.1,13.3C31,57,30.5,57,30,57 c-5.5,0-10,4.5-10,10c0,5.5,4.5,10,10,10c5.5,0,10-4.5,10-10c0-2.9-1.2-5.4-3.1-7.3l6.9-12.8C44,46.4,43.8,45.8,43.3,45.5z" fill="white"/>
                    </g>
                    <g>
                      <path d="M50,41c1,0,1.9-0.1,2.8-0.4l6.9,12.7c0.3,0.5,0.9,0.7,1.4,0.4c1.1-0.7,2.2-1.3,3.4-1.7 c0.6-0.2,0.8-0.9,0.5-1.4l-7.2-13.4c1.3-1.7,2.2-3.9,2.2-6.2c0-5.5-4.5-10-10-10s-10,4.5-10,10C40,36.5,44.5,41,50,41z" fill="white"/>
                    </g>
                  </g>
                  <text x="40" y="24" fontSize="20" fill="white">AutomaPost</text>
                </svg>
              </Link>
            </div>
            <p className="text-white/80 max-w-2xl leading-relaxed">
              The AI-powered LinkedIn automation tool that helps professionals grow their network effortlessly.
            </p>
          </div>

          {/* Right-side link columns wrapper (aligned to container right on lg+) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-24 lg:col-span-2 lg:ml-auto">
            {/* Product */}
            <nav aria-label="Product">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white/90 mb-4">Product</h3>
              <ul className="space-y-2 text-white/80">
                <li><Link 
                  href="/#features" 
                  className="hover:text-white transition-colors"
                  onClick={() => trackEvent('link_click', 'Footer', 'Features')}
                >Features</Link></li>
                <li><Link 
                  href="/#pricing" 
                  className="hover:text-white transition-colors"
                  onClick={() => trackEvent('link_click', 'Footer', 'Pricing')}
                >Pricing</Link></li>
                <li><Link 
                  href="/#faq" 
                  className="hover:text-white transition-colors"
                  onClick={() => trackEvent('link_click', 'Footer', 'FAQ')}
                >FAQ</Link></li>
                <li><Link 
                  href="/#reviews" 
                  className="hover:text-white transition-colors"
                  onClick={() => trackEvent('link_click', 'Footer', 'Reviews')}
                >Reviews</Link></li>
              </ul>
            </nav>

            {/* Company */}
            <nav aria-label="Company" className="sm:justify-self-end">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white/90 mb-4">Company</h3>
              <ul className="space-y-2 text-white/80">
                <li><Link 
                  href="/about" 
                  className="hover:text-white transition-colors"
                  onClick={() => trackEvent('link_click', 'Footer', 'About')}
                >About</Link></li>
                <li><Link 
                  href="/careers" 
                  className="hover:text-white transition-colors"
                  onClick={() => trackEvent('link_click', 'Footer', 'Careers')}
                >Careers</Link></li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom: Legal + Copyright */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80">
              <li><Link 
                href="/privacy" 
                className="hover:text-white transition-colors"
                onClick={() => trackEvent('link_click', 'Footer', 'Privacy Policy')}
              >Privacy Policy</Link></li>
              <li><Link 
                href="/terms" 
                className="hover:text-white transition-colors"
                onClick={() => trackEvent('link_click', 'Footer', 'Terms of Service')}
              >Terms of Service</Link></li>
              <li><Link 
                href="/cookies" 
                className="hover:text-white transition-colors"
                onClick={() => trackEvent('link_click', 'Footer', 'Cookie Policy')}
              >Cookie Policy</Link></li>
            </ul>
            <p className="text-white/60 text-sm">© 2025 Automapost.com. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}


