import { logger } from '@/lib/logger';
import { redisClient } from '@/lib/redis-client';
import * as Sentry from '@sentry/nextjs';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  serialize?: boolean; // Whether to JSON serialize the value
}

interface CacheMetadata {
  created: number;
  ttl: number;
  tags: string[];
  size: number;
}

interface CacheEntry {
  value: any;
  metadata: CacheMetadata;
}

export class Cache {
  private useRedis: boolean;
  private memoryCache: Map<string, CacheEntry>;
  private memoryMaxSize: number;

  constructor() {
    this.memoryCache = new Map();
    this.memoryMaxSize = parseInt(process.env.MEMORY_CACHE_MAX_SIZE || '1000');
    this.useRedis = redisClient.isReady();
    
    if (this.useRedis) {
      logger.info('Cache initialized with Redis backend');
    } else {
      logger.info('Cache initialized with memory backend');
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    return Sentry.startSpan(
      {
        op: "cache.get",
        name: "Cache Get",
      },
      async (span) => {
        try {
          span.setAttribute("key", key);
          span.setAttribute("backend", this.useRedis ? "redis" : "memory");

          if (this.useRedis) {
            const result = await redisClient.get(key);
            if (result === null) {
              span.setAttribute("hit", false);
              return null;
            }

            try {
              const parsed = JSON.parse(result);
              span.setAttribute("hit", true);
              return parsed.value;
            } catch {
              // Value is not JSON, return as string
              span.setAttribute("hit", true);
              return result as T;
            }
          } else {
            // Memory cache
            const entry = this.memoryCache.get(key);
            if (!entry) {
              span.setAttribute("hit", false);
              return null;
            }

            // Check TTL
            const now = Date.now();
            if (entry.metadata.ttl > 0 && now > entry.metadata.created + (entry.metadata.ttl * 1000)) {
              this.memoryCache.delete(key);
              span.setAttribute("hit", false);
              span.setAttribute("expired", true);
              return null;
            }

            span.setAttribute("hit", true);
            return entry.value;
          }
        } catch (error) {
          logger.error('Cache get error', error as Error, { key });
          span.setAttribute("error", true);
          return null;
        }
      }
    );
  }

  async set<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    return Sentry.startSpan(
      {
        op: "cache.set",
        name: "Cache Set",
      },
      async (span) => {
        try {
          const { ttl = 3600, tags = [], serialize = true } = options;
          
          span.setAttribute("key", key);
          span.setAttribute("backend", this.useRedis ? "redis" : "memory");
          span.setAttribute("ttl", ttl);

          if (this.useRedis) {
            const cacheValue = serialize ? JSON.stringify({
              value,
              metadata: {
                created: Date.now(),
                ttl,
                tags,
                size: JSON.stringify(value).length
              }
            }) : String(value);

            const success = await redisClient.set(key, cacheValue, { ex: ttl });
            span.setAttribute("success", success);
            return success;
          } else {
            // Memory cache
            const entry: CacheEntry = {
              value,
              metadata: {
                created: Date.now(),
                ttl,
                tags,
                size: JSON.stringify(value).length
              }
            };

            // Evict old entries if cache is full
            if (this.memoryCache.size >= this.memoryMaxSize) {
              this.evictOldestEntries();
            }

            this.memoryCache.set(key, entry);
            span.setAttribute("success", true);
            return true;
          }
        } catch (error) {
          logger.error('Cache set error', error as Error, { key });
          span.setAttribute("error", true);
          return false;
        }
      }
    );
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.useRedis) {
        return await redisClient.del(key);
      } else {
        return this.memoryCache.delete(key);
      }
    } catch (error) {
      logger.error('Cache delete error', error as Error, { key });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.useRedis) {
        return await redisClient.exists(key);
      } else {
        const entry = this.memoryCache.get(key);
        if (!entry) return false;

        // Check TTL
        const now = Date.now();
        if (entry.metadata.ttl > 0 && now > entry.metadata.created + (entry.metadata.ttl * 1000)) {
          this.memoryCache.delete(key);
          return false;
        }

        return true;
      }
    } catch (error) {
      logger.error('Cache exists error', error as Error, { key });
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    try {
      let invalidated = 0;

      if (this.useRedis) {
        // In Redis, we'd need to store tag->keys mapping separately
        // For now, we'll use a simple key pattern approach
        const keys = await redisClient.keys(`*:${tag}:*`);
        for (const key of keys) {
          await redisClient.del(key);
          invalidated++;
        }
      } else {
        // Memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
          if (entry.metadata.tags.includes(tag)) {
            this.memoryCache.delete(key);
            invalidated++;
          }
        }
      }

      logger.info('Cache invalidated by tag', { tag, invalidated });
      return invalidated;
    } catch (error) {
      logger.error('Cache invalidate by tag error', error as Error, { tag });
      return 0;
    }
  }

  async clear(): Promise<boolean> {
    try {
      if (this.useRedis) {
        // In production, you might want to be more selective
        const keys = await redisClient.keys('*');
        for (const key of keys) {
          await redisClient.del(key);
        }
      } else {
        this.memoryCache.clear();
      }

      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear error', error as Error);
      return false;
    }
  }

  async getStats(): Promise<{
    backend: string;
    size: number;
    memoryUsage?: number;
    hitRate?: number;
  }> {
    try {
      if (this.useRedis) {
        const keys = await redisClient.keys('*');
        return {
          backend: 'redis',
          size: keys.length
        };
      } else {
        const memoryUsage = Array.from(this.memoryCache.values())
          .reduce((sum, entry) => sum + entry.metadata.size, 0);

        return {
          backend: 'memory',
          size: this.memoryCache.size,
          memoryUsage
        };
      }
    } catch (error) {
      logger.error('Cache stats error', error as Error);
      return {
        backend: this.useRedis ? 'redis' : 'memory',
        size: 0
      };
    }
  }

  private evictOldestEntries(): void {
    // Remove 10% of oldest entries
    const entriesToRemove = Math.ceil(this.memoryCache.size * 0.1);
    const sortedEntries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.metadata.created - b.metadata.created);

    for (let i = 0; i < entriesToRemove && i < sortedEntries.length; i++) {
      this.memoryCache.delete(sortedEntries[i][0]);
    }

    logger.debug('Cache entries evicted', { removed: entriesToRemove });
  }

  // Helper method for caching function results
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, options);
    return result;
  }
}

// Export singleton instance
export const cache = new Cache();

// Utility functions for common caching patterns
export async function cacheUserData(userId: string, userData: any, ttl = 900): Promise<boolean> {
  return cache.set(`user:${userId}`, userData, { ttl, tags: ['users'] });
}

export async function getCachedUserData(userId: string): Promise<any> {
  return cache.get(`user:${userId}`);
}

export async function cacheAnalyticsData(key: string, data: any, ttl = 300): Promise<boolean> {
  return cache.set(`analytics:${key}`, data, { ttl, tags: ['analytics'] });
}

export async function getCachedAnalyticsData(key: string): Promise<any> {
  return cache.get(`analytics:${key}`);
}

export async function invalidateUserCache(userId: string): Promise<boolean> {
  return cache.del(`user:${userId}`);
}

export async function invalidateAnalyticsCache(): Promise<number> {
  return cache.invalidateByTag('analytics');
}