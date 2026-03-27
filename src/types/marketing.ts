// src/types/marketing.ts
import { Database } from './supabase';

// Base types from Supabase
type MarketingCampaign = Database['public']['Tables']['marketing_campaigns']['Row'];
type MarketingROI = Database['public']['Tables']['marketing_roi']['Row'];
type MarketingChannel = Database['public']['Tables']['marketing_channels']['Row'];
type MarketingAnalytics = Database['public']['Tables']['marketing_analytics']['Row'];
type MarketingAsset = Database['public']['Tables']['marketing_assets']['Row'];
type MarketingSegment = Database['public']['Tables']['marketing_segments']['Row'];

// New Campaign ROI Table (to replace marketing_roi view)
export interface CampaignROI {
  id: string;
  campaign_id: string;
  leads_generated: number;
  revenue_generated: number;
  total_spent: number;
  roi_percentage: number;
  conversions: number;
  cost_per_lead: number;
  cost_per_conversion: number;
  daily_data: any[];
  last_updated: string;
  created_at: string;
  updated_at: string;
}

// Extended Campaign with ROI data
export interface Campaign extends MarketingCampaign {
  roi_data?: CampaignROI;
  segments?: Segment[];
  assets?: Asset[];
}

// ROI type for display (computed fields)
export interface ROI {
  leads_generated: number;
  revenue_generated: number;
  total_spent: number;
  roi_percentage: number;
  conversions: number;
  cost_per_lead: number;
  cost_per_conversion: number;
  roi_percentage_formatted?: string;
}

// Channel type
export interface Channel {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  default_budget: number | null;
  created_at: string;
  updated_at: string;
}

// Analytics type for dashboard
export interface Analytics {
  id: string;
  date: string;
  channel: string;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr?: number; // calculated: (clicks / impressions) * 100
  conversion_rate?: number; // calculated: (conversions / clicks) * 100
  roas?: number; // calculated: revenue / spend
}

// Asset type for campaign assets
export interface Asset {
  id: string;
  campaign_id: string | null;
  type: 'image' | 'video' | 'document' | 'landing_page' | 'email_template';
  name: string;
  url: string | null;
  content: any;
  metadata: any;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

// Segment type for audience targeting
export interface Segment {
  id: string;
  name: string;
  description: string | null;
  criteria: {
    industries?: string[];
    company_sizes?: string[];
    locations?: string[];
    subscription_tiers?: string[];
    behavior?: {
      min_reports?: number;
      last_active_days?: number;
      min_spend?: number;
    };
  };
  size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Campaign form data for creating/updating campaigns
export interface CampaignFormData {
  name: string;
  channel: string;
  budget: number;
  start_date: string;
  end_date: string;
  target_audience: string[];
  content: {
    headline?: string;
    description?: string;
    cta?: string;
    image_url?: string;
    landing_page_url?: string;
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
}

// Marketing metrics for dashboard KPI cards
export interface MarketingMetrics {
  total_spend: number;
  total_revenue: number;
  total_leads: number;
  total_conversions: number;
  overall_roi: number;
  cost_per_lead: number;
  cost_per_conversion: number;
  conversion_rate: number;
}

// Channel performance for charts
export interface ChannelPerformance {
  channel: string;
  spend: number;
  revenue: number;
  leads: number;
  conversions: number;
  roi: number;
  cpl: number; // cost per lead
  cpc: number; // cost per conversion
  trend: 'up' | 'down' | 'stable';
}

// SEO types for SEO page
export interface SEOKeyword {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  trend: 'up' | 'down' | 'stable';
  url: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface SEOAnalytics {
  date: string;
  impressions: number;
  clicks: number;
  position: number;
  ctr: number;
}

export interface SEOMetrics {
  total_impressions: number;
  total_clicks: number;
  avg_position: number;
  avg_ctr: number;
  top_keywords: SEOKeyword[];
}

// Competitor types for competitor intelligence
export interface CompetitorMetrics {
  web_traffic: number;
  social_followers: number;
  employee_count: number;
  customer_count: number;
  estimated_revenue: number;
  growth_rate: number;
}

export interface CompetitorActivity {
  date: string;
  type: 'pricing' | 'feature' | 'funding' | 'partnership' | 'acquisition' | 'hiring' | 'product_launch';
  description: string;
  impact: 'high' | 'medium' | 'low';
  source_url?: string;
}

export interface CompetitorSWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorPricing {
  single_report: number;
  monthly_subscription: number;
  annual_enterprise: number;
  custom_pricing: boolean;
  free_trial: boolean;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  founded: string;
  funding: string;
  market_share: number;
  market_position: 'leader' | 'challenger' | 'niche' | 'emerging';
  category?: 'direct' | 'indirect' | 'potential' | 'partner';
  tags?: string[];
  notes?: string;
  pricing: {
    single: number;
    monthly: number;
    enterprise: number;
  };
  features: string[];
  strengths: string[];
  weaknesses: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  metrics: {
    webTraffic: number;
    socialFollowers: number;
    employeeCount: number;
    customerCount: number;
    annualRevenue: number;
  };
  recent_activity: Array<{
    date: string;
    type: 'pricing' | 'feature' | 'funding' | 'partnership' | 'acquisition';
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  competitive_score?: number;
}

export interface CompetitorComparison {
  id: string;
  name: string;
  website: string;
  market_share: number;
  market_position: string;
  funding: string;
  founded: string;
  single_report_price: string;
  monthly_subscription_price: string;
  enterprise_price: string;
  feature_count: number;
  feature_list: string[];
  strength_count: number;
  weakness_count: number;
  customer_count: string;
  annual_revenue_millions: string;
  monthly_web_traffic: string;
  social_followers: string;
  employee_count: string;
  recent_activity_count: number;
  competitive_score: number;
  created_at: string;
  updated_at: string;
}

export interface CompetitorFormData {
  name: string;
  website: string;
  founded: string;
  funding: string;
  market_share: number;
  market_position: 'leader' | 'challenger' | 'niche' | 'emerging';
  category?: 'direct' | 'indirect' | 'potential' | 'partner';
  tags?: string[];
  notes?: string;
  pricing: {
    single: number;
    monthly: number;
    enterprise: number;
  };
  features: string[];
  strengths: string[];
  weaknesses: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  metrics: {
    webTraffic: number;
    socialFollowers: number;
    employeeCount: number;
    customerCount: number;
    annualRevenue: number;
  };
  recent_activity: Array<{
    date: string;
    type: string;
    description: string;
    impact: string;
  }>;
}

// Campaign analytics types
export interface CampaignAnalytics {
  campaign_id: string;
  daily_performance: {
    date: string;
    impressions: number;
    clicks: number;
    leads: number;
    conversions: number;
    spend: number;
    revenue: number;
  }[];
  hourly_performance?: {
    hour: number;
    conversions: number;
    spend: number;
  }[];
  device_breakdown?: {
    device: 'desktop' | 'mobile' | 'tablet';
    conversions: number;
    spend: number;
  }[];
  geographic_breakdown?: {
    region: string;
    leads: number;
    conversions: number;
  }[];
}

// Forecast types
export interface ForecastData {
  month: string;
  spend: number;
  revenue: number;
  leads: number;
  roi: number;
  is_forecast: boolean;
  confidence_lower?: number;
  confidence_upper?: number;
}

// Export types
export interface ExportConfig {
  format: 'csv' | 'json' | 'pdf';
  date_range: {
    from: string;
    to: string;
  };
  metrics: string[];
  group_by?: 'day' | 'week' | 'month' | 'channel';
}