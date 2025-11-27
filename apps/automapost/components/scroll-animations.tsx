'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollAnimationProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  delay?: number
}

export function ScrollAnimation({ 
  children, 
  className = '', 
  threshold = 0.1,
  delay = 0 
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(true) // Start visible by default
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-100 translate-y-0' // Always visible now
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function FadeInUp({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`transition-all duration-700 opacity-100 translate-y-0 ${className}`}>
      {children}
    </div>
  )
}

export function ScaleIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`transition-all duration-500 opacity-100 scale-100 ${className}`}>
      {children}
    </div>
  )
}

export function RotateInOnScroll({ 
  children, 
  className = '', 
  threshold = 0.3,
  initialRotation = 3,
  finalRotation = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  threshold?: number;
  initialRotation?: number;
  finalRotation?: number;
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), 100)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        transform: `rotate(${isVisible ? finalRotation : initialRotation}deg)`,
        opacity: 1
      }}
    >
      {children}
    </div>
  )
} 