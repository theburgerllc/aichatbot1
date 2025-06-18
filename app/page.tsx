'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { ConversionTrifecta } from '@/components/ConversionTrifecta'
import { NotificationPopup } from '@/components/NotificationPopup'
import { ExitIntentModal } from '@/components/ExitIntentModal'

export default function HomePage() {
  const [currentIndustry, setCurrentIndustry] = useState('default')
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    // Initialize industry detection
    const industry = detectIndustry()
    setCurrentIndustry(industry)

    // Start notification system
    const notificationTimer = setTimeout(() => {
      setShowNotification(true)
    }, 8000)

    // Exit intent detection
    let mouseLeaveCount = 0
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        mouseLeaveCount++
        if (mouseLeaveCount >= 2) {
          setTimeout(() => setShowExitIntent(true), 500)
        }
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearTimeout(notificationTimer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm-script" strategy="beforeInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-XXXXXXX');`}
      </Script>

      {/* GTM NoScript */}
      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      {/* Main Content */}
      <Header currentIndustry={currentIndustry} />
      
      <main>
        <HeroSection currentIndustry={currentIndustry} />
        <ConversionTrifecta currentIndustry={currentIndustry} />
      </main>

      {/* Modals and Popups */}
      <NotificationPopup 
        show={showNotification}
        onClose={() => setShowNotification(false)}
        industry={currentIndustry}
      />
      
      <ExitIntentModal 
        show={showExitIntent}
        onClose={() => setShowExitIntent(false)}
        industry={currentIndustry}
      />
    </>
  )
}

// Industry detection utility
function detectIndustry(): string {
  if (typeof window === 'undefined') return 'default'
  
  const urlParams = new URLSearchParams(window.location.search)
  const referrer = document.referrer.toLowerCase()
  const currentHour = new Date().getHours()
  const isMobile = window.innerWidth <= 768

  // Priority 1: URL parameters
  if (urlParams.get('industry')) {
    return urlParams.get('industry') || 'default'
  }

  // Priority 2: Referrer analysis
  if (referrer.includes('healthcare') || referrer.includes('medical') || referrer.includes('doctor')) {
    return 'healthcare'
  }
  
  if (referrer.includes('legal') || referrer.includes('law') || referrer.includes('attorney')) {
    return 'legal'
  }
  
  if (referrer.includes('shop') || referrer.includes('ecommerce') || referrer.includes('store')) {
    return 'ecommerce'
  }

  // Priority 3: Time-based detection (business hours = professional services)
  if (currentHour >= 9 && currentHour <= 17) {
    return Math.random() > 0.5 ? 'healthcare' : 'legal'
  }
  
  // Priority 4: Device-based detection (mobile = higher ecommerce probability)
  if (isMobile && Math.random() > 0.4) {
    return 'ecommerce'
  }
  
  // Priority 5: Random selection weighted by conversion data
  const weights = { healthcare: 0.4, legal: 0.35, ecommerce: 0.25 }
  const random = Math.random()
  if (random < weights.healthcare) {
    return 'healthcare'
  } else if (random < weights.healthcare + weights.legal) {
    return 'legal'
  } else {
    return 'ecommerce'
  }
}