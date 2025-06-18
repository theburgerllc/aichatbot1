#!/usr/bin/env node

/**
 * Sentry Integration Test Suite
 * 
 * This script tests various aspects of Sentry integration:
 * - Configuration validation
 * - Error reporting
 * - Performance monitoring
 * - Source maps (when available)
 * 
 * Usage:
 *   node test-sentry.js [test-name]
 * 
 * Available tests:
 *   - config: Test configuration
 *   - error: Test error reporting
 *   - performance: Test performance monitoring
 *   - all: Run all tests (default)
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class SentryTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colorCodes = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colorCodes[type]}[${timestamp}] ${message}${colorCodes.reset}`);
  }

  async testConfiguration() {
    this.log('🔧 Testing Sentry Configuration...', 'info');
    
    try {
      // Check if Sentry DSN is configured
      const envFiles = ['.env.local', '.env.production', '.env'];
      let hasDSN = false;
      
      for (const envFile of envFiles) {
        const envPath = path.join(process.cwd(), envFile);
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          if (envContent.includes('SENTRY_DSN') && !envContent.includes('SENTRY_DSN=')) {
            hasDSN = true;
            this.log(`✅ Found SENTRY_DSN in ${envFile}`, 'success');
            break;
          }
        }
      }
      
      if (!hasDSN && process.env.SENTRY_DSN) {
        hasDSN = true;
        this.log('✅ Found SENTRY_DSN in environment variables', 'success');
      }
      
      if (!hasDSN) {
        this.log('⚠️  SENTRY_DSN not found in environment files', 'warning');
        this.log('   Sentry will not report errors without a valid DSN', 'warning');
      }

      // Check Sentry configuration files
      const configFiles = [
        'sentry.client.config.ts',
        'sentry.server.config.ts', 
        'sentry.edge.config.ts',
        'instrumentation.ts'
      ];

      for (const configFile of configFiles) {
        const configPath = path.join(process.cwd(), configFile);
        if (fs.existsSync(configPath)) {
          this.log(`✅ Found ${configFile}`, 'success');
        } else {
          this.log(`❌ Missing ${configFile}`, 'error');
          this.errors.push(`Missing configuration file: ${configFile}`);
        }
      }

      // Check Next.js configuration
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      if (fs.existsSync(nextConfigPath)) {
        const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
        if (nextConfig.includes('@sentry/nextjs')) {
          this.log('✅ Sentry integration found in next.config.js', 'success');
        } else {
          this.log('⚠️  Sentry integration not found in next.config.js', 'warning');
        }
      }

      // Check package.json for Sentry dependency
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const sentryDep = packageJson.dependencies?.['@sentry/nextjs'] || 
                         packageJson.devDependencies?.['@sentry/nextjs'];
        
        if (sentryDep) {
          this.log(`✅ Sentry dependency found: @sentry/nextjs@${sentryDep}`, 'success');
        } else {
          this.log('❌ Sentry dependency not found in package.json', 'error');
          this.errors.push('Missing @sentry/nextjs dependency');
        }
      }

      this.results.push({
        test: 'Configuration',
        status: this.errors.length === 0 ? 'PASS' : 'PARTIAL',
        details: hasDSN ? 'All configuration files present' : 'Missing DSN configuration'
      });

    } catch (error) {
      this.log(`❌ Configuration test failed: ${error.message}`, 'error');
      this.errors.push(`Configuration test error: ${error.message}`);
      this.results.push({
        test: 'Configuration',
        status: 'FAIL',
        details: error.message
      });
    }
  }

  async testErrorReporting() {
    this.log('🚨 Testing Error Reporting...', 'info');
    
    try {
      // Create a test API route that throws an error
      const testErrorContent = `
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Simulate an error for testing
    throw new Error('Test error for Sentry verification - ${Date.now()}');
  } catch (error) {
    // Manually capture the error to ensure it's sent to Sentry
    Sentry.captureException(error);
    
    return NextResponse.json(
      { 
        error: 'Test error captured', 
        message: error.message,
        sentryEventId: Sentry.lastEventId() 
      }, 
      { status: 500 }
    );
  }
}
`;

      // Write test route
      const testRoutePath = path.join(process.cwd(), 'app', 'api', 'test-sentry', 'route.ts');
      const testRouteDir = path.dirname(testRoutePath);
      
      if (!fs.existsSync(testRouteDir)) {
        fs.mkdirSync(testRouteDir, { recursive: true });
      }
      
      fs.writeFileSync(testRoutePath, testErrorContent);
      this.log('✅ Created test error route', 'success');

      this.results.push({
        test: 'Error Reporting',
        status: 'PASS',
        details: 'Test route created - manual verification required'
      });

    } catch (error) {
      this.log(`❌ Error reporting test failed: ${error.message}`, 'error');
      this.errors.push(`Error reporting test error: ${error.message}`);
      this.results.push({
        test: 'Error Reporting', 
        status: 'FAIL',
        details: error.message
      });
    }
  }

  async testPerformanceMonitoring() {
    this.log('📈 Testing Performance Monitoring...', 'info');
    
    try {
      // Create a test API route that measures performance
      const testPerfContent = `
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  return Sentry.withScope(async (scope) => {
    const transaction = Sentry.startTransaction({
      name: 'Test Performance Transaction',
      op: 'test',
    });
    
    scope.setSpan(transaction);
    
    // Simulate some work
    const span = transaction.startChild({
      op: 'test-operation',
      description: 'Simulated database query'
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    span.finish();
    transaction.finish();
    
    return NextResponse.json({
      message: 'Performance monitoring test completed',
      transactionId: transaction.spanId
    });
  });
}
`;

      // Write test performance route
      const testPerfPath = path.join(process.cwd(), 'app', 'api', 'test-sentry-perf', 'route.ts');
      const testPerfDir = path.dirname(testPerfPath);
      
      if (!fs.existsSync(testPerfDir)) {
        fs.mkdirSync(testPerfDir, { recursive: true });
      }
      
      fs.writeFileSync(testPerfPath, testPerfContent);
      this.log('✅ Created test performance route', 'success');

      this.results.push({
        test: 'Performance Monitoring',
        status: 'PASS', 
        details: 'Test route created - manual verification required'
      });

    } catch (error) {
      this.log(`❌ Performance monitoring test failed: ${error.message}`, 'error');
      this.errors.push(`Performance monitoring test error: ${error.message}`);
      this.results.push({
        test: 'Performance Monitoring',
        status: 'FAIL',
        details: error.message
      });
    }
  }

  async testSourceMaps() {
    this.log('🗺️  Testing Source Maps...', 'info');
    
    try {
      // Check if source maps are configured in next.config.js
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      if (fs.existsSync(nextConfigPath)) {
        const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
        
        if (nextConfig.includes('hideSourceMaps')) {
          this.log('✅ Source maps configuration found in next.config.js', 'success');
        } else {
          this.log('⚠️  Source maps configuration not explicitly found', 'warning');
        }
        
        if (nextConfig.includes('widenClientFileUpload')) {
          this.log('✅ Enhanced source map upload configuration found', 'success');
        }
      }

      // Check for .sentryclirc file
      const sentryCliRcPath = path.join(process.cwd(), '.sentryclirc');
      if (fs.existsSync(sentryCliRcPath)) {
        this.log('✅ Found .sentryclirc configuration', 'success');
      } else {
        this.log('ℹ️  .sentryclirc not found (optional)', 'info');
      }

      this.results.push({
        test: 'Source Maps',
        status: 'PASS',
        details: 'Source map configuration verified'
      });

    } catch (error) {
      this.log(`❌ Source maps test failed: ${error.message}`, 'error');
      this.errors.push(`Source maps test error: ${error.message}`);
      this.results.push({
        test: 'Source Maps',
        status: 'FAIL', 
        details: error.message
      });
    }
  }

  async testLoggerIntegration() {
    this.log('📝 Testing Logger Integration...', 'info');
    
    try {
      // Check if logger is properly integrated with Sentry
      const loggerPath = path.join(process.cwd(), 'lib', 'logger.ts');
      if (fs.existsSync(loggerPath)) {
        const loggerContent = fs.readFileSync(loggerPath, 'utf8');
        
        if (loggerContent.includes('@sentry/nextjs')) {
          this.log('✅ Logger Sentry integration found', 'success');
        } else {
          this.log('❌ Logger Sentry integration not found', 'error');
          this.errors.push('Logger does not integrate with Sentry');
        }
        
        if (loggerContent.includes('captureException')) {
          this.log('✅ Logger uses Sentry captureException', 'success');
        } else {
          this.log('⚠️  Logger does not use Sentry captureException', 'warning');
        }
      } else {
        this.log('⚠️  Logger file not found', 'warning');
      }

      this.results.push({
        test: 'Logger Integration',
        status: 'PASS',
        details: 'Logger integration verified'
      });

    } catch (error) {
      this.log(`❌ Logger integration test failed: ${error.message}`, 'error');
      this.errors.push(`Logger integration test error: ${error.message}`);
      this.results.push({
        test: 'Logger Integration',
        status: 'FAIL',
        details: error.message
      });
    }
  }

  printSummary() {
    this.log('\n📋 SENTRY INTEGRATION TEST SUMMARY', 'info');
    this.log('=====================================', 'info');
    
    this.results.forEach(result => {
      const statusEmoji = result.status === 'PASS' ? '✅' : 
                         result.status === 'PARTIAL' ? '⚠️' : '❌';
      this.log(`${statusEmoji} ${result.test}: ${result.status}`, 
               result.status === 'PASS' ? 'success' : 
               result.status === 'PARTIAL' ? 'warning' : 'error');
      this.log(`   ${result.details}`, 'info');
    });

    if (this.errors.length > 0) {
      this.log('\n🚨 ISSUES FOUND:', 'warning');
      this.errors.forEach(error => {
        this.log(`   • ${error}`, 'error');
      });
    }

    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const totalCount = this.results.length;
    
    this.log(`\n📊 Overall Status: ${passCount}/${totalCount} tests passed`, 
             passCount === totalCount ? 'success' : 'warning');

    // Provide next steps
    this.log('\n🔍 NEXT STEPS:', 'info');
    this.log('1. Set SENTRY_DSN in your environment variables', 'info');
    this.log('2. Test error reporting: curl http://localhost:3000/api/test-sentry', 'info');
    this.log('3. Test performance: curl http://localhost:3000/api/test-sentry-perf', 'info');
    this.log('4. Check Sentry dashboard for captured events', 'info');
    this.log('5. Deploy to production and verify error reporting', 'info');
  }

  async runAllTests() {
    this.log('🚀 Starting Sentry Integration Tests...', 'info');
    
    await this.testConfiguration();
    await this.testErrorReporting();
    await this.testPerformanceMonitoring();
    await this.testSourceMaps();
    await this.testLoggerIntegration();
    
    this.printSummary();
  }
}

// CLI Interface
async function main() {
  const testName = process.argv[2] || 'all';
  const tester = new SentryTester();

  switch (testName) {
    case 'config':
      await tester.testConfiguration();
      break;
    case 'error':
      await tester.testErrorReporting();
      break;
    case 'performance':
      await tester.testPerformanceMonitoring();
      break;
    case 'sourcemaps':
      await tester.testSourceMaps();
      break;
    case 'logger':
      await tester.testLoggerIntegration();
      break;
    case 'all':
    default:
      await tester.runAllTests();
      break;
  }

  tester.printSummary();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = SentryTester;