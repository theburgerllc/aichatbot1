// ROI Calculator JavaScript - High Converting with Smart Email Capture

// Global calculator state
let currentCalculator = null;
let calculatorStartTime = null;
let userEngagement = {
  inputChanges: 0,
  timeSpent: 0,
  resultsViewed: false,
  emailCaptureShown: false,
};

// Location-based wage rates (US states)
const wageRates = {
  CA: { healthcare: 28, legal: 32, ecommerce: 24, name: 'California' },
  NY: { healthcare: 26, legal: 35, ecommerce: 25, name: 'New York' },
  TX: { healthcare: 22, legal: 28, ecommerce: 20, name: 'Texas' },
  FL: { healthcare: 21, legal: 26, ecommerce: 19, name: 'Florida' },
  IL: { healthcare: 24, legal: 30, ecommerce: 22, name: 'Illinois' },
  PA: { healthcare: 23, legal: 29, ecommerce: 21, name: 'Pennsylvania' },
  OH: { healthcare: 20, legal: 25, ecommerce: 18, name: 'Ohio' },
  GA: { healthcare: 21, legal: 26, ecommerce: 19, name: 'Georgia' },
  NC: { healthcare: 20, legal: 24, ecommerce: 18, name: 'North Carolina' },
  MI: { healthcare: 22, legal: 27, ecommerce: 20, name: 'Michigan' },
  OTHER: { healthcare: 22, legal: 27, ecommerce: 20, name: 'Other' },
};

// Industry benchmarks and multipliers
const industryData = {
  healthcare: {
    automationRate: 0.72,
    callsPerPatient: 2.3,
    avgCallDuration: 4.8,
    workDaysPerMonth: 22,
    roiMultiplier: 1.15,
  },
  legal: {
    conversionImprovement: 0.35,
    avgResponseTime: 1.8, // hours to minutes
    caseValueMultiplier: 1.22,
    leadQualityBonus: 0.15,
  },
  ecommerce: {
    recoveryRate: 0.37,
    avgRecoveryTime: 2.5, // hours
    conversionBoost: 0.23,
    satisfactionIncrease: 0.45,
  },
};

// Chart configurations
let healthcareChart, legalChart, ecommerceChart;

// Initialize calculators on page load
document.addEventListener('DOMContentLoaded', function () {
  initializeCalculatorHub();
  setupCalculatorEventListeners();
  detectUserLocation();

  // Track calculator page view
  trackCalculatorEvent('calculator_page_viewed', {
    timestamp: Date.now(),
    referrer: document.referrer,
  });
});

// Initialize Calculator Hub
function initializeCalculatorHub() {
  const calcCards = document.querySelectorAll('.calc-card');

  calcCards.forEach(card => {
    card.addEventListener('click', () => {
      const industry = card.dataset.industry;
      showCalculator(industry);

      trackCalculatorEvent('calculator_selected', {
        industry,
        timestamp: Date.now(),
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
}

// Setup Event Listeners for Calculator Inputs
function setupCalculatorEventListeners() {
  // Healthcare calculator
  setupIndustryCalculator('healthcare', calculateHealthcareROI);

  // Legal calculator
  setupIndustryCalculator('legal', calculateLegalROI);

  // E-commerce calculator
  setupIndustryCalculator('ecommerce', calculateEcommerceROI);
}

function setupIndustryCalculator(industry, calculationFunction) {
  const calculator = document.getElementById(`${industry}-calc`);
  if (!calculator) return;

  const inputs = calculator.querySelectorAll('input[type="range"], select');

  inputs.forEach(input => {
    input.addEventListener('input', e => {
      // Update display for range inputs
      if (e.target.type === 'range') {
        const valueDisplay =
          e.target.parentElement.nextElementSibling.querySelector(
            '.current-value'
          );
        if (valueDisplay) {
          let value = e.target.value;

          // Format large numbers
          if (
            e.target.id.includes('visitors') ||
            e.target.id.includes('case-value')
          ) {
            value = parseInt(value).toLocaleString();
          }

          valueDisplay.textContent = value;
        }
      }

      // Update location wage rate
      if (e.target.id.includes('location')) {
        updateWageRate(industry, e.target.value);
      }

      // Recalculate results
      calculationFunction();

      // Track engagement
      userEngagement.inputChanges++;
      trackCalculatorEvent('calculator_input_changed', {
        industry,
        input: e.target.id,
        value: e.target.value,
        engagement_score: userEngagement.inputChanges,
      });

      // Show email capture after sufficient engagement
      checkEmailCaptureThreshold(industry);
    });
  });
}

// Show Calculator
function showCalculator(industry) {
  currentCalculator = industry;
  calculatorStartTime = Date.now();
  userEngagement = {
    inputChanges: 0,
    timeSpent: 0,
    resultsViewed: false,
    emailCaptureShown: false,
  };

  // Hide hub
  document.getElementById('calculatorHub').style.display = 'none';

  // Show calculator
  document.getElementById(`${industry}-calc`).style.display = 'block';

  // Initialize calculation
  switch (industry) {
    case 'healthcare':
      calculateHealthcareROI();
      break;
    case 'legal':
      calculateLegalROI();
      break;
    case 'ecommerce':
      calculateEcommerceROI();
      break;
  }

  // Start engagement timer
  startEngagementTimer();

  trackCalculatorEvent('calculator_opened', {
    industry,
    timestamp: Date.now(),
  });
}

// Healthcare ROI Calculation
function calculateHealthcareROI() {
  const providers = parseInt(
    document.getElementById('healthcare-providers').value
  );
  const patientsPerDay = parseInt(
    document.getElementById('healthcare-patients').value
  );
  const location = document.getElementById('healthcare-location').value;

  const data = industryData.healthcare;
  const hourlyWage = wageRates[location]?.healthcare || 22;

  // Conservative calculations for credibility
  const totalCalls =
    providers * patientsPerDay * data.callsPerPatient * data.workDaysPerMonth;
  const automatedCalls = totalCalls * data.automationRate;
  const timeSavedMinutes = automatedCalls * data.avgCallDuration;
  const timeSavedHours = timeSavedMinutes / 60;
  const monthlySavings = Math.round(
    timeSavedHours * hourlyWage * data.roiMultiplier
  );

  // Update primary result with animation
  animateCountUp('healthcare-amount', monthlySavings);

  // Update breakdown
  document.getElementById('healthcare-hours').textContent =
    Math.round(timeSavedHours).toLocaleString();
  document.getElementById('healthcare-calls').textContent =
    Math.round(automatedCalls).toLocaleString();
  document.getElementById('healthcare-roi-period').textContent =
    calculateROIPeriod(monthlySavings, 297); // $297/month cost

  // Update benchmark comparison
  document.getElementById('healthcare-your-savings').textContent =
    monthlySavings.toLocaleString();
  updateBenchmarkComparison('healthcare', monthlySavings, 31250);

  // Update chart
  updateSavingsChart('healthcare', monthlySavings, timeSavedHours);

  // Mark results as viewed
  userEngagement.resultsViewed = true;

  trackCalculatorEvent('healthcare_roi_calculated', {
    providers,
    patients_per_day: patientsPerDay,
    location,
    monthly_savings: monthlySavings,
    hours_saved: timeSavedHours,
  });
}

// Legal ROI Calculation
function calculateLegalROI() {
  const monthlyLeads = parseInt(document.getElementById('legal-leads').value);
  const currentConversion = parseInt(
    document.getElementById('legal-conversion').value
  );
  const caseValue = parseInt(document.getElementById('legal-case-value').value);
  const practiceType = document.getElementById('legal-type').value;

  const data = industryData.legal;

  // Calculate improved conversion with AI
  const improvedConversion = Math.min(
    currentConversion * (1 + data.conversionImprovement),
    45
  );
  const additionalCases =
    monthlyLeads * ((improvedConversion - currentConversion) / 100);
  const monthlyGrowth = Math.round(
    additionalCases * caseValue * data.caseValueMultiplier
  );

  // Update primary result
  animateCountUp('legal-amount', monthlyGrowth);

  // Update breakdown
  document.getElementById('legal-cases').textContent =
    additionalCases.toFixed(1);
  document.getElementById('legal-conversion-increase').textContent =
    `${Math.round(data.conversionImprovement * 100)}%`;

  // Update benchmark comparison
  document.getElementById('legal-your-growth').textContent =
    monthlyGrowth.toLocaleString();
  updateBenchmarkComparison('legal', monthlyGrowth, 48750);

  // Update chart
  updateGrowthChart(
    'legal',
    monthlyLeads,
    currentConversion,
    improvedConversion
  );

  userEngagement.resultsViewed = true;

  trackCalculatorEvent('legal_roi_calculated', {
    monthly_leads: monthlyLeads,
    current_conversion: currentConversion,
    case_value: caseValue,
    practice_type: practiceType,
    monthly_growth: monthlyGrowth,
    additional_cases: additionalCases,
  });
}

// E-commerce ROI Calculation
function calculateEcommerceROI() {
  const monthlyVisitors = parseInt(
    document.getElementById('ecommerce-visitors').value
  );
  const abandonmentRate =
    parseInt(document.getElementById('ecommerce-abandonment').value) / 100;
  const aov = parseInt(document.getElementById('ecommerce-aov').value);
  const storeType = document.getElementById('ecommerce-type').value;

  const data = industryData.ecommerce;

  // Calculate cart recovery
  const conversionRate = 0.03; // 3% baseline conversion
  const abandonedCarts = monthlyVisitors * conversionRate * abandonmentRate;
  const recoveredCarts = Math.round(abandonedCarts * data.recoveryRate);
  const monthlyRecovery = Math.round(recoveredCarts * aov);

  // Update primary result
  animateCountUp('ecommerce-amount', monthlyRecovery);

  // Update breakdown
  document.getElementById('ecommerce-carts').textContent =
    recoveredCarts.toLocaleString();

  // Update benchmark comparison
  document.getElementById('ecommerce-your-recovery').textContent =
    monthlyRecovery.toLocaleString();
  updateBenchmarkComparison('ecommerce', monthlyRecovery, 22500);

  // Update chart
  updateRecoveryChart(
    'ecommerce',
    abandonedCarts,
    recoveredCarts,
    monthlyRecovery
  );

  userEngagement.resultsViewed = true;

  trackCalculatorEvent('ecommerce_roi_calculated', {
    monthly_visitors: monthlyVisitors,
    abandonment_rate: abandonmentRate * 100,
    aov,
    store_type: storeType,
    monthly_recovery: monthlyRecovery,
    recovered_carts: recoveredCarts,
  });
}

// Animation Functions
function animateCountUp(elementId, targetValue) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const duration = 1500;
  const increment = targetValue / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      current = targetValue;
      clearInterval(timer);
    }

    element.textContent = Math.floor(current).toLocaleString();
  }, 16);
}

// Chart Functions
function updateSavingsChart(industry, savings, hours) {
  const canvas = document.getElementById(`${industry}-savings-chart`);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (healthcareChart) {
    healthcareChart.destroy();
  }

  healthcareChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Monthly Savings', 'Current Costs'],
      datasets: [
        {
          data: [savings, savings * 0.6],
          backgroundColor: ['#2563EB', '#E5E7EB'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
      },
    },
  });
}

function updateGrowthChart(industry, leads, currentConv, improvedConv) {
  const canvas = document.getElementById(`${industry}-growth-chart`);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (legalChart) {
    legalChart.destroy();
  }

  legalChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Before AI', 'With AI'],
      datasets: [
        {
          label: 'Conversion Rate',
          data: [currentConv, improvedConv],
          backgroundColor: ['#E5E7EB', '#7C3AED'],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return `${value}%`;
            },
          },
        },
      },
    },
  });
}

function updateRecoveryChart(industry, abandoned, recovered, revenue) {
  const canvas = document.getElementById(`${industry}-recovery-chart`);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (ecommerceChart) {
    ecommerceChart.destroy();
  }

  ecommerceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Recovered Revenue',
          data: [revenue * 0.2, revenue * 0.5, revenue * 0.8, revenue],
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return `$${value.toLocaleString()}`;
            },
          },
        },
      },
    },
  });
}

// Utility Functions
function updateWageRate(industry, location) {
  const wageRateElement = document.getElementById(`${industry}-wage-rate`);
  const rate = wageRates[location]?.[industry] || wageRates['OTHER'][industry];

  if (wageRateElement) {
    wageRateElement.textContent = `Avg wage: $${rate}/hr`;
  }
}

function updateBenchmarkComparison(industry, yourValue, avgValue) {
  const yourBar = document.querySelector(
    `#${industry}-calc .your-bar .bar-fill`
  );
  const percentage = Math.min((yourValue / avgValue) * 60, 100); // Cap at 100%

  if (yourBar) {
    yourBar.style.width = `${percentage}%`;
  }
}

function calculateROIPeriod(monthlySavings, monthlyCost) {
  const paybackMonths = monthlyCost / monthlySavings;

  if (paybackMonths < 1) {
    return `${Math.round(paybackMonths * 30)} days`;
  } else {
    return `${Math.round(paybackMonths)} weeks`;
  }
}

// Location Detection
function detectUserLocation() {
  // Try to detect location via IP (would need a service like ipapi.co)
  // For now, default to California
  const defaultLocation = 'CA';

  // Update all location selects
  document.querySelectorAll('[id$="-location"]').forEach(select => {
    select.value = defaultLocation;
    const industry = select.id.split('-')[0];
    updateWageRate(industry, defaultLocation);
  });
}

// Engagement Tracking
function startEngagementTimer() {
  setInterval(() => {
    userEngagement.timeSpent += 1;

    // Check thresholds for email capture
    if (userEngagement.timeSpent > 30 && !userEngagement.emailCaptureShown) {
      checkEmailCaptureThreshold(currentCalculator);
    }
  }, 1000);
}

function checkEmailCaptureThreshold(industry) {
  if (userEngagement.emailCaptureShown) return;

  const showEmailCapture =
    userEngagement.inputChanges >= 3 ||
    userEngagement.timeSpent >= 45 ||
    (userEngagement.resultsViewed && userEngagement.inputChanges >= 2);

  if (showEmailCapture) {
    showEmailCaptureForm(industry);
  }
}

function showEmailCaptureForm(industry) {
  const emailCapture = document.getElementById(`${industry}-email-capture`);
  if (emailCapture) {
    emailCapture.style.display = 'block';
    userEngagement.emailCaptureShown = true;

    // Smooth scroll to email capture
    emailCapture.scrollIntoView({ behavior: 'smooth', block: 'center' });

    trackCalculatorEvent('email_capture_shown', {
      industry,
      input_changes: userEngagement.inputChanges,
      time_spent: userEngagement.timeSpent,
      trigger: userEngagement.inputChanges >= 3 ? 'interactions' : 'time',
    });
  }
}

// Navigation Functions
function showCalculatorHub() {
  // Hide all calculators
  document.querySelectorAll('.roi-calculator').forEach(calc => {
    calc.style.display = 'none';
  });

  // Show hub
  document.getElementById('calculatorHub').style.display = 'block';

  // Track exit
  if (currentCalculator) {
    trackCalculatorEvent('calculator_exited', {
      industry: currentCalculator,
      time_spent: Date.now() - calculatorStartTime,
      input_changes: userEngagement.inputChanges,
      results_viewed: userEngagement.resultsViewed,
    });
  }

  currentCalculator = null;
}

// Conversion Actions
function startTrial(industry) {
  trackCalculatorEvent('trial_started_from_calculator', {
    industry,
    calculator_completion: userEngagement.resultsViewed,
    engagement_score: userEngagement.inputChanges,
  });

  // Redirect to trial with calculator data
  const params = new URLSearchParams({
    source: 'calculator',
    industry,
    calculator_completed: userEngagement.resultsViewed,
  });

  window.location.href = `/signup?${params.toString()}`;
}

function scheduleConsultation(industry) {
  trackCalculatorEvent('consultation_scheduled_from_calculator', {
    industry,
    calculator_completion: userEngagement.resultsViewed,
    engagement_score: userEngagement.inputChanges,
  });

  // Open scheduling widget or redirect
  alert('Consultation scheduling widget would open here');
}

function submitEmailCapture(event, industry) {
  event.preventDefault();

  const email = event.target.querySelector('input[type="email"]').value;

  trackCalculatorEvent('email_captured', {
    industry,
    email,
    time_to_capture: userEngagement.timeSpent,
    input_changes: userEngagement.inputChanges,
  });

  // Send to backend/email service
  console.log('Email captured:', email, 'Industry:', industry);

  // Show success message
  const form = event.target;
  form.innerHTML = `
        <div class="email-success">
            <h4>✅ Report Sent!</h4>
            <p>Check your email for your detailed ROI analysis.</p>
        </div>
    `;

  // Show additional CTAs after email capture
  setTimeout(() => {
    showPostEmailCTAs(industry);
  }, 2000);
}

function showPostEmailCTAs(industry) {
  const ctaSection = document.querySelector(`#${industry}-calc .calc-ctas`);
  if (ctaSection) {
    ctaSection.style.background =
      'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';
    ctaSection.style.padding = '32px';
    ctaSection.style.borderRadius = '12px';
    ctaSection.style.border = '2px solid #10B981';

    // Update urgency text
    const urgencyText = ctaSection.querySelector('.urgency-text');
    if (urgencyText) {
      urgencyText.innerHTML = `
                <span class="urgency-icon">🎉</span>
                <span>Ready to get started? <strong>Join today and save 25%</strong></span>
            `;
    }
  }
}

// Social Sharing Functions
function shareToLinkedIn() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(
    `I just calculated my ROI with AI chatbots - incredible results! Check it out:`
  );
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${text}`,
    '_blank'
  );
}

function shareToTwitter() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(
    `Just calculated my ROI with AI chatbots - the results are amazing! 🚀`
  );
  window.open(
    `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    '_blank'
  );
}

function shareViaEmail() {
  const subject = encodeURIComponent('Check out my AI chatbot ROI calculation');
  const body = encodeURIComponent(
    `I just used this ROI calculator and the results are impressive! Take a look: ${window.location.href}`
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function printResults() {
  window.print();
}

function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
}

// Analytics
function trackCalculatorEvent(eventName, properties = {}) {
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      ...properties,
      event_category: 'roi_calculator',
      event_label: currentCalculator || 'unknown',
    });
  }

  // Google Tag Manager
  if (typeof dataLayer !== 'undefined') {
    dataLayer.push({
      event: eventName,
      calculator_industry: currentCalculator || 'unknown',
      ...properties,
      timestamp: Date.now(),
    });
  }

  // Console log for debugging
  console.log('Calculator Event:', eventName, properties);
}

// Performance Monitoring
function monitorCalculatorPerformance() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;

        trackCalculatorEvent('calculator_performance', {
          load_time: loadTime,
          dom_ready:
            perfData.domContentLoadedEventEnd - perfData.navigationStart,
        });
      }, 0);
    });
  }
}

// Initialize performance monitoring
monitorCalculatorPerformance();

// Error handling
window.addEventListener('error', e => {
  trackCalculatorEvent('calculator_error', {
    message: e.message,
    filename: e.filename,
    line: e.lineno,
    calculator: currentCalculator,
  });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (currentCalculator && calculatorStartTime) {
    trackCalculatorEvent('calculator_session_end', {
      industry: currentCalculator,
      session_duration: Date.now() - calculatorStartTime,
      input_changes: userEngagement.inputChanges,
      results_viewed: userEngagement.resultsViewed,
      email_captured: userEngagement.emailCaptureShown,
    });
  }
});
