'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HeroSectionProps {
  currentIndustry: string
}

const industryHeadlines = {
  healthcare: "Save $43,702 Daily with HIPAA-Compliant AI",
  legal: "Convert 35% More Leads Starting Tonight", 
  ecommerce: "Recover $32,000 Monthly from Abandoned Carts",
  default: "Automate Customer Communication with AI"
}

export function HeroSection({ currentIndustry }: HeroSectionProps) {
  const [currentHeadline, setCurrentHeadline] = useState('')
  const [isRotating, setIsRotating] = useState(false)

  useEffect(() => {
    // Set initial headline based on detected industry
    const initialHeadline = industryHeadlines[currentIndustry as keyof typeof industryHeadlines] || industryHeadlines.default
    setCurrentHeadline(initialHeadline)

    // Start headline rotation
    const headlines = Object.values(industryHeadlines)
    let currentIndex = 0

    const rotationInterval = setInterval(() => {
      setIsRotating(true)
      
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % headlines.length
        setCurrentHeadline(headlines[currentIndex])
        setIsRotating(false)

        // Track headline rotation
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'headline_rotation', {
            event_category: 'engagement',
            headline: headlines[currentIndex]
          })
        }
      }, 250)
    }, 3000)

    return () => clearInterval(rotationInterval)
  }, [currentIndustry])

  const handleDemoClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'hero_demo_click', {
        event_category: 'conversion_tracking',
        industry: currentIndustry
      })
    }
  }

  const handleCalculatorClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'hero_calculator_click', {
        event_category: 'conversion_tracking', 
        industry: currentIndustry
      })
    }
  }

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="text-center lg:text-left">
            {/* Rotating Headlines */}
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight transition-opacity duration-250 ${isRotating ? 'opacity-50' : 'opacity-100'}`}>
              {currentHeadline}
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 max-w-2xl">
              Join 9,500+ SMBs already automating customer communication
            </p>
            
            {/* Dual CTA Strategy */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/demo"
                onClick={handleDemoClick}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                data-gtm="hero_demo_click"
              >
                Interactive Demo
              </Link>
              
              <Link 
                href="/calculators"
                onClick={handleCalculatorClick}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                data-gtm="hero_calculator_click"
              >
                Calculate My Savings
              </Link>
            </div>
            
            {/* Trust Strip */}
            <div className="mt-12 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                <span>SOC2 Certified</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                <span>HIPAA Compliant</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                <span>99.9% Uptime</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                <span>No Card Required</span>
              </div>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
              <video 
                className="w-full h-auto"
                autoPlay 
                muted 
                loop 
                playsInline
                data-gtm="hero_video_play"
                onPlay={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'video_play', {
                      event_category: 'engagement',
                      video_type: 'hero',
                      industry: currentIndustry
                    })
                  }
                }}
              >
                <source src="/hero-demo.mp4" type="video/mp4" />
                <source src="/hero-demo.webm" type="video/webm" />
                {/* Fallback for browsers that don't support video */}
                <div className="w-full h-64 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-4">🤖</div>
                    <div className="text-lg font-semibold">AI Chatbot Demo</div>
                    <div className="text-sm opacity-90">Interactive customer communication</div>
                  </div>
                </div>
              </video>
              
              {/* Play button overlay (if needed) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Floating elements for visual interest */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
          </div>
          
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full opacity-40 animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-blue-400 rounded-full opacity-30 animate-ping delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-green-400 rounded-full opacity-50 animate-ping delay-1000"></div>
      </div>
    </section>
  )
}