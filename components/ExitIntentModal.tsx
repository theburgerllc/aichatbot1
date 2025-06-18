'use client'

import { useState, useEffect } from 'react'

interface ExitIntentModalProps {
  show: boolean
  industry: string
  onClose: () => void
  trackEvent: (event: string, properties?: Record<string, any>) => void
}

export function ExitIntentModal({ 
  show, 
  industry, 
  onClose, 
  trackEvent 
}: ExitIntentModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setEmail('')
      setIsSubmitting(false)
      setIsSubmitted(false)
    }
  }, [show])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      // Track the exit intent submission
      trackEvent('exit_intent_email_submitted', {
        industry,
        email,
        source: 'exit_intent_modal'
      })

      // Send to analytics/lead capture API
      await fetch('/api/track-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'exit_intent_capture',
          email,
          industry,
          timestamp: Date.now()
        })
      })

      setIsSubmitted(true)
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Failed to submit exit intent email:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    trackEvent('exit_intent_modal_closed', {
      industry,
      emailEntered: !!email,
      source: 'close_button'
    })
    onClose()
  }

  const handleOverlayClick = () => {
    trackEvent('exit_intent_modal_closed', {
      industry,
      emailEntered: !!email,
      source: 'overlay_click'
    })
    onClose()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            data-gtm="exit_intent_close"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚡</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Wait! Get 15% off your first 3 months
                </h2>
                <p className="text-gray-600">
                  See why 847 {industry === 'healthcare' ? 'healthcare practices' : 
                            industry === 'legal' ? 'law firms' : 
                            industry === 'ecommerce' ? 'online stores' : 'businesses'} joined this month
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    required
                    data-gtm="exit_intent_email_input"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-gtm="exit_intent_submit"
                >
                  {isSubmitting ? 'Getting Your Discount...' : 'Claim My 15% Discount'}
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>No spam, unsubscribe anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>847+ {industry === 'healthcare' ? 'practices' : 
                              industry === 'legal' ? 'firms' : 
                              industry === 'ecommerce' ? 'stores' : 'businesses'} joined this month</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Setup takes less than 5 minutes</span>
                </div>
              </div>

              {/* Social Proof Numbers */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">9,500+</div>
                  <div className="text-sm text-gray-600">Businesses Trust Our AI</div>
                </div>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Success! Check Your Email
              </h2>
              <p className="text-gray-600 mb-4">
                We've sent your 15% discount code and setup instructions to {email}
              </p>
              <div className="text-sm text-gray-500">
                Redirecting you to get started...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}