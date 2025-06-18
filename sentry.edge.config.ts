import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV !== 'production',

  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  beforeSend(event, hint) {
    // Filter out non-actionable errors for edge runtime
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        
        // Filter network errors
        if (message.includes('fetch') || message.includes('NetworkError')) {
          return null;
        }
        
        // Filter edge-specific errors that are non-critical
        if (message.includes('AbortError') || message.includes('TimeoutError')) {
          return null;
        }
      }
    }
    
    return event;
  },

  initialScope: {
    tags: {
      component: 'edge',
    },
  },
});