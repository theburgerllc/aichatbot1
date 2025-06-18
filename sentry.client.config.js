import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture 100% of the transactions for session replay.
  // If you don't want to use Session Replay, you can remove this,
  // or set to 0 to disable it.
  replaysSessionSampleRate: 0.1,
  
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
  
  // Disable Sentry if no DSN is provided
  enabled: !!process.env.SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release information
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Filter out common errors that aren't actionable
  beforeSend(event, hint) {
    // Filter out network errors
    if (event.exception) {
      const error = hint.originalException;
      if (error?.name === 'NetworkError' || error?.name === 'ChunkLoadError') {
        return null;
      }
    }
    
    return event;
  },
  
  // Additional tags
  initialScope: {
    tags: {
      component: 'client'
    }
  }
});