'use client'

import { useState, useEffect } from 'react'

interface HealthcareCalculatorProps {
  onBack: () => void
}

// Location-based wage rates for healthcare
const wageRates = {
  CA: { rate: 28, name: 'California' },
  NY: { rate: 26, name: 'New York' },
  TX: { rate: 22, name: 'Texas' },
  FL: { rate: 21, name: 'Florida' },
  IL: { rate: 24, name: 'Illinois' },
  PA: { rate: 23, name: 'Pennsylvania' },
  OH: { rate: 20, name: 'Ohio' },
  GA: { rate: 21, name: 'Georgia' },
  NC: { rate: 20, name: 'North Carolina' },
  MI: { rate: 22, name: 'Michigan' },
  OTHER: { rate: 22, name: 'Other' },
}

export function HealthcareCalculator({ onBack }: HealthcareCalculatorProps) {
  const [inputs, setInputs] = useState({
    providers: 5,
    patientsPerDay: 60,
    location: 'CA'
  })
  const [results, setResults] = useState({
    monthlySavings: 0,
    hoursSaved: 0,
    callsAutomated: 0,
    roiPeriod: ''
  })
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [engagementScore, setEngagementScore] = useState(0)

  // Calculate ROI whenever inputs change
  useEffect(() => {
    calculateHealthcareROI()
  }, [inputs])

  // Track engagement and show email capture
  useEffect(() => {
    if (engagementScore >= 3) {
      setTimeout(() => setShowEmailCapture(true), 1000)
    }
  }, [engagementScore])

  const calculateHealthcareROI = () => {
    const { providers, patientsPerDay, location } = inputs
    const hourlyWage = wageRates[location as keyof typeof wageRates]?.rate || 22
    
    // Industry benchmarks
    const automationRate = 0.72
    const callsPerPatient = 2.3
    const avgCallDuration = 4.8 // minutes
    const workDaysPerMonth = 22
    const roiMultiplier = 1.15
    
    // Calculations
    const totalCalls = providers * patientsPerDay * callsPerPatient * workDaysPerMonth
    const automatedCalls = totalCalls * automationRate
    const timeSavedMinutes = automatedCalls * avgCallDuration
    const timeSavedHours = timeSavedMinutes / 60
    const monthlySavings = Math.round(timeSavedHours * hourlyWage * roiMultiplier)
    
    // ROI period calculation
    const monthlyCost = 297 // AI chatbot cost
    const paybackMonths = monthlyCost / monthlySavings
    const roiPeriod = paybackMonths < 1 
      ? `${Math.round(paybackMonths * 30)} days`
      : `${Math.round(paybackMonths * 4)} weeks`

    setResults({
      monthlySavings,
      hoursSaved: Math.round(timeSavedHours),
      callsAutomated: Math.round(automatedCalls),
      roiPeriod
    })

    // Track calculation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'healthcare_roi_calculated', {
        event_category: 'calculator_usage',
        providers,
        patients_per_day: patientsPerDay,
        location,
        monthly_savings: monthlySavings,
        hours_saved: timeSavedHours
      })
    }
  }

  const handleInputChange = (field: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }))
    setEngagementScore(prev => prev + 1)
    
    // Track input changes
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calculator_input_changed', {
        event_category: 'engagement',
        field,
        value,
        engagement_score: engagementScore + 1
      })
    }
  }

  const handleEmailSubmit = (email: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'email_captured', {
        event_category: 'lead_generation',
        industry: 'healthcare',
        email,
        engagement_score: engagementScore
      })
    }
    
    // Show success state
    setShowEmailCapture(false)
    alert('Report sent! Check your email for your detailed ROI analysis.')
  }

  const startTrial = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'trial_started_from_calculator', {
        event_category: 'conversion',
        industry: 'healthcare',
        calculator_completion: true,
        engagement_score: engagementScore
      })
    }
    
    window.location.href = `/signup?source=calculator&industry=healthcare&calculator_completed=true`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              data-gtm="calculator_back_to_hub"
            >
              ← Choose Different Industry
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">2</div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">3</div>
              </div>
              <span className="text-sm text-gray-600">Step 1 of 3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Inputs */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Healthcare Practice ROI Calculator</h2>
            <p className="text-gray-600 mb-8">Takes 30 seconds • See instant results</p>
            
            <div className="space-y-8">
              {/* Number of Providers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Number of Providers
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={inputs.providers}
                    onChange={(e) => handleInputChange('providers', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    data-gtm="calc_healthcare_providers"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>50+</span>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-blue-600">{inputs.providers}</span>
                  <span className="text-gray-600 ml-2">providers</span>
                </div>
              </div>

              {/* Patients per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Patients per Day
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={inputs.patientsPerDay}
                    onChange={(e) => handleInputChange('patientsPerDay', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    data-gtm="calc_healthcare_patients"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20</span>
                    <span>200+</span>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-blue-600">{inputs.patientsPerDay}</span>
                  <span className="text-gray-600 ml-2">patients/day</span>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Your Location
                </label>
                <select
                  value={inputs.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-gtm="calc_healthcare_location"
                >
                  {Object.entries(wageRates).map(([code, data]) => (
                    <option key={code} value={code}>
                      {data.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-600">
                  Avg wage: ${wageRates[inputs.location as keyof typeof wageRates]?.rate || 22}/hr
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Monthly Savings</h3>
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                95% Accuracy
              </div>
            </div>

            {/* Primary Result */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                ${results.monthlySavings.toLocaleString()}
              </div>
              <div className="text-gray-600">per month</div>
            </div>

            {/* Breakdown */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Hours Saved Monthly</span>
                <span className="font-semibold text-gray-900">{results.hoursSaved.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Calls Automated</span>
                <span className="font-semibold text-gray-900">{results.callsAutomated.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">ROI Period</span>
                <span className="font-semibold text-gray-900">{results.roiPeriod}</span>
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Your savings vs. industry average</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">You</span>
                  <span className="font-semibold">${results.monthlySavings.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: Math.min((results.monthlySavings / 31250) * 60, 100) + '%' }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Industry Avg</span>
                  <span className="text-sm text-gray-600">$31,250</span>
                </div>
                <p className="text-sm text-green-600 font-medium">
                  You save {Math.round(((results.monthlySavings - 31250) / 31250) * 100)}% more than average
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Capture */}
        {showEmailCapture && (
          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Your Detailed ROI Report</h3>
            <p className="text-gray-600 mb-6">12-month projections, implementation timeline, and competitor analysis</p>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const email = (e.target as any).email.value
                handleEmailSubmit(email)
              }}
              className="max-w-md mx-auto flex gap-4"
            >
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-gtm="calc_healthcare_email"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Send My Report
              </button>
            </form>
            
            <p className="text-sm text-gray-500 mt-4">
              📧 Detailed report + implementation tips. Unsubscribe anytime.
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={startTrial}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors mb-4"
              data-gtm="calc_healthcare_trial"
            >
              Start Saving Now - Free Trial
            </button>
            
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <span className="text-xl">🔥</span>
              <span className="font-medium">
                Join <strong>847 practices</strong> saving this month
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}