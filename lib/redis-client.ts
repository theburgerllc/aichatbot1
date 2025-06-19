import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

interface RedisConfig {
  url: string;
  token: string;
}

class RedisClient {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.client = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        this.isConnected = true;
        logger.info('Redis client initialized successfully');
      } else {
        logger.warn('Redis credentials not configured, using fallback');
      }
    } catch (error) {
      logger.error('Failed to initialize Redis client', error as Error);
      Sentry.captureException(error);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;

    try {
      const result = await this.client.get(key);
      // Handle both string and null responses properly
      if (result === null || result === undefined) return null;
      return String(result);
    } catch (error) {
      logger.error('Redis GET error', error as Error, { key });
      Sentry.captureException(error);
      return null;
    }
  }

  async set(key: string, value: string, options?: { ex?: number; px?: number }): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.set(key, value, options);
      return result === 'OK';
    } catch (error) {
      logger.error('Redis SET error', error as Error, { key });
      Sentry.captureException(error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis DEL error', error as Error, { key });
      Sentry.captureException(error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis EXISTS error', error as Error, { key });
      Sentry.captureException(error);
      return false;
    }
  }

  async incr(key: string): Promise<number | null> {
    if (!this.client) return null;

    try {
      const result = await this.client.incr(key);
      return result;
    } catch (error) {
      logger.error('Redis INCR error', error as Error, { key });
      Sentry.captureException(error);
      return null;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXPIRE error', error as Error, { key });
      Sentry.captureException(error);
      return false;
    }
  }

  async ttl(key: string): Promise<number | null> {
    if (!this.client) return null;

    try {
      const result = await this.client.ttl(key);
      return result;
    } catch (error) {
      logger.error('Redis TTL error', error as Error, { key });
      Sentry.captureException(error);
      return null;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.client) return [];

    try {
      const result = await this.client.keys(pattern);
      return result;
    } catch (error) {
      logger.error('Redis KEYS error', error as Error, { pattern });
      Sentry.captureException(error);
      return [];
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    if (!this.client) return keys.map(() => null);

    try {
      const result = await this.client.mget(...keys);
      return result;
    } catch (error) {
      logger.error('Redis MGET error', error as Error, { keyCount: keys.length });
      Sentry.captureException(error);
      return keys.map(() => null);
    }
  }

  async ping(): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error', error as Error);
      Sentry.captureException(error);
      return false;
    }
  }

  async flushall(): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.flushall();
      return result === 'OK';
    } catch (error) {
      logger.error('Redis FLUSHALL error', error as Error);
      Sentry.captureException(error);
      return false;
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    if (!this.client) {
      return { healthy: false, error: 'Redis client not initialized' };
    }

    const startTime = Date.now();
    
    try {
      await this.ping();
      const latency = Date.now() - startTime;
      
      return { healthy: true, latency };
    } catch (error) {
      return { 
        healthy: false, 
        error: (error as Error).message,
        latency: Date.now() - startTime 
      };
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }
}

// Export singleton instance
export const redisClient = new RedisClient();
export default redisClient;