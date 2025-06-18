'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'

interface DemoStep {
  id: number
  title: string
  description: string
  component: React.ReactNode
  duration: number
}

type Industry = 'healthcare' | 'legal' | 'ecommerce'
type DemoFormat = 'interactive' | 'video' | 'sandbox'
type DemoView = 'hub' | 'player' | 'completed'

export default function DemoPage() {
  const [currentView, setCurrentView] = useState<DemoView>('hub')
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('healthcare')
  const [selectedFormat, setSelectedFormat] = useState<DemoFormat>('interactive')
  const [currentStep, setCurrentStep] = useState(1)
  const [viewersCount, setViewersCount] = useState(847)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [demoStartTime, setDemoStartTime] = useState<number>(0)
  const [userInteractions, setUserInteractions] = useState<string[]>([])
  
  const totalSteps = 15
  const progressPercentage = (currentStep / totalSteps) * 100

  // Analytics tracking
  const trackEvent = (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties)
    }
    
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties })
    }).catch(() => {})
  }

  // Industry data
  const industryData = {
    healthcare: {
      title: 'Healthcare Demo',
      subtitle: 'HIPAA-compliant patient communication and appointment scheduling',
      icon: '🏥',
      stats: [
        { label: 'monthly savings', value: '$43K' },
        { label: 'faster service', value: '73%' }
      ],
      chatPreview: 'Schedule appointment?',
      metricPreview: '73% faster',
      color: 'blue'
    },
    legal: {
      title: 'Legal Practice Demo',
      subtitle: 'Convert more leads with 24/7 consultation scheduling',
      icon: '⚖️',
      stats: [
        { label: 'more conversions', value: '35%' },
        { label: 'availability', value: '24/7' }
      ],
      chatPreview: 'Consultation available?',
      metricPreview: '35% more leads',
      color: 'purple'
    },
    ecommerce: {
      title: 'E-commerce Demo',
      subtitle: 'Recover abandoned carts and increase customer satisfaction',
      icon: '🛒',
      stats: [
        { label: 'monthly recovery', value: '$32K' },
        { label: 'higher satisfaction', value: '45%' }
      ],
      chatPreview: 'Need help with order?',
      metricPreview: '$32K recovered',
      color: 'green'
    }
  }

  // Format options
  const formatOptions = [
    { 
      id: 'interactive' as DemoFormat, 
      icon: '🎮', 
      title: 'Interactive Demo', 
      subtitle: 'Hands-on experience',
      selected: selectedFormat === 'interactive'
    },
    { 
      id: 'video' as DemoFormat, 
      icon: '🎥', 
      title: 'Video Overview', 
      subtitle: 'Watch & learn',
      selected: selectedFormat === 'video'
    },
    { 
      id: 'sandbox' as DemoFormat, 
      icon: '🔧', 
      title: 'Live Sandbox', 
      subtitle: 'Build your own',
      selected: selectedFormat === 'sandbox'
    }
  ]

  // Demo steps (simplified for this implementation)
  const getDemoSteps = (industry: Industry): DemoStep[] => {
    const baseSteps = [
      { id: 1, title: 'Welcome Setup', description: 'Configure your chatbot settings', duration: 8 },
      { id: 2, title: 'Brand Customization', description: 'Match your brand colors and style', duration: 8 },
      { id: 3, title: 'Knowledge Base', description: 'Upload your business information', duration: 8 },
      { id: 4, title: 'Conversation Flow', description: 'Design customer interactions', duration: 8 },
      { id: 5, title: 'Integration Setup', description: 'Connect to your existing tools', duration: 8 },
    ]
    
    // Add industry-specific steps
    if (industry === 'healthcare') {
      return [...baseSteps,
        { id: 6, title: 'HIPAA Compliance', description: 'Configure privacy settings', duration: 8 },
        { id: 7, title: 'Appointment Booking', description: 'Set up calendar integration', duration: 8 },
        { id: 8, title: 'Patient Forms', description: 'Create intake workflows', duration: 8 },
        { id: 9, title: 'Insurance Verification', description: 'Configure verification process', duration: 8 },
        { id: 10, title: 'Provider Scheduling', description: 'Set staff availability', duration: 8 },
        { id: 11, title: 'Emergency Protocols', description: 'Configure urgent care routing', duration: 8 },
        { id: 12, title: 'Prescription Refills', description: 'Automate refill requests', duration: 8 },
        { id: 13, title: 'Test Conversations', description: 'Try sample patient interactions', duration: 8 },
        { id: 14, title: 'Go Live Setup', description: 'Deploy to your website', duration: 8 },
        { id: 15, title: 'Results Dashboard', description: 'View your analytics', duration: 8 }
      ]
    } else if (industry === 'legal') {
      return [...baseSteps,
        { id: 6, title: 'Lead Qualification', description: 'Set up screening questions', duration: 8 },
        { id: 7, title: 'Consultation Booking', description: 'Configure appointment slots', duration: 8 },
        { id: 8, title: 'Case Intake Forms', description: 'Create legal intake workflows', duration: 8 },
        { id: 9, title: 'Retainer Management', description: 'Set up payment collection', duration: 8 },
        { id: 10, title: 'Document Collection', description: 'Automate document requests', duration: 8 },
        { id: 11, title: 'Follow-up Sequences', description: 'Create nurture campaigns', duration: 8 },
        { id: 12, title: 'Referral Tracking', description: 'Monitor lead sources', duration: 8 },
        { id: 13, title: 'Test Scenarios', description: 'Try sample client interactions', duration: 8 },
        { id: 14, title: 'Launch Campaign', description: 'Deploy across marketing channels', duration: 8 },
        { id: 15, title: 'Conversion Analytics', description: 'Track lead conversion', duration: 8 }
      ]
    } else {
      return [...baseSteps,
        { id: 6, title: 'Product Catalog', description: 'Import your inventory', duration: 8 },
        { id: 7, title: 'Cart Recovery', description: 'Set up abandonment flows', duration: 8 },
        { id: 8, title: 'Order Tracking', description: 'Configure shipping updates', duration: 8 },
        { id: 9, title: 'Support Tickets', description: 'Automate customer service', duration: 8 },
        { id: 10, title: 'Upselling Flows', description: 'Create recommendation logic', duration: 8 },
        { id: 11, title: 'Return Management', description: 'Streamline return process', duration: 8 },
        { id: 12, title: 'Review Collection', description: 'Automate feedback requests', duration: 8 },
        { id: 13, title: 'Test Purchase Flow', description: 'Try sample customer journey', duration: 8 },
        { id: 14, title: 'E-commerce Integration', description: 'Connect to your store', duration: 8 },
        { id: 15, title: 'Revenue Analytics', description: 'Track recovered revenue', duration: 8 }
      ]
    }
  }

  // Effects
  useEffect(() => {
    trackEvent('demo_page_view', { timestamp: Date.now() })
    
    // Simulate live viewer count updates
    const interval = setInterval(() => {
      setViewersCount(prev => prev + Math.floor(Math.random() * 3) - 1)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentView === 'player' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [currentView, timeRemaining])

  // Handlers
  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry)
    trackEvent('demo_industry_selected', { industry })
  }

  const handleFormatSelect = (format: DemoFormat) => {
    setSelectedFormat(format)
    trackEvent('demo_format_selected', { format })
  }

  const handleStartDemo = () => {
    setCurrentView('player')
    setDemoStartTime(Date.now())
    trackEvent('demo_started', { 
      industry: selectedIndustry, 
      format: selectedFormat 
    })
  }

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      setUserInteractions(prev => [...prev, `step_${currentStep}_completed`])
      trackEvent('demo_step_completed', { 
        step: currentStep, 
        industry: selectedIndustry 
      })
    } else {
      handleDemoComplete()
    }
  }

  const handleSkipDemo = () => {
    setCurrentStep(totalSteps)
    handleDemoComplete()
    trackEvent('demo_skipped', { 
      step: currentStep, 
      industry: selectedIndustry 
    })
  }

  const handleDemoComplete = () => {
    setCurrentView('completed')
    setShowCompletionModal(true)
    const completionTime = Date.now() - demoStartTime
    trackEvent('demo_completed', { 
      industry: selectedIndustry,
      format: selectedFormat,
      completionTime,
      stepsCompleted: currentStep,
      interactions: userInteractions.length
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (currentView === 'hub') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Home
              </Link>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">{viewersCount}</span> people watching demos right now
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              See AI Chatbots Transform Your Business
            </h1>
            <p className="text-xl text-gray-600">
              Choose your industry for a personalized 2-minute experience
            </p>
          </div>

          {/* Industry Demo Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {Object.entries(industryData).map(([key, data]) => {
              const industry = key as Industry
              const isSelected = selectedIndustry === industry
              return (
                <div 
                  key={industry}
                  className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
                    isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                  onClick={() => handleIndustrySelect(industry)}
                >
                  {/* Preview Animation */}
                  <div className="relative bg-gray-50 rounded-lg p-4 mb-4 h-24 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white rounded-lg px-3 py-1 shadow-md text-sm">
                        {data.chatPreview}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      {data.metricPreview}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl mb-2">{data.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{data.subtitle}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {data.stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="font-bold text-lg">{stat.value}</div>
                          <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                      <span>⏱ 2 minutes</span>
                      <span>✓ 15 steps</span>
                    </div>

                    <button 
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? 'Selected' : `Start ${data.title}`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Demo Format Selector */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-center mb-6">Choose Your Demo Format</h3>
            <div className="flex justify-center gap-4">
              {formatOptions.map((format) => (
                <div
                  key={format.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all text-center ${
                    format.selected 
                      ? 'bg-blue-100 border-2 border-blue-500' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleFormatSelect(format.id)}
                >
                  <div className="text-2xl mb-2">{format.icon}</div>
                  <div className="font-medium">{format.title}</div>
                  <div className="text-sm text-gray-600">{format.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Demo Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleStartDemo}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Start {industryData[selectedIndustry].title} ({selectedFormat})
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <span className="text-gray-700">SOC2 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="text-gray-700">No Installation Required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📱</span>
              <span className="text-gray-700">Works on Any Device</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="text-gray-700">Real Data Scenarios</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'player') {
    const currentStepData = getDemoSteps(selectedIndustry)[currentStep - 1]
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Demo Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentView('hub')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Demos
                </button>
                <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-sm font-medium">
                  {industryData[selectedIndustry].icon} {industryData[selectedIndustry].title}
                </div>
              </div>
              
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Step {currentStep} of {totalSteps}</span>
                    <span>{formatTime(timeRemaining)} remaining</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleSkipDemo}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Skip to Results →
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  ?
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Stage */}
        <div className="flex-1 flex">
          <div className="flex-1 p-8">
            <div className="bg-white rounded-xl shadow-lg p-8 h-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentStepData?.title}
                </h2>
                <p className="text-gray-600">
                  {currentStepData?.description}
                </p>
              </div>

              {/* Simulated Interface */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">⚙️</div>
                  <div className="text-lg font-medium text-gray-700">
                    Interactive {currentStepData?.title} Interface
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Click anywhere to simulate interaction
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentStep === totalSteps ? 'Complete Demo' : 'Continue →'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 p-4 space-y-4">
            {/* Expert Chat Widget */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  👨‍💼
                </div>
                <div>
                  <div className="font-medium">Demo Expert</div>
                  <div className="text-sm text-green-600">Available now</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Questions about what you're seeing? I'm here to help!
              </p>
              <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Chat with Expert
              </button>
            </div>

            {/* Share Widget */}
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="font-medium mb-2">Share with Your Team</h4>
              <p className="text-sm text-gray-600 mb-3">Send this demo to colleagues</p>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Get Shareable Link
              </button>
            </div>

            {/* Urgency Widget */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⏰</span>
                <span className="font-medium">Limited Time Offer</span>
              </div>
              <p className="text-sm text-amber-800 mb-3">
                Get 25% off if you start trial today
              </p>
              <div className="text-lg font-mono text-amber-700">
                23:47:12
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Completion Modal
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Demo Complete!</h2>
            <p className="text-gray-600">
              You've seen how AI chatbots can transform your {selectedIndustry} business
            </p>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {industryData[selectedIndustry].stats[0].value}
              </div>
              <div className="text-sm text-gray-600">Potential Savings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentStep}</div>
              <div className="text-sm text-gray-600">Steps Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((Date.now() - demoStartTime) / 1000)}s
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                trackEvent('trial_started_from_demo', { industry: selectedIndustry })
                window.location.href = `/signup?industry=${selectedIndustry}&source=demo`
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start My Free Trial
            </button>
            <button
              onClick={() => {
                trackEvent('calculator_from_demo', { industry: selectedIndustry })
                window.location.href = `/calculators?industry=${selectedIndustry}`
              }}
              className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Calculate Exact Savings
            </button>
            <button
              onClick={() => {
                trackEvent('email_demo_requested', { industry: selectedIndustry })
                alert('Demo link will be sent to your email!')
              }}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Email Me This Demo
            </button>
          </div>

          {/* Certificate */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                trackEvent('demo_certificate_generated', { industry: selectedIndustry })
                alert('Certificate generated!')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              📜 Generate Completion Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}