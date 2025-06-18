'use client'

import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    // For now, redirect to the static HTML version
    // This preserves existing functionality while we migrate
    window.location.href = '/index.html'
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading AI Chatbot Solutions...</h1>
        <p className="mt-2 text-gray-600">Redirecting to main application...</p>
      </div>
    </div>
  )
}