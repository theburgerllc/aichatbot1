'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface ConversionTrackerProps {
  userId?: string;
  sessionId?: string;
  industry?: string;
  source?: string;
  medium?: string;
  campaign?: string;
}

interface TrackingEvent {
  type: 'demo_click' | 'demo_complete' | 'calculator_start' | 'calculator_complete' | 
        'email_capture' | 'trial_signup' | 'trial_complete' | 'subscription_start' |
        'page_view' | 'scroll_depth' | 'time_on_page' | 'cta_click';
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
}

export default function ConversionTracker({
  userId,
  sessionId,
  industry,
  source,
  medium,
  campaign
}: ConversionTrackerProps) {
  const pathname = usePathname();
  const startTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);
  const isTracking = useRef<boolean>(true);

  // Generate session ID if not provided
  const currentSessionId = sessionId || (() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('conversion_session_id');
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('conversion_session_id', id);
      }
      return id;
    }
    return 'server_session';
  })();

  const trackEvent = useCallback(async (event: TrackingEvent) => {
    if (!isTracking.current) return;

    try {
      const enrichedEvent = {
        ...event,
        userId,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
        metadata: {
          ...event.metadata,
          industry,
          source,
          medium,
          campaign,
          page: pathname,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          location: await getLocationData(),
        }
      };

      // Send to our analytics API
      await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_event',
          ...enrichedEvent
        }),
      });

      // Send to Google Analytics if available
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.type, {
          event_category: 'conversion',
          event_label: event.properties?.label || pathname,
          value: event.properties?.value || 1,
          custom_map: event.properties,
        });
      }

      console.debug('Conversion event tracked:', event.type, enrichedEvent);
    } catch (error) {
      console.error('Failed to track conversion event:', error);
    }
  }, [userId, currentSessionId, industry, source, medium, campaign, pathname]);

  // Track page view
  useEffect(() => {
    trackEvent({
      type: 'page_view',
      properties: {
        page: pathname,
        timestamp: new Date().toISOString(),
      }
    });

    startTime.current = Date.now();
  }, [pathname, trackEvent]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const currentScrollDepth = Math.round((scrollTop / documentHeight) * 100);

      // Track scroll milestones (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (currentScrollDepth >= milestone && scrollDepth.current < milestone) {
          trackEvent({
            type: 'scroll_depth',
            properties: {
              depth: milestone,
              page: pathname,
            }
          });
        }
      }

      scrollDepth.current = Math.max(scrollDepth.current, currentScrollDepth);
    };

    const throttledHandleScroll = throttle(handleScroll, 250);
    window.addEventListener('scroll', throttledHandleScroll);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [trackEvent, pathname]);

  // Track time on page when leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTime.current;
      
      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon) {
        const eventData = JSON.stringify({
          action: 'track_event',
          type: 'time_on_page',
          userId,
          sessionId: currentSessionId,
          properties: {
            duration: timeOnPage,
            page: pathname,
            scrollDepth: scrollDepth.current,
          },
          timestamp: new Date().toISOString(),
        });

        navigator.sendBeacon('/api/analytics/conversion', eventData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, currentSessionId, pathname]);

  // Set up click tracking for CTA buttons and important elements
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Track clicks on elements with data-track attribute
      const trackElement = target.closest('[data-track]');
      if (trackElement) {
        const trackType = trackElement.getAttribute('data-track');
        const trackLabel = trackElement.getAttribute('data-track-label') || trackElement.textContent;
        const trackValue = trackElement.getAttribute('data-track-value');

        trackEvent({
          type: 'cta_click',
          properties: {
            element: trackType,
            label: trackLabel,
            value: trackValue ? parseInt(trackValue) : 1,
            page: pathname,
          }
        });
      }

      // Auto-track common conversion elements
      if (target.matches('button, [role="button"], a[href*="demo"], a[href*="trial"], a[href*="signup"]')) {
        const buttonText = target.textContent?.trim().toLowerCase() || '';
        
        let eventType: TrackingEvent['type'] = 'cta_click';
        if (buttonText.includes('demo')) eventType = 'demo_click';
        else if (buttonText.includes('trial') || buttonText.includes('signup')) eventType = 'trial_signup';
        
        trackEvent({
          type: eventType,
          properties: {
            buttonText,
            href: target.getAttribute('href'),
            page: pathname,
          }
        });
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [trackEvent, pathname]);

  // Expose tracking function globally for manual tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).trackConversion = trackEvent;
    }
  }, [trackEvent]);

  return null; // This is a tracking component, no visual output
}

// Utility functions
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

async function getLocationData() {
  try {
    // In production, you might use a geolocation service
    // For now, return mock data or try to get basic info from browser
    if (typeof navigator !== 'undefined' && navigator.language) {
      return {
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
    return {};
  } catch {
    return {};
  }
}

// TypeScript declarations for global tracking
declare global {
  interface Window {
    trackConversion?: (event: TrackingEvent) => Promise<void>;
    gtag?: (...args: any[]) => void;
  }
}