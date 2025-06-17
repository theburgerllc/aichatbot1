#!/usr/bin/env node

/**
 * AI Chatbot Solutions - Production Deployment Test Suite
 * 
 * This script tests all API endpoints and verifies production deployment
 * Run with: node test-deployment.js [BASE_URL]
 * 
 * Example: node test-deployment.js https://aichatbotsolutions.io
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || 'https://aichatbotsolutions.io';
const TIMEOUT = 10000; // 10 seconds

// Test data
const TEST_DATA = {
  analytics: {
    event: 'deployment_test',
    properties: {
      source: 'test_script',
      timestamp: new Date().toISOString()
    }
  },
  calculator: {
    industry: 'healthcare',
    providers: 5,
    patientsPerDay: 100,
    location: 'New York'
  },
  demo: {
    action: 'track_progress',
    stepNumber: 1,
    industry: 'healthcare',
    timeSpent: 30,
    completed: false
  },
  square: {
    action: 'create_payment',
    amount: 10000, // $100.00 in cents
    sourceId: 'test_card_token',
    idempotencyKey: 'test_' + Date.now()
  }
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const requestOptions = {
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Chatbot-Solutions-Test/1.0',
        ...options.headers
      },
      method: options.method || 'GET'
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testEndpoint(name, path, method = 'GET', body = null) {
  const url = `${BASE_URL}${path}`;
  console.log(`\n${colorize('Testing:', 'cyan')} ${name}`);
  console.log(`${colorize('URL:', 'blue')} ${url}`);
  console.log(`${colorize('Method:', 'blue')} ${method}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(url, {
      method,
      body,
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {}
    });
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`${colorize('Status:', 'blue')} ${response.status}`);
    console.log(`${colorize('Response Time:', 'blue')} ${duration}ms`);
    
    // Check for security headers
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options', 
      'referrer-policy',
      'strict-transport-security'
    ];
    
    console.log(`${colorize('Security Headers:', 'blue')}`);
    securityHeaders.forEach(header => {
      const value = response.headers[header];
      if (value) {
        console.log(`  ✓ ${header}: ${value}`);
      } else {
        console.log(`  ${colorize('✗', 'red')} ${header}: Missing`);
      }
    });

    // Check rate limiting headers
    const rateLimitHeaders = ['x-ratelimit-limit', 'x-ratelimit-remaining'];
    const hasRateLimit = rateLimitHeaders.some(h => response.headers[h]);
    if (hasRateLimit) {
      console.log(`${colorize('Rate Limiting:', 'blue')} Active`);
      rateLimitHeaders.forEach(header => {
        const value = response.headers[header];
        if (value) console.log(`  ${header}: ${value}`);
      });
    }

    if (response.status >= 200 && response.status < 300) {
      console.log(`${colorize('✓ PASS', 'green')} - ${name}`);
      if (response.data && typeof response.data === 'object') {
        console.log(`${colorize('Response:', 'blue')} ${JSON.stringify(response.data, null, 2)}`);
      }
      return { success: true, status: response.status, duration, response: response.data };
    } else {
      console.log(`${colorize('✗ FAIL', 'red')} - ${name} (Status: ${response.status})`);
      if (response.data) {
        console.log(`${colorize('Error:', 'red')} ${JSON.stringify(response.data, null, 2)}`);
      }
      return { success: false, status: response.status, duration, error: response.data };
    }
  } catch (error) {
    console.log(`${colorize('✗ ERROR', 'red')} - ${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testRateLimit(path) {
  console.log(`\n${colorize('Testing Rate Limiting:', 'cyan')} ${path}`);
  
  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(makeRequest(`${BASE_URL}${path}`, { method: 'POST', body: TEST_DATA.analytics }));
  }
  
  try {
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      console.log(`${colorize('✓ PASS', 'green')} - Rate limiting is working`);
    } else {
      console.log(`${colorize('⚠ WARNING', 'yellow')} - Rate limiting may not be configured properly`);
    }
    
    return rateLimited;
  } catch (error) {
    console.log(`${colorize('✗ ERROR', 'red')} - Rate limit test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(colorize('🚀 AI Chatbot Solutions - Production Deployment Test Suite', 'magenta'));
  console.log(colorize('=' .repeat(60), 'magenta'));
  console.log(`${colorize('Base URL:', 'blue')} ${BASE_URL}`);
  console.log(`${colorize('Timestamp:', 'blue')} ${new Date().toISOString()}`);

  const results = [];

  // Test 1: Home page
  results.push(await testEndpoint('Home Page', '/'));

  // Test 2: Analytics API
  results.push(await testEndpoint('Analytics API', '/api/analytics', 'POST', TEST_DATA.analytics));

  // Test 3: Calculator API
  results.push(await testEndpoint('Calculator API', '/api/calculator', 'POST', TEST_DATA.calculator));

  // Test 4: Demo API
  results.push(await testEndpoint('Demo API', '/api/demo', 'POST', TEST_DATA.demo));

  // Test 5: Square API
  results.push(await testEndpoint('Square API', '/api/square', 'POST', TEST_DATA.square));

  // Test 6: Webhooks API (should require proper authentication)
  results.push(await testEndpoint('Webhooks API', '/api/webhooks', 'POST', { test: 'data' }));

  // Test 7: Rate limiting
  const rateLimitWorking = await testRateLimit('/api/analytics');

  // Test 8: 404 handling
  results.push(await testEndpoint('404 Handling', '/api/nonexistent', 'GET'));

  // Summary
  console.log(`\n${colorize('📊 Test Summary', 'magenta')}`);
  console.log(colorize('=' .repeat(40), 'magenta'));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`${colorize('Total Tests:', 'blue')} ${total}`);
  console.log(`${colorize('Passed:', 'green')} ${passed}`);
  console.log(`${colorize('Failed:', 'red')} ${failed}`);
  console.log(`${colorize('Rate Limiting:', rateLimitWorking ? 'green' : 'yellow')} ${rateLimitWorking ? 'Working' : 'Needs Check'}`);
  
  const averageResponseTime = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length;
  
  if (averageResponseTime) {
    console.log(`${colorize('Average Response Time:', 'blue')} ${Math.round(averageResponseTime)}ms`);
  }

  // Performance analysis
  console.log(`\n${colorize('📈 Performance Analysis', 'magenta')}`);
  results.forEach((result, index) => {
    if (result.duration) {
      const status = result.duration < 1000 ? 'green' : result.duration < 3000 ? 'yellow' : 'red';
      const emoji = result.duration < 1000 ? '🚀' : result.duration < 3000 ? '⚡' : '🐌';
      console.log(`${emoji} Test ${index + 1}: ${result.duration}ms ${colorize(result.duration < 1000 ? '(Fast)' : result.duration < 3000 ? '(Good)' : '(Slow)', status)}`);
    }
  });

  // Overall status
  console.log(`\n${colorize('🎯 Overall Status', 'magenta')}`);
  if (passed === total) {
    console.log(colorize('🎉 ALL TESTS PASSED! Deployment is successful.', 'green'));
  } else if (passed >= total * 0.8) {
    console.log(colorize('✅ Most tests passed. Minor issues detected.', 'yellow'));
  } else {
    console.log(colorize('❌ Multiple failures detected. Review deployment.', 'red'));
  }

  console.log(`\n${colorize('🔗 Next Steps:', 'cyan')}`);
  console.log('1. Verify domain configuration if using custom domain');
  console.log('2. Test payment processing with real Square credentials');
  console.log('3. Configure analytics tracking (GA, GTM)');
  console.log('4. Set up monitoring and alerts');
  console.log('5. Test email functionality with Resend');
  
  return { passed, failed, total, rateLimitWorking, averageResponseTime };
}

// Main execution
if (require.main === module) {
  runTests().catch(error => {
    console.error(colorize(`Fatal error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };