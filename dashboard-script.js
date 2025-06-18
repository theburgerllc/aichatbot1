// CRO Dashboard JavaScript - Real-time Performance Monitoring

// Dashboard state
const dashboardData = {
  lastUpdated: Date.now(),
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  charts: {},
  alerts: [],
  realTimeData: {
    pageViews: 12847,
    demoClicks: 3635,
    demoCompleted: 2836,
    calcUsed: 1847,
    emailCaptured: 923,
    trialStarted: 316,
  },
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
  initializeDashboard();
  loadDashboardData();
  initializeCharts();
  startRealTimeUpdates();
  setupEventListeners();

  console.log('🚀 CRO Dashboard initialized');
});

// Initialize Dashboard
function initializeDashboard() {
  updateLastUpdatedTime();

  // Check for auto-refresh setting
  const autoRefreshCheckbox = document.getElementById('autoRefresh');
  if (autoRefreshCheckbox) {
    autoRefreshCheckbox.checked = dashboardData.autoRefresh;
  }

  // Load any saved dashboard preferences
  const savedPreferences = localStorage.getItem('dashboard_preferences');
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);
    dashboardData.autoRefresh = preferences.autoRefresh ?? true;
    dashboardData.refreshInterval = preferences.refreshInterval ?? 30000;
  }
}

// Load Dashboard Data
function loadDashboardData() {
  // In a real implementation, this would fetch from your analytics API
  // For demo purposes, we'll simulate data with some realistic fluctuations

  const baseData = {
    demoCTR: 28.3,
    trialConversion: 8.7,
    calcCompletion: 71.2,
    industries: {
      healthcare: 11.2,
      legal: 9.8,
      ecommerce: 12.4,
    },
    funnel: {
      pageViews: 12847,
      demoClicks: 3635,
      demoCompleted: 2836,
      calcUsed: 1847,
      emailCaptured: 923,
      trialStarted: 316,
    },
  };

  // Add some realistic variation
  const variation = () => (Math.random() - 0.5) * 0.1; // ±5% variation

  dashboardData.metrics = {
    demoCTR: baseData.demoCTR + baseData.demoCTR * variation(),
    trialConversion:
      baseData.trialConversion + baseData.trialConversion * variation(),
    calcCompletion:
      baseData.calcCompletion + baseData.calcCompletion * variation(),
    industries: {
      healthcare:
        baseData.industries.healthcare +
        baseData.industries.healthcare * variation(),
      legal:
        baseData.industries.legal + baseData.industries.legal * variation(),
      ecommerce:
        baseData.industries.ecommerce +
        baseData.industries.ecommerce * variation(),
    },
  };

  dashboardData.realTimeData = {
    ...baseData.funnel,
    pageViews: baseData.funnel.pageViews + Math.floor(Math.random() * 100),
    demoClicks: baseData.funnel.demoClicks + Math.floor(Math.random() * 20),
    trialStarted: baseData.funnel.trialStarted + Math.floor(Math.random() * 5),
  };

  updateDashboardUI();
}

// Update Dashboard UI
function updateDashboardUI() {
  const metrics = dashboardData.metrics;
  const realTime = dashboardData.realTimeData;

  // Update main metrics
  updateMetricValue('demoCTR', metrics.demoCTR, 32.25);
  updateMetricValue('trialConversion', metrics.trialConversion, 11.7);
  updateMetricValue('calcCompletion', metrics.calcCompletion, 75.0);

  // Update industry metrics
  updateIndustryMetrics(metrics.industries);

  // Update funnel metrics
  updateFunnelMetrics(realTime);

  // Update charts
  updateCharts();

  // Check for alerts
  checkPerformanceAlerts();

  // Update real-time activity
  updateActivityFeed();

  updateLastUpdatedTime();
}

// Update Metric Value
function updateMetricValue(metricId, currentValue, targetValue) {
  const valueElement = document.getElementById(metricId);
  if (valueElement) {
    // Animate the value change
    animateNumber(
      valueElement,
      parseFloat(valueElement.textContent) || 0,
      currentValue,
      1000
    );

    // Update progress bar
    const card = valueElement.closest('.metric-card');
    const progressFill = card?.querySelector('.progress-fill');
    const progressText = card?.querySelector('.progress-text');

    if (progressFill && progressText) {
      const percentage = (currentValue / targetValue) * 100;
      progressFill.style.width = `${Math.min(percentage, 100)}%`;
      progressText.textContent = `${percentage.toFixed(1)}% of target`;
    }

    // Update trend (simulate daily comparison)
    const trendValue = card?.querySelector('.trend-value');
    const trendIcon = card?.querySelector('.trend-icon');

    if (trendValue && trendIcon) {
      const yesterdayValue = currentValue * (0.95 + Math.random() * 0.1); // Simulate yesterday's value
      const change = ((currentValue - yesterdayValue) / yesterdayValue) * 100;

      trendValue.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
      trendIcon.textContent = change >= 0 ? '↑' : '↓';
      trendIcon.className = `trend-icon ${change >= 0 ? 'up' : 'down'}`;
      trendValue.style.color = change >= 0 ? '#10B981' : '#EF4444';
    }
  }
}

// Update Industry Metrics
function updateIndustryMetrics(industries) {
  Object.keys(industries).forEach(industry => {
    const rate = industries[industry];
    const rateElement = document.querySelector(
      `.industry-item .industry-name:contains("${industry.charAt(0).toUpperCase() + industry.slice(1)}") + .industry-rate`
    );
    const fillElement = document.querySelector(`.industry-fill.${industry}`);

    if (rateElement) {
      rateElement.textContent = `${rate.toFixed(1)}%`;
    }

    if (fillElement) {
      const percentage = (rate / 11.7) * 100; // Assuming 11.7% as baseline target
      fillElement.style.width = `${Math.min(percentage, 120)}%`; // Allow up to 120% for visual impact
    }
  });
}

// Update Funnel Metrics
function updateFunnelMetrics(data) {
  const elements = {
    pageViews: document.getElementById('pageViews'),
    demoClicks: document.getElementById('demoClicks'),
    demoCompleted: document.getElementById('demoCompleted'),
    calcUsed: document.getElementById('calcUsed'),
    emailCaptured: document.getElementById('emailCaptured'),
    trialStarted: document.getElementById('trialStarted'),
  };

  // Update counts
  Object.keys(elements).forEach(key => {
    if (elements[key]) {
      animateNumber(
        elements[key],
        parseInt(elements[key].textContent.replace(/,/g, '')) || 0,
        data[key],
        1500
      );
    }
  });

  // Update conversion rates
  const rates = {
    demoClickRate: (data.demoClicks / data.pageViews) * 100,
    demoCompletionRate: (data.demoCompleted / data.demoClicks) * 100,
    calcUsageRate: (data.calcUsed / data.demoCompleted) * 100,
    emailCaptureRate: (data.emailCaptured / data.calcUsed) * 100,
    trialConversionRate: (data.trialStarted / data.emailCaptured) * 100,
  };

  Object.keys(rates).forEach(rateKey => {
    const element = document.getElementById(rateKey);
    if (element) {
      element.textContent = `${rates[rateKey].toFixed(1)}%`;
    }
  });
}

// Initialize Charts
function initializeCharts() {
  initializeFunnelChart();
}

// Initialize Funnel Chart
function initializeFunnelChart() {
  const canvas = document.getElementById('conversionFunnel');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  dashboardData.charts.funnel = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'Page Views',
        'Demo Clicks',
        'Demo Complete',
        'Calculator',
        'Email Capture',
        'Trial Started',
      ],
      datasets: [
        {
          label: 'Conversion Funnel',
          data: [
            dashboardData.realTimeData.pageViews,
            dashboardData.realTimeData.demoClicks,
            dashboardData.realTimeData.demoCompleted,
            dashboardData.realTimeData.calcUsed,
            dashboardData.realTimeData.emailCaptured,
            dashboardData.realTimeData.trialStarted,
          ],
          backgroundColor: [
            '#E0E7FF',
            '#C7D2FE',
            '#A5B4FC',
            '#818CF8',
            '#6366F1',
            '#4F46E5',
          ],
          borderColor: [
            '#6366F1',
            '#6366F1',
            '#6366F1',
            '#6366F1',
            '#6366F1',
            '#6366F1',
          ],
          borderWidth: 2,
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
        tooltip: {
          callbacks: {
            label(context) {
              const total = dashboardData.realTimeData.pageViews;
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.raw.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback(value) {
              return value.toLocaleString();
            },
          },
        },
        x: {
          ticks: {
            maxRotation: 45,
          },
        },
      },
    },
  });
}

// Update Charts
function updateCharts() {
  if (dashboardData.charts.funnel) {
    dashboardData.charts.funnel.data.datasets[0].data = [
      dashboardData.realTimeData.pageViews,
      dashboardData.realTimeData.demoClicks,
      dashboardData.realTimeData.demoCompleted,
      dashboardData.realTimeData.calcUsed,
      dashboardData.realTimeData.emailCaptured,
      dashboardData.realTimeData.trialStarted,
    ];
    dashboardData.charts.funnel.update('none'); // No animation for real-time updates
  }
}

// Check Performance Alerts
function checkPerformanceAlerts() {
  const alerts = [];
  const metrics = dashboardData.metrics;

  // Demo CTR Alert
  if (metrics.demoCTR < 25) {
    alerts.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Demo CTR Below Threshold',
      description: `Current CTR (${metrics.demoCTR.toFixed(1)}%) is significantly below target (32.25%)`,
      time: 'Just now',
      action: 'Consider A/B testing new headlines or CTA buttons',
    });
  }

  // Trial Conversion Alert
  if (metrics.trialConversion < 7) {
    alerts.push({
      type: 'error',
      icon: '🚨',
      title: 'Trial Conversion Critical',
      description: `Trial conversion (${metrics.trialConversion.toFixed(1)}%) is critically low`,
      time: '2 minutes ago',
      action: 'Immediate intervention required',
    });
  }

  // Success Alert
  if (metrics.industries.ecommerce > 12) {
    alerts.push({
      type: 'success',
      icon: '🎉',
      title: 'E-commerce Performance Excellent',
      description: `E-commerce conversion (${metrics.industries.ecommerce.toFixed(1)}%) exceeds target`,
      time: '5 minutes ago',
      action: 'Consider scaling e-commerce marketing',
    });
  }

  // Calculator Completion Alert
  if (metrics.calcCompletion < 65) {
    alerts.push({
      type: 'warning',
      icon: '📊',
      title: 'Calculator Completion Low',
      description: `Calculator completion (${metrics.calcCompletion.toFixed(1)}%) needs optimization`,
      time: '8 minutes ago',
      action: 'Review calculator UX and input complexity',
    });
  }

  dashboardData.alerts = alerts;
  displayAlerts();
}

// Display Alerts
function displayAlerts() {
  const container = document.getElementById('alertsContainer');
  if (!container) return;

  if (dashboardData.alerts.length === 0) {
    container.innerHTML = `
            <div class="alert success">
                <div class="alert-icon">✅</div>
                <div class="alert-content">
                    <div class="alert-title">All Systems Performing Well</div>
                    <div class="alert-description">No performance issues detected</div>
                </div>
                <div class="alert-time">Updated now</div>
            </div>
        `;
    return;
  }

  container.innerHTML = dashboardData.alerts
    .map(
      alert => `
        <div class="alert ${alert.type}">
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-description">${alert.description}</div>
                ${alert.action ? `<div class="alert-action">💡 ${alert.action}</div>` : ''}
            </div>
            <div class="alert-time">${alert.time}</div>
        </div>
    `
    )
    .join('');
}

// Update Activity Feed
function updateActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;

  // Generate realistic activity items
  const activities = generateRecentActivities();

  feed.innerHTML = activities
    .map(
      activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                ${activity.icon}
            </div>
            <div class="activity-details">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `
    )
    .join('');
}

// Generate Recent Activities
function generateRecentActivities() {
  const activityTypes = [
    {
      type: 'demo',
      icon: '🎬',
      templates: [
        'Healthcare practice in California started demo',
        'Legal firm in New York completed demo',
        'Medical group viewed pricing after demo',
      ],
    },
    {
      type: 'calculator',
      icon: '🧮',
      templates: [
        'E-commerce store calculated $24K monthly savings',
        'Law practice used ROI calculator',
        'Healthcare clinic submitted calculator email',
      ],
    },
    {
      type: 'trial',
      icon: '🚀',
      templates: [
        'Medical practice started free trial',
        'Legal firm signed up for trial',
        'E-commerce business converted to trial',
      ],
    },
  ];

  const activities = [];
  const now = Date.now();

  for (let i = 0; i < 8; i++) {
    const typeData =
      activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const template =
      typeData.templates[Math.floor(Math.random() * typeData.templates.length)];
    const timeAgo = Math.floor(Math.random() * 3600); // Last hour

    activities.push({
      type: typeData.type,
      icon: typeData.icon,
      text: template,
      time: formatTimeAgo(now - timeAgo * 1000),
    });
  }

  return activities.sort((a, b) => b.timestamp - a.timestamp);
}

// Start Real-time Updates
function startRealTimeUpdates() {
  setInterval(() => {
    if (dashboardData.autoRefresh) {
      loadDashboardData();
    }
  }, dashboardData.refreshInterval);

  // Simulate real-time counter updates
  setInterval(() => {
    // Small incremental updates to make it feel live
    dashboardData.realTimeData.pageViews += Math.floor(Math.random() * 3);

    if (Math.random() > 0.7) {
      dashboardData.realTimeData.demoClicks += 1;
    }

    if (Math.random() > 0.9) {
      dashboardData.realTimeData.trialStarted += 1;
    }

    // Update specific elements without full refresh
    updateCounterElement('pageViews', dashboardData.realTimeData.pageViews);
    updateCounterElement('demoClicks', dashboardData.realTimeData.demoClicks);
    updateCounterElement(
      'trialStarted',
      dashboardData.realTimeData.trialStarted
    );
  }, 5000); // Every 5 seconds
}

// Setup Event Listeners
function setupEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshDashboard);
  }

  // Auto-refresh checkbox
  const autoRefreshCheckbox = document.getElementById('autoRefresh');
  if (autoRefreshCheckbox) {
    autoRefreshCheckbox.addEventListener('change', e => {
      dashboardData.autoRefresh = e.target.checked;
      saveDashboardPreferences();
    });
  }

  // Region click handlers
  document.querySelectorAll('.region').forEach(region => {
    region.addEventListener('click', () => {
      const regionName = region.dataset.region;
      showRegionDetails(regionName);
    });
  });
}

// Refresh Dashboard
function refreshDashboard() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.classList.add('loading');
  }

  // Simulate API call delay
  setTimeout(() => {
    loadDashboardData();

    if (refreshBtn) {
      refreshBtn.classList.remove('loading');
    }

    // Show success message briefly
    showNotification('Dashboard refreshed successfully', 'success');
  }, 1000);
}

// Utility Functions
function animateNumber(element, startValue, endValue, duration) {
  const startTime = Date.now();
  const difference = endValue - startValue;

  function step() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + difference * easedProgress;

    if (element.textContent.includes('%')) {
      element.textContent = currentValue.toFixed(1);
    } else {
      element.textContent = Math.round(currentValue).toLocaleString();
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function updateCounterElement(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    if (value !== currentValue) {
      animateNumber(element, currentValue, value, 500);
    }
  }
}

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return 'Yesterday';
}

function updateLastUpdatedTime() {
  const element = document.getElementById('lastUpdated');
  if (element) {
    element.textContent = new Date().toLocaleTimeString();
  }
  dashboardData.lastUpdated = Date.now();
}

function saveDashboardPreferences() {
  const preferences = {
    autoRefresh: dashboardData.autoRefresh,
    refreshInterval: dashboardData.refreshInterval,
  };
  localStorage.setItem('dashboard_preferences', JSON.stringify(preferences));
}

function showRegionDetails(regionName) {
  const regionData = {
    'west-coast': { name: 'West Coast', conversion: 9.8, traffic: 847 },
    midwest: { name: 'Midwest', conversion: 11.2, traffic: 423 },
    northeast: { name: 'Northeast', conversion: 13.4, traffic: 1234 },
    southeast: { name: 'Southeast', conversion: 10.1, traffic: 567 },
  };

  const data = regionData[regionName];
  if (data) {
    showNotification(
      `${data.name}: ${data.conversion}% conversion, ${data.traffic} visitors`,
      'info'
    );
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Remove after delay
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Export for global access
window.dashboardData = dashboardData;
window.refreshDashboard = refreshDashboard;
