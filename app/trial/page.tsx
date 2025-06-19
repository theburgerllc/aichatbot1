import { Metadata } from 'next';
import TrialSignup from '@/components/trial-signup';

export const metadata: Metadata = {
  title: 'Start Your Free Trial | AI Chatbot Solutions',
  description: 'Start your 14-day free trial of our AI chatbot platform. No credit card required.',
  openGraph: {
    title: 'Start Your Free Trial | AI Chatbot Solutions',
    description: 'Start your 14-day free trial of our AI chatbot platform. No credit card required.',
    type: 'website',
  },
};

export default function TrialPage() {
  const handleTrialSuccess = (data: any) => {
    console.log('Trial signup successful:', data);
    
    // Track successful trial signup
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'trial_signup_complete', {
        event_category: 'conversion',
        event_label: 'trial',
        value: 1
      });
    }
  };

  const handleTrialError = (error: string) => {
    console.error('Trial signup error:', error);
    
    // Track failed trial signup
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'trial_signup_error', {
        event_category: 'error',
        event_label: error,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Business?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of businesses using AI chatbots to improve customer engagement, 
            reduce support costs, and increase conversions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Setup</h3>
            <p className="text-gray-600">Get your chatbot up and running in minutes, not weeks.</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">Track performance and optimize your chatbot with detailed insights.</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75A9.75 9.75 0 0112 2.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600">Get help when you need it with our dedicated support team.</p>
          </div>
        </div>

        {/* Trial Signup Form */}
        <div className="flex justify-center">
          <TrialSignup
            planId="standard-trial"
            onSuccess={handleTrialSuccess}
            onError={handleTrialError}
          />
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 mb-4">Trusted by over 10,000+ businesses worldwide</p>
          <div className="flex items-center justify-center space-x-8 opacity-60">
            <div className="text-sm font-medium text-gray-400">Enterprise Security</div>
            <div className="text-sm font-medium text-gray-400">SOC 2 Compliant</div>
            <div className="text-sm font-medium text-gray-400">99.9% Uptime</div>
            <div className="text-sm font-medium text-gray-400">GDPR Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}