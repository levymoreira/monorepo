'use client'

import Image from 'next/image'

export default function VisualPanel() {
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
              Get Started
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Create Your
              <span className="block bg-gradient-to-r from-[#0078D4] to-cyan-600 bg-clip-text text-transparent mt-2">
                Professional Account
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-xl mx-auto">
              Join thousands of professionals using AI to create engaging LinkedIn content effortlessly.
            </p>
          </div>

          {/* Product Animation */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm rounded-3xl shadow-2xl shadow-blue-100 overflow-hidden">
              <Image
                src="/annimation.gif"
                alt="AutomaPost onboarding preview"
                width={640}
                height={640}
                priority
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
