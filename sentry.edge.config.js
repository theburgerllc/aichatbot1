import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
  
  // Disable Sentry if no DSN is provided
  enabled: !!process.env.SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release information
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Additional tags
  initialScope: {
    tags: {
      component: 'edge'
    }
  }
});