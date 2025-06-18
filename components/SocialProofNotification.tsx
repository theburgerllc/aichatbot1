'use client'

import { useEffect, useState } from 'react'

interface SocialProofNotificationProps {
  show: boolean
  industry: string
  industryData: any
  onClose: () => void
}

export function SocialProofNotification({ 
  show, 
  industry, 
  industryData, 
  onClose 
}: SocialProofNotificationProps) {
  const [currentNotification, setCurrentNotification] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for fade out animation
      }, 4000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, onClose])

  useEffect(() => {
    if (industry !== 'default' && industryData[industry]) {
      const notifications = industryData[industry].notifications
      if (notifications && notifications.length > 0) {
        // Rotate through notifications
        setCurrentNotification(Math.floor(Math.random() * notifications.length))
      }
    }
  }, [industry, industryData])

  if (!show || industry === 'default' || !industryData[industry]) {
    return null
  }

  const notifications = industryData[industry].notifications
  const notificationText = notifications?.[currentNotification] || ''

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">🎉</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 mb-1">
              New Customer Success!
            </div>
            <div className="text-sm text-gray-600">
              {notificationText}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {Math.floor(Math.random() * 5) + 1} minutes ago
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            data-gtm="notification_close"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-4000 ease-linear"
            style={{ 
              width: isVisible ? '0%' : '100%',
              transition: isVisible ? 'width 4s linear' : 'none'
            }}
          />
        </div>
      </div>
    </div>
  )
}