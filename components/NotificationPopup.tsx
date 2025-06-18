'use client'

import { useState, useEffect } from 'react'

interface NotificationPopupProps {
  show: boolean
  onClose: () => void
  industry: string
}

const industryNotifications = {
  healthcare: [
    "Medical Practice in California just started their free trial",
    "Dental Clinic in Texas upgraded to Pro plan",
    "Healthcare Group in Florida saved $12K this month"
  ],
  legal: [
    "Law Firm in New York just started their free trial",
    "Legal Practice in Illinois converted 47 leads today", 
    "Attorney in Georgia saved 15 hours this week"
  ],
  ecommerce: [
    "E-commerce Store in Miami just started their free trial",
    "Online Retailer in Seattle recovered $3,200 today",
    "Shopify Store in Portland increased conversions 34%"
  ],
  default: [
    "Business in Your Area just started their free trial",
    "Local Company upgraded to Pro plan",
    "Nearby Business saved thousands this month"
  ]
}

export function NotificationPopup({ show, onClose, industry }: NotificationPopupProps) {
  const [currentNotification, setCurrentNotification] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      const notifications = industryNotifications[industry as keyof typeof industryNotifications] || industryNotifications.default
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
      setCurrentNotification(randomNotification)
      
      // Show with animation
      setTimeout(() => setIsVisible(true), 100)
      
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 4000)

      // Track notification shown
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'notification_shown', {
          event_category: 'social_proof',
          notification_text: randomNotification,
          industry
        })
      }

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, industry])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300) // Wait for exit animation

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'notification_closed', {
        event_category: 'social_proof',
        industry
      })
    }
  }

  if (!show) return null

  const [title, message] = currentNotification.split(' just ')

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🎉</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {title}
            </div>
            <div className="text-sm text-gray-600">
              just {message || 'took action'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Just now
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            data-gtm="notification_close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full animate-shrink"
            style={{ 
              width: '100%',
              animation: 'shrink 4s linear forwards'
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink {
          animation: shrink 4s linear forwards;
        }
      `}</style>
    </div>
  )
}