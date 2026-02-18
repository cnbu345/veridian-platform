// src/types/sales-marketing.ts // Sales Marketing Intelligence Interface
// Stage and Source types
export type LeadStage = 'new' | 'contacted' | 'consultation_scheduled' | 'consultation_completed' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type LeadSource = 'organic' | 'linkedin' | 'referral' | 'direct' | 'conference' | 'outbound' | 'partner' | 'other'
export type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'status_change'
export type ImpactLevel = 'high' | 'medium' | 'low'
export type RiskLevel = 'healthy' | 'moderate' | 'at_risk'
export type CampaignChannel = 'linkedin' | 'email' | 'google' | 'direct' | 'conference' | 'partner'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

// Detailed entity interfaces
export interface Lead {
  id: string
  company_name: string
  company_website?: string
  industry?: string
  state?: string
  city?: string
  contact_name?: string
  contact_title?: string
  contact_email?: string
  contact_phone?: string
  source: LeadSource
  score: number
  stage: LeadStage
  value?: number
  probability?: number
  notes?: string
  tags: string[]
  assigned_to?: string
  last_contact?: string
  next_action?: string
  next_action_date?: string
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  type: ActivityType
  description: string
  metadata?: any
  created_by?: string
  created_at: string
}

export interface Competitor {
  id: string
  name: string
  website?: string
  founded?: string
  funding?: string
  market_share?: number
  pricing: {
    single?: number
    monthly?: number
    enterprise?: number
  }
  features: string[]
  strengths: string[]
  weaknesses: string[]
  swot?: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  recentActivity?: CompetitorActivity[]
  created_at: string
  updated_at: string
}

export interface CompetitorActivity {
  id: string
  competitor_id: string
  type: 'pricing' | 'feature' | 'funding' | 'partnership' | 'acquisition'
  description: string
  impact: ImpactLevel
  url?: string
  date: string
  created_at: string
}

export interface ContentMetric {
  id: string
  title: string
  url: string
  topic: string
  views: number
  unique_visitors: number
  avg_time_on_page: number
  bounce_rate: number
  downloads: number
  shares: number
  leads_generated: number
  conversions: number
}

export interface ContentAnalytics {
  id: string
  page_url: string
  page_title?: string
  topic?: string
  state?: string
  views: number
  unique_visitors: number
  avg_time_on_page?: number
  bounce_rate?: number
  downloads: number
  shares: number
  leads_generated: number
  date: string
}

export interface MarketingCampaign {
  id: string
  name: string
  channel: CampaignChannel
  budget?: number
  spent?: number
  start_date?: string
  end_date?: string
  target_audience: string[]
  content?: any
  metrics?: {
    impressions?: number
    clicks?: number
    leads?: number
    conversions?: number
    revenue?: number
    cost?: number
    roi?: number
  }
  status: CampaignStatus
  created_at: string
  updated_at: string
}

export interface CustomerHealth {
  id: string
  user_id: string
  company_name: string
  contact_name?: string
  email?: string
  health_score: number
  risk_level: RiskLevel
  last_login?: string
  report_count: number
  support_tickets: number
  nps_score?: number
  csat_score?: number
  churn_probability?: number
  expansion_opportunity: string[]
  subscription_tier?: string
  mrr?: number
  notes?: string
  updated_at: string
}

export interface Deal {
  id: string
  company_name: string
  value: number
  stage: LeadStage
  probability: number
  expected_close_date: string
  owner: string
}

export interface HealthFactor {
  name: string
  score: number
  weight: number
  status: 'positive' | 'neutral' | 'negative'
}

export interface StateActivity {
  state: string
  activity_level: 'high' | 'medium' | 'low'
  pending_legislation: number
  recent_enforcement: number
}

export interface TopicTrend {
  topic: string
  growth: number
  volume: number
  sentiment: number
}

export interface SearchTrend {
  keyword: string
  volume: number
  growth: number
  competition: 'high' | 'medium' | 'low'
}

export interface Mention {
  source: string
  competitor: string
  sentiment: 'positive' | 'neutral' | 'negative'
  excerpt: string
  date: string
}

export interface LegislationUpdate {
  state: string
  bill_number: string
  title: string
  status: 'proposed' | 'in_committee' | 'passed' | 'enacted'
  effective_date?: string
}

export interface UpsellOpportunity {
  customer_id: string
  company_name: string
  current_tier: string
  recommended_tier: string
  potential_value: number
  confidence: number
  reasons: string[]
}

export interface ChurnRisk {
  customer_id: string
  company_name: string
  risk_score: number
  primary_reason: string
  suggested_action: string
}

export interface PipelineStage {
  count: number
  value: number
  weightedValue: number
  avgDealSize: number
}

export interface HealthScore {
  average: number
  distribution: {
    healthy: number    // 80-100
    moderate: number   // 50-79
    atRisk: number     // 0-49
  }
  factors: HealthFactor[]
}

export interface AttributionData {
  sessions: number
  leads: number
  opportunities: number
  revenue: number
  cost: number
  roi: number
}

// Main intelligence interface (your existing one, enhanced)
export interface SalesMarketingIntelligence {
  leads: {
    total: number
    byStage: Record<LeadStage, number>
    bySource: Record<LeadSource, number>
    byState: Record<string, number>
    byIndustry: Record<string, number>
    scoreDistribution: {
      hot: number    // 80-100
      warm: number   // 50-79
      cold: number   // 0-49
    }
    conversionRates: {
      leadToConsultation: number
      consultationToSale: number
      leadToSale: number
      avgDaysToClose: number
    }
    recentLeads?: Lead[]
  }

  competitors: {
    name: string
    pricing: Record<string, number>
    features: string[]
    marketShare: number
    recentActivity: CompetitorActivity[]
    swotAnalysis: {
      strengths: string[]
      weaknesses: string[]
      opportunities: string[]
      threats: string[]
    }
  }[]

  content: {
    totalViews: number
    uniqueVisitors: number
    avgTimeOnPage: number
    bounceRate: number
    topPerforming: ContentMetric[]
    byTopic: Record<string, ContentMetric>
    byState: Record<string, ContentMetric>
    downloads: number
    shares: number
  }

  pipeline: {
    totalValue: number
    weightedValue: number
    byStage: Record<LeadStage, PipelineStage>
    velocity: number // days through pipeline
    winRate: number
    lossReasons: Record<string, number>
    upcomingClosures: Deal[]
  }

  customerHealth: {
    bySegment: Record<string, HealthScore>
    atRisk: CustomerHealth[]
    expansion: UpsellOpportunity[]
    churnPrediction: ChurnRisk[]
    nps: number
    csat: number
  }

  attribution: {
    firstTouch: Record<string, AttributionData>
    multiTouch: Record<string, AttributionData>
    lastTouch: Record<string, AttributionData>
    roi: Record<string, number>
    cac: Record<string, number>
    ltv: Record<string, number>
  }

  regulatoryTrends: {
    mostActiveStates: StateActivity[]
    emergingTopics: TopicTrend[]
    searchTrends: SearchTrend[]
    competitorMentions: Mention[]
    legislationTracking: LegislationUpdate[]
  }
}