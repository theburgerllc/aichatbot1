import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateAnalyticsPayload, analyticsPayloadSchema } from '@/lib/validation';
import { logger, generateCorrelationId, logApiRequest, logApiError } from '@/lib/logger';
import { z } from 'zod';

type AnalyticsPayload = z.infer<typeof analyticsPayloadSchema>;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const correlationId = generateCorrelationId();
  const requestLogger = logger.forRequest(correlationId);
  
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  
  try {
    requestLogger.info('Analytics API request started', {
      method: 'POST',
      url: '/api/analytics',
      ip,
      userAgent: request.headers.get('user-agent'),
    });

    // Rate limiting
    const { success } = await rateLimit.limit(ip);

    if (!success) {
      const duration = Date.now() - startTime;
      logApiRequest('POST', '/api/analytics', 429, duration, { correlationId, ip });
      requestLogger.warn('Rate limit exceeded', { ip, duration });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Validate payload
    const body = await request.json();
    const validatedData = validateAnalyticsPayload(body);

    requestLogger.debug('Analytics payload validated', {
      event: validatedData.event,
      hasProperties: !!validatedData.properties,
      hasUserId: !!validatedData.userId,
    });

    // Process analytics data
    await processAnalyticsEvent(validatedData, requestLogger);

    const duration = Date.now() - startTime;
    logApiRequest('POST', '/api/analytics', 200, duration, { 
      correlationId, 
      ip,
      event: validatedData.event 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    logApiError('POST', '/api/analytics', error as Error, { 
      correlationId, 
      ip,
      duration 
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processAnalyticsEvent(data: AnalyticsPayload, requestLogger: ReturnType<typeof logger.forRequest>) {
  try {
    const timestamp = data.timestamp || new Date().toISOString();
    
    // Log analytics event with structured logging
    requestLogger.info('Analytics event received', {
      event: data.event,
      timestamp,
      userId: data.userId,
      sessionId: data.sessionId,
      propertyCount: data.properties ? Object.keys(data.properties).length : 0,
      eventType: 'analytics',
    });

    // In production, you would:
    // 1. Send to analytics service (Google Analytics, Mixpanel, etc.)
    // 2. Store in database for later analysis
    // 3. Forward to data warehouse

    // Example: Send to Google Analytics 4 Measurement Protocol
    if (process.env.NEXT_PUBLIC_GA_ID) {
      requestLogger.debug('Preparing to send to GA4', {
        gaId: process.env.NEXT_PUBLIC_GA_ID.substring(0, 8) + '...',
        event: data.event,
      });
      // GA4 Measurement Protocol implementation would go here
      // await sendToGA4(data);
    }

    // Example: Store in database
    // await prisma.analytics.create({
    //   data: {
    //     event: data.event,
    //     properties: data.properties,
    //     timestamp: new Date(data.timestamp || Date.now()),
    //     userId: data.userId,
    //     sessionId: data.sessionId
    //   }
    // });

    requestLogger.debug('Analytics event processed successfully', {
      event: data.event,
      processingComplete: true,
    });

    return { success: true };
  } catch (error) {
    requestLogger.error('Failed to process analytics event', error as Error, {
      event: data.event,
      userId: data.userId,
      errorType: 'analytics_processing_error',
    });
    throw error;
  }
}
