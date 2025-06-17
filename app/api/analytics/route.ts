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
  // Track event to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', data.event, {
      event_category: 'engagement',
      event_label: data.properties?.industry || 'unknown',
      value: data.properties?.value || 1,
    });
  }
  
  // Store in database or send to analytics service
  // Implementation depends on your chosen analytics provider
}