-- Migration: Create analytics and conversion tracking tables
-- Version: 002
-- Description: Create tables for comprehensive analytics and conversion tracking

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  properties JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_url ON analytics_events(page_url);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_id ON analytics_events(event_id);

-- Compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_timestamp ON analytics_events(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_session ON analytics_events(user_id, session_id) WHERE user_id IS NOT NULL;

-- Table for conversion funnel tracking
CREATE TABLE IF NOT EXISTS conversion_funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  funnel_stage VARCHAR(100) NOT NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for funnel analysis
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_session ON conversion_funnels(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_user ON conversion_funnels(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_stage ON conversion_funnels(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_entered_at ON conversion_funnels(entered_at);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_stage_entered ON conversion_funnels(funnel_stage, entered_at);

-- Table for A/B test tracking
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  conversion_type VARCHAR(100),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for A/B test analysis
CREATE INDEX IF NOT EXISTS idx_ab_tests_name ON ab_tests(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_tests_variant ON ab_tests(variant_name);
CREATE INDEX IF NOT EXISTS idx_ab_tests_user ON ab_tests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ab_tests_session ON ab_tests(session_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_assigned_at ON ab_tests(assigned_at);
CREATE INDEX IF NOT EXISTS idx_ab_tests_name_variant ON ab_tests(test_name, variant_name);

-- Add comments
COMMENT ON TABLE analytics_events IS 'Stores all analytics events for tracking user behavior and conversions';
COMMENT ON TABLE conversion_funnels IS 'Tracks user progression through conversion funnels';
COMMENT ON TABLE ab_tests IS 'Stores A/B test assignments and conversion data';

-- Create materialized view for real-time analytics dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_dashboard_stats AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users
FROM analytics_events 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), event_type;

-- Index for the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_dashboard_stats_hour_type 
ON analytics_dashboard_stats(hour, event_type);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_analytics_dashboard_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_dashboard_stats;
END;
$$ LANGUAGE plpgsql;