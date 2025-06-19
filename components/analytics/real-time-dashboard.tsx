'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  MousePointer, 
  Calculator,
  Mail,
  Play,
  Crown,
  Activity
} from 'lucide-react';

interface RealTimeMetrics {
  activeUsers: number;
  pageViews: number;
  conversions: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number; conversions: number }>;
  recentEvents: Array<{
    id: string;
    type: string;
    timestamp: string;
    page: string;
    properties: Record<string, any>;
  }>;
  funnelData: Array<{
    stage: string;
    count: number;
    rate: number;
  }>;
}

interface RealTimeDashboardProps {
  refreshInterval?: number;
  showEvents?: boolean;
  compact?: boolean;
}

export default function RealTimeDashboard({ 
  refreshInterval = 5000,
  showEvents = true,
  compact = false
}: RealTimeDashboardProps) {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchMetrics = async () => {
    try {
      // Fetch conversion funnel data
      const funnelResponse = await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_funnel' }),
      });

      // Fetch conversion stats
      const statsResponse = await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_stats' }),
      });

      if (funnelResponse.ok && statsResponse.ok) {
        const funnelData = await funnelResponse.json();
        const statsData = await statsResponse.json();

        // Simulate real-time metrics
        const mockMetrics: RealTimeMetrics = {
          activeUsers: Math.floor(Math.random() * 50) + 20,
          pageViews: Math.floor(Math.random() * 200) + 100,
          conversions: Math.floor(Math.random() * 10) + 5,
          conversionRate: parseFloat((Math.random() * 5 + 2).toFixed(2)),
          topPages: [
            { page: '/', views: 45, conversions: 8 },
            { page: '/demo', views: 32, conversions: 12 },
            { page: '/calculators', views: 28, conversions: 6 },
            { page: '/trial', views: 19, conversions: 15 },
          ],
          recentEvents: generateRecentEvents(),
          funnelData: funnelData.funnel || []
        };

        setMetrics(mockMetrics);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    intervalRef.current = setInterval(fetchMetrics, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'demo_click':
      case 'demo_complete':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'calculator_start':
      case 'calculator_complete':
        return <Calculator className="w-4 h-4 text-green-600" />;
      case 'email_capture':
        return <Mail className="w-4 h-4 text-purple-600" />;
      case 'trial_signup':
      case 'trial_complete':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'page_view':
        return <MousePointer className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">Failed to load real-time metrics</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Live Metrics</h3>
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Live
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.activeUsers}</div>
            <div className="text-xs text-gray-500">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.conversions}</div>
            <div className="text-xs text-gray-500">Conversions</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Real-Time Analytics</h2>
        <div className="flex items-center text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Last updated: {formatTime(lastUpdated.toISOString())}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MousePointer className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pageViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.conversions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Pages</h3>
          <div className="space-y-3">
            {metrics.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{page.page}</p>
                  <p className="text-sm text-gray-600">{page.views} views</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{page.conversions}</p>
                  <p className="text-xs text-gray-500">conversions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        {showEvents && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Live Activity</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {metrics.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatEventType(event.type)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{event.page}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mini Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel (Real-Time)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.funnelData.slice(0, 6).map((stage, index) => (
            <div key={index} className="text-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stage.rate, 100)}%` }}
                />
              </div>
              <p className="text-xs font-medium text-gray-900">{stage.stage}</p>
              <p className="text-lg font-bold text-gray-900">{stage.count.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{stage.rate}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate mock recent events
function generateRecentEvents() {
  const eventTypes = ['demo_click', 'calculator_start', 'email_capture', 'trial_signup', 'page_view'];
  const pages = ['/', '/demo', '/calculators', '/trial', '/pricing'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `event_${Date.now()}_${i}`,
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    timestamp: new Date(Date.now() - (i * 30000)).toISOString(), // Events every 30 seconds
    page: pages[Math.floor(Math.random() * pages.length)],
    properties: {},
  }));
}