export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.SENTRY_DSN,
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Release Health
      environment: process.env.NODE_ENV || 'development',
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with an error will be recorded
      
      // Capture Console
      initialScope: {
        tags: {
          component: 'server',
        },
      },
      
      beforeSend(event, hint) {
        // Filter out non-actionable errors
        if (event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = error.message as string;
            
            // Filter network errors
            if (message.includes('fetch') || message.includes('NetworkError')) {
              return null;
            }
            
            // Filter chunk load errors
            if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
              return null;
            }
            
            // Filter common browser extension errors
            if (message.includes('extension') || message.includes('chrome-extension')) {
              return null;
            }
          }
        }
        
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.SENTRY_DSN,
      
      // Adjust sample rate for edge
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      environment: process.env.NODE_ENV || 'development',
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      
      initialScope: {
        tags: {
          component: 'edge',
        },
      },
    });
  }
}

// Add the onRequestError hook for Next.js 15
export async function onRequestError(err: unknown, request: unknown, context: unknown) {
  const { captureRequestError } = await import('@sentry/nextjs');
  captureRequestError(err, request as any, context as any);
}
