import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateAnalyticsPayload } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const { success } = await rateLimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Validate payload
    const body = await request.json();
    const validatedData = validateAnalyticsPayload(body);

    // Process analytics data
    await processAnalyticsEvent(validatedData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processAnalyticsEvent(data: any) {
  try {
    // Log analytics event (server-side, so no window object)
    console.log('Analytics Event:', {
      event: data.event,
      properties: data.properties,
      timestamp: data.timestamp || new Date().toISOString(),
      userId: data.userId,
      sessionId: data.sessionId
    });
    
    // In production, you would:
    // 1. Send to analytics service (Google Analytics, Mixpanel, etc.)
    // 2. Store in database for later analysis
    // 3. Forward to data warehouse
    
    // Example: Send to Google Analytics 4 Measurement Protocol
    if (process.env.NEXT_PUBLIC_GA_ID) {
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
    
    return { success: true };
  } catch (error) {
    console.error('Failed to process analytics event:', error);
    throw error;
  }
}