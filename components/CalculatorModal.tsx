'use client'

import { useState } from 'react'

interface CalculatorModalProps {
  show: boolean
  industry: string
  onClose: () => void
  trackEvent: (event: string, properties?: Record<string, any>) => void
}

export function CalculatorModal({ 
  show, 
  industry, 
  onClose, 
  trackEvent 
}: CalculatorModalProps) {
  const [providers, setProviders] = useState(5)
  const [patientsPerDay, setPatientsPerDay] = useState(50)
  const [location, setLocation] = useState('')
  const [result, setResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  if (!show) return null

  const handleCalculate = async () => {
    if (!location.trim()) return

    setIsCalculating(true)
    
    try {
      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industry === 'default' ? 'healthcare' : industry,
          providers,
          patientsPerDay,
          location: location.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        
        trackEvent('calculator_completed', {
          industry,
          monthlySavings: data.monthlySavings,
          source: 'calculator_modal'
        })
      }
    } catch (error) {
      console.error('Calculator error:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleStartTrial = () => {
    trackEvent('trial_started_from_calculator', {
      industry,
      monthlySavings: result?.monthlySavings,
      source: 'calculator_modal'
    })
    window.location.href = `/signup?industry=${industry}&savings=${result?.monthlySavings}&source=calculator`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            data-gtm="calculator_modal_close"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="pr-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Calculate Your ROI
            </h2>

            {!result ? (
              /* Input Form */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Providers/Staff
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={providers}
                    onChange={(e) => setProviders(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1</span>
                    <span className="font-medium">{providers}</span>
                    <span>100+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Customer Interactions
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={patientsPerDay}
                    onChange={(e) => setPatientsPerDay(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>10</span>
                    <span className="font-medium">{patientsPerDay}</span>
                    <span>500+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={isCalculating || !location.trim()}
                  className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCalculating ? 'Calculating...' : 'Calculate My Savings'}
                </button>
              </div>
            ) : (
              /* Results */
              <div className="space-y-6">
                <div className="text-center bg-green-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    ${result.monthlySavings?.toLocaleString()}/month
                  </h3>
                  <p className="text-gray-600">Estimated Monthly Savings</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {result.efficiencyGain}%
                    </div>
                    <div className="text-sm text-gray-600">Efficiency Gain</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      ${result.yearlyProjection?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Yearly Projection</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Automated Interactions</span>
                    <span className="font-medium">{result.automatedInteractions?.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Saved</span>
                    <span className="font-medium">{result.timeSavedHours} hours/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time Improvement</span>
                    <span className="font-medium">{result.responseTimeReduction}% faster</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleStartTrial}
                    className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Start My Free Trial
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Recalculate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}