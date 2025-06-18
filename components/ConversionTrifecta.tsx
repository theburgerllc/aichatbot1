'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ConversionTrifectaProps {
  currentIndustry: string
}

const industryTestimonials = {
  healthcare: {
    quote: "Reduced patient wait times by 73% and saved $2,400 monthly on staff costs.",
    author: "Dr. Sarah Chen, Family Practice"
  },
  legal: {
    quote: "Converted 34% more leads and automated 80% of initial consultations.",
    author: "Michael Torres, Personal Injury Law"
  },
  ecommerce: {
    quote: "Recovered $28K in abandoned carts and increased customer satisfaction 45%.",
    author: "Lisa Park, Online Retailer"
  }
}

export function ConversionTrifecta({ currentIndustry }: ConversionTrifectaProps) {
  const [calculatorValues, setCalculatorValues] = useState({
    monthlyLeads: 500,
    conversionRate: 12,
    avgOrderValue: 150
  })
  const [monthlySavings, setMonthlySavings] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [microDemoPlaying, setMicroDemoPlaying] = useState(false)

  // Calculate savings whenever values change
  useEffect(() => {
    const { monthlyLeads, conversionRate, avgOrderValue } = calculatorValues
    if (monthlyLeads && conversionRate && avgOrderValue) {
      const currentRevenue = monthlyLeads * (conversionRate / 100) * avgOrderValue
      const improvedConversion = Math.min(conversionRate * 1.35, 100)
      const improvedRevenue = monthlyLeads * (improvedConversion / 100) * avgOrderValue
      const savings = improvedRevenue - currentRevenue
      setMonthlySavings(Math.round(savings))
    }
  }, [calculatorValues])

  // Testimonial rotation
  useEffect(() => {
    const testimonials = Object.keys(industryTestimonials)
    let startIndex = 0
    
    // Start with industry-specific testimonial
    if (currentIndustry in industryTestimonials) {
      startIndex = testimonials.indexOf(currentIndustry)
      setCurrentTestimonial(startIndex)
    }

    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndustry])

  const handleInputChange = (field: string, value: number) => {
    setCalculatorValues(prev => ({ ...prev, [field]: value }))
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calculator_input_change', {
        event_category: 'engagement',
        field,
        value,
        industry: currentIndustry
      })
    }
  }

  const playMicroDemo = () => {
    setMicroDemoPlaying(true)
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'micro_demo_play', {
        event_category: 'engagement',
        industry: currentIndustry
      })
    }

    // Auto-stop after 15 seconds
    setTimeout(() => {
      setMicroDemoPlaying(false)
    }, 15000)
  }

  const testimonialKeys = Object.keys(industryTestimonials) as Array<keyof typeof industryTestimonials>
  const currentTestimonialData = industryTestimonials[testimonialKeys[currentTestimonial]]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Column 1: See It Work */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">See It Work</h3>
            
            <div className="relative mb-6">
              {/* Micro Demo Video */}
              <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
                <video
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay={microDemoPlaying}
                  data-gtm="micro_demo_play"
                >
                  <source src={`/demo-${currentIndustry}.mp4`} type="video/mp4" />
                  <source src={`/demo-${currentIndustry}.webm`} type="video/webm" />
                  {/* Fallback */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-3xl mb-2">💬</div>
                      <div className="text-sm font-medium">Demo Preview</div>
                    </div>
                  </div>
                </video>
                
                {/* Play Button */}
                {!microDemoPlaying && (
                  <button
                    onClick={playMicroDemo}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all group"
                    data-gtm="micro_demo_click"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">15-second preview</p>
            
            <Link 
              href={`/demo?industry=${currentIndustry}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              data-gtm="trifecta_demo_full"
            >
              Full {currentIndustry === 'healthcare' ? 'Healthcare' : currentIndustry === 'legal' ? 'Legal' : 'E-commerce'} Demo →
            </Link>
          </div>

          {/* Column 2: Calculate Savings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Calculate Savings</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="monthlyLeads" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly leads
                </label>
                <input
                  type="number"
                  id="monthlyLeads"
                  value={calculatorValues.monthlyLeads}
                  onChange={(e) => handleInputChange('monthlyLeads', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500"
                  min="1"
                  data-gtm="calculator_leads_input"
                />
              </div>
              
              <div>
                <label htmlFor="conversionRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Current conversion %
                </label>
                <input
                  type="number"
                  id="conversionRate"
                  value={calculatorValues.conversionRate}
                  onChange={(e) => handleInputChange('conversionRate', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                  min="1"
                  max="100"
                  data-gtm="calculator_conversion_input"
                />
              </div>
              
              <div>
                <label htmlFor="avgOrderValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Avg order value
                </label>
                <input
                  type="number"
                  id="avgOrderValue"
                  value={calculatorValues.avgOrderValue}
                  onChange={(e) => handleInputChange('avgOrderValue', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150"
                  min="1"
                  data-gtm="calculator_value_input"
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  Monthly Savings: ${monthlySavings.toLocaleString()}
                </div>
              </div>
            </div>
            
            <Link 
              href="/calculators"
              className="block w-full mt-6 text-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              data-gtm="trifecta_calculator_full"
            >
              Full ROI Calculator →
            </Link>
          </div>

          {/* Column 3: Industry Success */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Industry Success</h3>
            
            <div className="min-h-[200px] flex flex-col justify-center">
              <blockquote className="text-lg text-gray-700 italic mb-4">
                "{currentTestimonialData.quote}"
              </blockquote>
              
              <cite className="text-sm font-medium text-gray-900 not-italic">
                {currentTestimonialData.author}
              </cite>
            </div>
            
            {/* Testimonial dots */}
            <div className="flex justify-center space-x-2 mt-6 mb-6">
              {testimonialKeys.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              onClick={() => {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'testimonial_click', {
                    event_category: 'engagement',
                    industry: currentIndustry
                  })
                }
              }}
            >
              More success stories →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}