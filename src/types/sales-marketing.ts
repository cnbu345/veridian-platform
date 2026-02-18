// src/types/sales-marketing.ts
export interface SalesMarketingIntelligence {
  // Lead Scoring & Tracking
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
  }

  // Competitor Intelligence
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

  // Content Performance
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

  // Sales Pipeline
  pipeline: {
    totalValue: number
    weightedValue: number
    byStage: Record<LeadStage, PipelineStage>
    velocity: number // days through pipeline
    winRate: number
    lossReasons: Record<string, number>
    upcomingClosures: Deal[]
  }

  // Customer Health
  customerHealth: {
    bySegment: Record<string, HealthScore>
    atRisk: Customer[]
    expansion: UpsellOpportunity[]
    churnPrediction: ChurnRisk[]
    nps: number
    csat: number
  }

  // Marketing Attribution
  attribution: {
    firstTouch: Record<string, AttributionData>
    multiTouch: Record<string, AttributionData>
    lastTouch: Record<string, AttributionData>
    roi: Record<string, number>
    cac: Record<string, number>
    ltv: Record<string, number>
  }

  // Regulatory Trends
  regulatoryTrends: {
    mostActiveStates: StateActivity[]
    emergingTopics: TopicTrend[]
    searchTrends: SearchTrend[]
    competitorMentions: Mention[]
    legislationTracking: LegislationUpdate[]
  }
}

interface LeadStage {
  stage: 'new' | 'contacted' | 'consultation_scheduled' | 'consultation_completed' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  count: number
  value: number
}

interface LeadSource {
  source: 'organic' | 'linkedin' | 'referral' | 'direct' | 'conference' | 'outbound' | 'partner' | 'other'
  count: number
  conversionRate: number
}

interface PipelineStage {
  count: number
  value: number
  weightedValue: number
  avgDealSize: number
}

interface HealthScore {
  average: number
  distribution: {
    healthy: number    // 80-100
    moderate: number   // 50-79
    atRisk: number     // 0-49
  }
  factors: HealthFactor[]
}

interface AttributionData {
  sessions: number
  leads: number
  opportunities: number
  revenue: number
  cost: number
  roi: number
}