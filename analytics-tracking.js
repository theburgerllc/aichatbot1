// Comprehensive Conversion Tracking System
// Designed for 32.25% demo CTR and 11.7% overall conversion targets

// Global tracking state
let trackingInitialized = false;
const sessionData = {
  startTime: Date.now(),
  pageViews: 0,
  industry: null,
  intent: 'low',
  source: null,
  deviceCategory: null,
  engagementScore: 0,
  conversions: [],
  microConversions: [],
  abTestVariants: {},
};

// DataLayer initialization with enhanced user context
window.dataLayer = window.dataLayer || [];

// Initialize tracking system
function initializeTracking() {
  if (trackingInitialized) return;

  // Detect user context
  sessionData.industry = detectIndustry();
  sessionData.intent = classifyIntent();
  sessionData.source = getTrafficSource();
  sessionData.deviceCategory = getDeviceCategory();

  // Initialize dataLayer with context
  dataLayer.push({
    event: 'pageview_enhanced',
    userIndustry: sessionData.industry,
    userIntent: sessionData.intent,
    entrySource: sessionData.source,
    deviceCategory: sessionData.deviceCategory,
    sessionId: generateSessionId(),
    timestamp: Date.now(),
  });

  // Start session tracking
  startSessionTracking();

  // Initialize A/B tests
  initializeABTests();

  // Set up automated optimization
  setupAutomatedOptimization();

  trackingInitialized = true;

  console.log('🚀 Advanced tracking initialized:', sessionData);
}

// Industry Detection Algorithm
function detectIndustry() {
  // Priority 1: URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('industry')) {
    trackEvent('industry_detected', {
      method: 'url_param',
      industry: urlParams.get('industry'),
    });
    return urlParams.get('industry');
  }

  // Priority 2: Referrer analysis
  const referrer = document.referrer.toLowerCase();
  if (
    referrer.includes('healthcare') ||
    referrer.includes('medical') ||
    referrer.includes('doctor')
  ) {
    trackEvent('industry_detected', {
      method: 'referrer',
      industry: 'healthcare',
    });
    return 'healthcare';
  }
  if (
    referrer.includes('legal') ||
    referrer.includes('law') ||
    referrer.includes('attorney')
  ) {
    trackEvent('industry_detected', { method: 'referrer', industry: 'legal' });
    return 'legal';
  }
  if (
    referrer.includes('shop') ||
    referrer.includes('ecommerce') ||
    referrer.includes('store') ||
    referrer.includes('shopify')
  ) {
    trackEvent('industry_detected', {
      method: 'referrer',
      industry: 'ecommerce',
    });
    return 'ecommerce';
  }

  // Priority 3: Time-based detection (business hours = professional services)
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 17) {
    const industry = Math.random() > 0.5 ? 'healthcare' : 'legal';
    trackEvent('industry_detected', { method: 'time_based', industry });
    return industry;
  }

  // Priority 4: Device-based detection (mobile = higher ecommerce probability)
  if (getDeviceCategory() === 'mobile' && Math.random() > 0.4) {
    trackEvent('industry_detected', {
      method: 'device_based',
      industry: 'ecommerce',
    });
    return 'ecommerce';
  }

  // Priority 5: Previous session data
  const previousIndustry = localStorage.getItem('user_industry');
  if (previousIndustry) {
    trackEvent('industry_detected', {
      method: 'previous_session',
      industry: previousIndustry,
    });
    return previousIndustry;
  }

  // Default: Weighted random based on conversion data
  const weights = { healthcare: 0.4, legal: 0.35, ecommerce: 0.25 };
  const random = Math.random();
  let industry = 'ecommerce';

  if (random < weights.healthcare) {
    industry = 'healthcare';
  } else if (random < weights.healthcare + weights.legal) {
    industry = 'legal';
  }

  trackEvent('industry_detected', { method: 'weighted_random', industry });
  return industry;
}

// Intent Classification
function classifyIntent() {
  const highIntentIndicators = [
    'pricing',
    'demo',
    'trial',
    'buy',
    'purchase',
    'signup',
    'start',
    'calculator',
    'roi',
    'savings',
    'cost',
  ];

  const mediumIntentIndicators = [
    'features',
    'how-it-works',
    'benefits',
    'compare',
    'vs',
    'integration',
    'security',
    'compliance',
  ];

  const currentPath = window.location.pathname.toLowerCase();
  const currentSearch = window.location.search.toLowerCase();
  const currentHash = window.location.hash.toLowerCase();
  const fullUrl = currentPath + currentSearch + currentHash;

  // Check for high intent indicators
  if (highIntentIndicators.some(indicator => fullUrl.includes(indicator))) {
    trackEvent('intent_classified', { intent: 'high', method: 'url_analysis' });
    return 'high';
  }

  // Check for medium intent indicators
  if (mediumIntentIndicators.some(indicator => fullUrl.includes(indicator))) {
    trackEvent('intent_classified', {
      intent: 'medium',
      method: 'url_analysis',
    });
    return 'medium';
  }

  // Check previous session activity
  const demoProgress = sessionStorage.getItem('demoProgress');
  const calculatorUsed = localStorage.getItem('calculator_used');

  if (demoProgress || calculatorUsed) {
    trackEvent('intent_classified', {
      intent: 'medium',
      method: 'previous_activity',
    });
    return 'medium';
  }

  // Check referrer intent
  const referrer = document.referrer.toLowerCase();
  if (
    referrer.includes('google') &&
    (referrer.includes('chatbot') || referrer.includes('automation'))
  ) {
    trackEvent('intent_classified', {
      intent: 'medium',
      method: 'search_intent',
    });
    return 'medium';
  }

  trackEvent('intent_classified', { intent: 'low', method: 'default' });
  return 'low';
}

// Traffic Source Detection
function getTrafficSource() {
  const referrer = document.referrer;
  const utmSource = new URLSearchParams(window.location.search).get(
    'utm_source'
  );

  if (utmSource) return utmSource;

  if (!referrer || referrer === '') return 'direct';

  const domain = new URL(referrer).hostname.toLowerCase();

  // Search engines
  if (domain.includes('google')) return 'google';
  if (domain.includes('bing')) return 'bing';
  if (domain.includes('yahoo')) return 'yahoo';
  if (domain.includes('duckduckgo')) return 'duckduckgo';

  // Social media
  if (domain.includes('facebook') || domain.includes('fb.com'))
    return 'facebook';
  if (domain.includes('twitter') || domain.includes('t.co')) return 'twitter';
  if (domain.includes('linkedin')) return 'linkedin';
  if (domain.includes('youtube')) return 'youtube';

  // Industry sites
  if (domain.includes('healthcare') || domain.includes('medical'))
    return 'healthcare_site';
  if (domain.includes('legal') || domain.includes('law')) return 'legal_site';
  if (domain.includes('shopify') || domain.includes('ecommerce'))
    return 'ecommerce_site';

  return 'referral';
}

// Device Category Detection
function getDeviceCategory() {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();

  if (
    width <= 768 ||
    userAgent.includes('mobile') ||
    userAgent.includes('android') ||
    userAgent.includes('iphone')
  ) {
    return 'mobile';
  }
  if (
    width <= 1024 ||
    userAgent.includes('tablet') ||
    userAgent.includes('ipad')
  ) {
    return 'tablet';
  }
  return 'desktop';
}

// Session ID Generator
function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Enhanced Event Tracking
function trackEvent(eventName, properties = {}) {
  const eventData = {
    event: eventName,
    event_category: properties.category || 'engagement',
    event_label: properties.label || sessionData.industry,
    timestamp: Date.now(),
    session_id: sessionData.sessionId,
    user_industry: sessionData.industry,
    user_intent: sessionData.intent,
    traffic_source: sessionData.source,
    device_category: sessionData.deviceCategory,
    engagement_score: sessionData.engagementScore,
    ...properties,
  };

  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }

  // Google Tag Manager
  dataLayer.push(eventData);

  // Internal tracking for optimization
  updateEngagementScore(eventName, properties);

  // Store for funnel analysis
  sessionData.conversions.push({
    event: eventName,
    timestamp: Date.now(),
    properties,
  });

  console.log('📊 Event tracked:', eventName, eventData);
}

// Micro-Conversion Definitions
const microConversions = {
  page_scroll_25: { value: 5, weight: 0.1 },
  page_scroll_50: { value: 10, weight: 0.2 },
  page_scroll_75: { value: 15, weight: 0.3 },
  video_play: { value: 20, weight: 0.4 },
  demo_started: { value: 25, weight: 0.5 },
  demo_25_percent: { value: 40, weight: 0.6 },
  demo_50_percent: { value: 60, weight: 0.7 },
  demo_75_percent: { value: 80, weight: 0.8 },
  demo_completed: { value: 100, weight: 1.0 },
  calculator_started: { value: 30, weight: 0.4 },
  calculator_input_changed: { value: 10, weight: 0.2 },
  calculator_completed: { value: 70, weight: 0.8 },
  calculator_email_submitted: { value: 90, weight: 0.9 },
  pricing_viewed: { value: 50, weight: 0.6 },
  features_explored: { value: 25, weight: 0.3 },
  integration_clicked: { value: 35, weight: 0.4 },
  testimonial_viewed: { value: 20, weight: 0.3 },
  case_study_downloaded: { value: 60, weight: 0.7 },
  email_captured: { value: 80, weight: 0.8 },
  consultation_scheduled: { value: 120, weight: 1.2 },
  trial_started: { value: 200, weight: 2.0 },
};

// Track Micro-Conversions
function trackMicroConversion(conversionType, additionalData = {}) {
  const conversion = microConversions[conversionType];
  if (!conversion) return;

  sessionData.microConversions.push({
    type: conversionType,
    value: conversion.value,
    timestamp: Date.now(),
    ...additionalData,
  });

  // Update engagement score
  sessionData.engagementScore += conversion.weight;

  // Track as custom event
  trackEvent('micro_conversion', {
    conversion_type: conversionType,
    conversion_value: conversion.value,
    total_engagement_score: sessionData.engagementScore,
    category: 'micro_conversion',
    ...additionalData,
  });

  // Check for qualification thresholds
  checkLeadQualification();
}

// Enhanced Ecommerce Tracking
function trackEcommerce(action, planData) {
  const ecommerceData = {
    currency: 'USD',
    value: planData.price,
    items: [
      {
        item_id: planData.id,
        item_name: planData.name,
        item_category: 'subscription',
        item_variant: planData.billing_period,
        price: planData.price,
        quantity: 1,
        discount: planData.discount || 0,
      },
    ],
  };

  // Track specific ecommerce actions
  switch (action) {
    case 'view_item':
      gtag('event', 'view_item', ecommerceData);
      trackEvent('pricing_plan_viewed', {
        plan_id: planData.id,
        plan_name: planData.name,
        plan_price: planData.price,
        category: 'ecommerce',
      });
      break;

    case 'add_to_cart':
      gtag('event', 'add_to_cart', ecommerceData);
      trackEvent('plan_selected', {
        plan_id: planData.id,
        plan_name: planData.name,
        plan_price: planData.price,
        category: 'ecommerce',
      });
      break;

    case 'begin_checkout':
      gtag('event', 'begin_checkout', ecommerceData);
      trackEvent('checkout_started', {
        plan_id: planData.id,
        plan_name: planData.name,
        plan_price: planData.price,
        category: 'ecommerce',
      });
      break;

    case 'purchase':
      gtag('event', 'purchase', {
        transaction_id: planData.transaction_id,
        ...ecommerceData,
      });
      trackEvent('trial_started', {
        plan_id: planData.id,
        plan_name: planData.name,
        plan_price: planData.price,
        transaction_id: planData.transaction_id,
        value: planData.ltv_prediction || planData.price * 12,
        category: 'conversion',
      });
      break;
  }
}

// Engagement Score Calculation
function updateEngagementScore(eventName, _properties) {
  const timeSpent = Date.now() - sessionData.startTime;
  const timeBonus = Math.min(timeSpent / 60000, 5); // Max 5 points for time

  // Event-specific scoring
  let eventScore = 0;
  if (eventName.includes('demo')) eventScore = 2;
  if (eventName.includes('calculator')) eventScore = 1.5;
  if (eventName.includes('pricing')) eventScore = 1;
  if (eventName.includes('scroll')) eventScore = 0.5;
  if (eventName.includes('click')) eventScore = 0.3;

  sessionData.engagementScore += eventScore + timeBonus * 0.1;

  // Store engagement score in dataLayer for GTM
  dataLayer.push({
    event: 'engagement_score_updated',
    engagement_score: sessionData.engagementScore,
    session_time: timeSpent,
  });
}

// Lead Qualification System
function checkLeadQualification() {
  const score = sessionData.engagementScore;
  let qualification = 'cold';

  if (score >= 10) qualification = 'hot';
  else if (score >= 5) qualification = 'warm';

  // Check for qualification change
  const previousQualification = sessionStorage.getItem('lead_qualification');
  if (qualification !== previousQualification) {
    sessionStorage.setItem('lead_qualification', qualification);

    trackEvent('lead_qualification_changed', {
      previous_qualification: previousQualification || 'new',
      new_qualification: qualification,
      engagement_score: score,
      category: 'lead_scoring',
    });

    // Trigger personalization changes
    personalizeExperience(qualification);
  }
}

// Experience Personalization
function personalizeExperience(qualification) {
  switch (qualification) {
    case 'hot': {
      // Show high-intent CTAs
      document.querySelectorAll('.primary-cta').forEach(btn => {
        btn.style.backgroundColor = '#DC2626'; // Red for urgency
        btn.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.3)';
      });

      // Add urgency messaging
      const urgencyBadge = document.createElement('div');
      urgencyBadge.className = 'urgency-badge';
      urgencyBadge.innerHTML = '🔥 Limited time: 25% off first month';
      urgencyBadge.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 1000;
                background: #DC2626; color: white; padding: 12px 20px;
                border-radius: 8px; font-weight: 600; animation: pulse 2s infinite;
            `;
      document.body.appendChild(urgencyBadge);
      break;
    }

    case 'warm':
      // Highlight demo and calculator CTAs
      document
        .querySelectorAll('[href*="demo"], [href*="calculator"]')
        .forEach(btn => {
          btn.style.border = '2px solid #F59E0B';
          btn.style.position = 'relative';
        });
      break;
  }

  trackEvent('experience_personalized', {
    qualification,
    engagement_score: sessionData.engagementScore,
    category: 'personalization',
  });
}

// A/B Testing Framework
function initializeABTests() {
  const tests = {
    headline_test: {
      variants: [
        'Save $43,702 Daily with HIPAA-Compliant AI',
        'Cut Customer Service Costs by 68%',
        'Automate 73% of Patient Communications',
      ],
      traffic_split: [0.33, 0.33, 0.34],
      element_selector: '.rotating-headline',
    },
    cta_button_test: {
      variants: [
        'Start My Free Trial',
        'Get Started Free',
        'Try Risk-Free for 30 Days',
      ],
      traffic_split: [0.33, 0.33, 0.34],
      element_selector: '.primary-cta',
    },
    demo_length_test: {
      variants: ['short', 'medium', 'long'],
      traffic_split: [0.33, 0.33, 0.34],
      config_key: 'demo_length',
    },
  };

  Object.keys(tests).forEach(testName => {
    const test = tests[testName];
    const random = Math.random();
    let selectedVariant = 0;
    let cumulativeWeight = 0;

    for (let i = 0; i < test.traffic_split.length; i++) {
      cumulativeWeight += test.traffic_split[i];
      if (random <= cumulativeWeight) {
        selectedVariant = i;
        break;
      }
    }

    sessionData.abTestVariants[testName] = {
      variant: selectedVariant,
      variant_name: test.variants[selectedVariant],
    };

    // Apply test variant
    if (test.element_selector) {
      const elements = document.querySelectorAll(test.element_selector);
      elements.forEach(el => {
        if (el.textContent.trim()) {
          el.textContent = test.variants[selectedVariant];
        }
      });
    }

    // Store in sessionStorage for consistency
    sessionStorage.setItem(`ab_test_${testName}`, selectedVariant.toString());

    trackEvent('ab_test_assigned', {
      test_name: testName,
      variant: selectedVariant,
      variant_name: test.variants[selectedVariant],
      category: 'ab_testing',
    });
  });
}

// Session Tracking
function startSessionTracking() {
  // Track page scroll depth
  let maxScroll = 0;
  const scrollDepths = [25, 50, 75, 90];

  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      scrollDepths.forEach(depth => {
        if (
          scrollPercent >= depth &&
          !sessionStorage.getItem(`scroll_${depth}`)
        ) {
          sessionStorage.setItem(`scroll_${depth}`, 'true');
          trackMicroConversion(`page_scroll_${depth}`);
        }
      });
    }
  });

  // Track time on page milestones
  const timeThresholds = [30, 60, 120, 300]; // seconds
  timeThresholds.forEach(threshold => {
    setTimeout(() => {
      if (!sessionStorage.getItem(`time_${threshold}`)) {
        sessionStorage.setItem(`time_${threshold}`, 'true');
        trackEvent('time_milestone', {
          threshold_seconds: threshold,
          category: 'engagement',
        });
      }
    }, threshold * 1000);
  });

  // Track tab visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackEvent('tab_hidden', { category: 'engagement' });
    } else {
      trackEvent('tab_visible', { category: 'engagement' });
    }
  });

  // Track page unload
  window.addEventListener('beforeunload', () => {
    const sessionDuration = Date.now() - sessionData.startTime;
    trackEvent('session_end', {
      session_duration: sessionDuration,
      page_views: sessionData.pageViews,
      micro_conversions: sessionData.microConversions.length,
      engagement_score: sessionData.engagementScore,
      category: 'session',
    });
  });
}

// Automated Optimization Rules
function setupAutomatedOptimization() {
  // Check conversion rates every hour
  setInterval(() => {
    const conversionRate = calculateConversionRate();
    const targetRate = 0.117; // 11.7% target

    if (conversionRate < targetRate * 0.8) {
      // Performance alert
      trackEvent('performance_alert', {
        current_rate: conversionRate,
        target_rate: targetRate,
        severity: 'high',
        category: 'optimization',
      });

      // Auto-optimization triggers
      optimizePerformance();
    }
  }, 3600000); // Check hourly

  // Real-time optimization based on user behavior
  setInterval(() => {
    optimizeUserExperience();
  }, 30000); // Check every 30 seconds
}

// Performance Optimization
function optimizePerformance() {
  const demoCompletionRate = getDemoCompletionRate();
  const calculatorEngagement = getCalculatorEngagement();

  // Auto-adjust demo length if completion rate is low
  if (demoCompletionRate < 0.5) {
    trackEvent('auto_optimization_triggered', {
      action: 'shorten_demo',
      trigger: 'low_completion_rate',
      rate: demoCompletionRate,
      category: 'optimization',
    });

    // Implement demo shortening
    sessionStorage.setItem('demo_shortened', 'true');
  }

  // Simplify calculator if engagement is low
  if (calculatorEngagement < 0.3) {
    trackEvent('auto_optimization_triggered', {
      action: 'simplify_calculator',
      trigger: 'low_engagement',
      rate: calculatorEngagement,
      category: 'optimization',
    });

    // Implement calculator simplification
    sessionStorage.setItem('calculator_simplified', 'true');
  }
}

// Real-time User Experience Optimization
function optimizeUserExperience() {
  const _qualification = sessionStorage.getItem('lead_qualification');
  const timeOnPage = Date.now() - sessionData.startTime;

  // Show exit intent for engaged users after 2 minutes
  if (
    timeOnPage > 120000 &&
    sessionData.engagementScore > 3 &&
    !sessionStorage.getItem('exit_intent_shown')
  ) {
    sessionStorage.setItem('exit_intent_shown', 'true');

    // Setup exit intent detection
    document.addEventListener('mouseleave', e => {
      if (e.clientY <= 0) {
        trackEvent('exit_intent_triggered', {
          engagement_score: sessionData.engagementScore,
          time_on_page: timeOnPage,
          category: 'optimization',
        });

        // Show exit intent modal (if implemented)
        const exitModal = document.getElementById('exitIntentModal');
        if (exitModal) {
          exitModal.classList.add('show');
        }
      }
    });
  }
}

// Utility Functions
function calculateConversionRate() {
  // Get conversion data from localStorage or API
  const trials = parseInt(localStorage.getItem('total_trials') || '0');
  const visitors = parseInt(localStorage.getItem('total_visitors') || '1');
  return trials / visitors;
}

function getDemoCompletionRate() {
  const started = parseInt(localStorage.getItem('demos_started') || '0');
  const completed = parseInt(localStorage.getItem('demos_completed') || '0');
  return started > 0 ? completed / started : 0;
}

function getCalculatorEngagement() {
  const started = parseInt(localStorage.getItem('calculators_started') || '0');
  const completed = parseInt(
    localStorage.getItem('calculators_completed') || '0'
  );
  return started > 0 ? completed / started : 0;
}

// Initialize tracking when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTracking);
} else {
  initializeTracking();
}

// Export functions for global use
window.trackEvent = trackEvent;
window.trackMicroConversion = trackMicroConversion;
window.trackEcommerce = trackEcommerce;
window.sessionData = sessionData;
