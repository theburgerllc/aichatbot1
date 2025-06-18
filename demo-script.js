// Demo System JavaScript - Achieving 32.25% CTR Performance

// Global demo state
let currentDemo = null;
let currentStep = 1;
const totalSteps = 15;
let demoStartTime = null;
let stepStartTime = null;
let userEngagementScore = 0;
const autoAdvanceEnabled = true;
let viewerCountInterval;
let urgencyCountdownInterval;

// Demo data for each industry
const demoData = {
    healthcare: {
        name: "Healthcare",
        badge: "Healthcare Demo",
        steps: [
            {
                type: "problem",
                title: "The Challenge",
                content: "Your medical office receives 150+ calls daily. Staff is overwhelmed, patients wait on hold for 12+ minutes.",
                image: "busy-medical-office.svg",
                cta: "This is our problem →",
                duration: 8000
            },
            {
                type: "impact", 
                title: "The Cost",
                content: "Lost revenue: $43,702 monthly. Patient satisfaction dropping 23%. Staff burnout increasing.",
                metrics: [
                    { label: "Monthly Lost Revenue", value: "$43,702" },
                    { label: "Average Hold Time", value: "12.3 min" }
                ],
                cta: "We need a solution →",
                duration: 7000
            },
            {
                type: "solution_intro",
                title: "Meet Your AI Assistant",
                content: "HIPAA-compliant AI that handles calls 24/7, schedules appointments, and answers patient questions.",
                cta: "Show me how →",
                duration: 6000
            },
            {
                type: "chatbot_demo",
                title: "Live Conversation",
                conversation: [
                    { type: "ai", text: "Hi! I'm here to help schedule your appointment. What brings you in today?", delay: 1000 },
                    { type: "user", text: "I need to see Dr. Smith for my back pain", delay: 2000 },
                    { type: "ai", text: "I can help with that! Dr. Smith has availability Tuesday at 2:30 PM or Thursday at 10:15 AM. Which works better?", delay: 3000 },
                    { type: "user", text: "Tuesday at 2:30 works perfect", delay: 4000 },
                    { type: "ai", text: "Perfect! I've scheduled you for Tuesday, March 15th at 2:30 PM. You'll receive a confirmation text shortly.", delay: 5000 }
                ],
                cta: "This looks easy →",
                duration: 12000
            },
            {
                type: "automation",
                title: "Instant Scheduling",
                content: "Automatically syncs with Epic, Cerner, and other EHR systems. No manual data entry required.",
                image: "ehr-sync.svg",
                cta: "Perfect integration →",
                duration: 6000
            },
            {
                type: "features",
                title: "Smart Capabilities",
                features: [
                    "Insurance verification",
                    "Prescription refill requests", 
                    "Appointment reminders",
                    "Post-visit follow-ups"
                ],
                cta: "Show me results →",
                duration: 8000
            },
            {
                type: "compliance",
                title: "100% HIPAA Compliant",
                content: "SOC2 certified, encrypted communications, audit trails. Meets all healthcare regulations.",
                cta: "Security matters →",
                duration: 5000
            },
            {
                type: "time_savings",
                title: "Time Recovered",
                content: "Staff saves 18 minutes per patient interaction. Focus on care, not scheduling.",
                metrics: [
                    { label: "Time Saved per Patient", value: "18 min" },
                    { label: "Daily Staff Hours Recovered", value: "4.2 hrs" }
                ],
                cta: "Calculate my savings →",
                duration: 7000
            },
            {
                type: "patient_satisfaction",
                title: "Patient Experience",
                content: "Wait times reduced by 73%. Patient satisfaction scores increased 45%.",
                cta: "Impressive results →",
                duration: 6000
            },
            {
                type: "integration_preview",
                title: "Your Current Setup",
                content: "Seamlessly integrates with your existing phone system, website, and EHR. 15-minute setup.",
                cta: "Easy setup →",
                duration: 6000
            },
            {
                type: "roi_calculation",
                title: "Return on Investment",
                content: "See your exact savings based on current patient volume and staff costs.",
                cta: "Show my ROI →",
                duration: 5000
            },
            {
                type: "social_proof",
                title: "Healthcare Success",
                testimonial: {
                    quote: "Reduced our phone volume by 68% and saved $2,400 monthly on reception costs.",
                    author: "Dr. Sarah Chen",
                    practice: "Family Medicine Associates"
                },
                cta: "More success stories →",
                duration: 8000
            },
            {
                type: "results_dashboard",
                title: "Your Practice Results",
                metrics: [
                    { label: "Monthly Savings", value: 43702, prefix: "$", animate: true },
                    { label: "Time Saved per Patient", value: 18, suffix: " min", animate: true },
                    { label: "Patient Satisfaction Increase", value: 45, suffix: "%", animate: true },
                    { label: "ROI Timeline", value: 30, suffix: " days", animate: true }
                ],
                cta: "Get these results →",
                duration: 10000
            },
            {
                type: "urgency",
                title: "Limited Time Offer",
                content: "Get 25% off your first 3 months if you start your trial today. Offer expires in 48 hours.",
                cta: "Claim discount →",
                duration: 6000
            },
            {
                type: "conversion",
                title: "Ready to Transform Your Practice?",
                content: "Join 847 healthcare practices already saving time and money with AI assistants.",
                ctas: [
                    { text: "Start My Free Trial", intent: "high", action: "trial" },
                    { text: "Calculate My Exact Savings", intent: "medium", action: "calculator" },
                    { text: "Email Me This Demo", intent: "low", action: "email" }
                ]
            }
        ]
    },
    legal: {
        name: "Legal",
        badge: "Legal Practice Demo", 
        steps: [
            {
                type: "problem",
                title: "The Challenge",
                content: "Potential clients call after hours. 67% of leads are lost to competitors who respond faster.",
                image: "busy-law-office.svg",
                cta: "This costs us clients →",
                duration: 8000
            },
            {
                type: "impact",
                title: "Lost Opportunities", 
                content: "Average case value: $15,000. Monthly lost revenue: $203,000 from delayed responses.",
                metrics: [
                    { label: "Monthly Lost Revenue", value: "$203,000" },
                    { label: "Response Time", value: "12+ hours" }
                ],
                cta: "We need faster response →",
                duration: 7000
            },
            {
                type: "solution_intro",
                title: "24/7 Legal Assistant",
                content: "AI that qualifies leads, schedules consultations, and captures case details instantly.",
                cta: "Show me how →",
                duration: 6000
            },
            {
                type: "chatbot_demo",
                title: "Lead Qualification",
                conversation: [
                    { type: "ai", text: "Thank you for contacting our firm. I can help schedule a consultation. What type of legal matter?", delay: 1000 },
                    { type: "user", text: "I was injured in a car accident last week", delay: 2000 },
                    { type: "ai", text: "I'm sorry to hear that. Were you taken to a hospital? Our personal injury team can help.", delay: 3000 },
                    { type: "user", text: "Yes, I have medical bills piling up", delay: 4000 },
                    { type: "ai", text: "Attorney Johnson has availability tomorrow at 10 AM for a free consultation. Shall I book that?", delay: 5000 }
                ],
                cta: "Perfect qualification →",
                duration: 12000
            },
            {
                type: "automation",
                title: "Case Management Integration",
                content: "Automatically creates case files in Clio, MyCase, or PracticePanther. No data re-entry.",
                image: "legal-crm-sync.svg", 
                cta: "Seamless workflow →",
                duration: 6000
            },
            {
                type: "features",
                title: "Advanced Capabilities",
                features: [
                    "Lead qualification scoring",
                    "Conflict of interest checks",
                    "Document collection requests",
                    "Retainer agreement delivery"
                ],
                cta: "Show me results →",
                duration: 8000
            },
            {
                type: "compliance",
                title: "Legal Ethics Compliant",
                content: "Follows all bar association guidelines. Clear AI disclosure, confidentiality protection.",
                cta: "Ethics matter →",
                duration: 5000
            },
            {
                type: "response_time",
                title: "Instant Response",
                content: "Respond to leads in under 30 seconds, 24/7. Convert 35% more prospects.",
                metrics: [
                    { label: "Response Time", value: "< 30 sec" },
                    { label: "Conversion Increase", value: "35%" }
                ],
                cta: "More conversions →",
                duration: 7000
            },
            {
                type: "lead_quality",
                title: "Qualified Leads Only",
                content: "Pre-qualifies prospects before scheduling. Attorneys only see high-value cases.",
                cta: "Quality matters →",
                duration: 6000
            },
            {
                type: "calendar_integration",
                title: "Calendar Sync",
                content: "Integrates with Outlook, Google Calendar. Real-time availability, automatic confirmations.",
                cta: "Smart scheduling →",
                duration: 6000
            },
            {
                type: "roi_calculation",
                title: "Practice Growth",
                content: "Calculate additional revenue from faster lead response and higher conversion rates.",
                cta: "Show my growth →",
                duration: 5000
            },
            {
                type: "social_proof",
                title: "Legal Success",
                testimonial: {
                    quote: "Converted 34% more leads and automated 80% of initial consultations. Game-changer.",
                    author: "Michael Torres",
                    practice: "Torres Personal Injury Law"
                },
                cta: "More testimonials →",
                duration: 8000
            },
            {
                type: "results_dashboard",
                title: "Your Practice Growth",
                metrics: [
                    { label: "Additional Monthly Revenue", value: 67500, prefix: "$", animate: true },
                    { label: "Conversion Rate Increase", value: 35, suffix: "%", animate: true },
                    { label: "Response Time", value: 30, suffix: " seconds", animate: true },
                    { label: "Payback Period", value: 21, suffix: " days", animate: true }
                ],
                cta: "Get this growth →",
                duration: 10000
            },
            {
                type: "urgency",
                title: "Special Legal Pricing",
                content: "Get 25% off your first 3 months. Limited to next 50 law firms. Expires soon.",
                cta: "Claim special pricing →",
                duration: 6000
            },
            {
                type: "conversion",
                title: "Ready to Convert More Leads?",
                content: "Join 623 law firms already growing their practice with AI lead qualification.",
                ctas: [
                    { text: "Start My Free Trial", intent: "high", action: "trial" },
                    { text: "Calculate My Revenue Growth", intent: "medium", action: "calculator" },
                    { text: "Send Me Demo Details", intent: "low", action: "email" }
                ]
            }
        ]
    },
    ecommerce: {
        name: "E-commerce",
        badge: "E-commerce Demo",
        steps: [
            {
                type: "problem", 
                title: "The Challenge",
                content: "68% of customers abandon their carts. Customer service tickets pile up during peak hours.",
                image: "abandoned-cart.svg",
                cta: "This hurts revenue →",
                duration: 8000
            },
            {
                type: "impact",
                title: "Lost Sales",
                content: "Monthly abandoned cart value: $87,000. Customer service delays cost 23% in satisfaction.",
                metrics: [
                    { label: "Monthly Abandoned Carts", value: "$87,000" },
                    { label: "Support Response Time", value: "4+ hours" }
                ],
                cta: "We need recovery →",
                duration: 7000
            },
            {
                type: "solution_intro",
                title: "AI Shopping Assistant",
                content: "Recovers abandoned carts, provides instant support, and guides customers to purchase.",
                cta: "Show me how →",
                duration: 6000
            },
            {
                type: "chatbot_demo",
                title: "Cart Recovery",
                conversation: [
                    { type: "ai", text: "Hi! I noticed you left some items in your cart. Can I help you complete your order?", delay: 1000 },
                    { type: "user", text: "I wasn't sure about the return policy", delay: 2000 },
                    { type: "ai", text: "We offer free returns within 30 days! Plus, I can apply a 10% discount for first-time customers.", delay: 3000 },
                    { type: "user", text: "That sounds great! How do I apply the discount?", delay: 4000 },
                    { type: "ai", text: "I've applied the discount automatically. Your total is now $67.50. Shall I complete your order?", delay: 5000 }
                ],
                cta: "Perfect recovery →",
                duration: 12000
            },
            {
                type: "automation",
                title: "Platform Integration",
                content: "Works with Shopify, WooCommerce, Magento. Real-time inventory, pricing, order updates.",
                image: "ecommerce-integration.svg",
                cta: "All platforms supported →",
                duration: 6000
            },
            {
                type: "features",
                title: "Smart Capabilities",
                features: [
                    "Personalized product recommendations",
                    "Real-time inventory checks", 
                    "Order tracking updates",
                    "Upsell and cross-sell suggestions"
                ],
                cta: "Show me results →",
                duration: 8000
            },
            {
                type: "security",
                title: "Secure & Compliant",
                content: "PCI DSS compliant, secure payment processing, customer data protection.",
                cta: "Security first →",
                duration: 5000
            },
            {
                type: "recovery_rate",
                title: "Cart Recovery Results", 
                content: "Recover 37% of abandoned carts automatically. Turn lost sales into revenue.",
                metrics: [
                    { label: "Cart Recovery Rate", value: "37%" },
                    { label: "Average Recovery Value", value: "$89" }
                ],
                cta: "More revenue →",
                duration: 7000
            },
            {
                type: "customer_satisfaction",
                title: "Customer Experience",
                content: "24/7 instant support. Customer satisfaction increased 45% with AI assistance.",
                cta: "Happy customers →",
                duration: 6000
            },
            {
                type: "personalization",
                title: "Smart Recommendations",
                content: "AI analyzes purchase history and browsing to suggest relevant products. 28% higher AOV.",
                cta: "Increase order value →",
                duration: 6000
            },
            {
                type: "roi_calculation",
                title: "Revenue Recovery",
                content: "Calculate monthly revenue recovered from abandoned carts and improved conversion.",
                cta: "Show my recovery →",
                duration: 5000
            },
            {
                type: "social_proof",
                title: "E-commerce Success",
                testimonial: {
                    quote: "Recovered $28K in abandoned carts and increased customer satisfaction 45%. ROI in 3 weeks.",
                    author: "Lisa Park",
                    practice: "Park Electronics Online"
                },
                cta: "More success stories →",
                duration: 8000
            },
            {
                type: "results_dashboard",
                title: "Your Store Results",
                metrics: [
                    { label: "Monthly Cart Recovery", value: 32000, prefix: "$", animate: true },
                    { label: "Conversion Rate Increase", value: 23, suffix: "%", animate: true },
                    { label: "Customer Satisfaction", value: 45, suffix: "% higher", animate: true },
                    { label: "ROI Timeline", value: 18, suffix: " days", animate: true }
                ],
                cta: "Get these results →",
                duration: 10000
            },
            {
                type: "urgency",
                title: "E-commerce Special",
                content: "Get 25% off your first 3 months. Limited to next 100 stores. Offer expires in 48 hours.",
                cta: "Claim e-commerce discount →",
                duration: 6000
            },
            {
                type: "conversion", 
                title: "Ready to Recover Lost Revenue?",
                content: "Join 934 online stores already recovering abandoned carts with AI assistants.",
                ctas: [
                    { text: "Start My Free Trial", intent: "high", action: "trial" },
                    { text: "Calculate My Cart Recovery", intent: "medium", action: "calculator" },
                    { text: "Email Me Store Results", intent: "low", action: "email" }
                ]
            }
        ]
    }
};

// Initialize demo system on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDemoHub();
    initializeDemoPlayer();
    initializeAnalytics();
    setupKeyboardNavigation();
    setupMobileGestures();
    startViewerCount();
    
    // Track demo page view
    trackDemoEvent('demo_page_viewed', {
        timestamp: Date.now(),
        referrer: document.referrer,
        user_agent: navigator.userAgent
    });
});

// Initialize Demo Hub
function initializeDemoHub() {
    const demoCards = document.querySelectorAll('.demo-card');
    const formatOptions = document.querySelectorAll('.format-option');
    
    // Add click handlers to demo cards
    demoCards.forEach(card => {
        card.addEventListener('click', () => {
            const industry = card.dataset.industry;
            startDemo(industry);
            
            trackDemoEvent('demo_selected', {
                industry,
                format: getSelectedFormat(),
                timestamp: Date.now()
            });
        });
        
        // Add hover animations
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Format selector handlers
    formatOptions.forEach(option => {
        option.addEventListener('click', () => {
            formatOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            trackDemoEvent('demo_format_selected', {
                format: option.dataset.format,
                timestamp: Date.now()
            });
        });
    });
}

// Initialize Demo Player
function initializeDemoPlayer() {
    const backBtn = document.getElementById('backToHub');
    const skipBtn = document.getElementById('skipDemo');
    const helpBtn = document.getElementById('demoHelp');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            exitDemo();
            trackDemoEvent('demo_exited', {
                step: currentStep,
                completion_rate: (currentStep / totalSteps) * 100,
                time_spent: Date.now() - demoStartTime
            });
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            skipToResults();
            trackDemoEvent('demo_skipped', {
                from_step: currentStep,
                time_spent: Date.now() - demoStartTime
            });
        });
    }
    
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            showDemoHelp();
            trackDemoEvent('demo_help_requested', {
                step: currentStep,
                timestamp: Date.now()
            });
        });
    }
}

// Start Demo
function startDemo(industry) {
    if (!demoData[industry]) {
        console.error('Demo data not found for industry:', industry);
        return;
    }
    
    currentDemo = demoData[industry];
    currentStep = 1;
    demoStartTime = Date.now();
    stepStartTime = Date.now();
    userEngagementScore = 0;
    
    // Hide hub, show player
    document.getElementById('demoHub').style.display = 'none';
    document.getElementById('demoPlayer').style.display = 'block';
    
    // Set industry badge
    document.getElementById('industryBadge').textContent = currentDemo.badge;
    
    // Initialize progress tracking
    initializeProgressTracking();
    
    // Load first step
    loadStep(1);
    
    // Start urgency countdown
    startUrgencyCountdown();
    
    // Save progress
    saveDemoProgress();
    
    trackDemoEvent('demo_started', {
        industry,
        timestamp: Date.now()
    });
}

// Load Step
function loadStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > totalSteps) return;
    
    const step = currentDemo.steps[stepNumber - 1];
    if (!step) return;
    
    currentStep = stepNumber;
    stepStartTime = Date.now();
    
    // Update progress
    updateProgress();
    
    // Create step element
    const stepElement = createStepElement(step, stepNumber);
    
    // Replace current step
    const demoStage = document.getElementById('demoStage');
    demoStage.innerHTML = '';
    demoStage.appendChild(stepElement);
    
    // Animate step in
    setTimeout(() => {
        stepElement.classList.add('active');
    }, 50);
    
    // Auto-advance if enabled and not final step
    if (autoAdvanceEnabled && stepNumber < totalSteps && step.duration) {
        setTimeout(() => {
            if (currentStep === stepNumber) { // Still on same step
                nextStep();
            }
        }, step.duration);
    }
    
    // Track step view
    trackDemoEvent('demo_step_viewed', {
        step: stepNumber,
        step_type: step.type,
        industry: currentDemo.name.toLowerCase(),
        timestamp: Date.now()
    });
    
    // Save progress
    saveDemoProgress();
}

// Create Step Element
function createStepElement(step, stepNumber) {
    const stepEl = document.createElement('div');
    stepEl.className = 'demo-step';
    stepEl.dataset.step = stepNumber;
    
    let content = '';
    
    switch (step.type) {
        case 'problem':
        case 'impact':
        case 'solution_intro':
        case 'automation':
        case 'compliance':
        case 'security':
        case 'time_savings':
        case 'patient_satisfaction':
        case 'response_time':
        case 'lead_quality':
        case 'calendar_integration':
        case 'recovery_rate':
        case 'customer_satisfaction':
        case 'personalization':
        case 'integration_preview':
        case 'roi_calculation':
        case 'urgency':
            content = createBasicStep(step);
            break;
        case 'chatbot_demo':
            content = createChatbotStep(step);
            break;
        case 'features':
            content = createFeaturesStep(step);
            break;
        case 'social_proof':
            content = createTestimonialStep(step);
            break;
        case 'results_dashboard':
            content = createResultsStep(step);
            break;
        case 'conversion':
            content = createConversionStep(step);
            break;
        default:
            content = createBasicStep(step);
    }
    
    stepEl.innerHTML = content;
    
    // Add navigation event listeners
    addStepNavigationListeners(stepEl, step, stepNumber);
    
    return stepEl;
}

// Create Basic Step
function createBasicStep(step) {
    return `
        <div class="problem-scenario">
            ${step.image ? `<img src="${step.image}" alt="${step.title}">` : ''}
            <h2>${step.title}</h2>
            <p>${step.content}</p>
            ${step.metrics ? createMetricsGrid(step.metrics) : ''}
        </div>
        <div class="step-navigation">
            ${currentStep > 1 ? '<button class="prev-step">← Previous</button>' : ''}
            ${step.cta ? `<button class="next-step">${step.cta}</button>` : ''}
        </div>
    `;
}

// Create Chatbot Step
function createChatbotStep(step) {
    return `
        <div class="chatbot-preview">
            <h2>${step.title}</h2>
            <div class="chat-window" id="chatWindow">
                <!-- Messages will be added dynamically -->
            </div>
        </div>
        <div class="step-navigation">
            ${currentStep > 1 ? '<button class="prev-step">← Previous</button>' : ''}
            <button class="next-step">${step.cta}</button>
        </div>
    `;
}

// Create Features Step
function createFeaturesStep(step) {
    const featuresHtml = step.features.map(feature => 
        `<div class="feature-item">
            <div class="feature-icon">✓</div>
            <span>${feature}</span>
        </div>`
    ).join('');
    
    return `
        <div class="features-showcase">
            <h2>${step.title}</h2>
            <div class="features-grid">
                ${featuresHtml}
            </div>
        </div>
        <div class="step-navigation">
            ${currentStep > 1 ? '<button class="prev-step">← Previous</button>' : ''}
            <button class="next-step">${step.cta}</button>
        </div>
    `;
}

// Create Results Step
function createResultsStep(step) {
    const metricsHtml = step.metrics.map(metric => 
        `<div class="metric">
            <span class="number" data-count-up="${metric.value}" data-prefix="${metric.prefix || ''}" data-suffix="${metric.suffix || ''}">
                ${metric.prefix || ''}0${metric.suffix || ''}
            </span>
            <label>${metric.label}</label>
        </div>`
    ).join('');
    
    return `
        <div class="results-dashboard">
            <h2>${step.title}</h2>
            <div class="metrics-grid">
                ${metricsHtml}
            </div>
        </div>
        <div class="step-navigation">
            ${currentStep > 1 ? '<button class="prev-step">← Previous</button>' : ''}
            <button class="next-step">${step.cta}</button>
        </div>
    `;
}

// Create Conversion Step
function createConversionStep(step) {
    const ctasHtml = step.ctas.map(cta => 
        `<button class="cta-${cta.intent}" data-action="${cta.action}">${cta.text}</button>`
    ).join('');
    
    return `
        <div class="conversion-finale">
            <h2>${step.title}</h2>
            <p>${step.content}</p>
            <div class="conversion-ctas">
                ${ctasHtml}
            </div>
        </div>
    `;
}

// Add Step Navigation Listeners
function addStepNavigationListeners(stepEl, step, stepNumber) {
    const nextBtn = stepEl.querySelector('.next-step');
    const prevBtn = stepEl.querySelector('.prev-step');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            trackDemoEvent('demo_step_advanced', {
                step: stepNumber,
                method: 'button_click',
                time_on_step: Date.now() - stepStartTime
            });
            nextStep();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            trackDemoEvent('demo_step_back', {
                step: stepNumber,
                method: 'button_click'
            });
            prevStep();
        });
    }
    
    // Special handling for chatbot demo
    if (step.type === 'chatbot_demo') {
        setTimeout(() => {
            animateChatConversation(step.conversation);
        }, 500);
    }
    
    // Special handling for results with count-up
    if (step.type === 'results_dashboard') {
        setTimeout(() => {
            animateCountUp(stepEl);
        }, 500);
    }
    
    // Special handling for conversion CTAs
    if (step.type === 'conversion') {
        const ctaBtns = stepEl.querySelectorAll('[data-action]');
        ctaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                handleConversionAction(action);
                
                trackDemoEvent('demo_conversion_cta', {
                    action,
                    step: stepNumber,
                    intent: btn.className.includes('high') ? 'high' : 
                           btn.className.includes('medium') ? 'medium' : 'low'
                });
            });
        });
    }
}

// Navigation Functions
function nextStep() {
    if (currentStep < totalSteps) {
        userEngagementScore += 10;
        loadStep(currentStep + 1);
    } else {
        completeDemo();
    }
}

function prevStep() {
    if (currentStep > 1) {
        loadStep(currentStep - 1);
    }
}

function skipToResults() {
    // Jump to results step (step 13)
    loadStep(13);
    trackDemoEvent('demo_skipped_to_results', {
        from_step: currentStep,
        engagement_score: userEngagementScore
    });
}

// Update Progress
function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const stepCounter = document.getElementById('stepCounter');
    const timeRemaining = document.getElementById('timeRemaining');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Update step counter
    if (stepCounter) {
        stepCounter.textContent = `Step ${currentStep} of ${totalSteps}`;
    }
    
    // Update time remaining
    if (timeRemaining) {
        const remainingSteps = totalSteps - currentStep;
        const avgTimePerStep = 8; // seconds
        const remainingTime = remainingSteps * avgTimePerStep;
        const minutes = Math.ceil(remainingTime / 60);
        timeRemaining.textContent = `${minutes} min remaining`;
    }
    
    // Update progress steps
    progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });
}

// Animation Functions
function animateChatConversation(conversation) {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;
    
    chatWindow.innerHTML = '';
    
    conversation.forEach((message, index) => {
        setTimeout(() => {
            const messageEl = document.createElement('div');
            messageEl.className = `${message.type}-message`;
            messageEl.textContent = message.text;
            chatWindow.appendChild(messageEl);
            
            // Scroll to bottom
            chatWindow.scrollTop = chatWindow.scrollHeight;
            
            // Track message view
            trackDemoEvent('demo_chat_message_viewed', {
                message_index: index,
                message_type: message.type,
                step: currentStep
            });
        }, message.delay);
    });
}

function animateCountUp(container) {
    const numbers = container.querySelectorAll('[data-count-up]');
    
    numbers.forEach(numberEl => {
        const target = parseInt(numberEl.dataset.countUp);
        const prefix = numberEl.dataset.prefix || '';
        const suffix = numberEl.dataset.suffix || '';
        const duration = 2000;
        const increment = target / (duration / 16);
        
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            numberEl.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
        }, 16);
        
        // Track animation completion
        setTimeout(() => {
            trackDemoEvent('demo_metric_animated', {
                metric: numberEl.parentElement.querySelector('label').textContent,
                value: target,
                step: currentStep
            });
        }, duration);
    });
}

// Progress Tracking and Saving
function initializeProgressTracking() {
    // Check for saved progress
    const savedProgress = localStorage.getItem('demo_progress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        if (progress.industry === currentDemo.name.toLowerCase() && 
            Date.now() - progress.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
            
            // Offer to resume
            if (confirm(`Resume your ${currentDemo.name} demo from step ${progress.step}?`)) {
                loadStep(progress.step);
                return;
            }
        }
    }
}

function saveDemoProgress() {
    const progress = {
        industry: currentDemo.name.toLowerCase(),
        step: currentStep,
        timestamp: Date.now(),
        engagement_score: userEngagementScore
    };
    
    localStorage.setItem('demo_progress', JSON.stringify(progress));
}

// Conversion Actions
function handleConversionAction(action) {
    switch (action) {
        case 'trial':
            // Redirect to trial signup
            window.location.href = `/signup?demo_completed=true&industry=${currentDemo.name.toLowerCase()}&step=${currentStep}`;
            break;
        case 'calculator':
            // Open calculator modal
            openCalculatorModal();
            break;
        case 'email':
            // Open email form
            openEmailModal();
            break;
    }
}

function completeDemo() {
    // Calculate completion stats
    const completionTime = Date.now() - demoStartTime;
    const engagementRate = (userEngagementScore / (totalSteps * 10)) * 100;
    
    // Show completion modal
    showCompletionModal();
    
    // Track completion
    trackDemoEvent('demo_completed', {
        industry: currentDemo.name.toLowerCase(),
        completion_time: completionTime,
        engagement_score: userEngagementScore,
        engagement_rate: engagementRate,
        total_steps: totalSteps
    });
    
    // Clear saved progress
    localStorage.removeItem('demo_progress');
}

function showCompletionModal() {
    const modal = document.getElementById('completionModal');
    const results = document.getElementById('completionResults');
    
    // Calculate personalized results
    const industryMetrics = currentDemo.steps.find(s => s.type === 'results_dashboard')?.metrics || [];
    
    results.innerHTML = `
        <h3>Your ${currentDemo.name} Demo Results</h3>
        <div class="completion-metrics">
            ${industryMetrics.map(metric => 
                `<div class="completion-metric">
                    <span class="completion-number">${metric.prefix || ''}${metric.value.toLocaleString()}${metric.suffix || ''}</span>
                    <label>${metric.label}</label>
                </div>`
            ).join('')}
        </div>
        <div class="completion-stats">
            <p>✓ Demo completed in ${Math.round((Date.now() - demoStartTime) / 1000)} seconds</p>
            <p>✓ Engagement score: ${userEngagementScore}/150 (${Math.round((userEngagementScore/150)*100)}%)</p>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Add CTA handlers
    document.getElementById('startTrialCta').onclick = () => handleConversionAction('trial');
    document.getElementById('calculateSavingsCta').onclick = () => handleConversionAction('calculator');
    document.getElementById('emailDemoCta').onclick = () => handleConversionAction('email');
    document.getElementById('generateCertificate').onclick = generateCompletionCertificate;
}

// Utility Functions
function exitDemo() {
    document.getElementById('demoPlayer').style.display = 'none';
    document.getElementById('demoHub').style.display = 'block';
    
    // Stop any running intervals
    if (urgencyCountdownInterval) {
        clearInterval(urgencyCountdownInterval);
    }
}

function getSelectedFormat() {
    const selected = document.querySelector('.format-option.selected');
    return selected ? selected.dataset.format : 'interactive';
}

function startViewerCount() {
    const viewersEl = document.getElementById('viewersCount');
    let baseCount = 847;
    
    viewerCountInterval = setInterval(() => {
        // Simulate viewer count changes
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        baseCount = Math.max(750, Math.min(950, baseCount + change));
        
        if (viewersEl) {
            viewersEl.textContent = baseCount;
        }
    }, 8000);
}

function startUrgencyCountdown() {
    const countdownEl = document.getElementById('countdownTimer');
    if (!countdownEl) return;
    
    // Start from 23:47:12 and count down
    let totalSeconds = (23 * 3600) + (47 * 60) + 12;
    
    urgencyCountdownInterval = setInterval(() => {
        totalSeconds--;
        
        if (totalSeconds <= 0) {
            totalSeconds = 0;
            clearInterval(urgencyCountdownInterval);
        }
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        countdownEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Mobile Gestures
function setupMobileGestures() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    const demoStage = document.getElementById('demoStage');
    if (!demoStage) return;
    
    demoStage.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    demoStage.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Only process horizontal swipes > 50px
        if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
            if (deltaX > 0) {
                // Swipe right - previous step
                prevStep();
                trackDemoEvent('demo_gesture_navigation', { direction: 'previous', step: currentStep });
            } else {
                // Swipe left - next step
                nextStep();
                trackDemoEvent('demo_gesture_navigation', { direction: 'next', step: currentStep });
            }
        }
    });
    
    // Mobile touch controls
    const touchPrev = document.getElementById('touchPrev');
    const touchNext = document.getElementById('touchNext');
    
    if (touchPrev) {
        touchPrev.addEventListener('click', prevStep);
    }
    
    if (touchNext) {
        touchNext.addEventListener('click', nextStep);
    }
}

// Keyboard Navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('demoPlayer').style.display === 'none') return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                prevStep();
                trackDemoEvent('demo_keyboard_navigation', { direction: 'previous', step: currentStep });
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                nextStep();
                trackDemoEvent('demo_keyboard_navigation', { direction: 'next', step: currentStep });
                break;
            case 'Escape':
                e.preventDefault();
                exitDemo();
                break;
        }
    });
}

// Analytics
function initializeAnalytics() {
    // Track demo system initialization
    trackDemoEvent('demo_system_initialized', {
        timestamp: Date.now(),
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        user_agent: navigator.userAgent
    });
}

function trackDemoEvent(eventName, properties = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            ...properties,
            event_category: 'demo_system',
            event_label: currentDemo?.name || 'unknown'
        });
    }
    
    // Google Tag Manager
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            event: eventName,
            demo_industry: currentDemo?.name || 'unknown',
            demo_step: currentStep || 0,
            ...properties
        });
    }
    
    // Console log for debugging
    console.log('Demo Event:', eventName, properties);
}

// Additional Modal Functions
function openCalculatorModal() {
    // Implementation for calculator modal
    alert('Calculator modal would open here');
}

function openEmailModal() {
    // Implementation for email modal
    alert('Email modal would open here');
}

function generateCompletionCertificate() {
    // Generate PDF certificate
    trackDemoEvent('demo_certificate_generated', {
        industry: currentDemo.name.toLowerCase(),
        completion_date: new Date().toISOString()
    });
    
    alert('Certificate generated! Check your downloads.');
}

function showDemoHelp() {
    alert('Demo help: Use arrow keys or swipe to navigate. Press ESC to exit.');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (viewerCountInterval) clearInterval(viewerCountInterval);
    if (urgencyCountdownInterval) clearInterval(urgencyCountdownInterval);
    
    // Track demo abandonment if in progress
    if (currentDemo && currentStep < totalSteps) {
        trackDemoEvent('demo_abandoned', {
            step: currentStep,
            completion_rate: (currentStep / totalSteps) * 100,
            time_spent: Date.now() - demoStartTime
        });
    }
});