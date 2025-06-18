'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

interface CalculatorResults {
  monthlySavings: number
  yearlyProjection: number
  paybackPeriod: number
  efficiencyGain: number
  automatedInteractions: number
  timeSavedHours: number
  responseTimeReduction: number
  additionalMetrics?: Record<string, any>
}

type Industry = 'healthcare' | 'legal' | 'ecommerce'
type CalculatorView = 'hub' | Industry

export default function CalculatorsPage() {
  const [currentView, setCurrentView] = useState<CalculatorView>('hub')
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [calculatorResults, setCalculatorResults] = useState<CalculatorResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  
  // Healthcare calculator state
  const [healthcareProviders, setHealthcareProviders] = useState(5)
  const [healthcarePatients, setHealthcarePatients] = useState(60)
  const [healthcareLocation, setHealthcareLocation] = useState('')

  // Legal calculator state
  const [legalLeads, setLegalLeads] = useState(80)
  const [legalConversion, setLegalConversion] = useState(15)
  const [legalCaseValue, setLegalCaseValue] = useState(5000)

  // Ecommerce calculator state
  const [ecommerceOrders, setEcommerceOrders] = useState(300)
  const [ecommerceAOV, setEcommerceAOV] = useState(85)
  const [ecommerceAbandonRate, setEcommerceAbandonRate] = useState(70)

  const chartRef = useRef<HTMLCanvasElement>(null)

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

  // Industry calculator data
  const industryData = {
    healthcare: {
      title: 'Healthcare Practice ROI Calculator',
      subtitle: 'Patient scheduling, insurance verification, appointment reminders',
      averageSavings: '$43,702/mo',
      icon: '🏥',
      urgencyText: 'Join 847 practices saving this month'
    },
    legal: {
      title: 'Legal Practice Growth Calculator',
      subtitle: 'Lead qualification, consultation scheduling, case intake',
      averageSavings: '$67,500/mo',
      icon: '⚖️',
      urgencyText: '423 law firms increased revenue this month'
    },
    ecommerce: {
      title: 'E-commerce Recovery Calculator',
      subtitle: 'Cart recovery, customer support, order tracking',
      averageSavings: '$32,000/mo',
      icon: '🛒',
      urgencyText: '934 stores recovering carts with AI'
    }
  }

  useEffect(() => {
    trackEvent('calculator_page_view', {
      timestamp: Date.now()
    })
  }, [])

  // Calculate ROI based on industry and inputs
  const calculateROI = async (industry: Industry) => {
    setIsCalculating(true)
    
    try {
      let calculationData
      
      switch (industry) {
        case 'healthcare':
          calculationData = {
            industry: 'healthcare',
            providers: healthcareProviders,
            patientsPerDay: healthcarePatients,
            location: healthcareLocation
          }
          break
        case 'legal':
          calculationData = {
            industry: 'legal',
            monthlyLeads: legalLeads,
            conversionRate: legalConversion,
            avgCaseValue: legalCaseValue
          }
          break
        case 'ecommerce':
          calculationData = {
            industry: 'ecommerce',
            monthlyOrders: ecommerceOrders,
            averageOrderValue: ecommerceAOV,
            abandonmentRate: ecommerceAbandonRate
          }
          break
      }

      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculationData)
      })

      if (response.ok) {
        const results = await response.json()
        setCalculatorResults(results)
        
        // Create visualization
        createSavingsChart(results)

        trackEvent('calculator_completed', {
          industry,
          monthlySavings: results.monthlySavings,
          source: 'calculator_page'
        })

        // Show email capture after 3 seconds of engagement
        setTimeout(() => {
          setShowEmailCapture(true)
        }, 3000)
      }
    } catch (error) {
      console.error('Calculator error:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  // Create Chart.js visualization
  const createSavingsChart = (results: CalculatorResults) => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Monthly Savings', 'Current Costs'],
        datasets: [{
          data: [results.monthlySavings, results.monthlySavings * 0.3],
          backgroundColor: ['#10B981', '#E5E7EB'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }

  const handleEmailSubmit = async (e: React.FormEvent, industry: Industry) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = new FormData(form).get('email') as string

    trackEvent('calculator_email_submitted', {
      industry,
      email,
      monthlySavings: calculatorResults?.monthlySavings
    })

    // Send email capture to API
    await fetch('/api/track-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'calculator_email_capture',
        email,
        industry,
        results: calculatorResults,
        timestamp: Date.now()
      })
    })

    setShowEmailCapture(false)
    alert('Thanks! Your detailed ROI report is being sent to your email.')
  }

  const startTrial = (industry: Industry) => {
    trackEvent('trial_started_from_calculator', {
      industry,
      monthlySavings: calculatorResults?.monthlySavings,
      source: 'calculator_page'
    })
    window.location.href = `/signup?industry=${industry}&source=calculator&savings=${calculatorResults?.monthlySavings}`
  }

  if (currentView === 'hub') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
        
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
                ← Back to Home
              </Link>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-amber-600">12,847</span> businesses calculated ROI this month
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Calculate Your ROI in 30 Seconds
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              See your exact monthly savings with AI chatbots. No email required to start.
            </p>
          </div>

          {/* Calculator Options */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {Object.entries(industryData).map(([key, data]) => {
              const industry = key as Industry
              return (
                <div 
                  key={industry}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => {
                    setCurrentView(industry)
                    trackEvent('calculator_selected', { industry })
                  }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{data.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {industry === 'healthcare' ? 'Healthcare Practice' :
                       industry === 'legal' ? 'Legal Practice' : 'E-commerce Store'}
                    </h3>
                    <p className="text-gray-600 mb-4">{data.subtitle}</p>
                    <div className="bg-green-50 p-3 rounded-lg mb-6">
                      <span className="text-sm text-gray-600">Average Savings: </span>
                      <span className="font-bold text-green-600">{data.averageSavings}</span>
                    </div>
                    <button className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors">
                      Calculate {industry === 'healthcare' ? 'Healthcare' : 
                                industry === 'legal' ? 'Legal' : 'E-commerce'} ROI
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-gray-700">No Email Required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span className="text-gray-700">30 Second Results</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-gray-700">Industry-Specific</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-gray-700">Real Data Sources</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Industry-specific calculator view
  const industryInfo = industryData[currentView as Industry]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setCurrentView('hub')}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              ← Choose Different Industry
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm">2</div>
                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm">3</div>
              </div>
              <span className="text-sm text-gray-600">Step 1 of 3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calculator Inputs */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-2">{industryInfo.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900">{industryInfo.title}</h2>
              <p className="text-gray-600">Takes 30 seconds • See instant results</p>
            </div>

            {/* Healthcare Calculator */}
            {currentView === 'healthcare' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Providers: {healthcareProviders}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={healthcareProviders}
                    onChange={(e) => setHealthcareProviders(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1</span>
                    <span>50+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patients per Day: {healthcarePatients}
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={healthcarePatients}
                    onChange={(e) => setHealthcarePatients(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>20</span>
                    <span>200+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={healthcareLocation}
                    onChange={(e) => setHealthcareLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Legal Calculator */}
            {currentView === 'legal' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Leads: {legalLeads}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={legalLeads}
                    onChange={(e) => setLegalLeads(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>10</span>
                    <span>500+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Conversion Rate: {legalConversion}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={legalConversion}
                    onChange={(e) => setLegalConversion(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>5%</span>
                    <span>40%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Case Value: ${legalCaseValue.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="500"
                    value={legalCaseValue}
                    onChange={(e) => setLegalCaseValue(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>$1K</span>
                    <span>$50K+</span>
                  </div>
                </div>
              </div>
            )}

            {/* E-commerce Calculator */}
            {currentView === 'ecommerce' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Orders: {ecommerceOrders}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    value={ecommerceOrders}
                    onChange={(e) => setEcommerceOrders(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>50</span>
                    <span>2000+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Order Value: ${ecommerceAOV}
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="500"
                    value={ecommerceAOV}
                    onChange={(e) => setEcommerceAOV(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>$25</span>
                    <span>$500+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cart Abandonment Rate: {ecommerceAbandonRate}%
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="85"
                    value={ecommerceAbandonRate}
                    onChange={(e) => setEcommerceAbandonRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>40%</span>
                    <span>85%</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => calculateROI(currentView as Industry)}
              disabled={isCalculating || (currentView === 'healthcare' && !healthcareLocation)}
              className="w-full mt-8 px-8 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCalculating ? 'Calculating...' : 'Calculate My ROI'}
            </button>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {!calculatorResults ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Results Will Appear Here</h3>
                <p className="text-gray-500">Complete the calculator to see your personalized ROI breakdown</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center bg-green-50 p-6 rounded-lg">
                  <h3 className="text-3xl font-bold text-green-600 mb-2">
                    ${calculatorResults.monthlySavings.toLocaleString()}/month
                  </h3>
                  <p className="text-gray-600">Estimated Monthly Savings</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {calculatorResults.efficiencyGain}%
                    </div>
                    <div className="text-sm text-gray-600">Efficiency Gain</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {calculatorResults.paybackPeriod} mo
                    </div>
                    <div className="text-sm text-gray-600">Payback Period</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-64">
                  <canvas ref={chartRef}></canvas>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Automated Interactions</span>
                    <span className="font-medium">{calculatorResults.automatedInteractions?.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Saved</span>
                    <span className="font-medium">{calculatorResults.timeSavedHours} hours/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time Improvement</span>
                    <span className="font-medium">{calculatorResults.responseTimeReduction}% faster</span>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t">
                  <button
                    onClick={() => startTrial(currentView as Industry)}
                    className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Start My Free Trial
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Share Results
                  </button>
                  <div className="text-center text-sm text-amber-600">
                    🔥 {industryInfo.urgencyText}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEmailCapture(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <button
                onClick={() => setShowEmailCapture(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Your Detailed ROI Report</h3>
              <p className="text-gray-600 mb-4">12-month projections, implementation timeline, and competitor analysis</p>
              
              <form onSubmit={(e) => handleEmailSubmit(e, currentView as Industry)} className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Send My Report
                </button>
              </form>
              
              <p className="text-xs text-gray-500 mt-3">📧 Detailed report + implementation tips. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowShareModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your ROI Results</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    trackEvent('calculator_share', { platform: 'linkedin', industry: currentView })
                    window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Share on LinkedIn
                </button>
                <button 
                  onClick={() => {
                    trackEvent('calculator_share', { platform: 'twitter', industry: currentView })
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=I just calculated my ROI with AI chatbots: ${calculatorResults?.monthlySavings}/month savings!`)
                  }}
                  className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Share on Twitter
                </button>
                <button 
                  onClick={() => {
                    trackEvent('calculator_share', { platform: 'email', industry: currentView })
                    window.location.href = `mailto:?subject=My AI Chatbot ROI Results&body=I calculated ${calculatorResults?.monthlySavings}/month in savings with AI chatbots. Check it out: ${window.location.href}`
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Email Results
                </button>
                <button 
                  onClick={() => {
                    trackEvent('calculator_share', { platform: 'print', industry: currentView })
                    window.print()
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}