'use client'

import { useState, cloneElement, ReactElement } from 'react'
import FloatingLogos from '@/components/floating-logos'
import HeroPost from './hero-post'

interface HeroFloatingWrapperProps {
  children: React.ReactNode
}

export default function HeroFloatingWrapper({ children }: HeroFloatingWrapperProps) {
  const [isPostHovered, setIsPostHovered] = useState(false)

  return (
    <div className="contents">
      {/* Floating logos span the full section width */}
      <div className="hidden lg:block absolute inset-0 z-10">
        <FloatingLogos isPostHovered={isPostHovered} />
      </div>
      
      <div className="container relative z-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {children}
          
          {/* Post card with hover state management */}
          <div 
            onMouseEnter={() => setIsPostHovered(true)}
            onMouseLeave={() => setIsPostHovered(false)}
          >
            <HeroPost />
          </div>
        </div>
      </div>
    </div>
  )
}