import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV !== 'production',

  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,

  beforeSend(event, hint) {
    // Filter out non-actionable errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        
        // Filter network errors that are common in browsers
        if (message.includes('fetch') || message.includes('NetworkError')) {
          return null;
        }
        
        // Filter chunk load errors (common with code splitting)
        if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
          return null;
        }
        
        // Filter browser extension errors
        if (message.includes('extension') || message.includes('chrome-extension')) {
          return null;
        }

        // Filter ResizeObserver errors (common browser quirk)
        if (message.includes('ResizeObserver')) {
          return null;
        }
      }
    }
    
    return event;
  },

  initialScope: {
    tags: {
      component: 'client',
    },
  },
});