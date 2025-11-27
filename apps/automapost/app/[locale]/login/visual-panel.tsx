'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

export default function VisualPanel() {
  const [linkedinAnimation, setLinkedinAnimation] = useState<any>(null)

  useEffect(() => {
    // Load LinkedIn animation
    fetch('/linkedin-animation.json')
      .then(response => response.json())
      .then(data => setLinkedinAnimation(data))
      .catch(error => console.error('Error loading LinkedIn animation:', error))
  }, [])
  
  return (
    <div className="hidden lg:block relative w-full lg:w-[70%] h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-gray-50 to-gray-100">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-2xl text-center space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 border border-blue-100">
              <div className="w-2 h-2 bg-[#0078D4] rounded-full mr-2 animate-pulse"></div>
              Welcome Back
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Sign In to Your 
              <span className="block bg-gradient-to-r from-[#0078D4] to-cyan-600 bg-clip-text text-transparent mt-2">
                Professional Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-xl mx-auto">
              Access your AI-powered content creation tools and manage your LinkedIn presence with one click.
            </p>
          </div>

          {/* LinkedIn Animation */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm">
              {linkedinAnimation ? (
                <Lottie 
                  animationData={linkedinAnimation} 
                  loop={true}
                  className="w-full h-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-[#0078D4] rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
