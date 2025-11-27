'use client'

import { useEffect, useState, useRef } from 'react'
import { TrendingUp, Users, Clock, Star } from 'lucide-react'

interface StatProps {
  icon: React.ReactNode
  value: string
  label: string
  delay: number
  isInView: boolean
}

function Stat({ icon, value, label, delay, isInView }: StatProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!isInView || hasAnimated) return

    const timer = setTimeout(() => {
      setHasAnimated(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [isInView, delay, hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const target = parseFloat(value.replace(/,/g, ''))
    const increment = target / 50
    let current = 0
    
    // Calculate number of decimal places in the target value
    const decimalPlaces = value.includes('.') ? value.split('.')[1].length : 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      // Round to the same number of decimal places as the input
      setCount(Number(current.toFixed(decimalPlaces)))
    }, 20)

    return () => clearInterval(timer)
  }, [hasAnimated, value])

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-white">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-neutral-dark mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-neutral-gray">{label}</div>
    </div>
  )
}

export default function Stats() {
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "500",
      label: "Active Users",
      delay: 0
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      value: "3200",
      label: "Articles Published",
      delay: 200
    },
    {
      icon: <Clock className="w-6 h-6" />,
      value: "10",
      label: "Hours Saved/Week",
      delay: 400
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: "4.8",
      label: "User Rating",
      delay: 600
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          // Once animation starts, disconnect observer so it only happens once
          observer.disconnect()
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} data-section="trusted_stats" className="py-16 bg-neutral-light">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark mb-4">
            Trusted by Professionals Worldwide
          </h2>
          <p className="text-lg text-neutral-gray">
            Join hundreds of professionals who've transformed their SEO strategy
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Stat key={index} {...stat} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  )
} 