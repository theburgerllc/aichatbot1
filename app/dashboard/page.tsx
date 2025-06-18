'use client'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

interface MetricData {
  value: number
  unit: string
  target: number
  trend: number
  trendDirection: 'up' | 'down'
  progressPercentage: number
}

interface FunnelStage {
  id: number
  name: string
  count: number
  rate: number
}

interface ABTest {
  id: string
  name: string
  status: 'running' | 'completed' | 'paused'
  variants: Array<{
    name: string
    conversionRate: number
    sampleSize: number
    isWinner?: boolean
  }>
  confidence: number
  improvement: number
}

interface ActivityItem {
  id: string
  type: 'demo_completed' | 'trial_started' | 'calculator_used' | 'email_captured'
  timestamp: number
  location: string
  industry: string
}

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([])
  
  const funnelChartRef = useRef<HTMLCanvasElement>(null)

  // Sample data (in a real app, this would come from an API)
  const metrics: Record<string, MetricData> = {
    demoCTR: {
      value: 28.3,
      unit: '%',
      target: 32.25,
      trend: 2.1,
      trendDirection: 'up',
      progressPercentage: 87.8
    },
    trialConversion: {
      value: 8.7,
      unit: '%',
      target: 11.7,
      trend: 0.4,
      trendDirection: 'up',
      progressPercentage: 74.4
    },
    calcCompletion: {
      value: 71.2,
      unit: '%',
      target: 75,
      trend: -1.8,
      trendDirection: 'down',
      progressPercentage: 94.9
    }
  }

  const industryPerformance = [
    { name: 'Healthcare', rate: 11.2, progressPercentage: 95.7, color: 'blue' },
    { name: 'Legal', rate: 9.8, progressPercentage: 83.8, color: 'purple' },
    { name: 'E-commerce', rate: 12.4, progressPercentage: 106.0, color: 'green' }
  ]

  const funnelStages: FunnelStage[] = [
    { id: 1, name: 'Page Views', count: 12847, rate: 100 },
    { id: 2, name: 'Demo Clicks', count: 3635, rate: 28.3 },
    { id: 3, name: 'Demo Completed', count: 2836, rate: 78.0 },
    { id: 4, name: 'Calculator Used', count: 1847, rate: 65.1 },
    { id: 5, name: 'Email Captured', count: 923, rate: 50.0 },
    { id: 6, name: 'Trial Started', count: 316, rate: 34.2 }
  ]

  const abTests: ABTest[] = [
    {
      id: 'homepage-headlines',
      name: 'Homepage Headlines',
      status: 'running',
      variants: [
        { name: 'A: "Save $43K Daily"', conversionRate: 32.1, sampleSize: 2847, isWinner: true },
        { name: 'B: "Cut Costs 68%"', conversionRate: 27.8, sampleSize: 2834 }
      ],
      confidence: 95,
      improvement: 15.5
    },
    {
      id: 'cta-buttons',
      name: 'CTA Button Text',
      status: 'running',
      variants: [
        { name: 'A: "Start Free Trial"', conversionRate: 64.2, sampleSize: 1402, isWinner: true },
        { name: 'B: "Get Started"', conversionRate: 58.9, sampleSize: 1398 }
      ],
      confidence: 99,
      improvement: 12.8
    }
  ]

  const geographicActivity = [
    { region: 'West Coast', count: 847, position: { left: '10%', top: '20%', width: '15%', height: '60%' }, activity: 'active' },
    { region: 'Midwest', count: 423, position: { left: '35%', top: '15%', width: '20%', height: '50%' }, activity: 'normal' },
    { region: 'Northeast', count: 1234, position: { left: '65%', top: '10%', width: '18%', height: '45%' }, activity: 'very-active' },
    { region: 'Southeast', count: 567, position: { left: '55%', top: '45%', width: '25%', height: '40%' }, activity: 'normal' }
  ]

  // Generate sample activity items
  const generateActivityItem = (): ActivityItem => {
    const types: ActivityItem['type'][] = ['demo_completed', 'trial_started', 'calculator_used', 'email_captured']
    const locations = ['San Francisco, CA', 'New York, NY', 'Chicago, IL', 'Austin, TX', 'Miami, FL', 'Seattle, WA']
    const industries = ['Healthcare', 'Legal', 'E-commerce']
    
    return {
      id: Math.random().toString(36).substring(7),
      type: types[Math.floor(Math.random() * types.length)],
      timestamp: Date.now(),
      location: locations[Math.floor(Math.random() * locations.length)],
      industry: industries[Math.floor(Math.random() * industries.length)]
    }
  }

  // Effects
  useEffect(() => {
    // Initialize with some activity items
    const initialActivity = Array.from({ length: 10 }, generateActivityItem)
    setActivityFeed(initialActivity)

    // Set up real-time activity simulation
    const activityInterval = setInterval(() => {
      setActivityFeed(prev => {
        const newItem = generateActivityItem()
        return [newItem, ...prev.slice(0, 19)] // Keep last 20 items
      })
    }, 3000)

    return () => clearInterval(activityInterval)
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const refreshInterval = setInterval(() => {
        refreshDashboard()
      }, 30000) // 30 seconds

      return () => clearInterval(refreshInterval)
    }
  }, [autoRefresh])

  useEffect(() => {
    // Create funnel chart
    if (funnelChartRef.current) {
      const ctx = funnelChartRef.current.getContext('2d')
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: funnelStages.map(stage => stage.name),
            datasets: [{
              data: funnelStages.map(stage => stage.count),
              backgroundColor: [
                '#3B82F6',
                '#6366F1',
                '#8B5CF6',
                '#A855F7',
                '#C084FC',
                '#DDD6FE'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#F3F4F6'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
      }
    }
  }, [])

  const refreshDashboard = async () => {
    setIsRefreshing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatActivityType = (type: ActivityItem['type']) => {
    switch (type) {
      case 'demo_completed': return '🎬 Demo Completed'
      case 'trial_started': return '🚀 Trial Started'
      case 'calculator_used': return '🧮 Calculator Used'
      case 'email_captured': return '📧 Email Captured'
      default: return type
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes === 1) return '1 minute ago'
    return `${minutes} minutes ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
      
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🚀 CRO Dashboard
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                Last updated: {formatTime(lastUpdated)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshDashboard}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <span className={`${isRefreshing ? 'animate-spin' : ''}`}>🔄</span>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (30s)
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Key Metrics Overview */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Demo CTR */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-700">Demo Click-Through Rate</h3>
                <span className="text-xs text-gray-500">Last 24h</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-gray-900">{metrics.demoCTR.value}</span>
                <span className="text-sm text-gray-500">{metrics.demoCTR.unit}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Target: {metrics.demoCTR.target}%
              </div>
              <div className="flex items-center gap-1 mb-3">
                <span className="text-green-600">↑</span>
                <span className="text-sm text-green-600">+{metrics.demoCTR.trend}%</span>
                <span className="text-xs text-gray-500">vs yesterday</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${metrics.demoCTR.progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.demoCTR.progressPercentage}% of target
              </div>
            </div>

            {/* Trial Conversion */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-700">Trial Conversion Rate</h3>
                <span className="text-xs text-gray-500">Last 24h</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-gray-900">{metrics.trialConversion.value}</span>
                <span className="text-sm text-gray-500">{metrics.trialConversion.unit}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Target: {metrics.trialConversion.target}%
              </div>
              <div className="flex items-center gap-1 mb-3">
                <span className="text-green-600">↑</span>
                <span className="text-sm text-green-600">+{metrics.trialConversion.trend}%</span>
                <span className="text-xs text-gray-500">vs yesterday</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${metrics.trialConversion.progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.trialConversion.progressPercentage}% of target
              </div>
            </div>

            {/* Calculator Completion */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-700">Calculator Completion</h3>
                <span className="text-xs text-gray-500">Last 24h</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-gray-900">{metrics.calcCompletion.value}</span>
                <span className="text-sm text-gray-500">{metrics.calcCompletion.unit}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Target: {metrics.calcCompletion.target}%
              </div>
              <div className="flex items-center gap-1 mb-3">
                <span className="text-red-600">↓</span>
                <span className="text-sm text-red-600">{metrics.calcCompletion.trend}%</span>
                <span className="text-xs text-gray-500">vs yesterday</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${metrics.calcCompletion.progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.calcCompletion.progressPercentage}% of target
              </div>
            </div>

            {/* Industry Performance */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-700">Industry Performance</h3>
                <span className="text-xs text-gray-500">Conversion rates</span>
              </div>
              <div className="space-y-3">
                {industryPerformance.map((industry) => (
                  <div key={industry.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{industry.name}</span>
                      <span className="text-sm font-medium">{industry.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          industry.color === 'blue' ? 'bg-blue-500' :
                          industry.color === 'purple' ? 'bg-purple-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(industry.progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Conversion Funnel */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Conversion Funnel Analysis</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-80">
                <canvas ref={funnelChartRef}></canvas>
              </div>
              <div className="space-y-4">
                {funnelStages.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {stage.id}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{stage.name}</div>
                      <div className="text-2xl font-bold text-gray-900">{stage.count.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{stage.rate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* A/B Tests */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Active A/B Tests</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {abTests.map((test) => (
              <div key={test.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-900">{test.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    test.status === 'running' ? 'bg-green-100 text-green-800' :
                    test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  {test.variants.map((variant, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border-2 ${
                      variant.isWinner ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{variant.name}</span>
                        {variant.isWinner && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Winner</span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="font-medium">{variant.conversionRate}%</span>
                        <span>{variant.sampleSize.toLocaleString()} visitors</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{test.confidence}% Confidence</span>
                    <span className="text-green-600 font-medium">+{test.improvement}% improvement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Activity */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Real-time Activity</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Live Conversions</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activityFeed.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg">{formatActivityType(item.type).split(' ')[0]}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{formatActivityType(item.type).split(' ').slice(1).join(' ')}</div>
                      <div className="text-xs text-gray-500">{item.location} • {item.industry}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Map */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Geographic Activity</h3>
              <div className="relative bg-gray-100 rounded-lg h-80 overflow-hidden">
                {geographicActivity.map((region) => (
                  <div
                    key={region.region}
                    className={`absolute rounded-lg p-2 text-center text-white text-xs font-medium transition-all ${
                      region.activity === 'very-active' ? 'bg-green-600' :
                      region.activity === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                    style={region.position}
                  >
                    <div className="font-semibold">{region.region}</div>
                    <div className="text-lg font-bold">{region.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}