import { NextRequest, NextResponse } from 'next/server';
import { healthCheck, getPoolStats } from '@/lib/database';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
      pool?: any;
      details?: any;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
      details?: any;
    };
    external: {
      square: {
        status: 'healthy' | 'unhealthy';
        latency?: number;
      };
      sentry: {
        status: 'healthy' | 'unhealthy';
      };
    };
  };
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu?: any;
  };
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/health",
    },
    async () => {
      const startTime = Date.now();

      try {
        logger.debug('Health check requested');

        const health: HealthStatus = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          uptime: process.uptime(),
          services: {
            database: { status: 'unhealthy' },
            redis: { status: 'unhealthy' },
            external: {
              square: { status: 'unhealthy' },
              sentry: { status: 'healthy' }
            }
          },
          metrics: {
            memory: getMemoryUsage()
          }
        };

        // Check database health
        const dbStartTime = Date.now();
        try {
          const dbHealth = await healthCheck();
          const dbLatency = Date.now() - dbStartTime;
          const poolStats = await getPoolStats();

          health.services.database = {
            status: dbHealth.healthy ? 'healthy' : 'unhealthy',
            latency: dbLatency,
            pool: poolStats,
            details: dbHealth.details
          };
        } catch (error) {
          logger.error('Database health check failed', error as Error);
          health.services.database = {
            status: 'unhealthy',
            details: { error: (error as Error).message }
          };
        }

        // Check Redis health (if configured)
        try {
          const redisHealth = await checkRedisHealth();
          health.services.redis = redisHealth;
        } catch (error) {
          health.services.redis = {
            status: 'unhealthy',
            details: { error: (error as Error).message }
          };
        }

        // Check Square API health
        try {
          const squareHealth = await checkSquareHealth();
          health.services.external.square = squareHealth;
        } catch (error) {
          health.services.external.square = {
            status: 'unhealthy',
            details: { error: (error as Error).message }
          };
        }

        // Determine overall health status
        const unhealthyServices = Object.values(health.services)
          .filter(service => service.status === 'unhealthy').length;

        if (unhealthyServices === 0) {
          health.status = 'healthy';
        } else if (unhealthyServices <= 1 && health.services.database.status === 'healthy') {
          health.status = 'degraded';
        } else {
          health.status = 'unhealthy';
        }

        const totalTime = Date.now() - startTime;
        
        logger.info('Health check completed', {
          status: health.status,
          duration: totalTime,
          databaseLatency: health.services.database.latency,
          unhealthyServices
        });

        // Return appropriate HTTP status
        const httpStatus = health.status === 'healthy' ? 200 : 
                          health.status === 'degraded' ? 200 : 503;

        return NextResponse.json(health, { status: httpStatus });
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error('Health check failed', error as Error, { duration });
        Sentry.captureException(error);

        return NextResponse.json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed',
          duration
        }, { status: 503 });
      }
    }
  );
}

async function checkRedisHealth(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; details?: any }> {
  // If Redis is not configured, mark as healthy (optional service)
  if (!process.env.REDIS_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    return { status: 'healthy', details: { message: 'Redis not configured' } };
  }

  const startTime = Date.now();
  
  try {
    // For Upstash Redis REST API
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: {
          'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        return { status: 'healthy', latency };
      } else {
        return { status: 'unhealthy', details: { statusCode: response.status } };
      }
    }

    // For standard Redis (if you add redis client later)
    return { status: 'healthy', details: { message: 'Redis client not implemented' } };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      details: { error: (error as Error).message } 
    };
  }
}

async function checkSquareHealth(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; details?: any }> {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    return { status: 'unhealthy', details: { message: 'Square not configured' } };
  }

  const startTime = Date.now();

  try {
    // Check Square API with a simple locations call
    const response = await fetch('https://connect.squareup.com/v2/locations', {
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return { status: 'healthy', latency };
    } else {
      return { 
        status: 'unhealthy', 
        latency,
        details: { statusCode: response.status } 
      };
    }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      details: { error: (error as Error).message } 
    };
  }
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  const total = usage.heapTotal;
  const used = usage.heapUsed;
  
  return {
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round((used / total) * 100)
  };
}

// Simple health check endpoint
export async function HEAD() {
  try {
    const dbHealth = await healthCheck();
    return new Response(null, { 
      status: dbHealth.healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}