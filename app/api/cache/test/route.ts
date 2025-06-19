import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: {
        cache: { status: 'pending', details: {} },
        rateLimit: { status: 'pending', details: {} },
        redis: { status: 'pending', details: {} }
      }
    };

    // Test 1: Cache functionality
    try {
      const testKey = 'cache-test-' + Date.now();
      const testValue = { message: 'Hello Redis!', timestamp: Date.now() };
      
      // Set cache
      const setResult = await cache.set(testKey, testValue, { ttl: 60 });
      
      // Get cache
      const getValue = await cache.get(testKey);
      
      // Get cache stats
      const stats = await cache.getStats();
      
      testResults.tests.cache = {
        status: setResult && getValue ? 'passed' : 'failed',
        details: {
          setResult,
          retrievedValue: getValue,
          valueMatches: JSON.stringify(getValue) === JSON.stringify(testValue),
          stats
        }
      };
      
      // Cleanup
      await cache.del(testKey);
    } catch (error) {
      testResults.tests.cache = {
        status: 'failed',
        details: { error: (error as Error).message }
      };
    }

    // Test 2: Rate limiting
    try {
      const testIP = '192.168.1.100';
      
      const rateLimitResult1 = await rateLimit.limit(testIP);
      const rateLimitResult2 = await rateLimit.limit(testIP);
      
      testResults.tests.rateLimit = {
        status: rateLimitResult1.success && rateLimitResult2.success ? 'passed' : 'failed',
        details: {
          firstRequest: rateLimitResult1,
          secondRequest: rateLimitResult2,
          remainingDecreased: rateLimitResult1.remaining > rateLimitResult2.remaining
        }
      };
      
      // Reset for cleanup
      await rateLimit.reset(testIP);
    } catch (error) {
      testResults.tests.rateLimit = {
        status: 'failed',
        details: { error: (error as Error).message }
      };
    }

    // Test 3: Direct Redis connection
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const testKey = 'redis-direct-test-' + Date.now();
        const testValue = 'direct-redis-test';
        
        // Direct Redis test
        const setResponse = await fetch(
          `${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(testKey)}/${encodeURIComponent(testValue)}`,
          {
            headers: { 'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
          }
        );
        
        const getResponse = await fetch(
          `${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(testKey)}`,
          {
            headers: { 'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
          }
        );
        
        const setData = await setResponse.json();
        const getData = await getResponse.json();
        
        // Cleanup
        await fetch(
          `${process.env.UPSTASH_REDIS_REST_URL}/del/${encodeURIComponent(testKey)}`,
          {
            headers: { 'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
          }
        );
        
        testResults.tests.redis = {
          status: setData.result === 'OK' && getData.result === testValue ? 'passed' : 'failed',
          details: {
            setResponse: setData,
            getResponse: getData,
            connectionWorking: setResponse.ok && getResponse.ok
          }
        };
      } else {
        testResults.tests.redis = {
          status: 'skipped',
          details: { reason: 'Redis credentials not configured' }
        };
      }
    } catch (error) {
      testResults.tests.redis = {
        status: 'failed',
        details: { error: (error as Error).message }
      };
    }

    // Overall status
    const allPassed = Object.values(testResults.tests).every(test => 
      test.status === 'passed' || test.status === 'skipped'
    );

    logger.info('Redis/Cache test completed', {
      allPassed,
      results: testResults.tests
    });

    return NextResponse.json({
      success: allPassed,
      ...testResults
    });

  } catch (error) {
    logger.error('Redis/Cache test failed', error as Error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}