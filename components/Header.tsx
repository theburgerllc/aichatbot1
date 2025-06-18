'use client'

import { useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  currentIndustry: string
}

export function Header({ currentIndustry }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleStartTrial = () => {
    // Track analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'header_trial_click', {
        event_category: 'conversion_tracking',
        industry: currentIndustry
      })
    }
    
    // Redirect to trial signup
    window.location.href = `/signup?industry=${currentIndustry}`
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-3 text-gray-900 hover:text-gray-700 transition-colors"
              data-gtm="header_logo_click"
            >
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 40 40" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 12L28 20L20 28L12 20L20 12Z" fill="white"/>
                </svg>
              </div>
              <span className="text-xl font-semibold hidden sm:block">
                AI Chatbot Solutions
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
                data-gtm="header_industries_click"
              >
                <span>Industries</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link 
                    href="/healthcare" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    data-gtm="header_healthcare_click"
                  >
                    Healthcare
                  </Link>
                  <Link 
                    href="/legal" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    data-gtm="header_legal_click"
                  >
                    Legal
                  </Link>
                  <Link 
                    href="/ecommerce" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    data-gtm="header_ecommerce_click"
                  >
                    Ecommerce
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* CTAs */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/pricing" 
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              data-gtm="header_pricing_click"
            >
              See Pricing
            </Link>
            
            <Link 
              href="/demo" 
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              data-gtm="header_demo_click"
            >
              Interactive Demo
            </Link>
            
            <button 
              onClick={handleStartTrial}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              data-gtm="header_trial_click"
            >
              Start My Free Trial
            </button>

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              data-gtm="mobile_menu_toggle"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <div className="px-4 py-2">
                <div className="text-sm font-medium text-gray-900 mb-2">Industries</div>
                <div className="space-y-1 ml-4">
                  <Link href="/healthcare" className="block py-1 text-sm text-gray-700">Healthcare</Link>
                  <Link href="/legal" className="block py-1 text-sm text-gray-700">Legal</Link>
                  <Link href="/ecommerce" className="block py-1 text-sm text-gray-700">Ecommerce</Link>
                </div>
              </div>
              
              <Link 
                href="/pricing" 
                className="block px-4 py-2 text-sm text-gray-700"
              >
                See Pricing
              </Link>
              
              <Link 
                href="/demo" 
                className="block px-4 py-2 text-sm text-gray-700"
              >
                Interactive Demo
              </Link>
              
              <div className="px-4 py-2">
                <button 
                  onClick={handleStartTrial}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors"
                >
                  Start My Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// Window interface is now declared in types/global.d.ts