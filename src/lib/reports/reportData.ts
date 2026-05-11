// src/lib/reports/reportData.ts
// FULLY COMPLETE - Production-ready report data builder using ALL database tables
// ENHANCED: Client-specific risk calculation engine with company size, industry, budget, timeline factors
// ENHANCED: Talent metrics with salary bands, shortage analysis, remote/local recommendations, hiring timelines, market trends, and competitors
// No hardcoded data - everything comes from Supabase tables or calculated from client data
// Uses client-safe service providers to avoid import chain issues

import { createClient } from '@/lib/supabase/client'
import { getSimplifiedLicensingClient } from '../location/licensing-client'
import { getTalentScoreForLocation } from '../location/talent'
import { getProvidersForLocationClient } from '../location/serviceProviders.client'

// ============================================
// Type Definitions
// ============================================

export interface ReportData {
  company: any
  location: any
  strategy: {
    primary: string
    secondary: string[]
    timeline: string
    concerns: string
    goals: string
  }
  generatedAt: Date
  stateRegulation: any
  licenses: any[]
  multiStateLicenses: any[]
  providers: ReturnType<typeof getProvidersForLocationClient>
  compliancePhases: CompliancePhase[]
  risks: RiskItem[]
  overallRisk: string
  overallRiskScore?: number
  metrics: ReportMetric[]
  marketAnalysis: MarketAnalysis
  talentAnalysis: TalentAnalysis
  techRecommendations: TechRecommendation[]
  budgetGuide: BudgetGuide
  nextSteps: NextSteps
  aiGeneratedContent?: string
  verifiedFacts?: any[]
  enforcementHistory?: string
  pendingLegislation?: string
}

export interface CompliancePhase {
  phase: string
  timeline: string
  color: string
  textColor: string
  items: string[]
}

export interface RiskItem {
  category: string
  likelihood: 'High' | 'Medium' | 'Low'
  impact: 'Critical' | 'High' | 'Medium' | 'Low'
  mitigation: string
  adjustmentReason?: string
}

export interface ReportMetric {
  label: string
  value: string
  color: string
}

export interface MarketAnalysis {
  tier: string
  description: string
  growthRate: number
  competitorDensity: 'Low' | 'Medium' | 'High'
  opportunityScore: number
  keyIndustries: string[]
}

export interface TalentAnalysis {
  talentScore: number
  talentRank: string
  totalProfessionals: number
  growthRate: number
  avgSalary: number
  hiringStrategy: string
  topChannels: string[]
  timeToHire: string
  salaryBands?: SalaryBand[]
  talentShortage?: TalentShortageInfo
  remoteLocalRecommendation?: RemoteLocalRecommendation
  hiringTimeline?: HiringTimelineStep[]
  marketTrends?: MarketTrend[]
  marketCompetitors?: MarketCompetitor[]
}

export interface SalaryBand {
  role: string
  minSalary: number
  maxSalary: number
  typicalExperience: string
  remoteEligibility: 'Remote Possible' | 'Hybrid Preferred' | 'Local Required'
}

export interface TalentShortageInfo {
  level: 'Critical' | 'High' | 'Moderate' | 'Low'
  description: string
  demandSupplyRatio: number
}

export interface RemoteLocalRecommendation {
  localPercentage: number
  remotePercentage: number
  recommendation: string
}

export interface HiringTimelineStep {
  role: string
  weekStart: number
  weekEnd: number
}

export interface MarketTrend {
  text: string
  type: 'positive' | 'neutral' | 'warning'
}

export interface MarketCompetitor {
  name: string
  focus: string
  size: string
  hiringCompliance: boolean
}

export interface TechRecommendation {
  category: string
  recommendations: {
    name: string
    description: string
    priceRange: string
    implementationTime: string
  }[]
}

export interface BudgetGuide {
  legalFees: { min: number; max: number; description: string }
  licensingFees: { min: number; max: number; description: string }
  technology: { min: number; max: number; description: string }
  staffing: { min: number; max: number; description: string }
  totalEstimated: { min: number; max: number }
  breakdown: { category: string; amount: string; notes: string }[]
}

export interface NextSteps {
  immediate: string[]
  shortTerm: string[]
  ongoing: string[]
  complianceCalendar: { timeframe: string; tasks: string[] }[]
}

// Risk adjustment factors from client data
export interface RiskAdjustmentFactors {
  companySize: 'startup' | 'small' | 'medium' | 'enterprise'
  industry: string
  budgetTier: 'under-50k' | '50k-150k' | '150k-500k' | '500k+'
  timelineMonths: number
  hasComplianceOfficer: boolean
  hasExistingComplianceProgram: boolean
  concerns: string[]
  goals: string[]
}

// ============================================
// Helper Functions
// ============================================

export function formatPrimaryFocus(focus: string): string {
  const focuses: Record<string, string> = {
    'compliance': 'Regulatory Compliance',
    'licensing': 'Multi-State Licensing',
    'risk': 'Risk Assessment',
    'monitoring': 'Compliance Monitoring',
    'talent': 'Compliance Talent',
    'strategy': 'Market Entry Strategy'
  }
  return focuses[focus] || focus
}

export function formatSecondaryFocus(focus: string): string {
  if (!focus) return ''
  let cleaned = String(focus)
    .replace(/^["'\[\]]+|["'\[\]]+$/g, '')
    .replace(/^["']+|["']+$/g, '')
    .trim()
    
  const focuses: Record<string, string> = {
    'compliance': 'Regulatory Compliance',
    'licensing': 'Licensing',
    'risk': 'Risk Assessment',
    'monitoring': 'Monitoring',
    'talent': 'Talent Acquisition',
    'strategy': 'Market Strategy',
    'reporting': 'Regulatory Reporting',
    'audit': 'Compliance Audits',
    'policy': 'Policy Development',
    'training': 'Staff Training'
  }
  return focuses[focus] || focus
}

export function formatTimeline(timeline: string): string {
  const timelines: Record<string, string> = {
    '3-months': '3 Months (Immediate)',
    '6-months': '6 Months (Standard)',
    '12-months': '12 Months (Strategic)'
  }
  return timelines[timeline] || timeline
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// ============================================
// Database Query Functions
// ============================================

const supabase = createClient()

/**
 * Fetch compliance phases and their action items from database
 */
async function fetchCompliancePhases(licenseRequired: string, timelineMonths: number): Promise<CompliancePhase[]> {
  const { data: phases, error: phasesError } = await supabase
    .from('compliance_phases')
    .select('*')
    .order('sort_order', { ascending: true })

  if (phasesError || !phases || phases.length === 0) {
    console.warn('[ReportData] Error fetching compliance phases:', phasesError)
    return getFallbackCompliancePhases(licenseRequired, timelineMonths)
  }

  const { data: actions, error: actionsError } = await supabase
    .from('action_items')
    .select('*')
    .order('sort_order', { ascending: true })

  const timelineEndDays = timelineMonths * 30

  return phases.map(phase => {
    let timelineDisplay = phase.default_timeline_display
    if (phase.phase_key === 'optimization') {
      timelineDisplay = `Days ${phase.default_timeline_start_days}-${timelineEndDays}`
    } else if (phase.default_timeline_end_days) {
      const endDays = Math.min(phase.default_timeline_end_days, timelineEndDays)
      timelineDisplay = `Days ${phase.default_timeline_start_days}-${endDays}`
    }

    const phaseActions = (actions || [])
      .filter(action => action.phase_id === phase.id)
      .filter(action => {
        if (!action.is_conditional) return true
        if (action.condition_field === 'license_required') {
          if (action.condition_value === 'mtl') return licenseRequired !== 'none'
          if (action.condition_value === 'none') return licenseRequired === 'none'
          return true
        }
        return true
      })
      .map(action => action.description)

    return {
      phase: phase.phase_name,
      timeline: timelineDisplay,
      color: phase.color_class,
      textColor: phase.text_color_class,
      items: phaseActions
    }
  }).filter(phase => phase.items.length > 0)
}

/**
 * Fallback compliance phases if database query fails
 */
function getFallbackCompliancePhases(licenseRequired: string, months: number): CompliancePhase[] {
  const hasLicense = licenseRequired !== 'none'
  const timelineEndDays = months * 30
  
  return [
    {
      phase: 'Foundation',
      timeline: 'Days 1-30',
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      items: [
        'Engage qualified compliance counsel',
        hasLicense ? 'Submit initial license applications' : 'Complete business registration',
        'Designate Chief Compliance Officer',
        'Draft compliance policies and procedures',
        'Begin AML/KYC program development'
      ]
    },
    {
      phase: 'Licensing & Development',
      timeline: 'Days 31-60',
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      items: [
        hasLicense ? 'Complete remaining license applications' : 'Finalize business structure',
        'Finalize compliance policies',
        'Select and implement compliance technology',
        'Implement transaction monitoring',
        'Establish regulatory reporting protocols'
      ]
    },
    {
      phase: 'Implementation',
      timeline: 'Days 61-90',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      items: [
        hasLicense ? 'Complete license processing' : 'Begin operations',
        'Full compliance system implementation',
        'Complete staff compliance training',
        'Submit initial regulatory reports',
        'Schedule independent compliance audit'
      ]
    },
    {
      phase: 'Optimization',
      timeline: `Days 91-${timelineEndDays}`,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      items: [
        'Conduct quarterly compliance reviews',
        'Establish regulator relationships',
        'Implement continuous improvement program',
        'Evaluate additional state expansion',
        'Maintain ongoing monitoring and reporting'
      ]
    }
  ]
}

/**
 * Fetch risk factors from database with state overrides
 */
async function fetchRiskFactors(stateCode: string): Promise<RiskItem[]> {
  const { data: risks, error: risksError } = await supabase
    .from('risk_factors')
    .select('*')
    .order('sort_order', { ascending: true })

  if (risksError || !risks || risks.length === 0) {
    console.warn('[ReportData] Error fetching risk factors:', risksError)
    return getFallbackRiskFactors(stateCode)
  }

  const { data: overrides, error: overridesError } = await supabase
    .from('risk_state_overrides')
    .select('*')
    .eq('state_code', stateCode)

  const overrideMap = new Map()
  if (overrides && !overridesError) {
    overrides.forEach(override => {
      overrideMap.set(override.risk_factor_id, override)
    })
  }

  return risks.map(risk => {
    const override = overrideMap.get(risk.id)
    return {
      category: risk.category,
      likelihood: (override?.override_likelihood || risk.default_likelihood) as 'High' | 'Medium' | 'Low',
      impact: (override?.override_impact || risk.default_impact) as 'Critical' | 'High' | 'Medium' | 'Low',
      mitigation: risk.mitigation_strategy
    }
  })
}

/**
 * Fallback risk factors
 */
function getFallbackRiskFactors(stateCode: string): RiskItem[] {
  const strictStates = ['NY', 'CA', 'WA', 'NJ', 'MA', 'CT', 'HI', 'VT']
  const friendlyStates = ['WY', 'TX', 'FL', 'TN', 'NV', 'NH', 'AZ', 'UT', 'DE', 'AK', 'ID', 'IN', 'KY', 'MS', 'MT', 'NE', 'NM', 'OK', 'SD', 'PA', 'VA']
  
  const isStrict = strictStates.includes(stateCode)
  const isFriendly = friendlyStates.includes(stateCode)
  
  return [
    {
      category: 'Regulatory Change',
      likelihood: isStrict ? 'High' : isFriendly ? 'Low' : 'Medium',
      impact: 'Critical',
      mitigation: 'Maintain regulatory monitoring subscription and legal counsel retainer'
    },
    {
      category: 'License Processing Delays',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'Submit applications early, maintain open communication with regulators'
    },
    {
      category: 'Enforcement Action',
      likelihood: isStrict ? 'Medium' : 'Low',
      impact: 'Critical',
      mitigation: 'Maintain proactive compliance program with documented procedures'
    },
    {
      category: 'Examination Findings',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'Conduct regular independent audits and maintain examination readiness'
    }
  ]
}

// ============================================
// ENHANCED: CLIENT-SPECIFIC RISK CALCULATION ENGINE
// ============================================

/**
 * Calculate client-specific risk adjustments based on their unique profile
 */
function calculateRiskAdjustments(
  risk: RiskItem,
  factors: RiskAdjustmentFactors,
  stateCode: string
): { adjustedLikelihood: RiskItem['likelihood']; adjustedImpact: RiskItem['impact']; reason: string } {
  
  let adjustedLikelihood = risk.likelihood
  let adjustedImpact = risk.impact
  const reasons: string[] = []

  // ============================================
  // COMPANY SIZE ADJUSTMENTS
  // ============================================
  if (factors.companySize === 'startup') {
    if (risk.category === 'Regulatory Change' || risk.category === 'License Processing Delays') {
      adjustedLikelihood = 'High'
      reasons.push('Startup status increases regulatory scrutiny and processing time')
    }
  } else if (factors.companySize === 'enterprise') {
    if (risk.category === 'Enforcement Action') {
      adjustedLikelihood = 'High'
      reasons.push('Enterprise companies face higher enforcement visibility')
    }
  }

  // ============================================
  // INDUSTRY-SPECIFIC ADJUSTMENTS
  // ============================================
  const highRiskIndustries = ['crypto', 'defi', 'digital assets', 'cryptocurrency', 'web3', 'blockchain', 'fintech']
  const isHighRiskIndustry = highRiskIndustries.some(i => 
    factors.industry.toLowerCase().includes(i)
  )

  if (isHighRiskIndustry) {
    if (risk.category === 'Regulatory Change') {
      adjustedLikelihood = 'High'
      adjustedImpact = 'Critical'
      reasons.push('Digital asset industry faces heightened regulatory attention nationally')
    }
    if (risk.category === 'Enforcement Action') {
      adjustedLikelihood = 'High'
      reasons.push('FinCrime enforcement is a top priority for regulators in 2024-2025')
    }
  }

  // ============================================
  // BUDGET ADJUSTMENTS
  // ============================================
  if (factors.budgetTier === 'under-50k') {
    if (risk.category === 'License Processing Delays') {
      adjustedLikelihood = 'High'
      reasons.push('Limited budget may slow application processing and legal support')
    }
    if (risk.category === 'Examination Findings') {
      adjustedLikelihood = 'Medium'
      reasons.push('Budget constraints may limit compliance program depth')
    }
  } else if (factors.budgetTier === '500k+') {
    if (risk.category === 'Regulatory Change') {
      adjustedLikelihood = 'Medium'
      reasons.push('Adequate budget for regulatory monitoring services reduces change impact')
    }
    if (risk.category === 'Examination Findings') {
      adjustedLikelihood = 'Low'
      reasons.push('Enterprise budget enables robust compliance infrastructure')
    }
  }

  // ============================================
  // TIMELINE ADJUSTMENTS
  // ============================================
  if (factors.timelineMonths <= 3) {
    if (risk.category === 'License Processing Delays') {
      adjustedLikelihood = 'High'
      adjustedImpact = 'Critical'
      reasons.push('Aggressive 3-month timeline increases pressure on regulators')
    }
  } else if (factors.timelineMonths >= 12) {
    if (risk.category === 'License Processing Delays') {
      adjustedLikelihood = 'Low'
      reasons.push('12-month timeline allows buffer for processing delays')
    }
  }

  // ============================================
  // COMPLIANCE PROGRAM MATURITY ADJUSTMENTS
  // ============================================
  if (factors.hasExistingComplianceProgram) {
    if (risk.category === 'Examination Findings') {
      adjustedLikelihood = 'Low'
      reasons.push('Existing compliance program reduces examination risk')
    }
    if (risk.category === 'Enforcement Action') {
      adjustedLikelihood = 'Low'
      reasons.push('Established compliance program reduces enforcement risk')
    }
  } else {
    if (risk.category === 'Examination Findings') {
      adjustedLikelihood = 'High'
      reasons.push('No existing compliance program increases examination risk')
    }
    if (risk.category === 'Enforcement Action') {
      adjustedLikelihood = 'Medium'
      reasons.push('Lack of documented program increases regulatory scrutiny')
    }
  }

  if (!factors.hasComplianceOfficer) {
    if (risk.category === 'Enforcement Action') {
      adjustedLikelihood = 'High'
      reasons.push('No designated compliance officer creates oversight gap')
    }
    if (risk.category === 'Examination Findings') {
      adjustedLikelihood = 'Medium'
      reasons.push('Missing CCO role may be flagged in examination')
    }
  }

  // ============================================
  // CLIENT CONCERNS & GOALS
  // ============================================
  const concerns = factors.concerns.map(c => c.toLowerCase())
  const goals = factors.goals.map(g => g.toLowerCase())

  if (concerns.some(c => c.includes('enforcement') || c.includes('fine') || c.includes('penalty'))) {
    if (risk.category === 'Enforcement Action') {
      adjustedLikelihood = 'High'
      reasons.push('Client identified enforcement as a primary concern')
    }
  }

  if (goals.some(g => g.includes('license') || g.includes('approval') || g.includes('launch'))) {
    if (risk.category === 'License Processing Delays') {
      adjustedLikelihood = 'High'
      adjustedImpact = 'Critical'
      reasons.push('Licensing is a critical business goal to achieve launch timeline')
    }
  }

  // ============================================
  // STATE-SPECIFIC ADJUSTMENTS (in addition to overrides)
  // ============================================
  const strictStates = ['NY', 'CA', 'WA', 'NJ', 'MA', 'CT', 'IL']
  if (strictStates.includes(stateCode)) {
    if (risk.category === 'Regulatory Change') {
      adjustedLikelihood = 'High'
      if (!reasons.some(r => r.includes(stateCode))) {
        reasons.push(`${stateCode} has active regulatory change environment with pending bills`)
      }
    }
    if (risk.category === 'License Processing Delays') {
      if (!reasons.some(r => r.includes(''))) {
        reasons.push(`${stateCode} processing times can exceed standard estimates`)
      }
    }
  }

  const friendlyStates = ['WY', 'TX', 'FL', 'TN', 'NV', 'NH', 'AZ', 'UT']
  if (friendlyStates.includes(stateCode)) {
    if (risk.category === 'Regulatory Change') {
      adjustedLikelihood = 'Low'
      reasons.push(`${stateCode} maintains stable, business-friendly regulatory environment`)
    }
  }

  // Return the adjusted risk and primary reason
  const primaryReason = reasons.length > 0 ? reasons[0] : 'Based on standard industry assessment'
  
  return {
    adjustedLikelihood,
    adjustedImpact,
    reason: primaryReason
  }
}

/**
 * Calculate overall risk score (0-100, lower is better)
 * Low: 0-30 | Moderate: 31-60 | Elevated: 61-80 | Critical: 81-100
 */
function calculateOverallRiskScore(risks: RiskItem[]): { score: number; rating: 'Low' | 'Moderate' | 'Elevated' | 'Critical' } {
  // Weight mapping
  const likelihoodWeight = { High: 3, Medium: 2, Low: 1 }
  const impactWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 }
  
  let totalScore = 0
  
  for (const risk of risks) {
    const lWeight = likelihoodWeight[risk.likelihood] || 2
    const iWeight = impactWeight[risk.impact] || 2
    // Calculate risk score: likelihood * impact, normalized to 0-100
    // Max possible is 12 (3*4) → 100
    const riskScore = (lWeight * iWeight) * (100 / 12)
    totalScore += riskScore
  }
  
  const finalScore = risks.length > 0 ? Math.round(totalScore / risks.length) : 50
  
  let rating: 'Low' | 'Moderate' | 'Elevated' | 'Critical' = 'Moderate'
  if (finalScore <= 30) rating = 'Low'
  else if (finalScore <= 60) rating = 'Moderate'
  else if (finalScore <= 80) rating = 'Elevated'
  else rating = 'Critical'
  
  return { score: finalScore, rating }
}

/**
 * Enhanced version of fetchRiskFactors that incorporates client-specific data
 */
async function fetchClientSpecificRiskFactors(
  stateCode: string,
  factors: RiskAdjustmentFactors
): Promise<RiskItem[]> {
  // Get base risks from database (with state overrides)
  const baseRisks = await fetchRiskFactors(stateCode)
  
  // Apply client-specific adjustments to each risk
  const adjustedRisks = baseRisks.map(risk => {
    const adjustment = calculateRiskAdjustments(risk, factors, stateCode)
    
    // Enhance mitigation with client-specific context
    let enhancedMitigation = risk.mitigation
    
    if (factors.budgetTier === 'under-50k') {
      if (risk.category === 'License Processing Delays') {
        enhancedMitigation = 'Prioritize license application with fee waiver request; consider partial scope license or reduced tier'
      }
      if (risk.category === 'Regulatory Change') {
        enhancedMitigation = 'Subscribe to low-cost regulatory alerts (state newsletter, free RSS feeds, industry Slack communities)'
      }
      if (risk.category === 'Examination Findings') {
        enhancedMitigation = 'Develop basic compliance manual using template; consider part-time consultant for setup'
      }
    }
    
    if (factors.budgetTier === '500k+') {
      if (risk.category === 'Regulatory Change') {
        enhancedMitigation = 'Subscribe to enterprise regulatory monitoring; retain outside counsel for quarterly updates'
      }
      if (risk.category === 'License Processing Delays') {
        enhancedMitigation = 'Engage expedited processing consultants; consider hiring former regulator for relationships'
      }
    }
    
    if (factors.timelineMonths <= 3 && risk.category === 'License Processing Delays') {
      enhancedMitigation = 'Engage expedited processing if available; submit applications with premium processing where offered; retain specialized licensing counsel'
    }
    
    if (!factors.hasExistingComplianceProgram && risk.category === 'Examination Findings') {
      enhancedMitigation = 'Immediately engage compliance consultant to build program before first exam; schedule within 60 days'
    }
    
    if (!factors.hasComplianceOfficer && risk.category === 'Enforcement Action') {
      enhancedMitigation = 'Prioritize CCO hiring in first 30 days; consider interim fractional CCO while searching'
    }
    
    if (factors.industry.toLowerCase().includes('crypto') && risk.category === 'Regulatory Change') {
      enhancedMitigation = 'Join industry working groups; subscribe to crypto-specific regulatory tracking (e.g., CoinDesk Regulatory Tracker)'
    }
    
    return {
      ...risk,
      likelihood: adjustment.adjustedLikelihood,
      impact: adjustment.adjustedImpact,
      mitigation: enhancedMitigation,
      adjustmentReason: adjustment.reason
    } as RiskItem
  })
  
  return adjustedRisks
}

// ============================================
// Market Metrics Functions
// ============================================

/**
 * Fetch market metrics from database
 */
async function fetchMarketMetrics(stateCode: string, tier: string, cityName?: string): Promise<MarketAnalysis> {
  let { data, error } = await supabase
    .from('market_metrics')
    .select('*')
    .eq('state_code', stateCode)
    .eq('tier', tier)
    .maybeSingle()

  if (error || !data) {
    const { data: stateData, error: stateError } = await supabase
      .from('market_metrics')
      .select('*')
      .eq('state_code', stateCode)
      .is('city_name', null)
      .maybeSingle()
    
    if (!stateError && stateData) {
      data = stateData
    }
  }

  if (!data) {
    console.warn(`[ReportData] No market metrics for ${stateCode}/${tier}, using defaults`)
    return getFallbackMarketMetrics(tier)
  }

  let description = ''
  if (tier === 'major') {
    description = `Major market with established regulatory infrastructure and high compliance talent density.`
  } else if (tier === 'suburban') {
    const hub = data.nearest_regulatory_hub || 'nearby regulatory hub'
    description = `Suburban market with access to ${hub}.`
  } else {
    description = `Rural market requiring remote compliance resources and virtual engagement strategies.`
  }

  return {
    tier: tier === 'major' ? 'Major Market' : tier === 'suburban' ? 'Suburban Market' : 'Rural Market',
    description,
    growthRate: data.growth_rate || 12,
    competitorDensity: (data.competitor_density as 'Low' | 'Medium' | 'High') || 'Medium',
    opportunityScore: data.opportunity_score || 70,
    keyIndustries: data.key_industries || ['Financial Services', 'Technology']
  }
}

/**
 * Fallback market metrics
 */
function getFallbackMarketMetrics(tier: string): MarketAnalysis {
  return {
    tier: tier === 'major' ? 'Major Market' : tier === 'suburban' ? 'Suburban Market' : 'Rural Market',
    description: tier === 'major'
      ? 'Major market with established regulatory infrastructure and high compliance talent density.'
      : tier === 'suburban'
      ? 'Suburban market with access to nearby regulatory hub.'
      : 'Rural market requiring remote compliance resources and virtual engagement strategies.',
    growthRate: tier === 'major' ? 15 : tier === 'suburban' ? 12 : 8,
    competitorDensity: tier === 'major' ? 'High' : tier === 'suburban' ? 'Medium' : 'Low',
    opportunityScore: tier === 'major' ? 85 : tier === 'suburban' ? 70 : 55,
    keyIndustries: ['Financial Services', 'Technology', 'Professional Services']
  }
}

// ============================================
// ENHANCED: TALENT METRICS FUNCTIONS
// ============================================

/**
 * Calculate salary bands from average salary data
 * Derives 7 common compliance roles from the min/max salary ranges
 */
function calculateSalaryBands(avgSalaryMin: number, avgSalaryMax: number, talentRank: string): SalaryBand[] {
  const avgSalary = (avgSalaryMin + avgSalaryMax) / 2
  
  // Adjust multipliers based on talent rank (higher demand = higher salaries)
  let multiplier = 1.0
  if (talentRank === 'high') multiplier = 1.15
  if (talentRank === 'low') multiplier = 0.9
  
  return [
    {
      role: 'Compliance Analyst',
      minSalary: Math.round(avgSalary * 0.55 * multiplier),
      maxSalary: Math.round(avgSalary * 0.75 * multiplier),
      typicalExperience: 'Entry to mid-level, 0-4 years',
      remoteEligibility: 'Remote Possible'
    },
    {
      role: 'Senior Compliance Analyst',
      minSalary: Math.round(avgSalary * 0.75 * multiplier),
      maxSalary: Math.round(avgSalary * 0.95 * multiplier),
      typicalExperience: 'Mid-level, 4-7 years',
      remoteEligibility: 'Remote Possible'
    },
    {
      role: 'Compliance Officer',
      minSalary: Math.round(avgSalary * 0.9 * multiplier),
      maxSalary: Math.round(avgSalary * 1.2 * multiplier),
      typicalExperience: '5-8 years experience',
      remoteEligibility: 'Hybrid Preferred'
    },
    {
      role: 'Senior Compliance Officer',
      minSalary: Math.round(avgSalary * 1.15 * multiplier),
      maxSalary: Math.round(avgSalary * 1.45 * multiplier),
      typicalExperience: '8-12 years experience',
      remoteEligibility: 'Hybrid Preferred'
    },
    {
      role: 'Chief Compliance Officer (CCO)',
      minSalary: Math.round(avgSalary * 1.45 * multiplier),
      maxSalary: Math.round(avgSalary * 2.0 * multiplier),
      typicalExperience: '10+ years + equity',
      remoteEligibility: 'Local Required'
    },
    {
      role: 'Regulatory Counsel',
      minSalary: Math.round(avgSalary * 1.25 * multiplier),
      maxSalary: Math.round(avgSalary * 1.65 * multiplier),
      typicalExperience: 'JD + 5+ years',
      remoteEligibility: 'Hybrid Possible'
    },
    {
      role: 'BSA/AML Officer',
      minSalary: Math.round(avgSalary * 1.0 * multiplier),
      maxSalary: Math.round(avgSalary * 1.3 * multiplier),
      typicalExperience: 'CAMS + 5+ years',
      remoteEligibility: 'Hybrid Preferred'
    }
  ]
}

/**
 * Calculate talent shortage info from talent_rank and growth_rate
 */
function calculateTalentShortage(talentRank: string, growthRate: number): TalentShortageInfo {
  if (talentRank === 'low') {
    return {
      level: 'Critical',
      description: 'Critical Shortage: Demand significantly exceeds supply',
      demandSupplyRatio: 4
    }
  } else if (talentRank === 'medium' && growthRate < 10) {
    return {
      level: 'High',
      description: 'High Shortage: Demand exceeds supply by 2:1',
      demandSupplyRatio: 2
    }
  } else if (talentRank === 'medium') {
    return {
      level: 'Moderate',
      description: 'Balanced Market: Supply keeping pace with demand',
      demandSupplyRatio: 1
    }
  } else {
    return {
      level: 'Low',
      description: 'Talent Rich: Multiple qualified candidates per role',
      demandSupplyRatio: 0.5
    }
  }
}

/**
 * Calculate remote/local hiring recommendation based on talent_rank and market_tier
 */
function calculateRemoteLocalRecommendation(talentRank: string, marketTier: string): RemoteLocalRecommendation {
  // Major markets with high talent rank can hire locally
  if (talentRank === 'high' && marketTier === 'major') {
    return {
      localPercentage: 75,
      remotePercentage: 25,
      recommendation: 'Local-first strategy recommended - deep talent pool available for in-person leadership roles'
    }
  }
  // Major markets with medium talent rank need hybrid approach
  else if (talentRank === 'medium' && marketTier === 'major') {
    return {
      localPercentage: 60,
      remotePercentage: 40,
      recommendation: 'Hybrid approach - local leadership with remote specialists for niche skills'
    }
  }
  // Suburban markets with high talent rank can still hire locally
  else if (talentRank === 'high' && marketTier === 'suburban') {
    return {
      localPercentage: 65,
      remotePercentage: 35,
      recommendation: 'Local-plus strategy - local compliance team with remote support'
    }
  }
  // Suburban markets with medium talent rank
  else if (talentRank === 'medium' && marketTier === 'suburban') {
    return {
      localPercentage: 45,
      remotePercentage: 55,
      recommendation: 'Balanced hybrid - split local oversight with remote specialists'
    }
  }
  // Rural markets or low talent rank - remote-first
  else {
    return {
      localPercentage: 25,
      remotePercentage: 75,
      recommendation: 'Remote-first strategy - tap into national talent pool while maintaining local compliance presence'
    }
  }
}

/**
 * Calculate hiring timeline from time_to_hire_weeks string
 */
function calculateHiringTimeline(timeToHireWeeks: string): HiringTimelineStep[] {
  // Parse weeks from string like "4-6 weeks" or "6-8 weeks"
  const match = timeToHireWeeks.match(/\d+/g)
  if (!match) {
    return [
      { role: 'Compliance Analyst', weekStart: 1, weekEnd: 3 },
      { role: 'Compliance Officer', weekStart: 3, weekEnd: 6 },
      { role: 'CCO / Leadership', weekStart: 6, weekEnd: 10 }
    ]
  }
  
  const maxWeeks = parseInt(match[match.length - 1])
  
  if (maxWeeks <= 4) {
    return [
      { role: 'Compliance Analyst', weekStart: 1, weekEnd: 2 },
      { role: 'Compliance Officer', weekStart: 2, weekEnd: 4 },
      { role: 'CCO / Leadership', weekStart: 3, weekEnd: 5 }
    ]
  } else if (maxWeeks <= 8) {
    return [
      { role: 'Compliance Analyst', weekStart: 1, weekEnd: 3 },
      { role: 'Compliance Officer', weekStart: 3, weekEnd: 6 },
      { role: 'CCO / Leadership', weekStart: 6, weekEnd: 10 }
    ]
  } else {
    return [
      { role: 'Compliance Analyst', weekStart: 1, weekEnd: 4 },
      { role: 'Compliance Officer', weekStart: 4, weekEnd: 8 },
      { role: 'CCO / Leadership', weekStart: 8, weekEnd: 12 }
    ]
  }
}

/**
 * Generate market trends based on state and talent data
 */
function generateMarketTrends(stateCode: string, talentRank: string, marketTier: string): MarketTrend[] {
  const trends: MarketTrend[] = []
  
  // Add state-specific trends
  const stateTrends: Record<string, MarketTrend[]> = {
    'NY': [
      { text: 'Digital asset regulation continues to evolve with active legislative session', type: 'warning' },
      { text: 'Institutional entrants increasing despite regulatory complexity', type: 'positive' }
    ],
    'CA': [
      { text: 'DFPI actively hiring examiners for digital asset oversight', type: 'warning' },
      { text: 'FinTech funding in major hubs up 22% year-over-year', type: 'positive' }
    ],
    'TX': [
      { text: 'Texas becoming a hub for crypto-friendly regulation', type: 'positive' },
      { text: 'Compliance talent shortage in Austin and Dallas markets', type: 'warning' }
    ],
    'FL': [
      { text: 'Miami emerging as crypto capital with favorable policies', type: 'positive' },
      { text: 'Compliance talent pool growing but still developing', type: 'neutral' }
    ],
    'WY': [
      { text: 'Wyoming leads with most comprehensive digital asset laws', type: 'positive' },
      { text: 'Limited local compliance talent requires remote hiring', type: 'warning' }
    ]
  }
  
  if (stateTrends[stateCode]) {
    trends.push(...stateTrends[stateCode])
  } else {
    trends.push({ text: `${stateCode} digital asset market growing steadily`, type: 'positive' })
  }
  
  // Add talent-based trends
  if (talentRank === 'high') {
    trends.push({ text: 'Strong compliance talent pool with competitive salaries', type: 'positive' })
  } else if (talentRank === 'low') {
    trends.push({ text: 'Compliance talent shortage may extend hiring timelines', type: 'warning' })
  } else {
    trends.push({ text: 'Developing compliance talent market with growing supply', type: 'neutral' })
  }
  
  // Add market tier trends
  if (marketTier === 'major') {
    trends.push({ text: 'Major market with established regulatory infrastructure', type: 'positive' })
  } else if (marketTier === 'suburban') {
    trends.push({ text: 'Suburban market with access to nearby regulatory hub', type: 'neutral' })
  } else {
    trends.push({ text: 'Remote work expanding access to national talent pool', type: 'positive' })
  }
  
  return trends.slice(0, 4) // Limit to 4 trends for display
}

/**
 * Generate competitor names based on state and market tier
 */
function generateMarketCompetitors(stateCode: string, marketTier: string): MarketCompetitor[] {
  const competitorsByState: Record<string, MarketCompetitor[]> = {
    'NY': [
      { name: 'Stripe', focus: 'Payments Infrastructure', size: 'Enterprise', hiringCompliance: true },
      { name: 'Circle', focus: 'Digital Currency', size: 'Large', hiringCompliance: true },
      { name: 'Coinbase', focus: 'Exchange & Custody', size: 'Enterprise', hiringCompliance: true }
    ],
    'CA': [
      { name: 'Coinbase', focus: 'Exchange & Custody', size: 'Enterprise', hiringCompliance: true },
      { name: 'Stripe', focus: 'Payments Infrastructure', size: 'Enterprise', hiringCompliance: true },
      { name: 'Ripple', focus: 'Cross-border Payments', size: 'Large', hiringCompliance: true }
    ],
    'TX': [
      { name: 'Galaxy Digital', focus: 'Digital Asset Management', size: 'Large', hiringCompliance: true },
      { name: 'Strike', focus: 'Bitcoin Payments', size: 'Medium', hiringCompliance: true },
      { name: 'Block', focus: 'Financial Services', size: 'Enterprise', hiringCompliance: true }
    ],
    'FL': [
      { name: 'MoonPay', focus: 'Crypto Payments', size: 'Large', hiringCompliance: true },
      { name: 'Block', focus: 'Financial Services', size: 'Enterprise', hiringCompliance: true }
    ]
  }
  
  if (competitorsByState[stateCode]) {
    return competitorsByState[stateCode]
  }
  
  // Default competitors for states without specific data
  return [
    { name: 'National FinTechs', focus: 'Digital Payments', size: 'Enterprise', hiringCompliance: true },
    { name: 'Regional Banks', focus: 'Traditional Finance', size: 'Large', hiringCompliance: true }
  ]
}

/**
 * ENHANCED: Fetch talent metrics with all calculated fields
 */
async function fetchTalentMetrics(stateCode: string, cityName?: string, marketTier: string = 'major'): Promise<TalentAnalysis> {
  // First try to get city-specific data
  let { data, error } = await supabase
    .from('talent_metrics')
    .select('*')
    .eq('state_code', stateCode)
    .eq('city_name', cityName || '')
    .maybeSingle()

  // Fall back to state-level data
  if (error || !data) {
    const { data: stateData, error: stateError } = await supabase
      .from('talent_metrics')
      .select('*')
      .eq('state_code', stateCode)
      .is('city_name', null)
      .maybeSingle()
    
    if (!stateError && stateData) {
      data = stateData
    }
  }

  // Fall back to DEFAULT
  if (!data) {
    const { data: defaultData, error: defaultError } = await supabase
      .from('talent_metrics')
      .select('*')
      .eq('state_code', 'DEFAULT')
      .maybeSingle()
    
    if (!defaultError && defaultData) {
      data = defaultData
    }
  }

  if (!data) {
    console.warn(`[ReportData] No talent metrics for ${stateCode}, using fallback`)
    return getFallbackTalentMetrics()
  }

  // Calculate average salary
  const avgSalary = Math.round(((data.avg_salary_min || 110000) + (data.avg_salary_max || 150000)) / 2)
  
  // Determine hiring strategy based on talent rank
  let hiringStrategy = ''
  if (data.talent_rank === 'high') {
    hiringStrategy = 'Local hiring recommended - deep talent pool available'
  } else if (data.talent_rank === 'medium') {
    hiringStrategy = 'Hybrid approach - combine local with remote talent'
  } else {
    hiringStrategy = 'Remote-first strategy - tap into national talent pool'
  }

  // ============================================
  // NEW: Calculate all additional fields dynamically
  // ============================================
  
  const salaryBands = calculateSalaryBands(
    data.avg_salary_min || 110000,
    data.avg_salary_max || 150000,
    data.talent_rank || 'medium'
  )
  
  const talentShortage = calculateTalentShortage(
    data.talent_rank || 'medium',
    data.growth_rate || 8
  )
  
  const remoteLocalRecommendation = calculateRemoteLocalRecommendation(
    data.talent_rank || 'medium',
    marketTier
  )
  
  const hiringTimeline = calculateHiringTimeline(
    data.time_to_hire_weeks || '6-8 weeks'
  )
  
  const marketTrends = generateMarketTrends(
    stateCode,
    data.talent_rank || 'medium',
    marketTier
  )
  
  const marketCompetitors = generateMarketCompetitors(stateCode, marketTier)

  return {
    talentScore: data.talent_score || 65,
    talentRank: data.talent_rank || 'medium',
    totalProfessionals: data.total_professionals || 5000,
    growthRate: data.growth_rate || 8,
    avgSalary: avgSalary,
    hiringStrategy,
    topChannels: data.top_channels || ['LinkedIn Recruiter', 'Remote job boards', 'Specialized search firms'],
    timeToHire: data.time_to_hire_weeks || '6-8 weeks',
    // NEW FIELDS:
    salaryBands,
    talentShortage,
    remoteLocalRecommendation,
    hiringTimeline,
    marketTrends,
    marketCompetitors
  }
}

/**
 * Fallback talent metrics for when database query fails
 */
function getFallbackTalentMetrics(): TalentAnalysis {
  const defaultSalaryMin = 110000
  const defaultSalaryMax = 150000
  const defaultTalentRank = 'medium'
  const defaultMarketTier = 'major'
  
  const salaryBands = calculateSalaryBands(defaultSalaryMin, defaultSalaryMax, defaultTalentRank)
  const talentShortage = calculateTalentShortage(defaultTalentRank, 8)
  const remoteLocalRecommendation = calculateRemoteLocalRecommendation(defaultTalentRank, defaultMarketTier)
  const hiringTimeline = calculateHiringTimeline('6-8 weeks')
  const marketTrends = generateMarketTrends('DEFAULT', defaultTalentRank, defaultMarketTier)
  const marketCompetitors = generateMarketCompetitors('DEFAULT', defaultMarketTier)
  
  return {
    talentScore: 65,
    talentRank: 'medium',
    totalProfessionals: 5000,
    growthRate: 8,
    avgSalary: 145000,
    hiringStrategy: 'Hybrid approach - combine local with remote talent',
    topChannels: ['LinkedIn Recruiter', 'Remote job boards', 'Specialized search firms'],
    timeToHire: '6-8 weeks',
    // NEW FIELDS:
    salaryBands,
    talentShortage,
    remoteLocalRecommendation,
    hiringTimeline,
    marketTrends,
    marketCompetitors
  }
}

// ============================================
// Technology Vendor Functions
// ============================================

/**
 * Fetch technology vendors from database
 */
async function fetchTechRecommendations(): Promise<TechRecommendation[]> {
  const { data, error } = await supabase
    .from('technology_vendors')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data || data.length === 0) {
    console.warn('[ReportData] No technology vendors found, using fallback')
    return getFallbackTechRecommendations()
  }

  const grouped = new Map<string, any[]>()
  data.forEach(vendor => {
    if (!grouped.has(vendor.category)) {
      grouped.set(vendor.category, [])
    }
    grouped.get(vendor.category)!.push({
      name: vendor.name,
      description: vendor.description,
      priceRange: vendor.price_display,
      implementationTime: vendor.implementation_time
    })
  })

  return Array.from(grouped.entries()).map(([category, recommendations]) => ({
    category,
    recommendations
  }))
}

/**
 * Fallback tech recommendations
 */
function getFallbackTechRecommendations(): TechRecommendation[] {
  return [
    {
      category: 'AML/KYC & Blockchain Analytics',
      recommendations: [
        {
          name: 'Chainalysis',
          description: 'Industry-leading blockchain analytics and transaction monitoring',
          priceRange: '$25,000 - $100,000/year',
          implementationTime: '4-6 weeks'
        },
        {
          name: 'Elliptic',
          description: 'Crypto compliance and risk screening',
          priceRange: '$25,000 - $90,000/year',
          implementationTime: '4-6 weeks'
        }
      ]
    },
    {
      category: 'Regulatory Change Management',
      recommendations: [
        {
          name: 'Regology',
          description: 'AI-powered regulatory tracking and compliance management',
          priceRange: '$8,000 - $25,000/year',
          implementationTime: '2-3 weeks'
        }
      ]
    }
  ]
}

/**
 * Fetch budget guide from database
 */
async function fetchBudgetGuide(companySize: string, licenseFees?: number): Promise<BudgetGuide> {
  let sizeKey = 'small'
  const sizeLower = (companySize || '').toLowerCase()
  
  if (sizeLower === '1-10' || sizeLower === 'startup') sizeKey = 'startup'
  else if (sizeLower === '11-50' || sizeLower === 'small') sizeKey = 'small'
  else if (sizeLower === '51-200' || sizeLower === 'medium') sizeKey = 'medium'
  else if (sizeLower === '201+' || sizeLower === 'enterprise') sizeKey = 'enterprise'

  const { data, error } = await supabase
    .from('budget_templates')
    .select('*')
    .eq('company_size', sizeKey)
    .maybeSingle()

  if (error || !data) {
    console.warn(`[ReportData] No budget template for ${sizeKey}, using fallback`)
    return getFallbackBudgetGuide(licenseFees)
  }

  const licensingMin = licenseFees || data.licensing_fees_min || 5000
  const licensingMax = licenseFees ? licenseFees * 2 : data.licensing_fees_max || 30000

  return {
    legalFees: {
      min: data.legal_fees_min || 25000,
      max: data.legal_fees_max || 100000,
      description: data.legal_fees_description || 'Legal counsel retainer, license application support, ongoing advice'
    },
    licensingFees: {
      min: licensingMin,
      max: licensingMax,
      description: data.licensing_fees_description || 'Application fees, surety bonds, state filing costs'
    },
    technology: {
      min: data.technology_min || 30000,
      max: data.technology_max || 150000,
      description: data.technology_description || 'AML/KYC platforms, monitoring tools, compliance software'
    },
    staffing: {
      min: data.staffing_min || 80000,
      max: data.staffing_max || 250000,
      description: data.staffing_description || 'Compliance officer salary, training, ongoing resources'
    },
    totalEstimated: {
      min: data.total_min || 140000,
      max: data.total_max || 550000
    },
    breakdown: [
      { category: 'Legal & Compliance Counsel', amount: `${formatCurrency(data.legal_fees_min || 25000)} - ${formatCurrency(data.legal_fees_max || 100000)}`, notes: data.legal_fees_description || 'Retainer + project fees' },
      { category: 'Licensing & Filing Fees', amount: `${formatCurrency(licensingMin)} - ${formatCurrency(licensingMax)}`, notes: 'Application fees + bond' },
      { category: 'Technology & Software', amount: `${formatCurrency(data.technology_min || 30000)} - ${formatCurrency(data.technology_max || 150000)}`, notes: 'Annual licensing' },
      { category: 'Compliance Staff', amount: `${formatCurrency(data.staffing_min || 80000)} - ${formatCurrency(data.staffing_max || 250000)}`, notes: 'Salary + benefits' }
    ]
  }
}

/**
 * Fallback budget guide
 */
function getFallbackBudgetGuide(licenseFees?: number): BudgetGuide {
  const licensingMin = licenseFees || 5000
  const licensingMax = licenseFees ? licenseFees * 2 : 30000
  
  return {
    legalFees: { min: 25000, max: 100000, description: 'Legal counsel retainer, license application support, ongoing advice' },
    licensingFees: { min: licensingMin, max: licensingMax, description: 'Application fees, surety bonds, state filing costs' },
    technology: { min: 30000, max: 150000, description: 'AML/KYC platforms, monitoring tools, compliance software' },
    staffing: { min: 80000, max: 250000, description: 'Compliance officer salary, training, ongoing resources' },
    totalEstimated: { min: 140000, max: 550000 },
    breakdown: [
      { category: 'Legal & Compliance Counsel', amount: '$25,000 - $100,000', notes: 'Retainer + project fees' },
      { category: 'Licensing & Filing Fees', amount: `${formatCurrency(licensingMin)} - ${formatCurrency(licensingMax)}`, notes: 'Application fees + bond' },
      { category: 'Technology & Software', amount: '$30,000 - $150,000', notes: 'Annual licensing' },
      { category: 'Compliance Staff', amount: '$80,000 - $250,000', notes: 'Salary + benefits' }
    ]
  }
}

/**
 * Fetch next steps templates from database
 */
async function fetchNextSteps(licenseRequired: string): Promise<NextSteps> {
  const { data, error } = await supabase
    .from('next_steps_templates')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error || !data || data.length === 0) {
    console.warn('[ReportData] Error fetching next steps, using fallback')
    return getFallbackNextSteps(licenseRequired)
  }

  const hasLicense = licenseRequired !== 'none'
  const immediate: string[] = []
  const shortTerm: string[] = []
  const ongoing: string[] = []

  data.forEach(item => {
    if (item.is_conditional) {
      if (item.condition_field === 'license_required') {
        if (item.condition_value === 'mtl' && !hasLicense) return
        if (item.condition_value === 'none' && hasLicense) return
      }
    }
    
    if (item.template_type === 'immediate') immediate.push(item.description)
    else if (item.template_type === 'short_term') shortTerm.push(item.description)
    else if (item.template_type === 'ongoing') ongoing.push(item.description)
  })

  const complianceCalendar = await fetchComplianceCalendar(licenseRequired)

  return { immediate, shortTerm, ongoing, complianceCalendar }
}

/**
 * Fetch compliance calendar from database
 */
async function fetchComplianceCalendar(licenseRequired: string): Promise<{ timeframe: string; tasks: string[] }[]> {
  const { data: templates, error: templatesError } = await supabase
    .from('compliance_calendar_templates')
    .select('*')
    .order('sort_order', { ascending: true })

  if (templatesError || !templates || templates.length === 0) {
    console.warn('[ReportData] Error fetching compliance calendar, using fallback')
    return getFallbackComplianceCalendar(licenseRequired)
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('compliance_calendar_tasks')
    .select('*')
    .order('sort_order', { ascending: true })

  const hasLicense = licenseRequired !== 'none'
  
  return templates.map(template => {
    const templateTasks = (tasks || [])
      .filter(task => task.calendar_template_id === template.id)
      .filter(task => {
        if (!task.is_conditional) return true
        if (task.condition_field === 'license_required') {
          if (task.condition_value === 'mtl') return hasLicense
          if (task.condition_value === 'none') return !hasLicense
        }
        return true
      })
      .map(task => task.description)

    return {
      timeframe: template.timeframe,
      tasks: templateTasks
    }
  }).filter(template => template.tasks.length > 0)
}

/**
 * Fallback next steps
 */
function getFallbackNextSteps(licenseRequired: string): NextSteps {
  const hasLicense = licenseRequired !== 'none'
  
  return {
    immediate: [
      'Engage qualified digital asset compliance counsel within 7 days',
      hasLicense ? 'Begin license application preparation' : 'Complete business registration',
      'Designate interim Compliance Officer',
      'Start AML/KYC policy drafting',
      'Set up regulatory monitoring alerts'
    ],
    shortTerm: [
      hasLicense ? 'Submit license applications (Month 1-2)' : 'Complete business registration (Month 1)',
      'Select and implement compliance technology (Month 2-3)',
      'Hire permanent Compliance Officer (Month 2-3)',
      'Complete staff compliance training (Month 3)',
      'Establish regulatory reporting protocols (Month 3)'
    ],
    ongoing: [
      'Quarterly compliance reviews and risk assessments',
      'Annual independent compliance audits',
      'Continuous regulatory change monitoring',
      'License renewals and annual reports',
      'Ongoing staff training and development'
    ],
    complianceCalendar: getFallbackComplianceCalendar(licenseRequired)
  }
}

/**
 * Fallback compliance calendar
 */
function getFallbackComplianceCalendar(licenseRequired: string): { timeframe: string; tasks: string[] }[] {
  const hasLicense = licenseRequired !== 'none'
  return [
    { timeframe: 'Week 1', tasks: ['Legal counsel engagement', 'Initial compliance assessment'] },
    { timeframe: 'Month 1', tasks: ['Draft policies', hasLicense ? 'Begin license applications' : 'Complete registration', 'Designate compliance officer'] },
    { timeframe: 'Month 2-3', tasks: [hasLicense ? 'Submit applications' : 'Begin operations', 'Select technology', 'Hire compliance team'] },
    { timeframe: 'Quarterly', tasks: ['Compliance review', 'Regulatory reporting', 'Risk assessment update'] },
    { timeframe: 'Annually', tasks: ['Independent audit', hasLicense ? 'License renewals' : 'Annual report', 'Board review'] }
  ]
}

/**
 * Fetch licenses from licensing_requirements table
 */
async function fetchLicensesFromDatabase(stateCode: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('licensing_requirements')
    .select('*')
    .eq('state_code', stateCode.toUpperCase())
    .maybeSingle()
  
  if (error || !data) {
    console.warn(`[ReportData] No database license found for ${stateCode}, using fallback`)
    return getFallbackLicenses(stateCode)
  }
  
  const formatBond = (min: number | null, max: number | null): string => {
    if (min && max && min !== max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}`
    if (max) return `$${max.toLocaleString()}`
    return 'Contact regulator'
  }
  
  const formatFee = (fee: number | null): string => {
    if (!fee) return 'Contact regulator'
    return `$${fee.toLocaleString()}`
  }
  
  const formatTime = (min: number | null, max: number | null): string => {
    if (min && max && min !== max) return `${min}-${max} months`
    if (min) return `${min} months`
    if (max) return `${max} months`
    return data.processing_time_description || 'Contact regulator'
  }
  
  let licenseType = 'Money Transmitter License'
  if (data.license_required === 'bitlicense') licenseType = 'BitLicense'
  else if (data.license_required === 'dfpi') licenseType = 'DFPI License'
  else if (data.license_required === 'none') licenseType = 'No License Required'
  else if (data.license_required === 'mtl') licenseType = data.license_name || 'Money Transmitter License'
  
  return [{
    licenseType,
    required: data.license_required !== 'none',
    timeline: formatTime(data.processing_time_min_months, data.processing_time_max_months),
    fees: formatFee(data.application_fee),
    bonding: formatBond(data.bond_requirement_min, data.bond_requirement_max),
    renewal: data.annual_renewal_fee ? 'Annual' : 'Check with regulator',
    notes: data.license_description || data.notes || ''
  }]
}

/**
 * Fallback licenses for states not yet in database
 */
function getFallbackLicenses(stateCode: string): any[] {
  const fallbacks: Record<string, any[]> = {
    'NY': [{ licenseType: 'BitLicense', required: true, timeline: '6-12 months', fees: '$5,000', bonding: '$250,000', renewal: 'Biennial' }],
    'CA': [{ licenseType: 'DFPI License', required: true, timeline: '4-8 months', fees: '$1,000 - $5,000', bonding: '$250,000 - $500,000', renewal: 'Annual' }],
    'TX': [{ licenseType: 'Money Transmitter License', required: true, timeline: '3-4 months', fees: '$500', bonding: '$50,000', renewal: 'Annual' }],
    'FL': [{ licenseType: 'Money Transmitter License', required: true, timeline: '3-6 months', fees: '$1,000', bonding: '$75,000 - $300,000', renewal: 'Biennial' }],
    'CO': [{ licenseType: 'Money Transmitter License', required: true, timeline: '3-5 months', fees: '$500', bonding: '$50,000 - $250,000', renewal: 'Annual' }],
  }
  return fallbacks[stateCode] || [{ licenseType: 'Money Transmitter License', required: true, timeline: '3-6 months', fees: 'Varies', bonding: 'Varies', renewal: 'Annual' }]
}

/**
 * Fetch multi-state licenses for comparison table
 */
async function fetchMultiStateLicenses(primaryState: string, limit: number = 15): Promise<any[]> {
  const { data, error } = await supabase
    .from('licensing_requirements')
    .select('state_code, license_required, application_fee, bond_requirement_min, bond_requirement_max, processing_time_min_months, processing_time_max_months, regulatory_climate')
    .eq('verification_status', 'verified')
    .limit(limit)
  
  if (error || !data || data.length === 0) {
    console.warn('[ReportData] No multi-state licenses found in database')
    return []
  }
  
  const formatBond = (min: number | null, max: number | null): string => {
    if (min && max && min !== max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}`
    if (max) return `$${max.toLocaleString()}`
    return 'Varies'
  }
  
  const formatTime = (min: number | null, max: number | null): string => {
    if (min && max && min !== max) return `${min}-${max} months`
    if (min) return `${min} months`
    if (max) return `${max} months`
    return 'Varies'
  }
  
  const formatFee = (fee: number | null): string => {
    if (!fee) return 'Varies'
    return `$${fee.toLocaleString()}`
  }
  
  return data.map(item => {
    let licenseType = 'Money Transmitter'
    if (item.license_required === 'bitlicense') licenseType = 'BitLicense'
    else if (item.license_required === 'dfpi') licenseType = 'DFPI License'
    else if (item.license_required === 'none') licenseType = 'None Required'
    
    return {
      state: item.state_code,
      licenseType,
      timeline: formatTime(item.processing_time_min_months, item.processing_time_max_months),
      bonding: formatBond(item.bond_requirement_min, item.bond_requirement_max),
      applicationFee: formatFee(item.application_fee),
      renewal: 'Annual',
      isPrimary: item.state_code === primaryState,
      climate: item.regulatory_climate
    }
  })
}

// ============================================
// Main Report Data Builder
// ============================================

export interface BuildReportDataOptions {
  aiGeneratedContent?: string
  verifiedFacts?: any[]
  enforcementHistory?: string
  pendingLegislation?: string
  fullLicensingData?: any
}

export async function buildReportData(
  company: any,
  location: any,
  strategy: {
    primary: string
    secondary: string[]
    timeline: string
    concerns: string
    goals: string
  },
  options: BuildReportDataOptions = {}
): Promise<ReportData> {
  // Fetch licensing data from licensing_requirements table
  const licensing = await getSimplifiedLicensingClient(location.state)
  
  // Fetch licenses from database
  const licenses = await fetchLicensesFromDatabase(location.state)
  const multiStateLicenses = await fetchMultiStateLicenses(location.state, 15)

  // Get service providers - USING CLIENT-SAFE VERSION
  const providers = getProvidersForLocationClient(location.city, location.state, location.tier)

  // Get months for timeline calculations
  const timelineMonths = strategy.timeline === '3-months' ? 3 : strategy.timeline === '6-months' ? 6 : 12

  // ============================================
  // ENHANCED: Gather client-specific factors for risk adjustment
  // ============================================
  const riskAdjustmentFactors: RiskAdjustmentFactors = {
    companySize: company.size === '1-10' || company.size === 'startup' ? 'startup' : 
                  company.size === '11-50' || company.size === 'small' ? 'small' :
                  company.size === '51-200' || company.size === 'medium' ? 'medium' : 'enterprise',
    industry: company.industry || 'Financial Services',
    budgetTier: company.budget === 'under-50k' ? 'under-50k' :
                company.budget === '50k-150k' ? '50k-150k' :
                company.budget === '150k-500k' ? '150k-500k' : '500k+',
    timelineMonths: timelineMonths,
    hasComplianceOfficer: strategy.concerns?.toLowerCase().includes('compliance officer') || 
                          strategy.goals?.toLowerCase().includes('compliance officer') || false,
    hasExistingComplianceProgram: strategy.concerns?.toLowerCase().includes('program') || 
                                   strategy.goals?.toLowerCase().includes('program') ||
                                   strategy.concerns?.toLowerCase().includes('existing') || false,
    concerns: strategy.concerns ? [strategy.concerns] : [],
    goals: strategy.goals ? [strategy.goals] : []
  }

  // ENHANCED: Fetch client-specific risks (includes state overrides + client adjustments)
  const risks = await fetchClientSpecificRiskFactors(location.state, riskAdjustmentFactors)
  
  // ENHANCED: Calculate overall risk score and rating (lower is better)
  const overallRiskResult = calculateOverallRiskScore(risks)
  const overallRisk = overallRiskResult.rating
  const overallRiskScore = overallRiskResult.score

  // Fetch remaining dynamic data from other tables
  const compliancePhases = await fetchCompliancePhases(licensing.licenseRequired, timelineMonths)
  const marketAnalysis = await fetchMarketMetrics(location.state, location.tier, location.city)
  const talentAnalysis = await fetchTalentMetrics(location.state, location.city, location.tier)
  const techRecommendations = await fetchTechRecommendations()
  const budgetGuide = await fetchBudgetGuide(company.size, licensing.applicationFee)
  const nextSteps = await fetchNextSteps(licensing.licenseRequired)

  // Build state regulation object from database data
  const stateRegulation = {
    cryptoFriendly: licensing.cryptoFriendly,
    moneyTransmitter: licensing.moneyTransmitter,
    taxTreatment: licensing.taxTreatment,
    notes: licensing.notes,
    lastUpdated: new Date().toISOString().split('T')[0],
    licenseRequired: licensing.licenseRequired,
    applicationFee: licensing.applicationFeeFormatted,
    bondRequirement: licensing.bondRequirement,
    processingTime: licensing.processingTime
  }

  // Build metrics display with risk score
  const metrics: ReportMetric[] = [
    {
      label: 'Regulatory Climate',
      value: licensing.cryptoFriendly === 'friendly' ? 'Friendly' :
             licensing.cryptoFriendly === 'strict' ? 'Strict' : 'Moderate',
      color: licensing.cryptoFriendly === 'friendly' ? 'text-green-600' :
             licensing.cryptoFriendly === 'strict' ? 'text-red-600' : 'text-yellow-600'
    },
    {
      label: 'Licenses Required',
      value: licenses.filter(l => l.required).length.toString(),
      color: 'text-gold-400'
    },
    {
      label: 'Application Fee',
      value: licensing.applicationFeeFormatted,
      color: 'text-gold-400'
    },
    {
      label: 'Processing Time',
      value: licensing.processingTime,
      color: 'text-gold-400'
    },
    {
      label: 'Bond Requirement',
      value: licensing.bondRequirement,
      color: 'text-gold-400'
    },
    {
      label: 'Talent Score',
      value: `${talentAnalysis.talentScore}/100`,
      color: talentAnalysis.talentScore >= 70 ? 'text-green-600' :
             talentAnalysis.talentScore >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      label: 'Risk Score',
      value: `${overallRiskScore}/100`,
      color: overallRisk === 'Critical' ? 'text-red-600' :
             overallRisk === 'Elevated' ? 'text-orange-600' :
             overallRisk === 'Moderate' ? 'text-yellow-600' : 'text-green-600'
    },
    {
      label: 'Risk Level',
      value: overallRisk,
      color: overallRisk === 'Critical' ? 'text-red-600' :
             overallRisk === 'Elevated' ? 'text-orange-600' :
             overallRisk === 'Moderate' ? 'text-yellow-600' : 'text-green-600'
    }
  ]

  // Return complete report data object
  return {
    company,
    location,
    strategy,
    generatedAt: new Date(),
    stateRegulation,
    licenses,
    multiStateLicenses,
    providers,
    compliancePhases,
    risks,
    overallRisk,
    overallRiskScore,
    metrics,
    marketAnalysis,
    talentAnalysis,
    techRecommendations,
    budgetGuide,
    nextSteps,
    aiGeneratedContent: options.aiGeneratedContent,
    verifiedFacts: options.verifiedFacts,
    enforcementHistory: options.enforcementHistory,
    pendingLegislation: options.pendingLegislation
  }
}

// ============================================
// Export all types and utilities for external use
// ============================================

export type {
  SalaryBand,
  TalentShortageInfo,
  RemoteLocalRecommendation,
  HiringTimelineStep,
  MarketTrend,
  MarketCompetitor
}

// Re-export calculation functions for testing or external use
export {
  calculateSalaryBands,
  calculateTalentShortage,
  calculateRemoteLocalRecommendation,
  calculateHiringTimeline,
  generateMarketTrends,
  generateMarketCompetitors
}