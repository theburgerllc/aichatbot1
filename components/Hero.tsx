'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface HeroProps {
  currentIndustry: string
  industryData: any
  onOpenDemo: () => void
  onOpenCalculator: () => void
  trackEvent: (event: string, properties?: Record<string, any>) => void
}

export function Hero({ 
  currentIndustry, 
  industryData, 
  onOpenDemo, 
  onOpenCalculator, 
  trackEvent 
}: HeroProps) {
  const [currentHeadline, setCurrentHeadline] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Rotating headlines effect
  useEffect(() => {
    if (currentIndustry === 'default') return

    const headlines = industryData[currentIndustry]?.headlines
    if (!headlines || headlines.length <= 1) return

    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentHeadline(prev => (prev + 1) % headlines.length)
        setIsVisible(true)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [currentIndustry, industryData])

  const getHeadlineText = () => {
    if (currentIndustry === 'default') {
      return "Automate Customer Communication with AI"
    }
    
    const headlines = industryData[currentIndustry]?.headlines
    return headlines?.[currentHeadline] || "Automate Customer Communication with AI"
  }

  const handleDemoClick = () => {
    trackEvent('hero_demo_click', {
      industry: currentIndustry,
      source: 'hero_section'
    })
    onOpenDemo()
  }

  const handleCalculatorClick = () => {
    trackEvent('hero_calculator_click', {
      industry: currentIndustry,
      source: 'hero_section'  
    })
    onOpenCalculator()
  }

  const handleTrialClick = () => {
    trackEvent('hero_trial_click', {
      industry: currentIndustry,
      source: 'hero_section'
    })
    window.location.href = `/signup?industry=${currentIndustry}`
  }

  return (
    <section className="relative bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Rotating Headline */}
            <h1 className={`text-4xl lg:text-6xl font-bold text-gray-900 mb-6 transition-opacity duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              {getHeadlineText()}
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-8">
              Join 9,500+ SMBs already automating customer communication
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 mb-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>HIPAA compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>30-day free trial</span>
              </div>
            </div>

            {/* Dual CTA Strategy */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button
                onClick={handleDemoClick}
                className="px-8 py-4 bg-amber-600 text-white text-lg font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Interactive Demo
              </button>
              
              <button
                onClick={handleCalculatorClick}
                className="px-8 py-4 bg-white text-amber-600 border-2 border-amber-600 text-lg font-semibold rounded-lg hover:bg-amber-50 transition-colors"
              >
                Calculate ROI
              </button>
            </div>

            {/* Mini Calculator Teaser */}
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto lg:mx-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick ROI Preview
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Savings:</span>
                  <span className="font-semibold text-green-600">$12,400</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efficiency Gain:</span>
                  <span className="font-semibold text-blue-600">73%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payback Period:</span>
                  <span className="font-semibold text-purple-600">2.3 months</span>
                </div>
              </div>

              <button
                onClick={handleCalculatorClick}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Calculate Your Exact ROI →
              </button>
            </div>
          </div>

          {/* Hero Image/Video */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
              {/* Dashboard Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 ml-4">AI Chatbot Dashboard</span>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">73%</div>
                    <div className="text-sm text-gray-600">Faster Response</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">$12.4K</div>
                    <div className="text-sm text-gray-600">Monthly Savings</div>
                  </div>
                </div>

                {/* Chat Preview */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <div className="bg-white p-3 rounded-lg flex-1 shadow-sm">
                      <p className="text-sm">Hi! I can help you schedule an appointment. What day works best for you?</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <div className="bg-amber-100 p-3 rounded-lg max-w-xs">
                      <p className="text-sm">Tomorrow at 2 PM would be perfect</p>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <div className="bg-white p-3 rounded-lg flex-1 shadow-sm">
                      <p className="text-sm">Perfect! I've scheduled your appointment for tomorrow at 2 PM. You'll receive a confirmation email shortly.</p>
                    </div>
                  </div>
                </div>

                {/* Activity Indicator */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live - Processing 247 conversations</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-bounce">
              24/7 Active
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              HIPAA Compliant
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Trigger (Hidden) */}
      <div className="hidden">
        <video
          id="heroVideo"
          className="w-full h-auto rounded-lg shadow-lg"
          controls
          poster="/video-thumbnail.jpg"
        >
          <source src="/hero-demo.mp4" type="video/mp4" />
          <source src="/hero-demo.webm" type="video/webm" />
        </video>
      </div>
    </section>
  )
}