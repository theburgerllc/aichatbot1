import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

interface ConversionEvent {
  type: 'demo_click' | 'demo_complete' | 'calculator_start' | 'calculator_complete' | 
        'email_capture' | 'trial_signup' | 'trial_complete' | 'subscription_start';
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  properties?: Record<string, any>;
  metadata?: {
    industry?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    page?: string;
    referrer?: string;
    userAgent?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
}

interface ConversionFunnel {
  stage: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeToConvert: number;
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/analytics/conversion",
    },
    async () => {
      try {
        const { action, ...data } = await request.json();
        
        logger.info('Conversion analytics request received', { action });

        switch (action) {
          case 'track_event':
            return await trackConversionEvent(data);
          case 'get_funnel':
            return await getConversionFunnel(data);
          case 'get_stats':
            return await getConversionStats(data);
          default:
            logger.warn('Invalid conversion analytics action', { action });
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
      } catch (error) {
        logger.error('Conversion analytics error', { 
          error: error instanceof Error ? error.message : error 
        });
        Sentry.captureException(error);
        return NextResponse.json(
          { error: 'Analytics processing failed' },
          { status: 500 }
        );
      }
    }
  );
}

async function trackConversionEvent(data: ConversionEvent) {
  return Sentry.startSpan(
    {
      op: "analytics.track",
      name: "Track Conversion Event",
    },
    async (span) => {
      try {
        span.setAttribute("event_type", data.type);
        span.setAttribute("has_user_id", !!data.userId);
        span.setAttribute("has_session_id", !!data.sessionId);

        const timestamp = data.timestamp || new Date().toISOString();
        const enrichedEvent = {
          ...data,
          timestamp,
          eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          receivedAt: new Date().toISOString(),
        };

        logger.info('Conversion event tracked', {
          eventType: data.type,
          userId: data.userId,
          sessionId: data.sessionId,
          industry: data.metadata?.industry,
          source: data.metadata?.source,
          timestamp
        });

        // In production, store in database and send to analytics platforms
        await Promise.all([
          storeConversionEvent(enrichedEvent),
          sendToAnalyticsPlatforms(enrichedEvent),
          updateConversionMetrics(enrichedEvent),
        ]);

        span.setAttribute("status", "success");

        return NextResponse.json({
          success: true,
          eventId: enrichedEvent.eventId,
          timestamp: enrichedEvent.timestamp,
        });
      } catch (error) {
        logger.error('Failed to track conversion event', {
          error: error instanceof Error ? error.message : error,
          eventType: data.type
        });
        
        Sentry.captureException(error);
        span.setAttribute("error", true);
        
        return NextResponse.json(
          { error: 'Failed to track conversion event' },
          { status: 500 }
        );
      }
    }
  );
}

async function getConversionFunnel(filters: any) {
  try {
    // Mock funnel data - in production, query from database
    const funnelData: ConversionFunnel[] = [
      {
        stage: 'Page Views',
        count: 12847,
        conversionRate: 100,
        dropoffRate: 0,
        avgTimeToConvert: 0,
      },
      {
        stage: 'Demo Clicks',
        count: 3635,
        conversionRate: 28.3,
        dropoffRate: 71.7,
        avgTimeToConvert: 15, // seconds
      },
      {
        stage: 'Demo Completed',
        count: 2836,
        conversionRate: 78.0,
        dropoffRate: 22.0,
        avgTimeToConvert: 180, // 3 minutes
      },
      {
        stage: 'Calculator Used',
        count: 1847,
        conversionRate: 65.1,
        dropoffRate: 34.9,
        avgTimeToConvert: 45,
      },
      {
        stage: 'Email Captured',
        count: 923,
        conversionRate: 50.0,
        dropoffRate: 50.0,
        avgTimeToConvert: 30,
      },
      {
        stage: 'Trial Started',
        count: 316,
        conversionRate: 34.2,
        dropoffRate: 65.8,
        avgTimeToConvert: 120,
      },
    ];

    logger.info('Conversion funnel data retrieved', {
      totalStages: funnelData.length,
      topConversionRate: Math.max(...funnelData.map(s => s.conversionRate)),
      filters
    });

    return NextResponse.json({
      success: true,
      funnel: funnelData,
      metadata: {
        generatedAt: new Date().toISOString(),
        filters,
        totalEntries: funnelData[0]?.count || 0,
        finalConversions: funnelData[funnelData.length - 1]?.count || 0,
      }
    });
  } catch (error) {
    logger.error('Failed to get conversion funnel', { error, filters });
    throw error;
  }
}

async function getConversionStats(filters: any) {
  try {
    // Mock conversion statistics - in production, query from database
    const stats = {
      totalConversions: 316,
      conversionRate: 2.46, // 316/12847 * 100
      avgTimeToConvert: 390, // seconds (6.5 minutes)
      topSources: [
        { source: 'google', conversions: 142, rate: 44.9 },
        { source: 'direct', conversions: 89, rate: 28.2 },
        { source: 'referral', conversions: 52, rate: 16.5 },
        { source: 'social', conversions: 33, rate: 10.4 },
      ],
      industryBreakdown: [
        { industry: 'Healthcare', conversions: 126, rate: 39.9 },
        { industry: 'Legal', conversions: 95, rate: 30.1 },
        { industry: 'E-commerce', conversions: 73, rate: 23.1 },
        { industry: 'Other', conversions: 22, rate: 6.9 },
      ],
      trends: {
        daily: generateTrendData(7),
        weekly: generateTrendData(4),
        monthly: generateTrendData(12),
      }
    };

    logger.info('Conversion statistics retrieved', {
      totalConversions: stats.totalConversions,
      conversionRate: stats.conversionRate,
      filters
    });

    return NextResponse.json({
      success: true,
      stats,
      metadata: {
        generatedAt: new Date().toISOString(),
        filters,
        period: filters.period || 'last_30_days',
      }
    });
  } catch (error) {
    logger.error('Failed to get conversion stats', { error, filters });
    throw error;
  }
}

// Helper functions
async function storeConversionEvent(event: any) {
  // In production, store in database (PostgreSQL, MongoDB, etc.)
  logger.debug('Storing conversion event', { eventId: event.eventId, type: event.type });
  return true;
}

async function sendToAnalyticsPlatforms(event: any) {
  try {
    const promises = [];

    // Send to Google Analytics 4
    if (process.env.NEXT_PUBLIC_GA_ID) {
      promises.push(sendToGA4(event));
    }

    // Send to other platforms (Mixpanel, Amplitude, etc.)
    // promises.push(sendToMixpanel(event));
    // promises.push(sendToAmplitude(event));

    await Promise.allSettled(promises);
    
    logger.debug('Sent event to analytics platforms', { 
      eventId: event.eventId,
      platformCount: promises.length 
    });
  } catch (error) {
    logger.error('Failed to send to analytics platforms', { error, eventId: event.eventId });
  }
}

async function sendToGA4(event: any) {
  try {
    // GA4 Measurement Protocol implementation
    const measurementId = process.env.NEXT_PUBLIC_GA_ID;
    const apiSecret = process.env.GA4_API_SECRET;

    if (!measurementId || !apiSecret) {
      logger.warn('GA4 credentials not configured');
      return;
    }

    const payload = {
      client_id: event.sessionId || 'anonymous',
      events: [{
        name: event.type,
        params: {
          ...event.properties,
          timestamp_micros: new Date(event.timestamp).getTime() * 1000,
        }
      }]
    };

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error(`GA4 API error: ${response.status}`);
    }

    logger.debug('Event sent to GA4', { eventId: event.eventId });
  } catch (error) {
    logger.error('Failed to send to GA4', { error, eventId: event.eventId });
  }
}

async function updateConversionMetrics(event: any) {
  // Update real-time conversion metrics in Redis or database
  logger.debug('Updating conversion metrics', { eventType: event.type });
  return true;
}

function generateTrendData(periods: number) {
  return Array.from({ length: periods }, (_, i) => ({
    period: i + 1,
    conversions: Math.floor(Math.random() * 50) + 10,
    rate: Math.round((Math.random() * 5 + 2) * 100) / 100,
  }));
}