'use client'

import { useState, useEffect } from 'react'

interface EcommerceCalculatorProps {
  onBack: () => void
}

export function EcommerceCalculator({ onBack }: EcommerceCalculatorProps) {
  const [inputs, setInputs] = useState({
    monthlyVisitors: 15000,
    abandonmentRate: 70,
    aov: 85,
    storeType: 'fashion'
  })
  const [results, setResults] = useState({
    monthlyRecovery: 0,
    cartsRecovered: 0,
    recoveryRate: 37
  })

  useEffect(() => {
    calculateEcommerceROI()
  }, [inputs])

  const calculateEcommerceROI = () => {
    const { monthlyVisitors, abandonmentRate, aov } = inputs
    const recoveryRate = 0.37
    const conversionRate = 0.03
    
    const abandonedCarts = monthlyVisitors * conversionRate * (abandonmentRate / 100)
    const recoveredCarts = Math.round(abandonedCarts * recoveryRate)
    const monthlyRecovery = Math.round(recoveredCarts * aov)

    setResults({
      monthlyRecovery,
      cartsRecovered: recoveredCarts,
      recoveryRate: Math.round(recoveryRate * 100)
    })
  }

  const handleInputChange = (field: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const startTrial = () => {
    window.location.href = `/signup?source=calculator&industry=ecommerce&calculator_completed=true`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            ← Choose Different Industry
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Inputs */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">E-commerce Revenue Recovery Calculator</h2>
            <p className="text-gray-600 mb-8">Calculate revenue recovered from abandoned carts</p>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Monthly Visitors</label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="500"
                  value={inputs.monthlyVisitors}
                  onChange={(e) => handleInputChange('monthlyVisitors', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-green-600">{inputs.monthlyVisitors.toLocaleString()}</span>
                  <span className="text-gray-600 ml-2">visitors/month</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Cart Abandonment Rate</label>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={inputs.abandonmentRate}
                  onChange={(e) => handleInputChange('abandonmentRate', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-green-600">{inputs.abandonmentRate}</span>
                  <span className="text-gray-600 ml-2">% abandoned</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Average Order Value</label>
                <input
                  type="range"
                  min="25"
                  max="500"
                  step="5"
                  value={inputs.aov}
                  onChange={(e) => handleInputChange('aov', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-3 text-center">
                  <span className="text-2xl font-bold text-green-600">${inputs.aov}</span>
                  <span className="text-gray-600 ml-2">avg order</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Store Type</label>
                <select
                  value={inputs.storeType}
                  onChange={(e) => handleInputChange('storeType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="electronics">Electronics</option>
                  <option value="home_garden">Home & Garden</option>
                  <option value="health_beauty">Health & Beauty</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Monthly Cart Recovery</h3>
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Based on 934 Stores
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-green-600 mb-2">
                ${results.monthlyRecovery.toLocaleString()}
              </div>
              <div className="text-gray-600">per month</div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Carts Recovered</span>
                <span className="font-semibold text-gray-900">{results.cartsRecovered.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Recovery Rate</span>
                <span className="font-semibold text-gray-900">{results.recoveryRate}%</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Payback Period</span>
                <span className="font-semibold text-gray-900">18 days</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Your recovery vs. similar stores</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">You</span>
                  <span className="font-semibold">${results.monthlyRecovery.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: Math.min((results.monthlyRecovery / 22500) * 62, 100) + '%' }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Similar Stores</span>
                  <span className="text-sm text-gray-600">$22,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center">
          <button
            onClick={startTrial}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            Start Recovering Revenue
          </button>
          
          <div className="flex items-center justify-center space-x-2 text-orange-600 mt-4">
            <span className="text-xl">🚀</span>
            <span className="font-medium">
              <strong>934 stores</strong> recovering carts with AI
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}