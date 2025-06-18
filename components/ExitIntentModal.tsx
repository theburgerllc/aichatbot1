'use client'

import { useState, useEffect } from 'react'

interface ExitIntentModalProps {
  show: boolean
  onClose: () => void
  industry: string
}

const industryStats = {
  healthcare: '847 healthcare practices',
  legal: '623 law firms', 
  ecommerce: '934 online stores',
  default: '2,400+ businesses'
}

export function ExitIntentModal({ show, onClose, industry }: ExitIntentModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      // Add animation delay
      setTimeout(() => setIsVisible(true), 100)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Track modal shown
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exit_intent_shown', {
          event_category: 'conversion_opportunity',
          industry,
          trigger_method: 'mouse_leave'
        })
      }
    } else {
      setIsVisible(false)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [show, industry])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_closed', {
        event_category: 'conversion_opportunity',
        industry
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return
    
    setIsSubmitting(true)

    // Track email submission
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_submit', {
        event_category: 'lead_generation',
        email,
        industry,
        discount_claimed: true
      })
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Show success message
    alert('Discount claimed! Check your email for details.')
    
    setIsSubmitting(false)
    handleClose()
  }

  if (!show) return null

  const industryText = industryStats[industry as keyof typeof industryStats] || industryStats.default

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            data-gtm="exit_intent_close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Wait! Get 15% off your first 3 months
              </h2>
              <p className="text-gray-600">
                See why {industryText} joined this month
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  data-gtm="exit_intent_email_input"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                data-gtm="exit_intent_submit"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Claiming Discount...</span>
                  </div>
                ) : (
                  'Claim My Discount'
                )}
              </button>
            </form>
            
            {/* Trust indicators */}
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                <span>No spam, unsubscribe anytime</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                <span>{industryText} joined this month</span>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}