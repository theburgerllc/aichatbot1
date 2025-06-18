'use client'

import { useState, useEffect, useCallback } from 'react'
import Script from 'next/script'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { SocialProofNotification } from '@/components/SocialProofNotification'
import { ExitIntentModal } from '@/components/ExitIntentModal'
import { DemoModal } from '@/components/DemoModal'
import { CalculatorModal } from '@/components/CalculatorModal'

// Industry-specific data
const industryData = {
  healthcare: {
    headlines: ["Save $43,702 Daily with HIPAA-Compliant AI"],
    testimonials: {
      quote: "Reduced patient wait times by 73% and saved $2,400 monthly on staff costs.",
      author: "Dr. Sarah Chen, Family Practice"
    },
    notifications: [
      "Medical Practice in California just started their free trial",
      "Dental Clinic in Texas upgraded to Pro plan", 
      "Healthcare Group in Florida saved $12K this month"
    ],
    videoSrc: "/demo-healthcare"
  },
  legal: {
    headlines: ["Convert 35% More Leads Starting Tonight"],
    testimonials: {
      quote: "Converted 34% more leads and automated 80% of initial consultations.",
      author: "Michael Torres, Personal Injury Law"
    },
    notifications: [
      "Law Firm in New York just started their free trial",
      "Legal Practice in Illinois converted 47 leads today",
      "Attorney in Georgia saved 15 hours this week"
    ],
    videoSrc: "/demo-legal"
  },
  ecommerce: {
    headlines: ["Recover $32,000 Monthly from Abandoned Carts"],
    testimonials: {
      quote: "Recovered $28K in abandoned carts and increased customer satisfaction 45%.",
      author: "Lisa Park, Online Retailer"
    },
    notifications: [
      "E-commerce Store in Miami just started their free trial",
      "Online Retailer in Seattle recovered $3,200 today",
      "Shopify Store in Portland increased conversions 34%"
    ],
    videoSrc: "/demo-ecommerce"
  }
}

type Industry = keyof typeof industryData | 'default'

export default function HomePage() {
  const [currentIndustry, setCurrentIndustry] = useState<Industry>('default')
  const [isClient, setIsClient] = useState(false)
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [showCalculatorModal, setShowCalculatorModal] = useState(false)

  // Track analytics events
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties)
    }
    
    // Send to our analytics API
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties })
    }).catch(() => {
      // Silently fail if analytics is unavailable
    })
  }, [])

  // Industry detection logic
  const detectIndustry = useCallback((): Industry => {
    if (typeof window === 'undefined') return 'default'
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const industryParam = urlParams.get('industry')
    if (industryParam && industryParam in industryData) {
      return industryParam as Industry
    }

    // Check referrer for industry keywords
    const referrer = document.referrer.toLowerCase()
    if (referrer.includes('health') || referrer.includes('medical')) return 'healthcare'
    if (referrer.includes('legal') || referrer.includes('law')) return 'legal'
    if (referrer.includes('shop') || referrer.includes('ecommerce')) return 'ecommerce'

    // Check user agent (rough heuristic)
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('medical') || userAgent.includes('health')) return 'healthcare'

    // Time-based fallback (business hours heuristic)
    const hour = new Date().getHours()
    if (hour >= 9 && hour <= 17) {
      // Business hours - more likely to be B2B
      return Math.random() > 0.5 ? 'healthcare' : 'legal'
    }

    return 'ecommerce' // Evening/weekend users more likely e-commerce
  }, [])

  // Initialize industry detection
  useEffect(() => {
    setIsClient(true)
    const detected = detectIndustry()
    setCurrentIndustry(detected)
    
    trackEvent('page_view', {
      industry: detected,
      page: 'home',
      timestamp: Date.now()
    })
  }, [detectIndustry, trackEvent])

  // Exit intent detection
  useEffect(() => {
    if (!isClient) return

    let mouseLeaveCount = 0
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentTriggered) {
        mouseLeaveCount++
        if (mouseLeaveCount >= 2) {
          setExitIntentTriggered(true)
          setShowExitModal(true)
          trackEvent('exit_intent_triggered', {
            industry: currentIndustry,
            mouseLeaveCount
          })
        }
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [isClient, exitIntentTriggered, currentIndustry, trackEvent])

  // Social proof notifications
  useEffect(() => {
    if (!isClient) return

    const showRandomNotification = () => {
      if (currentIndustry === 'default') return
      
      const notifications = industryData[currentIndustry as keyof typeof industryData]?.notifications
      if (notifications) {
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 4000)
      }
    }

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(showRandomNotification, 3000)
    
    // Then show notifications every 15-25 seconds
    const interval = setInterval(showRandomNotification, 
      15000 + Math.random() * 10000
    )

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [isClient, currentIndustry])

  // Global functions for HTML event handlers (temporary during migration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.startTrial = () => {
        trackEvent('trial_started', { industry: currentIndustry, source: 'homepage' })
        window.location.href = '/signup'
      }
      
      window.openDemo = () => setShowDemoModal(true)
      window.closeDemo = () => setShowDemoModal(false)
      window.openCalculator = () => setShowCalculatorModal(true)
      window.closeCalculator = () => setShowCalculatorModal(false)
      window.closeNotification = () => setShowNotification(false)
    }
  }, [currentIndustry, trackEvent])

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-XXXXXXX');
        `}
      </Script>

      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      <div className="min-h-screen">
        <Header />
        
        <Hero 
          currentIndustry={currentIndustry}
          industryData={industryData}
          onOpenDemo={() => setShowDemoModal(true)}
          onOpenCalculator={() => setShowCalculatorModal(true)}
          trackEvent={trackEvent}
        />

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why 9,500+ Businesses Trust Our AI
              </h2>
              <p className="text-xl text-gray-600">
                Industry-leading features designed for your success
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Setup in 5 Minutes</h3>
                <p className="text-gray-600">Deploy on your website with just 3 lines of code</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
                <p className="text-gray-600">Enterprise-grade security for healthcare data</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">73% Efficiency Gain</h3>
                <p className="text-gray-600">Automate repetitive tasks and focus on growth</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Trusted by Industry Leaders
            </h2>
            
            {currentIndustry !== 'default' && industryData[currentIndustry as keyof typeof industryData] && (
              <div className="bg-gray-50 p-8 rounded-lg">
                <blockquote className="text-xl text-gray-700 mb-4 italic">
                  "{industryData[currentIndustry as keyof typeof industryData].testimonials.quote}"
                </blockquote>
                <cite className="text-gray-600 font-medium">
                  — {industryData[currentIndustry as keyof typeof industryData].testimonials.author}
                </cite>
              </div>
            )}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-amber-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of businesses already saving time and money with AI automation
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowDemoModal(true)}
                className="px-8 py-3 bg-white text-amber-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Watch Demo
              </button>
              <button 
                onClick={() => {
                  trackEvent('trial_started', { industry: currentIndustry, source: 'bottom_cta' })
                  window.location.href = '/signup'
                }}
                className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Modals and Notifications */}
      <SocialProofNotification 
        show={showNotification}
        industry={currentIndustry}
        industryData={industryData}
        onClose={() => setShowNotification(false)}
      />
      
      <ExitIntentModal 
        show={showExitModal}
        industry={currentIndustry}
        onClose={() => setShowExitModal(false)}
        trackEvent={trackEvent}
      />
      
      <DemoModal 
        show={showDemoModal}
        industry={currentIndustry}
        industryData={industryData}
        onClose={() => setShowDemoModal(false)}
        trackEvent={trackEvent}
      />
      
      <CalculatorModal 
        show={showCalculatorModal}
        industry={currentIndustry}
        onClose={() => setShowCalculatorModal(false)}
        trackEvent={trackEvent}
      />

      {/* Analytics Script */}
      <Script src="/analytics-tracking.js" strategy="lazyOnload" />
    </>
  )
}

// Global function declarations for backward compatibility
declare global {
  interface Window {
    startTrial: () => void
    openDemo: () => void
    closeDemo: () => void
    openCalculator: () => void
    closeCalculator: () => void
    closeNotification: () => void
  }
}