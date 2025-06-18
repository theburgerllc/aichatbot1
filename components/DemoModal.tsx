'use client'

interface DemoModalProps {
  show: boolean
  industry: string
  industryData: any
  onClose: () => void
  trackEvent: (event: string, properties?: Record<string, any>) => void
}

export function DemoModal({ 
  show, 
  industry, 
  industryData, 
  onClose, 
  trackEvent 
}: DemoModalProps) {
  if (!show) return null

  const handleVideoPlay = () => {
    trackEvent('demo_video_play', {
      industry,
      source: 'demo_modal'
    })
  }

  const handleStartTrial = () => {
    trackEvent('demo_modal_trial', {
      industry,
      source: 'demo_modal'
    })
    window.location.href = `/signup?industry=${industry}&source=demo`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            data-gtm="demo_modal_close"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Video Container */}
          <div className="relative bg-black rounded-t-xl">
            <video
              id="demoVideo"
              className="w-full h-auto rounded-t-xl"
              controls
              onPlay={handleVideoPlay}
              data-gtm="demo_video_play"
              poster="/video-thumbnail.jpg"
            >
              <source src="/full-demo.mp4" type="video/mp4" />
              <source src="/full-demo.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* CTA Section */}
          <div className="p-6 text-center bg-white rounded-b-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to get started?
            </h3>
            <p className="text-gray-600 mb-4">
              Join thousands of {industry === 'healthcare' ? 'healthcare practices' : 
                              industry === 'legal' ? 'law firms' : 
                              industry === 'ecommerce' ? 'online stores' : 'businesses'} already using our AI
            </p>
            <button
              onClick={handleStartTrial}
              className="px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
              data-gtm="demo_modal_trial"
            >
              Start My Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}