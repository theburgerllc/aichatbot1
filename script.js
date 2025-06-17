// Global variables
let currentIndustry = 'default';
let headlineRotationInterval;
let testimonialRotationInterval;
let notificationInterval;
let exitIntentTriggered = false;
let mouseLeaveCount = 0;

// Industry data
const industryData = {
    healthcare: {
        headlines: ["Save $43,702 Daily with HIPAA-Compliant AI"],
        testimonials: {
            quote: "Reduced patient wait times by 73% and saved $2,400 monthly on staff costs.",
            author: "Dr. Sarah Chen, Family Practice"
        },
        notifications: [
            "Medical Practice in California just started their free trial",
            "Dental Clinic in Texas upgraded to Pro plan",
            "Healthcare Group in Florida saved $12K this month"
        ],
        videoSrc: "/demo-healthcare"
    },
    legal: {
        headlines: ["Convert 35% More Leads Starting Tonight"],
        testimonials: {
            quote: "Converted 34% more leads and automated 80% of initial consultations.",
            author: "Michael Torres, Personal Injury Law"
        },
        notifications: [
            "Law Firm in New York just started their free trial",
            "Legal Practice in Illinois converted 47 leads today",
            "Attorney in Georgia saved 15 hours this week"
        ],
        videoSrc: "/demo-legal"
    },
    ecommerce: {
        headlines: ["Recover $32,000 Monthly from Abandoned Carts"],
        testimonials: {
            quote: "Recovered $28K in abandoned carts and increased customer satisfaction 45%.",
            author: "Lisa Park, Online Retailer"
        },
        notifications: [
            "E-commerce Store in Miami just started their free trial",
            "Online Retailer in Seattle recovered $3,200 today",
            "Shopify Store in Portland increased conversions 34%"
        ],
        videoSrc: "/demo-ecommerce"
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeIndustryDetection();
    initializeHeadlineRotation();
    initializeTestimonialRotation();
    initializeCalculator();
    initializeScrollAnimations();
    initializeExitIntent();
    initializeNotifications();
    initializeMobileMenu();
    initializeVideoPlayers();
    
    // Track page load
    trackEvent('page_view', {
        industry: currentIndustry,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
    });
});

// Industry Detection Algorithm
function initializeIndustryDetection() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer.toLowerCase();
    const currentHour = new Date().getHours();
    const isMobile = window.innerWidth <= 768;
    
    // Priority 1: URL parameters
    if (urlParams.get('industry')) {
        currentIndustry = urlParams.get('industry');
        trackEvent('industry_detection', { method: 'url_param', industry: currentIndustry });
        return;
    }
    
    // Priority 2: Referrer analysis
    if (referrer.includes('healthcare') || referrer.includes('medical') || referrer.includes('doctor')) {
        currentIndustry = 'healthcare';
        trackEvent('industry_detection', { method: 'referrer', industry: currentIndustry });
        return;
    }
    
    if (referrer.includes('legal') || referrer.includes('law') || referrer.includes('attorney')) {
        currentIndustry = 'legal';
        trackEvent('industry_detection', { method: 'referrer', industry: currentIndustry });
        return;
    }
    
    if (referrer.includes('shop') || referrer.includes('ecommerce') || referrer.includes('store')) {
        currentIndustry = 'ecommerce';
        trackEvent('industry_detection', { method: 'referrer', industry: currentIndustry });
        return;
    }
    
    // Priority 3: Time-based detection (business hours = professional services)
    if (currentHour >= 9 && currentHour <= 17) {
        currentIndustry = Math.random() > 0.5 ? 'healthcare' : 'legal';
        trackEvent('industry_detection', { method: 'time_based', industry: currentIndustry });
        return;
    }
    
    // Priority 4: Device-based detection (mobile = higher ecommerce probability)
    if (isMobile && Math.random() > 0.4) {
        currentIndustry = 'ecommerce';
        trackEvent('industry_detection', { method: 'device_based', industry: currentIndustry });
        return;
    }
    
    // Priority 5: Random selection weighted by conversion data
    const weights = { healthcare: 0.4, legal: 0.35, ecommerce: 0.25 };
    const random = Math.random();
    if (random < weights.healthcare) {
        currentIndustry = 'healthcare';
    } else if (random < weights.healthcare + weights.legal) {
        currentIndustry = 'legal';
    } else {
        currentIndustry = 'ecommerce';
    }
    
    trackEvent('industry_detection', { method: 'weighted_random', industry: currentIndustry });
}

// Headline Rotation
function initializeHeadlineRotation() {
    const headlineElement = document.getElementById('rotatingHeadline');
    const headlines = JSON.parse(headlineElement.dataset.industries);
    
    // Set initial headline based on detected industry
    const industryHeadline = headlines.find(h => h.industry === currentIndustry);
    if (industryHeadline) {
        headlineElement.textContent = industryHeadline.text;
    }
    
    let currentIndex = 0;
    headlineRotationInterval = setInterval(() => {
        headlineElement.classList.add('fade-out');
        
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % headlines.length;
            headlineElement.textContent = headlines[currentIndex].text;
            headlineElement.classList.remove('fade-out');
            
            trackEvent('headline_rotation', { 
                headline: headlines[currentIndex].text,
                industry: headlines[currentIndex].industry 
            });
        }, 250);
    }, 3000);
}

// Testimonial Rotation
function initializeTestimonialRotation() {
    const testimonials = document.querySelectorAll('.testimonial');
    let currentTestimonial = 0;
    
    // Show industry-specific testimonial first
    testimonials.forEach((testimonial, index) => {
        testimonial.classList.remove('active');
        if (testimonial.dataset.industry === currentIndustry) {
            testimonial.classList.add('active');
            currentTestimonial = index;
        }
    });
    
    testimonialRotationInterval = setInterval(() => {
        testimonials[currentTestimonial].classList.remove('active');
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        testimonials[currentTestimonial].classList.add('active');
        
        trackEvent('testimonial_rotation', { 
            testimonial_index: currentTestimonial,
            industry: testimonials[currentTestimonial].dataset.industry 
        });
    }, 5000);
}

// Calculator Functionality
function initializeCalculator() {
    const monthlyLeads = document.getElementById('monthlyLeads');
    const conversionRate = document.getElementById('conversionRate');
    const avgOrderValue = document.getElementById('avgOrderValue');
    const result = document.getElementById('calculatorResult');
    
    function calculateSavings() {
        const leads = parseInt(monthlyLeads.value) || 0;
        const conversion = parseFloat(conversionRate.value) || 0;
        const orderValue = parseFloat(avgOrderValue.value) || 0;
        
        if (leads && conversion && orderValue) {
            // Calculate current monthly revenue
            const currentRevenue = leads * (conversion / 100) * orderValue;
            
            // Calculate improved revenue with 35% better conversion
            const improvedConversion = Math.min(conversion * 1.35, 100);
            const improvedRevenue = leads * (improvedConversion / 100) * orderValue;
            
            // Calculate monthly savings (difference)
            const monthlySavings = improvedRevenue - currentRevenue;
            
            result.innerHTML = `<strong>Monthly Savings: $${monthlySavings.toLocaleString()}</strong>`;
            
            trackEvent('calculator_result', {
                leads: leads,
                conversion: conversion,
                order_value: orderValue,
                savings: monthlySavings,
                industry: currentIndustry
            });
        } else {
            result.innerHTML = '<strong>Monthly Savings: $0</strong>';
        }
    }
    
    [monthlyLeads, conversionRate, avgOrderValue].forEach(input => {
        input.addEventListener('input', calculateSavings);
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                trackEvent('section_viewed', {
                    section: entry.target.id || entry.target.className,
                    industry: currentIndustry
                });
            }
        });
    }, observerOptions);
    
    // Observe all major sections
    document.querySelectorAll('.trifecta-column').forEach(el => observer.observe(el));
}

// Exit Intent Detection
function initializeExitIntent() {
    let exitIntentTimer;
    
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && !exitIntentTriggered) {
            mouseLeaveCount++;
            
            // Trigger after 2nd mouse leave to avoid false positives
            if (mouseLeaveCount >= 2) {
                exitIntentTimer = setTimeout(() => {
                    showExitIntent();
                }, 500);
            }
        }
    });
    
    document.addEventListener('mouseenter', () => {
        if (exitIntentTimer) {
            clearTimeout(exitIntentTimer);
        }
    });
    
    // Also trigger on scroll attempt to leave
    let scrollAttempts = 0;
    window.addEventListener('scroll', () => {
        if (window.scrollY === 0) {
            scrollAttempts++;
            if (scrollAttempts >= 3 && !exitIntentTriggered) {
                setTimeout(showExitIntent, 1000);
            }
        }
    });
}

function showExitIntent() {
    if (exitIntentTriggered) return;
    
    exitIntentTriggered = true;
    const modal = document.getElementById('exitIntentModal');
    modal.classList.add('show');
    
    // Update content based on industry
    const industryText = currentIndustry === 'healthcare' ? '847 healthcare practices' :
                        currentIndustry === 'legal' ? '623 law firms' : '934 online stores';
    
    modal.querySelector('p').textContent = `See why ${industryText} joined this month`;
    
    trackEvent('exit_intent_shown', { industry: currentIndustry, trigger_method: 'mouse_leave' });
}

// Notification System
function initializeNotifications() {
    const notifications = industryData[currentIndustry]?.notifications || [
        "Business in Your Area just started their free trial",
        "Local Company upgraded to Pro plan",
        "Nearby Business saved thousands this month"
    ];
    
    let notificationIndex = 0;
    
    function showNotification() {
        const popup = document.getElementById('notificationPopup');
        const title = document.getElementById('notificationTitle');
        const message = document.getElementById('notificationMessage');
        
        const notificationText = notifications[notificationIndex];
        const parts = notificationText.split(' just ');
        
        title.textContent = parts[0];
        message.textContent = 'just ' + (parts[1] || 'took action');
        
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 4000);
        
        notificationIndex = (notificationIndex + 1) % notifications.length;
        
        trackEvent('notification_shown', {
            notification: notificationText,
            industry: currentIndustry
        });
    }
    
    // Show first notification after 8 seconds, then every 25-35 seconds
    setTimeout(showNotification, 8000);
    notificationInterval = setInterval(showNotification, 30000);
}

// Mobile Menu
function initializeMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.header-nav');
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('mobile-open');
            toggle.classList.toggle('active');
            
            trackEvent('mobile_menu_toggle', { action: nav.classList.contains('mobile-open') ? 'open' : 'close' });
        });
    }
}

// Video Players
function initializeVideoPlayers() {
    const heroVideo = document.querySelector('.hero-video');
    const microDemo = document.getElementById('microDemo');
    
    // Update micro demo source based on industry
    if (microDemo && industryData[currentIndustry]) {
        const sources = microDemo.querySelectorAll('source');
        sources.forEach(source => {
            const currentSrc = source.src;
            const extension = currentSrc.split('.').pop();
            source.src = `${industryData[currentIndustry].videoSrc}.${extension}`;
        });
        microDemo.load();
    }
    
    // Track video interactions
    [heroVideo, microDemo].forEach(video => {
        if (video) {
            video.addEventListener('play', () => {
                trackEvent('video_play', {
                    video_type: video.classList.contains('hero-video') ? 'hero' : 'micro_demo',
                    industry: currentIndustry
                });
            });
            
            video.addEventListener('ended', () => {
                trackEvent('video_complete', {
                    video_type: video.classList.contains('hero-video') ? 'hero' : 'micro_demo',
                    industry: currentIndustry
                });
            });
        }
    });
}

// Modal Functions
function openDemo() {
    const modal = document.getElementById('demoModal');
    modal.classList.add('show');
    
    const video = document.getElementById('demoVideo');
    video.currentTime = 0;
    
    trackEvent('demo_modal_opened', { industry: currentIndustry });
}

function closeDemo() {
    const modal = document.getElementById('demoModal');
    modal.classList.remove('show');
    
    const video = document.getElementById('demoVideo');
    video.pause();
    
    trackEvent('demo_modal_closed', { industry: currentIndustry });
}

function openCalculator() {
    const modal = document.getElementById('calculatorModal');
    modal.classList.add('show');
    
    // Initialize full calculator
    const fullCalculator = modal.querySelector('.full-calculator');
    fullCalculator.innerHTML = `
        <div class="calculator-section">
            <h3>Business Details</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Monthly Website Visitors</label>
                    <input type="number" id="fullMonthlyVisitors" placeholder="5000">
                </div>
                <div class="form-group">
                    <label>Current Conversion Rate (%)</label>
                    <input type="number" id="fullConversionRate" placeholder="2.5" step="0.1">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Average Order Value ($)</label>
                    <input type="number" id="fullOrderValue" placeholder="150">
                </div>
                <div class="form-group">
                    <label>Customer Support Hours/Month</label>
                    <input type="number" id="supportHours" placeholder="160">
                </div>
            </div>
        </div>
        
        <div class="calculator-results">
            <h3>Your ROI with AI Chatbots</h3>
            <div class="result-grid">
                <div class="result-item">
                    <div class="result-value" id="monthlyIncrease">$0</div>
                    <div class="result-label">Monthly Revenue Increase</div>
                </div>
                <div class="result-item">
                    <div class="result-value" id="costSavings">$0</div>
                    <div class="result-label">Monthly Cost Savings</div>
                </div>
                <div class="result-item">
                    <div class="result-value" id="totalRoi">$0</div>
                    <div class="result-label">Total Monthly ROI</div>
                </div>
                <div class="result-item">
                    <div class="result-value" id="yearlyRoi">$0</div>
                    <div class="result-label">Yearly ROI</div>
                </div>
            </div>
        </div>
        
        <div class="calculator-cta">
            <button class="btn btn-primary btn-large" onclick="startTrial()">Get This ROI - Start Free Trial</button>
        </div>
    `;
    
    // Add event listeners for full calculator
    ['fullMonthlyVisitors', 'fullConversionRate', 'fullOrderValue', 'supportHours'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateFullROI);
    });
    
    trackEvent('calculator_modal_opened', { industry: currentIndustry });
}

function closeCalculator() {
    const modal = document.getElementById('calculatorModal');
    modal.classList.remove('show');
    
    trackEvent('calculator_modal_closed', { industry: currentIndustry });
}

function calculateFullROI() {
    const visitors = parseInt(document.getElementById('fullMonthlyVisitors').value) || 0;
    const conversion = parseFloat(document.getElementById('fullConversionRate').value) || 0;
    const orderValue = parseFloat(document.getElementById('fullOrderValue').value) || 0;
    const supportHours = parseInt(document.getElementById('supportHours').value) || 0;
    
    if (visitors && conversion && orderValue) {
        // Current monthly revenue
        const currentRevenue = visitors * (conversion / 100) * orderValue;
        
        // Improved conversion with AI (typically 25-35% improvement)
        const improvementRate = currentIndustry === 'legal' ? 0.35 : 
                               currentIndustry === 'healthcare' ? 0.28 : 0.32;
        const improvedRevenue = visitors * ((conversion * (1 + improvementRate)) / 100) * orderValue;
        const monthlyIncrease = improvedRevenue - currentRevenue;
        
        // Cost savings (support staff reduction)
        const costSavings = supportHours * 25; // $25/hour average
        
        // Total ROI
        const totalRoi = monthlyIncrease + costSavings;
        const yearlyRoi = totalRoi * 12;
        
        document.getElementById('monthlyIncrease').textContent = `$${monthlyIncrease.toLocaleString()}`;
        document.getElementById('costSavings').textContent = `$${costSavings.toLocaleString()}`;
        document.getElementById('totalRoi').textContent = `$${totalRoi.toLocaleString()}`;
        document.getElementById('yearlyRoi').textContent = `$${yearlyRoi.toLocaleString()}`;
        
        trackEvent('full_calculator_result', {
            visitors: visitors,
            conversion: conversion,
            order_value: orderValue,
            support_hours: supportHours,
            monthly_roi: totalRoi,
            yearly_roi: yearlyRoi,
            industry: currentIndustry
        });
    }
}

function closeExitIntent() {
    const modal = document.getElementById('exitIntentModal');
    modal.classList.remove('show');
    
    trackEvent('exit_intent_closed', { industry: currentIndustry });
}

function submitExitIntent(event) {
    event.preventDefault();
    
    const email = document.getElementById('exitIntentEmail').value;
    
    trackEvent('exit_intent_submit', {
        email: email,
        industry: currentIndustry,
        discount_claimed: true
    });
    
    // Here you would typically send the email to your backend
    alert('Discount claimed! Check your email for details.');
    closeExitIntent();
}

function startTrial() {
    trackEvent('trial_started', {
        industry: currentIndustry,
        source: 'cta_button'
    });
    
    // Redirect to trial signup page
    window.location.href = '/signup?industry=' + currentIndustry;
}

function closeNotification() {
    const popup = document.getElementById('notificationPopup');
    popup.classList.remove('show');
    
    trackEvent('notification_closed', { industry: currentIndustry });
}

function playMicroDemo() {
    const video = document.getElementById('microDemo');
    const playButton = document.querySelector('.play-button');
    
    if (video.paused) {
        video.play();
        playButton.style.display = 'none';
        
        setTimeout(() => {
            playButton.style.display = 'flex';
        }, 15000); // Show play button again after 15 seconds
    } else {
        video.pause();
        playButton.style.display = 'flex';
    }
    
    trackEvent('micro_demo_interaction', {
        action: video.paused ? 'pause' : 'play',
        industry: currentIndustry
    });
}

// Analytics and Tracking
function trackEvent(eventName, properties = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            custom_parameter_1: properties.industry || currentIndustry,
            custom_parameter_2: JSON.stringify(properties),
            event_category: 'conversion_tracking',
            event_label: eventName
        });
    }
    
    // Google Tag Manager
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            event: eventName,
            industry: currentIndustry,
            ...properties,
            timestamp: Date.now()
        });
    }
    
    // Console log for debugging (remove in production)
    console.log('Event tracked:', eventName, properties);
}

// Performance Monitoring
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                trackEvent('page_performance', {
                    load_time: loadTime,
                    dom_ready: perfData.domContentLoadedEventEnd - perfData.navigationStart,
                    first_paint: performance.getEntriesByType('paint')[0]?.startTime || 0,
                    industry: currentIndustry
                });
                
                // Alert if load time is over 2.5 seconds
                if (loadTime > 2500) {
                    console.warn('Page load time exceeded 2.5 seconds:', loadTime + 'ms');
                }
            }, 0);
        });
    }
}

// Initialize performance monitoring
monitorPerformance();

// Cleanup intervals when page unloads
window.addEventListener('beforeunload', () => {
    if (headlineRotationInterval) clearInterval(headlineRotationInterval);
    if (testimonialRotationInterval) clearInterval(testimonialRotationInterval);
    if (notificationInterval) clearInterval(notificationInterval);
});

// Additional utility functions
function preloadCriticalResources() {
    // Preload industry-specific videos
    Object.values(industryData).forEach(industry => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = `${industry.videoSrc}.mp4`;
    });
}

// A/B Testing Framework
function initializeABTesting() {
    // Simple A/B test for CTA button text
    const primaryCTAs = document.querySelectorAll('.btn-primary');
    const testVariant = Math.random() > 0.5 ? 'A' : 'B';
    
    if (testVariant === 'B') {
        primaryCTAs.forEach(btn => {
            if (btn.textContent.includes('Start My Free Trial')) {
                btn.textContent = 'Get Started Free';
            }
        });
    }
    
    trackEvent('ab_test_assigned', {
        test: 'cta_button_text',
        variant: testVariant,
        industry: currentIndustry
    });
}

// Initialize A/B testing
document.addEventListener('DOMContentLoaded', initializeABTesting);

// Error handling
window.addEventListener('error', (e) => {
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        industry: currentIndustry
    });
});

// Intersection Observer for conversion tracking
function initializeConversionTracking() {
    const conversionPoints = [
        { selector: '.hero-ctas', event: 'hero_cta_viewed' },
        { selector: '.conversion-trifecta', event: 'trifecta_viewed' },
        { selector: '.mini-calculator', event: 'calculator_viewed' },
        { selector: '.testimonial-rotator', event: 'testimonials_viewed' }
    ];
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const conversionPoint = conversionPoints.find(cp => 
                    entry.target.matches(cp.selector) || entry.target.querySelector(cp.selector)
                );
                
                if (conversionPoint) {
                    trackEvent(conversionPoint.event, {
                        industry: currentIndustry,
                        scroll_depth: Math.round((window.scrollY / document.body.scrollHeight) * 100)
                    });
                }
            }
        });
    }, { threshold: 0.5 });
    
    conversionPoints.forEach(cp => {
        const elements = document.querySelectorAll(cp.selector);
        elements.forEach(el => observer.observe(el));
    });
}

// Initialize conversion tracking
document.addEventListener('DOMContentLoaded', initializeConversionTracking);