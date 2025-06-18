'use client'

import Link from 'next/link'

interface CalculatorHubProps {
  onCalculatorSelect: (industry: string) => void
}

export function CalculatorHub({ onCalculatorSelect }: CalculatorHubProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              data-gtm="calculator_back_to_home"
            >
              ← Back to Home
            </Link>
            
            <div className="text-center">
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">12,847</span> businesses calculated ROI this month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Calculate Your ROI in 30 Seconds
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See your exact monthly savings with AI chatbots. No email required to start.
          </p>
        </div>

        {/* Industry Calculator Selection */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          
          {/* Healthcare Calculator */}
          <div 
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            onClick={() => onCalculatorSelect('healthcare')}
            data-gtm="calculator_healthcare_selected"
          >
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Healthcare Practice</h3>
              <p className="text-gray-600 mb-6">
                Patient scheduling, insurance verification, appointment reminders
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <span className="text-sm text-blue-600 font-medium">
                  Average Savings: <strong className="text-blue-700">$43,702/mo</strong>
                </span>
              </div>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors group-hover:bg-blue-700">
                Calculate Healthcare ROI
              </button>
            </div>
          </div>

          {/* Legal Calculator */}
          <div 
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            onClick={() => onCalculatorSelect('legal')}
            data-gtm="calculator_legal_selected"
          >
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Legal Practice</h3>
              <p className="text-gray-600 mb-6">
                Lead qualification, consultation scheduling, case intake
              </p>
              
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <span className="text-sm text-purple-600 font-medium">
                  Average Growth: <strong className="text-purple-700">$67,500/mo</strong>
                </span>
              </div>
              
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors group-hover:bg-purple-700">
                Calculate Legal ROI
              </button>
            </div>
          </div>

          {/* E-commerce Calculator */}
          <div 
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            onClick={() => onCalculatorSelect('ecommerce')}
            data-gtm="calculator_ecommerce_selected"
          >
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">E-commerce Store</h3>
              <p className="text-gray-600 mb-6">
                Cart recovery, customer support, order tracking
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <span className="text-sm text-green-600 font-medium">
                  Average Recovery: <strong className="text-green-700">$32,000/mo</strong>
                </span>
              </div>
              
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors group-hover:bg-green-700">
                Calculate E-commerce ROI
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔒</span>
            <span>No Email Required</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg">⏱️</span>
            <span>30 Second Results</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎯</span>
            <span>Industry-Specific</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg">📊</span>
            <span>Real Data Sources</span>
          </div>
        </div>
      </div>
    </div>
  )
}