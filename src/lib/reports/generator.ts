// src/lib/reports/generator.ts
import { CompanyFormData } from './validation'
import { LocationAnalysis } from '../location/analyzer'
import { StrategyFormData } from './validation'
import { getStateRegulation, getComplianceChecklist } from '../location/regulations'
import { getTalentScoreForLocation, getTalentRecommendations } from '../location/talent'
import { GeneratedReport } from './types'

export interface GenerationResult {
  executive_summary: string
  location_analysis: any
  regulatory_analysis: any
  talent_analysis: any
  licensing_matrix: any
  compliance_roadmap: any
  regulatory_contacts: any
  risk_assessment: any
}

export async function generateReport(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData,
  userId: string
): Promise<GenerationResult> {
  console.log('Starting regulatory report generation for:', company.name)
  
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const regulation = getStateRegulation(location.state)
  const talentScore = getTalentScoreForLocation(location.city, location.state)
  const talentRecs = getTalentRecommendations(location.city, location.state, location.tier)
  const complianceChecklist = getComplianceChecklist(location.state)
  
  // Generate executive summary
  const executive_summary = generateExecutiveSummary(company, location, strategy, regulation)
  
  // Generate location analysis
  const location_analysis = generateLocationAnalysis(location, talentScore)
  
  // Generate regulatory analysis
  const regulatory_analysis = generateRegulatoryAnalysis(location, regulation, complianceChecklist)
  
  // Generate talent analysis
  const talent_analysis = generateTalentAnalysis(location, talentScore, talentRecs)
  
  // Generate licensing matrix
  const licensing_matrix = generateLicensingMatrix(location, regulation)
  
  // Generate compliance roadmap
  const compliance_roadmap = generateComplianceRoadmap(strategy)
  
  // Generate regulatory contacts
  const regulatory_contacts = generateRegulatoryContacts(location)
  
  // Generate risk assessment
  const risk_assessment = generateRiskAssessment(location, strategy)
  
  return {
    executive_summary,
    location_analysis,
    regulatory_analysis,
    talent_analysis,
    licensing_matrix,
    compliance_roadmap,
    regulatory_contacts,
    risk_assessment
  }
}

function generateExecutiveSummary(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData,
  regulation: any
): string {
  const marketDesc = location.tier === 'major' 
    ? 'major market with established regulatory infrastructure'
    : location.tier === 'suburban'
      ? `suburban market with access to ${location.nearestRegulatoryHub || location.nearestMajorCity}`
      : 'rural market requiring remote compliance resources'
  
  const regulatoryDesc = regulation.cryptoFriendly === 'friendly'
    ? 'favorable regulatory environment with lower compliance burden'
    : regulation.cryptoFriendly === 'moderate'
      ? 'moderate regulatory requirements requiring standard compliance'
      : 'strict regulatory framework requiring comprehensive compliance programs'
  
  return `# Executive Summary: ${company.name} Regulatory Intelligence Report

## Institution Overview
${company.name} operates in the ${company.industry} sector with ${company.size} employees. 
With a compliance budget of ${formatBudget(company.budget)}, the institution is positioned to develop comprehensive digital asset compliance programs.

## Jurisdiction Analysis
Based in ${location.city}, ${location.state}, your institution operates in a ${marketDesc}. 
This jurisdiction offers ${location.regulatoryClimate} regulatory climate and ${location.talentDensity} compliance talent density.

## Regulatory Focus
Based on your primary focus on ${formatPrimaryFocus(strategy.primary)}, 
we've developed a ${strategy.timeline} compliance roadmap that addresses your key concerns:
${strategy.concerns.substring(0, 150)}...

## Key Compliance Recommendations
1. ${location.licenseRequired !== 'none' ? `Prioritize license applications in ${location.state} - start within 30 days` : 'Leverage favorable regulatory environment for rapid market entry'}
2. ${regulation.cryptoFriendly === 'strict' ? 'Implement enhanced compliance infrastructure immediately' : 'Establish standard compliance protocols aligned with industry best practices'}
3. Focus on ${strategy.secondary.slice(0, 2).map(formatSecondaryFocus).join(' and ')} as secondary priorities

## Expected Outcomes
Within ${strategy.timeline}, your institution can expect to have established a compliant framework for digital asset activities, with appropriate licenses and regulatory relationships in place.
`
}

function generateLocationAnalysis(location: LocationAnalysis, talentScore: any): any {
  return {
    marketTier: location.tier,
    nearestRegulatoryHub: location.nearestRegulatoryHub,
    hubDistance: location.distanceToMajor || 0,
    talentScore: talentScore.score,
    talentRank: talentScore.rank,
    complianceProfessionals: talentScore.details.professionals,
    growthRate: talentScore.details.growthRate,
    msaInfo: location.msaName ? {
      name: location.msaName,
      population: location.msaPopulation
    } : null,
    summary: `${location.city} is a ${location.tier} market with ${
      talentScore.rank === 'high' ? 'strong' : 'developing'
    } compliance talent. ${location.nearestRegulatoryHub ? `Nearest regulatory hub: ${location.nearestRegulatoryHub}` : ''}`
  }
}

function generateRegulatoryAnalysis(location: LocationAnalysis, regulation: any, checklist: string[]): any {
  return {
    climate: regulation.cryptoFriendly,
    moneyTransmitter: regulation.moneyTransmitter,
    taxTreatment: regulation.taxTreatment,
    notes: regulation.notes,
    checklist,
    lastUpdated: regulation.lastUpdated,
    licenseRequired: location.licenseRequired,
    summary: `${location.state} has a ${regulation.cryptoFriendly} regulatory climate. ${
      regulation.cryptoFriendly === 'friendly' 
        ? 'This presents lower compliance barriers for digital asset initiatives.'
        : regulation.cryptoFriendly === 'strict'
          ? 'Expect significant compliance requirements and regulatory oversight.'
          : 'Standard compliance requirements with room to operate.'
    }`
  }
}

function generateTalentAnalysis(location: LocationAnalysis, talentScore: any, recs: any): any {
  return {
    score: talentScore.score,
    rank: talentScore.rank,
    estimatedComplianceProfessionals: talentScore.details.professionals,
    growthRate: talentScore.details.growthRate,
    remoteCapability: talentScore.details.remote,
    hiringStrategy: recs.strategy,
    approach: recs.hiringApproach,
    salaryMultiplier: recs.salaryMultiplier,
    channels: recs.topChannels,
    timeToHire: recs.estimatedTimeToHire
  }
}

function generateLicensingMatrix(location: LocationAnalysis, regulation: any): any {
  const licenses = []
  
  // Add money transmitter license
  if (regulation.moneyTransmitter.includes('required') || regulation.moneyTransmitter.includes('BitLicense')) {
    licenses.push({
      type: 'Money Transmitter License',
      required: true,
      timeline: '4-8 months',
      bonding: '$25,000 - $500,000',
      fee: '$1,000 - $5,000',
      notes: regulation.moneyTransmitter
    })
  }
  
  // Add BitLicense for NY
  if (location.state === 'NY') {
    licenses.push({
      type: 'BitLicense',
      required: true,
      timeline: '6-12 months',
      bonding: '$50,000 - $500,000',
      fee: '$5,000',
      notes: 'Comprehensive compliance program required'
    })
  }
  
  // Add DFPI for CA
  if (location.state === 'CA') {
    licenses.push({
      type: 'DFPI License',
      required: true,
      timeline: '4-8 months',
      bonding: '$25,000 - $500,000',
      fee: '$1,000 - $5,000',
      notes: 'California-specific requirements'
    })
  }
  
  // Add generic license
  if (licenses.length === 0) {
    licenses.push({
      type: 'State License',
      required: 'May be required',
      timeline: '2-6 months',
      bonding: 'Varies by state',
      fee: '$500 - $2,500',
      notes: 'Consult with counsel for specific requirements'
    })
  }
  
  return {
    state: location.state,
    licenses,
    summary: `${location.state} requires ${licenses.length} license(s) for digital asset activities.`
  }
}

function generateComplianceRoadmap(strategy: StrategyFormData): any {
  const months = strategy.timeline === '3-months' ? 3 : strategy.timeline === '6-months' ? 6 : 12
  
  return {
    timeline: strategy.timeline,
    phases: [
      {
        month: 1,
        focus: 'Foundation & Legal Setup',
        tasks: [
          'Engage qualified legal counsel',
          'Determine license requirements',
          'Begin license applications',
          'Designate compliance officer',
          'Initial compliance policy drafting'
        ]
      },
      {
        month: Math.floor(months / 3),
        focus: 'Licensing & Policy Development',
        tasks: [
          'Submit all license applications',
          'Finalize compliance policies',
          'Select compliance technology',
          'Begin AML/KYC implementation',
          'Establish reporting protocols'
        ]
      },
      {
        month: Math.floor(months * 0.66),
        focus: 'Implementation & Monitoring',
        tasks: [
          'Complete license processing',
          'Full compliance system implementation',
          'Staff training completion',
          'Initial regulatory reporting',
          'Compliance audit preparation'
        ]
      }
    ],
    milestones: [
      `Legal counsel engaged by end of Week 1`,
      `License applications submitted by end of Month 1`,
      `Compliance systems operational by Month ${Math.floor(months / 2)}`,
      `Full compliance achieved by Month ${months}`
    ]
  }
}

function generateRegulatoryContacts(location: LocationAnalysis): any {
  return {
    stateRegulator: getRegulatorContact(location.state),
    legalFirms: getLegalFirms(location.state),
    consultants: [
      { name: 'Compliance Partners Inc.', focus: 'Full-service compliance consulting' },
      { name: 'Regulatory Solutions Group', focus: 'Multi-state licensing specialists' },
      { name: 'AML Consultants Network', focus: 'KYC/AML program development' }
    ],
    technologyProviders: [
      { name: 'ComplyAdvantage', focus: 'AML monitoring solutions' },
      { name: 'Chainalysis', focus: 'Blockchain analytics' },
      { name: 'Elliptic', focus: 'Compliance screening' }
    ],
    industryAssociations: [
      { name: 'Blockchain Association', focus: 'National advocacy' },
      { name: 'Chamber of Digital Commerce', focus: 'Policy development' },
      { name: `${location.state} Bankers Association`, focus: 'State-specific resources' }
    ]
  }
}

function generateRiskAssessment(location: LocationAnalysis, strategy: StrategyFormData): any {
  const risks = [
    {
      category: 'Regulatory Change',
      risk: `Regulatory changes in ${location.state}`,
      likelihood: location.regulatoryClimate === 'strict' ? 'High' : 'Medium',
      impact: 'High',
      mitigation: 'Quarterly legal reviews, regulatory monitoring subscription'
    },
    {
      category: 'License Delays',
      risk: 'Extended processing times for licenses',
      likelihood: 'Medium',
      impact: 'Medium',
      mitigation: 'Begin applications early, engage experienced counsel'
    },
    {
      category: 'Enforcement Action',
      risk: `Regulatory enforcement in ${location.state}`,
      likelihood: location.regulatoryClimate === 'strict' ? 'Medium' : 'Low',
      impact: 'Critical',
      mitigation: 'Proactive compliance, documented procedures, regular audits'
    },
    {
      category: 'Examination Findings',
      risk: 'Compliance gaps identified during examination',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'Regular compliance audits, third-party reviews'
    }
  ]
  
  return {
    risks,
    overall: location.regulatoryClimate === 'strict' ? 'Elevated' : 'Moderate',
    recommendations: [
      'Maintain retainer with qualified compliance counsel',
      'Implement regulatory monitoring system',
      'Conduct quarterly compliance audits',
      'Document all compliance activities',
      'Establish proactive regulator relationships'
    ]
  }
}

// Helper functions
function formatBudget(budget: string): string {
  const budgets: Record<string, string> = {
    'under-50k': 'under $50,000',
    '50k-100k': '$50,000 - $100,000',
    '100k-250k': '$100,000 - $250,000',
    '250k-500k': '$250,000 - $500,000',
    '500k-plus': '$500,000+'
  }
  return budgets[budget] || budget
}

function formatPrimaryFocus(focus: string): string {
  const focuses: Record<string, string> = {
    'compliance': 'regulatory compliance',
    'licensing': 'multi-state licensing',
    'risk': 'risk assessment',
    'monitoring': 'compliance monitoring',
    'talent': 'compliance talent',
    'strategy': 'market entry strategy'
  }
  return focuses[focus] || focus
}

function formatSecondaryFocus(focus: string): string {
  const focuses: Record<string, string> = {
    'compliance': 'regulatory compliance',
    'licensing': 'licensing',
    'risk': 'risk assessment',
    'monitoring': 'monitoring',
    'talent': 'talent acquisition',
    'strategy': 'market strategy',
    'reporting': 'regulatory reporting',
    'audit': 'compliance audits',
    'policy': 'policy development',
    'training': 'staff training'
  }
  return focuses[focus] || focus
}

function getRegulatorContact(state: string): { name: string, phone: string, email: string } {
  const regulators: Record<string, any> = {
    'NY': { name: 'NYDFS', phone: '(212) 709-3500', email: 'licensing@dfs.ny.gov' },
    'CA': { name: 'DFPI', phone: '(866) 275-2677', email: 'licensing@dfpi.ca.gov' },
    'TX': { name: 'Texas Department of Banking', phone: '(877) 276-5554', email: 'info@dob.texas.gov' },
    'FL': { name: 'Florida Office of Financial Regulation', phone: '(850) 487-9687', email: 'licensing@flofr.gov' },
    'WY': { name: 'Wyoming Division of Banking', phone: '(307) 777-7797', email: 'banking@wyo.gov' }
  }
  
  return regulators[state] || { 
    name: `${state} Department of Banking`, 
    phone: 'Check website', 
    email: 'Check website' 
  }
}

function getLegalFirms(state: string): any[] {
  const firms: Record<string, any[]> = {
    'NY': [
      { name: 'Perkins Coie LLP', focus: 'Blockchain & Crypto' },
      { name: 'Sullivan & Cromwell', focus: 'FinTech' }
    ],
    'CA': [
      { name: 'Cooley LLP', focus: 'Digital Assets' },
      { name: 'Fenwick & West', focus: 'Crypto compliance' }
    ],
    'TX': [
      { name: 'Baker Botts', focus: 'Blockchain practice' },
      { name: 'Haynes Boone', focus: 'FinTech' }
    ],
    'FL': [
      { name: 'Greenberg Traurig', focus: 'Crypto practice' },
      { name: 'Holland & Knight', focus: 'Digital assets' }
    ],
    'WY': [
      { name: 'Crowley Fleck', focus: 'DAO specialists' },
      { name: 'Williams Porter', focus: 'Digital asset law' }
    ]
  }
  
  return firms[state] || [
    { name: 'Contact local bar association', focus: 'For referrals' },
    { name: 'Major national firms', focus: 'With local offices' }
  ]
}