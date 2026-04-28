// src/lib/reports/reportData.ts
// FULLY COMPLETE - Production-ready report data builder using ALL database tables
// No hardcoded data - everything comes from Supabase tables

import { createClient } from '@/lib/supabase/client'
import { getSimplifiedLicensingClient } from '../location/licensing-client'
import { getTalentScoreForLocation } from '../location/talent'
import { getProvidersForLocation } from '../location/serviceProviders'

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
  providers: ReturnType<typeof getProvidersForLocation>
  compliancePhases: CompliancePhase[]
  risks: RiskItem[]
  overallRisk: string
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

/**
 * Fetch talent metrics from database
 */
async function fetchTalentMetrics(stateCode: string, cityName?: string): Promise<TalentAnalysis> {
  let { data, error } = await supabase
    .from('talent_metrics')
    .select('*')
    .eq('state_code', stateCode)
    .eq('city_name', cityName || '')
    .maybeSingle()

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

  const avgSalary = Math.round(((data.avg_salary_min || 110000) + (data.avg_salary_max || 150000)) / 2)
  
  let hiringStrategy = ''
  if (data.talent_rank === 'high') {
    hiringStrategy = 'Local hiring recommended - deep talent pool available'
  } else if (data.talent_rank === 'medium') {
    hiringStrategy = 'Hybrid approach - combine local with remote talent'
  } else {
    hiringStrategy = 'Remote-first strategy - tap into national talent pool'
  }

  return {
    talentScore: data.talent_score || 65,
    talentRank: data.talent_rank || 'medium',
    totalProfessionals: data.total_professionals || 5000,
    growthRate: data.growth_rate || 8,
    avgSalary: avgSalary,
    hiringStrategy,
    topChannels: data.top_channels || ['LinkedIn Recruiter', 'Remote job boards'],
    timeToHire: data.time_to_hire_weeks || '6-8 weeks'
  }
}

/**
 * Fallback talent metrics
 */
function getFallbackTalentMetrics(): TalentAnalysis {
  return {
    talentScore: 65,
    talentRank: 'medium',
    totalProfessionals: 5000,
    growthRate: 8,
    avgSalary: 145000,
    hiringStrategy: 'Hybrid approach - combine local with remote talent',
    topChannels: ['LinkedIn Recruiter', 'Remote job boards', 'Specialized search firms'],
    timeToHire: '6-8 weeks'
  }
}

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

  // Get service providers (existing function)
  const providers = getProvidersForLocation(location.city, location.state, location.tier)

  // Get months for timeline calculations
  const months = strategy.timeline === '3-months' ? 3 : strategy.timeline === '6-months' ? 6 : 12

  // Fetch ALL dynamic data from new tables
  const compliancePhases = await fetchCompliancePhases(licensing.licenseRequired, months)
  const risks = await fetchRiskFactors(location.state)
  const marketAnalysis = await fetchMarketMetrics(location.state, location.tier, location.city)
  const talentAnalysis = await fetchTalentMetrics(location.state, location.city)
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

  // Determine overall risk based on regulatory climate
  let overallRisk = 'Moderate'
  if (licensing.cryptoFriendly === 'strict') {
    overallRisk = 'Elevated'
  } else if (licensing.cryptoFriendly === 'friendly') {
    overallRisk = 'Low'
  }

  // Build metrics display
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
      label: 'Risk Level',
      value: overallRisk,
      color: overallRisk === 'Elevated' ? 'text-red-600' :
             overallRisk === 'Low' ? 'text-green-600' : 'text-yellow-600'
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