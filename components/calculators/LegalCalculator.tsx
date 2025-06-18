'use client'

import { useState, useEffect } from 'react'

interface LegalCalculatorProps {
  onBack: () => void
}

export function LegalCalculator({ onBack }: LegalCalculatorProps) {
  const [inputs, setInputs] = useState({
    monthlyLeads: 80,
    currentConversion: 15,
    caseValue: 25000,
    practiceType: 'personal_injury'
  })
  const [results, setResults] = useState({
    monthlyGrowth: 0,
    additionalCases: 0,
    conversionIncrease: 35
  })

  useEffect(() => {
    calculateLegalROI()
  }, [inputs])

  const calculateLegalROI = () => {
    const { monthlyLeads, currentConversion, caseValue } = inputs
    const conversionImprovement = 0.35
    const caseValueMultiplier = 1.22
    
    const improvedConversion = Math.min(currentConversion * (1 + conversionImprovement), 45)
    const additionalCases = monthlyLeads * ((improvedConversion - currentConversion) / 100)
    const monthlyGrowth = Math.round(additionalCases * caseValue * caseValueMultiplier)

    setResults({
      monthlyGrowth,
      additionalCases: parseFloat(additionalCases.toFixed(1)),
      conversionIncrease: Math.round(conversionImprovement * 100)
    })
  }

  const handleInputChange = (field: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const startTrial = () => {
    window.location.href = `/signup?source=calculator&industry=legal&calculator_completed=true`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            ← Choose Different Industry
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Inputs */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Legal Practice Growth Calculator</h2>
            <p className="text-gray-600 mb-8">Calculate additional revenue from faster lead response</p>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Monthly Leads</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={inputs.monthlyLeads}
                  onChange={(e) => handleInputChange('monthlyLeads', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-purple-600">{inputs.monthlyLeads}</span>
                  <span className="text-gray-600 ml-2">leads/month</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Current Conversion Rate</label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={inputs.currentConversion}
                  onChange={(e) => handleInputChange('currentConversion', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-purple-600">{inputs.currentConversion}</span>
                  <span className="text-gray-600 ml-2">% conversion</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Average Case Value</label>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={inputs.caseValue}
                  onChange={(e) => handleInputChange('caseValue', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-purple-600">${inputs.caseValue.toLocaleString()}</span>
                  <span className="text-gray-600 ml-2">per case</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Practice Type</label>
                <select
                  value={inputs.practiceType}
                  onChange={(e) => handleInputChange('practiceType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="personal_injury">Personal Injury</option>
                  <option value="family_law">Family Law</option>
                  <option value="criminal_defense">Criminal Defense</option>
                  <option value="business_law">Business Law</option>
                  <option value="estate_planning">Estate Planning</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Monthly Revenue Growth</h3>
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Based on 623 Law Firms
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                ${results.monthlyGrowth.toLocaleString()}
              </div>
              <div className="text-gray-600">per month</div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Additional Cases</span>
                <span className="font-semibold text-gray-900">{results.additionalCases}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Response Time</span>
                <span className="font-semibold text-gray-900">{"< 2 min"}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Conversion Increase</span>
                <span className="font-semibold text-gray-900">{results.conversionIncrease}%</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Your growth vs. similar practices</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">You</span>
                  <span className="font-semibold">${results.monthlyGrowth.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: Math.min((results.monthlyGrowth / 48750) * 65, 100) + '%' }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Similar Practices</span>
                  <span className="text-sm text-gray-600">$48,750</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center">
          <button
            onClick={startTrial}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            Start Converting More Leads
          </button>
          
          <div className="flex items-center justify-center space-x-2 text-orange-600 mt-4">
            <span className="text-xl">⚡</span>
            <span className="font-medium">
              <strong>623 law firms</strong> already growing with AI
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}