'use client'

import { useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { CalculatorHub } from '@/components/calculators/CalculatorHub'
import { HealthcareCalculator } from '@/components/calculators/HealthcareCalculator'
import { LegalCalculator } from '@/components/calculators/LegalCalculator'
import { EcommerceCalculator } from '@/components/calculators/EcommerceCalculator'

export default function CalculatorsPage() {
  const [currentCalculator, setCurrentCalculator] = useState<string | null>(null)

  const handleCalculatorSelect = (industry: string) => {
    setCurrentCalculator(industry)
    
    // Track calculator selection
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calculator_selected', {
        event_category: 'conversion_tracking',
        industry,
        timestamp: Date.now()
      })
    }
  }

  const handleBackToHub = () => {
    // Track exit from calculator
    if (currentCalculator && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calculator_exited', {
        event_category: 'conversion_tracking',
        industry: currentCalculator,
        timestamp: Date.now()
      })
    }
    
    setCurrentCalculator(null)
  }

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm-calculator" strategy="beforeInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-XXXXXXX');`}
      </Script>

      <div className="min-h-screen bg-gray-50">
        {/* Show appropriate view based on current state */}
        {!currentCalculator ? (
          <CalculatorHub onCalculatorSelect={handleCalculatorSelect} />
        ) : currentCalculator === 'healthcare' ? (
          <HealthcareCalculator onBack={handleBackToHub} />
        ) : currentCalculator === 'legal' ? (
          <LegalCalculator onBack={handleBackToHub} />
        ) : currentCalculator === 'ecommerce' ? (
          <EcommerceCalculator onBack={handleBackToHub} />
        ) : null}
      </div>
    </>
  )
}