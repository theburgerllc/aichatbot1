import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '@/lib/logger';
import { redisClient } from '@/lib/redis-client';
import * as Sentry from '@sentry/nextjs';

// In-memory rate limiter for development/fallback
const inMemoryLimiter = new RateLimiterMemory({
  points: 50, // Number of requests
  duration: 60, // Per 60 seconds
});

// Custom Redis-based rate limiter for Upstash
class RedisRateLimiter {
  private points: number;
  private duration: number;

  constructor(points: number, duration: number) {
    this.points = points;
    this.duration = duration;
  }

  async get(key: string): Promise<{ remainingPoints: number; msBeforeNext: number } | null> {
    try {
      const current = await redisClient.get(`rl:${key}`);
      if (!current) return null;

      const data = JSON.parse(current);
      const now = Date.now();
      const resetTime = data.resetTime;
      
      if (now > resetTime) {
        // Window has expired, reset
        await redisClient.del(`rl:${key}`);
        return null;
      }

      return {
        remainingPoints: Math.max(0, this.points - data.count),
        msBeforeNext: resetTime - now
      };
    } catch (error) {
      logger.error('Redis rate limiter get error', error as Error, { key });
      return null;
    }
  }

  async consume(key: string): Promise<{ remainingPoints: number; msBeforeNext: number }> {
    try {
      const now = Date.now();
      const resetTime = now + (this.duration * 1000);
      const rlKey = `rl:${key}`;

      const current = await redisClient.get(rlKey);
      
      if (!current) {
        // First request in window
        const data = { count: 1, resetTime };
        await redisClient.set(rlKey, JSON.stringify(data), { ex: this.duration });
        
        return {
          remainingPoints: this.points - 1,
          msBeforeNext: resetTime - now
        };
      }

      const data = JSON.parse(current);
      
      if (now > data.resetTime) {
        // Window expired, reset
        const newData = { count: 1, resetTime };
        await redisClient.set(rlKey, JSON.stringify(newData), { ex: this.duration });
        
        return {
          remainingPoints: this.points - 1,
          msBeforeNext: resetTime - now
        };
      }

      // Increment count
      data.count += 1;
      await redisClient.set(rlKey, JSON.stringify(data), { ex: Math.ceil((data.resetTime - now) / 1000) });

      if (data.count > this.points) {
        throw new Error('Rate limit exceeded');
      }

      return {
        remainingPoints: this.points - data.count,
        msBeforeNext: data.resetTime - now
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Rate limit exceeded') {
        throw error;
      }
      logger.error('Redis rate limiter consume error', error as Error, { key });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(`rl:${key}`);
    } catch (error) {
      logger.error('Redis rate limiter delete error', error as Error, { key });
    }
  }
}

// Use Redis rate limiter if available, otherwise fall back to memory
const redisLimiter = redisClient.isReady() ? new RedisRateLimiter(50, 60) : null;

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
  private limiter: RateLimiterMemory | RedisRateLimiter;
  private useRedis: boolean;
  private points: number;
  private duration: number;
  
  constructor(limiter?: RateLimiterMemory | RedisRateLimiter, points = 50, duration = 60) {
    // Use Redis if available, otherwise fall back to memory
    this.limiter = limiter || redisLimiter || inMemoryLimiter;
    this.useRedis = !!(limiter || redisLimiter);
    this.points = points;
    this.duration = duration;
    
    if (this.useRedis) {
      logger.debug('Rate limiter using Redis backend');
    } else {
      logger.debug('Rate limiter using in-memory backend');
    }
  }
  
  async limit(key: string): Promise<RateLimitResult> {
    try {
      if (this.useRedis && this.limiter instanceof RedisRateLimiter) {
        // Redis rate limiter
        const result = await this.limiter.get(key);
        
        if (result === null) {
          // First request from this key
          const consumeResult = await this.limiter.consume(key);
          return {
            success: true,
            limit: this.points,
            remaining: consumeResult.remainingPoints,
            reset: Date.now() + consumeResult.msBeforeNext,
          };
        }
        
        if (result.remainingPoints <= 0) {
          return {
            success: false,
            limit: this.points,
            remaining: 0,
            reset: Date.now() + result.msBeforeNext,
          };
        }
        
        const consumeResult = await this.limiter.consume(key);
        
        return {
          success: true,
          limit: this.points,
          remaining: consumeResult.remainingPoints,
          reset: Date.now() + consumeResult.msBeforeNext,
        };
      } else {
        // Memory rate limiter
        const memoryLimiter = this.limiter as RateLimiterMemory;
        const result = await memoryLimiter.get(key);
        
        if (result === null) {
          // First request from this key
          await memoryLimiter.consume(key);
          return {
            success: true,
            limit: memoryLimiter.points,
            remaining: memoryLimiter.points - 1,
            reset: Date.now() + (memoryLimiter.duration * 1000),
          };
        }
        
        if (result.remainingPoints <= 0) {
          return {
            success: false,
            limit: memoryLimiter.points,
            remaining: 0,
            reset: new Date(Date.now() + result.msBeforeNext).getTime(),
          };
        }
        
        await memoryLimiter.consume(key);
        
        return {
          success: true,
          limit: memoryLimiter.points,
          remaining: result.remainingPoints - 1,
          reset: Date.now() + (memoryLimiter.duration * 1000),
        };
      }
    } catch (error: any) {
      // Rate limit exceeded
      if (error.message === 'Rate limit exceeded') {
        return {
          success: false,
          limit: this.points,
          remaining: 0,
          reset: Date.now() + (this.duration * 1000),
        };
      }
      
      // For memory limiter rejection format
      if (error.msBeforeNext) {
        return {
          success: false,
          limit: this.points,
          remaining: 0,
          reset: new Date(Date.now() + error.msBeforeNext).getTime(),
        };
      }
      
      throw error;
    }
  }
  
  async reset(key: string): Promise<void> {
    if (this.useRedis && this.limiter instanceof RedisRateLimiter) {
      await this.limiter.delete(key);
    } else {
      const memoryLimiter = this.limiter as RateLimiterMemory;
      await memoryLimiter.delete(key);
    }
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
