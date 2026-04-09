// src/lib/reports/reportData.ts
// Updated to use new licensing service

import { getSimplifiedLicensing } from '../location/licensing'
import { getTalentScoreForLocation } from '../location/talent'
import { LocationAnalysis } from '../location/analyzer'
import { getProvidersForLocation } from '../location/serviceProviders'
import { getLicensesForState, getAllStateLicenses } from '../location/licensingData'

export interface ReportData {
  company: any
  location: LocationAnalysis
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

// Helper function to format primary focus
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

// Helper function to format secondary focus
export function formatSecondaryFocus(focus: string): string {
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

// Helper function to format timeline
export function formatTimeline(timeline: string): string {
  const timelines: Record<string, string> = {
    '3-months': '3 Months (Immediate)',
    '6-months': '6 Months (Standard)',
    '12-months': '12 Months (Strategic)'
  }
  return timelines[timeline] || timeline
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Async version of buildReportData
export async function buildReportData(
  company: any,
  location: LocationAnalysis,
  strategy: {
    primary: string
    secondary: string[]
    timeline: string
    concerns: string
    goals: string
  }
): Promise<ReportData> {
  // Use the new licensing service instead of getStateRegulation
  const licensing = await getSimplifiedLicensing(location.state)
  
  // Transform licensing data to match the expected stateRegulation format
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
  
  // Use the existing licensing data for licenses
  const licenses = getLicensesForState(location.state)
  const multiStateLicenses = getAllStateLicenses(15) // Expand to 15 states
  
  // Use the service providers data
  const providers = getProvidersForLocation(location.city, location.state, location.tier)
  
  // Use your existing talent data
  const talentScore = getTalentScoreForLocation(location.city, location.state)
  
  // Get current year for dynamic dates
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const currentQuarter = Math.floor(currentMonth / 3) + 1
  
  // Determine timeline based on strategy
  const months = strategy.timeline === '3-months' ? 3 : strategy.timeline === '6-months' ? 6 : 12
  
  // Compliance phases based on timeline
  const compliancePhases: CompliancePhase[] = [
    {
      phase: 'Foundation',
      timeline: `Days 1-30`,
      color: 'bg-red-100 border-red-200',
      textColor: 'text-red-800',
      items: [
        'Engage qualified compliance counsel',
        'Submit initial license applications',
        'Designate Chief Compliance Officer',
        'Draft compliance policies',
        'Begin AML/KYC program development'
      ]
    },
    {
      phase: 'Licensing & Development',
      timeline: `Days 31-${Math.min(60, months * 30)}`,
      color: 'bg-yellow-100 border-yellow-200',
      textColor: 'text-yellow-800',
      items: [
        'Complete remaining license applications',
        'Finalize compliance policies',
        'Select compliance technology',
        'Implement transaction monitoring',
        'Establish reporting protocols'
      ]
    },
    {
      phase: 'Implementation',
      timeline: `Days ${Math.min(61, months * 30 + 1)}-${Math.min(90, months * 30)}`,
      color: 'bg-green-100 border-green-200',
      textColor: 'text-green-800',
      items: [
        'Complete license processing',
        'Full compliance system implementation',
        'Staff training completion',
        'Initial regulatory reporting',
        'Compliance audit preparation'
      ]
    },
    {
      phase: 'Optimization',
      timeline: `Days 91-${months * 30}`,
      color: 'bg-blue-100 border-blue-200',
      textColor: 'text-blue-800',
      items: [
        'Quarterly compliance reviews',
        'Regulatory relationship management',
        'Continuous improvement',
        'Expand to additional jurisdictions',
        'Ongoing monitoring & reporting'
      ]
    }
  ]
  
  // Risk items
  const risks: RiskItem[] = [
    {
      category: 'Regulatory Change',
      likelihood: location.regulatoryClimate === 'strict' ? 'High' : 'Medium',
      impact: 'Critical',
      mitigation: 'Continuous monitoring, legal counsel retainer'
    },
    {
      category: 'License Delays',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'Early application, expedited options'
    },
    {
      category: 'Enforcement Action',
      likelihood: location.regulatoryClimate === 'strict' ? 'Medium' : 'Low',
      impact: 'Critical',
      mitigation: 'Proactive compliance, documentation'
    },
    {
      category: 'Examination Findings',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'Regular audits, third-party reviews'
    },
    {
      category: 'Compliance Gaps',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'Quarterly assessments, staff training'
    },
    {
      category: 'Technology Failure',
      likelihood: 'Low',
      impact: 'High',
      mitigation: 'Redundant systems, regular testing'
    },
    {
      category: 'Data Privacy Breach',
      likelihood: 'Medium',
      impact: 'Critical',
      mitigation: 'Robust cybersecurity, insurance'
    }
  ]
  
  // Overall risk
  let overallRisk = 'Moderate'
  if (location.regulatoryClimate === 'strict') {
    overallRisk = 'Elevated'
  } else if (location.regulatoryClimate === 'friendly') {
    overallRisk = 'Low'
  }
  
  // Metrics
  const metrics: ReportMetric[] = [
    {
      label: 'Regulatory Climate',
      value: location.regulatoryClimate === 'friendly' ? 'Friendly' : 
             location.regulatoryClimate === 'strict' ? 'Strict' : 'Moderate',
      color: location.regulatoryClimate === 'friendly' ? 'text-green-600' :
             location.regulatoryClimate === 'strict' ? 'text-red-600' : 'text-yellow-600'
    },
    {
      label: 'Licenses Required',
      value: licenses.length.toString(),
      color: 'text-gold-400'
    },
    {
      label: 'Risk Level',
      value: overallRisk,
      color: overallRisk === 'Elevated' ? 'text-red-600' :
             overallRisk === 'Low' ? 'text-green-600' : 'text-yellow-600'
    },
    {
      label: 'Timeline',
      value: formatTimeline(strategy.timeline),
      color: 'text-gold-400'
    },
    {
      label: 'Talent Density',
      value: talentScore.rank === 'high' ? 'High' :
             talentScore.rank === 'medium' ? 'Moderate' : 'Developing',
      color: 'text-gold-400'
    },
    {
      label: 'Market Tier',
      value: location.tier === 'major' ? 'Major Market' :
             location.tier === 'suburban' ? 'Suburban' : 'Rural',
      color: 'text-gold-400'
    },
    {
      label: 'Application Fee',
      value: licensing.applicationFeeFormatted,
      color: 'text-gold-400'
    }
  ]
  
  // Market Analysis
  const marketAnalysis: MarketAnalysis = {
    tier: location.tier === 'major' ? 'Major Market' : 
          location.tier === 'suburban' ? 'Suburban Market' : 'Rural Market',
    description: location.tier === 'major' 
      ? `Major market with robust regulatory infrastructure and high compliance talent density.`
      : location.tier === 'suburban'
      ? `Suburban market with access to ${location.nearestRegulatoryHub || 'nearby regulatory hub'}.`
      : `Rural market requiring remote compliance resources and virtual engagement.`,
    growthRate: location.tier === 'major' ? 15 : location.tier === 'suburban' ? 12 : 8,
    competitorDensity: location.tier === 'major' ? 'High' : location.tier === 'suburban' ? 'Medium' : 'Low',
    opportunityScore: location.tier === 'major' ? 85 : location.tier === 'suburban' ? 70 : 55,
    keyIndustries: ['Financial Services', 'Technology', 'Real Estate']
  }
  
  // Talent Analysis
  const talentAnalysis: TalentAnalysis = {
    talentScore: talentScore.score,
    talentRank: talentScore.rank,
    totalProfessionals: talentScore.details.professionals,
    growthRate: talentScore.details.growthRate,
    avgSalary: talentScore.rank === 'high' ? 185000 : talentScore.rank === 'medium' ? 145000 : 110000,
    hiringStrategy: talentScore.rank === 'high'
      ? 'Local hiring recommended - deep talent pool available'
      : talentScore.rank === 'medium'
      ? 'Hybrid approach - combine local with remote talent'
      : 'Remote-first strategy - tap into national talent pool',
    topChannels: talentScore.rank === 'high'
      ? ['Local compliance associations', 'University law programs', 'Industry conferences']
      : ['LinkedIn Recruiter', 'Remote compliance job boards', 'Specialized search firms'],
    timeToHire: talentScore.rank === 'high' ? '4-6 weeks' : talentScore.rank === 'medium' ? '6-8 weeks' : '8-10 weeks'
  }
  
  // Technology Recommendations
  const techRecommendations: TechRecommendation[] = [
    {
      category: 'AML/KYC Solutions',
      recommendations: [
        {
          name: 'Chainalysis',
          description: 'Blockchain analytics and transaction monitoring',
          priceRange: '$25,000 - $100,000/year',
          implementationTime: '4-6 weeks'
        },
        {
          name: 'ComplyAdvantage',
          description: 'AML screening and sanctions monitoring',
          priceRange: '$20,000 - $75,000/year',
          implementationTime: '3-5 weeks'
        },
        {
          name: 'Elliptic',
          description: 'Blockchain analytics and compliance screening',
          priceRange: '$25,000 - $90,000/year',
          implementationTime: '4-6 weeks'
        }
      ]
    },
    {
      category: 'Identity Verification',
      recommendations: [
        {
          name: 'Trulioo',
          description: 'Global identity verification and KYC',
          priceRange: '$15,000 - $50,000/year',
          implementationTime: '2-4 weeks'
        },
        {
          name: 'Jumio',
          description: 'AI-powered identity verification',
          priceRange: '$15,000 - $45,000/year',
          implementationTime: '2-4 weeks'
        }
      ]
    },
    {
      category: 'Regulatory Monitoring',
      recommendations: [
        {
          name: 'ComplySci',
          description: 'Regulatory change management',
          priceRange: '$10,000 - $30,000/year',
          implementationTime: '2-3 weeks'
        },
        {
          name: 'Regology',
          description: 'AI-powered regulatory tracking',
          priceRange: '$8,000 - $25,000/year',
          implementationTime: '2-3 weeks'
        }
      ]
    }
  ]
  
  // Budget Guide
  const budgetGuide: BudgetGuide = {
    legalFees: {
      min: 25000,
      max: 100000,
      description: 'Legal counsel retainer, license application support, ongoing advice'
    },
    licensingFees: {
      min: 5000,
      max: 50000,
      description: 'Application fees, surety bonds, state filing costs'
    },
    technology: {
      min: 30000,
      max: 150000,
      description: 'AML/KYC platforms, monitoring tools, compliance software'
    },
    staffing: {
      min: 80000,
      max: 250000,
      description: 'Compliance officer salary, training, ongoing resources'
    },
    totalEstimated: {
      min: 140000,
      max: 550000
    },
    breakdown: [
      { category: 'Legal & Compliance Counsel', amount: '$25,000 - $100,000', notes: 'Retainer + project fees' },
      { category: 'Licensing & Filing Fees', amount: '$5,000 - $50,000', notes: 'Per state requirements' },
      { category: 'Technology & Software', amount: '$30,000 - $150,000', notes: 'Annual licensing' },
      { category: 'Compliance Staff', amount: '$80,000 - $250,000', notes: 'Salary + benefits' }
    ]
  }
  
  // Next Steps
  const nextSteps: NextSteps = {
    immediate: [
      'Engage qualified compliance counsel within 7 days',
      'Begin license application preparation',
      'Designate interim Compliance Officer',
      'Start AML/KYC policy drafting',
      'Set up regulatory monitoring alerts'
    ],
    shortTerm: [
      'Submit license applications (Month 1-2)',
      'Select and implement compliance technology (Month 2-3)',
      'Hire permanent Compliance Officer (Month 2-3)',
      'Complete staff compliance training (Month 3)',
      'Establish reporting protocols (Month 3)'
    ],
    ongoing: [
      'Quarterly compliance reviews',
      'Annual independent audits',
      'Continuous regulatory monitoring',
      'License renewals and updates',
      'Staff training and development'
    ],
    complianceCalendar: [
      {
        timeframe: 'Week 1',
        tasks: ['Legal counsel engagement', 'Initial license assessment']
      },
      {
        timeframe: 'Month 1',
        tasks: ['Draft policies', 'Begin applications', 'Designate compliance officer']
      },
      {
        timeframe: 'Month 2-3',
        tasks: ['Submit applications', 'Select technology', 'Hire team']
      },
      {
        timeframe: 'Quarterly',
        tasks: ['Compliance review', 'Regulatory reporting', 'Risk assessment update']
      },
      {
        timeframe: 'Annually',
        tasks: ['Independent audit', 'License renewals', 'Board review']
      }
    ]
  }
  
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
    nextSteps
  }
}