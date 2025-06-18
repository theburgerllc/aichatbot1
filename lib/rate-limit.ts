import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';

// In-memory rate limiter for development
const inMemoryLimiter = new RateLimiterMemory({
  points: 50, // Number of requests
  duration: 60, // Per 60 seconds
});

// Redis-based rate limiter for production
const redisLimiter: RateLimiterRedis | null = null;

// Note: Redis configuration will be done in production environment
// For now, using in-memory rate limiting

// API-specific rate limiters
const apiLimiters = {
  calculator: new RateLimiterMemory({
    points: 10, // 10 calculations
    duration: 60, // Per minute
  }),
  
  demo: new RateLimiterMemory({
    points: 5, // 5 demo requests
    duration: 300, // Per 5 minutes
  }),
  
  contact: new RateLimiterMemory({
    points: 3, // 3 form submissions
    duration: 3600, // Per hour
  }),
  
  analytics: new RateLimiterMemory({
    points: 100, // 100 events
    duration: 60, // Per minute
  }),
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export class RateLimit {
  private limiter: RateLimiterMemory;
  
  constructor(limiter?: RateLimiterMemory) {
    this.limiter = limiter || inMemoryLimiter;
  }
  
  async limit(key: string): Promise<RateLimitResult> {
    try {
      const result = await this.limiter.get(key);
      
      if (result === null) {
        // First request from this key
        await this.limiter.consume(key);
        return {
          success: true,
          limit: this.limiter.points,
          remaining: this.limiter.points - 1,
          reset: Date.now() + (this.limiter.duration * 1000),
        };
      }
      
      if (result.remainingPoints <= 0) {
        return {
          success: false,
          limit: this.limiter.points,
          remaining: 0,
          reset: new Date(Date.now() + result.msBeforeNext).getTime(),
        };
      }
      
      await this.limiter.consume(key);
      
      return {
        success: true,
        limit: this.limiter.points,
        remaining: result.remainingPoints - 1,
        reset: Date.now() + (this.limiter.duration * 1000),
      };
    } catch (rejRes: any) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.limiter.points,
        remaining: 0,
        reset: new Date(Date.now() + rejRes.msBeforeNext).getTime(),
      };
    }
  }
  
  async reset(key: string): Promise<void> {
    await this.limiter.delete(key);
  }
}

// Export pre-configured rate limiters
export const rateLimit = new RateLimit();
export const calculatorRateLimit = new RateLimit(apiLimiters.calculator);
export const demoRateLimit = new RateLimit(apiLimiters.demo);
export const contactRateLimit = new RateLimit(apiLimiters.contact);
export const analyticsRateLimit = new RateLimit(apiLimiters.analytics);

// Utility function to get client IP
export function getClientIP(request: Request): string {
  // Check common headers for real IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip',
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown') {
        return ip;
      }
    }
  }
  
  // Fallback to localhost for development
  return '127.0.0.1';
}

// Middleware helper for rate limiting
export async function applyRateLimit(
  request: Request,
  limiter: RateLimit = rateLimit
): Promise<Response | null> {
  const ip = getClientIP(request);
  const result = await limiter.limit(ip);
  
  if (!result.success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    });
  }
  
  return null; // No rate limit violation
}