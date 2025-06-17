import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rate-limit';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const { success, limit, remaining, reset } = await rateLimit.limit(ip);

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }

    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
  }

  // Industry detection and personalization
  if (request.nextUrl.pathname === '/') {
    const industry = detectIndustryFromRequest(request);
    if (industry) {
      response.cookies.set('detected_industry', industry, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 86400, // 24 hours
      });
    }
  }

  return response;
}

function detectIndustryFromRequest(request: NextRequest): string | null {
  // Check URL parameters
  const industry = request.nextUrl.searchParams.get('industry');
  if (industry && ['healthcare', 'legal', 'ecommerce'].includes(industry)) {
    return industry;
  }

  // Check user agent for industry-specific keywords
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  if (userAgent.includes('medical') || userAgent.includes('health')) {
    return 'healthcare';
  }
  
  if (userAgent.includes('legal') || userAgent.includes('law')) {
    return 'legal';
  }
  
  if (userAgent.includes('shop') || userAgent.includes('store')) {
    return 'ecommerce';
  }

  // Check referrer for industry indicators
  const referrer = request.headers.get('referer')?.toLowerCase() || '';
  
  if (referrer.includes('health') || referrer.includes('medical')) {
    return 'healthcare';
  }
  
  if (referrer.includes('legal') || referrer.includes('law')) {
    return 'legal';
  }
  
  if (referrer.includes('shop') || referrer.includes('ecommerce')) {
    return 'ecommerce';
  }

  return null;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};