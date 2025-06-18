'use client'

import { useEffect } from 'react'

export default function CalculatorsPage() {
  useEffect(() => {
    // For now, redirect to the static HTML version
    // This preserves existing functionality while we migrate
    window.location.href = '/calculators.html'
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading ROI Calculator...</h1>
        <p className="mt-2 text-gray-600">Redirecting to calculator...</p>
      </div>
    </div>
  )
}