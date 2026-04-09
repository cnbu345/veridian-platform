// src/lib/reports/generator.ts
// Generate Report - Updated to use new licensing service

import { CompanyFormData } from './validation'
import { LocationAnalysis } from '../location/analyzer'
import { StrategyFormData } from './validation'
import { getSimplifiedLicensing } from '../location/licensing'
import { getTalentScoreForLocation, getTalentRecommendations } from '../location/talent'
import { generateRegulatoryReport } from '../openai/openai'
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
  full_report?: string
}

// Helper function to get compliance checklist (temporary - can be moved to licensing service)
async function getComplianceChecklist(stateCode: string): Promise<string[]> {
  const licensing = await getSimplifiedLicensing(stateCode)
  
  const checklist = [
    'Register business entity with Secretary of State',
    'Obtain EIN from IRS',
    'Determine money transmitter license requirements',
  ]
  
  if (licensing.licenseRequired !== 'none') {
    checklist.push(`Apply for ${licensing.licenseLabel || licensing.licenseRequired} license (${licensing.processingTime})`)
    checklist.push('Prepare audited financial statements')
    checklist.push(`Meet surety bond requirement: ${licensing.bondRequirement}`)
    checklist.push(`Application fee: ${licensing.applicationFeeFormatted}`)
    checklist.push('Implement AML/KYC procedures with blockchain analytics tools')
    checklist.push('Designate qualified Compliance Officer with CAMS certification preferred')
    checklist.push('Establish physical commercial office (no virtual offices/P.O. boxes)')
  }
  
  if (stateCode === 'NY') {
    checklist.push('Apply for BitLicense (12-18 months processing)')
    checklist.push('Budget $250k-$1M for legal, compliance, and cybersecurity')
    checklist.push('Maintain enhanced capital reserves')
    checklist.push('Implement real-time blockchain analytics')
    checklist.push('Designate CISO for cybersecurity')
  }
  
  if (stateCode === 'CA') {
    checklist.push('Register with DFPI by July 1, 2026 deadline')
    checklist.push('Comply with California Consumer Privacy Act')
    checklist.push('Prepare for DFAL licensing requirements')
  }
  
  if (stateCode === 'FL') {
    checklist.push('Register with OFR as money services business')
    checklist.push('For kiosk operators: comply with CS/CS/SB 198 (2026) registration requirements')
    checklist.push('Implement daily transaction limits where applicable')
  }
  
  if (['TX', 'WY', 'FL', 'NV', 'SD', 'NH', 'TN'].includes(stateCode)) {
    checklist.push('Review state-specific tax exemptions (no state income tax)')
  }
  
  if (licensing.cryptoFriendly === 'strict') {
    checklist.push('Budget for higher compliance costs (20-30% of staff in compliance roles)')
    checklist.push('Prepare for rigorous regulatory examinations')
  }
  
  return checklist
}

export async function generateReport(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData,
  userId: string
): Promise<GenerationResult> {
  console.log('Starting regulatory report generation for:', company.name)
  
  try {
    // Generate full AI report using our service
    const fullReport = await generateRegulatoryReport({
      companyName: company.name,
      industry: company.industry,
      companySize: company.size,
      budget: company.budget,
      city: location.city,
      state: location.state,
      locationTier: location.tier,
      nearestRegulatoryHub: location.nearestRegulatoryHub,
      primaryFocus: strategy.primary,
      secondaryFocus: strategy.secondary,
      timeline: strategy.timeline,
      concerns: strategy.concerns,
      goals: strategy.goals
    })

    // Parse the AI report into structured sections
    const executive_summary = extractExecutiveSummary(fullReport)
    const regulatory_analysis = await extractRegulatoryAnalysis(fullReport, location, strategy)
    const licensing_matrix = await extractLicensingMatrix(fullReport, location)
    const compliance_roadmap = extractComplianceRoadmap(fullReport, strategy)
    const regulatory_contacts = extractRegulatoryContacts(fullReport, location)
    const risk_assessment = extractRiskAssessment(fullReport, location, strategy)

    // Get local data for sections not fully covered by AI
    const licensing = await getSimplifiedLicensing(location.state)
    const talentScore = getTalentScoreForLocation(location.city, location.state)
    const talentRecs = getTalentRecommendations(location.city, location.state, location.tier)
    const complianceChecklist = await getComplianceChecklist(location.state)

    return {
      executive_summary,
      location_analysis: generateLocationAnalysis(location, talentScore),
      regulatory_analysis,
      talent_analysis: generateTalentAnalysis(location, talentScore, talentRecs),
      licensing_matrix,
      compliance_roadmap,
      regulatory_contacts,
      risk_assessment,
      full_report: fullReport
    }
  } catch (error) {
    console.error('AI generation failed, using local data:', error)
    
    // Fallback to completely local generation
    return generateLocalReport(company, location, strategy)
  }
}

// AI Report Parsing Functions
function extractExecutiveSummary(fullReport: string): string {
  const regex = /## 1\. EXECUTIVE SUMMARY([\s\S]*?)(?=## 2\.|$)/
  const match = fullReport.match(regex)
  return match ? match[1].trim() : generateLocalExecutiveSummary()
}

async function extractRegulatoryAnalysis(
  fullReport: string, 
  location: LocationAnalysis, 
  strategy: StrategyFormData
): Promise<any> {
  const regex = /## 2\. STATE REGULATORY ANALYSIS[\s\S]*?\([A-Z]{2}\)([\s\S]*?)(?=## 3\.|$)/
  const match = fullReport.match(regex)
  
  const licensing = await getSimplifiedLicensing(location.state)
  const checklist = await getComplianceChecklist(location.state)
  
  return {
    climate: licensing.cryptoFriendly,
    moneyTransmitter: licensing.moneyTransmitter,
    taxTreatment: licensing.taxTreatment,
    notes: licensing.notes,
    checklist,
    lastUpdated: new Date().toISOString().split('T')[0],
    licenseRequired: location.licenseRequired,
    applicationFee: licensing.applicationFeeFormatted,
    bondRequirement: licensing.bondRequirement,
    processingTime: licensing.processingTime,
    summary: match ? match[1].trim() : generateLocalRegulatorySummary(location, licensing),
    fullAnalysis: match ? match[0].trim() : null
  }
}

async function extractLicensingMatrix(fullReport: string, location: LocationAnalysis): Promise<any> {
  const regex = /## 3\. MULTI-STATE LICENSING MATRIX([\s\S]*?)(?=## 4\.|$)/
  const match = fullReport.match(regex)
  
  const licensing = await getSimplifiedLicensing(location.state)
  const licenses = []
  
  if (licensing.licenseRequired !== 'none') {
    licenses.push({
      type: licensing.licenseLabel || licensing.licenseRequired,
      required: true,
      timeline: licensing.processingTime,
      bonding: licensing.bondRequirement,
      fee: licensing.applicationFeeFormatted,
      notes: licensing.moneyTransmitter
    })
  }
  
  if (location.state === 'NY') {
    licenses.push({
      type: 'BitLicense',
      required: true,
      timeline: '12-18 months',
      bonding: '$250,000 - $500,000',
      fee: '$5,000',
      notes: 'Comprehensive compliance program required'
    })
  }
  
  if (location.state === 'CA') {
    licenses.push({
      type: 'DFPI License',
      required: true,
      timeline: '9-12 months',
      bonding: '$250,000 - $500,000',
      fee: '$1,000 - $5,000',
      notes: 'California-specific requirements effective July 1, 2026'
    })
  }
  
  if (licenses.length === 0) {
    licenses.push({
      type: 'No Specific License Required',
      required: false,
      timeline: 'N/A',
      bonding: 'None required',
      fee: 'None',
      notes: 'Business may still need general business license'
    })
  }
  
  return {
    state: location.state,
    licenses,
    summary: match ? match[1].trim() : `${location.state} requires ${licenses.length} license(s) for digital asset activities.`,
    fullMatrix: match ? match[0].trim() : null
  }
}

function extractComplianceRoadmap(fullReport: string, strategy: StrategyFormData): any {
  const regex = /## 5\. COMPLIANCE IMPLEMENTATION ROADMAP([\s\S]*?)(?=## 6\.|$)/
  const match = fullReport.match(regex)
  
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
    ],
    fullRoadmap: match ? match[0].trim() : null
  }
}

function extractRegulatoryContacts(fullReport: string, location: LocationAnalysis): any {
  const regex = /## 6\. REGULATORY RESOURCES([\s\S]*?)(?=## 7\.|$)/
  const match = fullReport.match(regex)
  
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
    ],
    fullResources: match ? match[0].trim() : null
  }
}

function extractRiskAssessment(fullReport: string, location: LocationAnalysis, strategy: StrategyFormData): any {
  const regex = /## 7\. RISK ASSESSMENT([\s\S]*?)(?=## 8\.|$|DISCLAIMER)/
  const match = fullReport.match(regex)
  
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
    ],
    fullAssessment: match ? match[0].trim() : null
  }
}

// Local generation functions (fallback when AI fails)
async function generateLocalReport(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData
): Promise<GenerationResult> {
  const licensing = await getSimplifiedLicensing(location.state)
  const talentScore = getTalentScoreForLocation(location.city, location.state)
  const talentRecs = getTalentRecommendations(location.city, location.state, location.tier)
  const complianceChecklist = await getComplianceChecklist(location.state)
  
  return {
    executive_summary: generateExecutiveSummary(company, location, strategy, licensing),
    location_analysis: generateLocationAnalysis(location, talentScore),
    regulatory_analysis: generateRegulatoryAnalysis(location, licensing, complianceChecklist),
    talent_analysis: generateTalentAnalysis(location, talentScore, talentRecs),
    licensing_matrix: generateLicensingMatrix(location, licensing),
    compliance_roadmap: generateComplianceRoadmap(strategy),
    regulatory_contacts: generateRegulatoryContacts(location),
    risk_assessment: generateRiskAssessment(location, strategy)
  }
}

// Local generation helper functions
function generateExecutiveSummary(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData,
  licensing: any
): string {
  const marketDesc = location.tier === 'major' 
    ? 'major market with established regulatory infrastructure'
    : location.tier === 'suburban'
      ? `suburban market with access to ${location.nearestRegulatoryHub || location.nearestMajorCity}`
      : 'rural market requiring remote compliance resources'
  
  const regulatoryDesc = licensing.cryptoFriendly === 'friendly'
    ? 'favorable regulatory environment with lower compliance burden'
    : licensing.cryptoFriendly === 'moderate'
      ? 'moderate regulatory requirements requiring standard compliance'
      : 'strict regulatory framework requiring comprehensive compliance programs'
  
  return `# Executive Summary: ${company.name} Regulatory Intelligence Report

## Institution Overview
${company.name} operates in the ${company.industry} sector with ${company.size} employees. 
With a compliance budget of ${formatBudget(company.budget)}, the institution is positioned to develop comprehensive digital asset compliance programs.

## Jurisdiction Analysis
Based in ${location.city}, ${location.state}, your institution operates in a ${marketDesc}. 
This jurisdiction offers ${location.regulatoryClimate} regulatory climate and ${location.talentDensity} compliance talent density.

## Financial Requirements
- Application Fee: ${licensing.applicationFeeFormatted}
- Bond Requirement: ${licensing.bondRequirement}
- Processing Time: ${licensing.processingTime}

## Regulatory Focus
Based on your primary focus on ${formatPrimaryFocus(strategy.primary)}, 
we've developed a ${strategy.timeline} compliance roadmap that addresses your key concerns:
${strategy.concerns.substring(0, 150)}...

## Key Compliance Recommendations
1. ${location.licenseRequired !== 'none' ? `Prioritize license applications in ${location.state} - start within 30 days (${licensing.processingTime})` : 'Leverage favorable regulatory environment for rapid market entry'}
2. ${licensing.cryptoFriendly === 'strict' ? 'Implement enhanced compliance infrastructure immediately' : 'Establish standard compliance protocols aligned with industry best practices'}
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

function generateRegulatoryAnalysis(location: LocationAnalysis, licensing: any, checklist: string[]): any {
  return {
    climate: licensing.cryptoFriendly,
    moneyTransmitter: licensing.moneyTransmitter,
    taxTreatment: licensing.taxTreatment,
    notes: licensing.notes,
    checklist,
    lastUpdated: new Date().toISOString().split('T')[0],
    licenseRequired: location.licenseRequired,
    applicationFee: licensing.applicationFeeFormatted,
    bondRequirement: licensing.bondRequirement,
    processingTime: licensing.processingTime,
    summary: `${location.state} has a ${licensing.cryptoFriendly} regulatory climate. ${
      licensing.cryptoFriendly === 'friendly' 
        ? 'This presents lower compliance barriers for digital asset initiatives.'
        : licensing.cryptoFriendly === 'strict'
          ? 'Expect significant compliance requirements and regulatory oversight.'
          : 'Standard compliance requirements with room to operate.'
    } Application fee is ${licensing.applicationFeeFormatted} with a bond requirement of ${licensing.bondRequirement}.`
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

function generateLicensingMatrix(location: LocationAnalysis, licensing: any): any {
  const licenses = []
  
  if (licensing.licenseRequired !== 'none') {
    licenses.push({
      type: licensing.licenseLabel || licensing.licenseRequired,
      required: true,
      timeline: licensing.processingTime,
      bonding: licensing.bondRequirement,
      fee: licensing.applicationFeeFormatted,
      notes: licensing.moneyTransmitter
    })
  }
  
  if (location.state === 'NY') {
    licenses.push({
      type: 'BitLicense',
      required: true,
      timeline: '12-18 months',
      bonding: '$250,000 - $500,000',
      fee: '$5,000',
      notes: 'Comprehensive compliance program required'
    })
  }
  
  if (location.state === 'CA') {
    licenses.push({
      type: 'DFPI License',
      required: true,
      timeline: '9-12 months',
      bonding: '$250,000 - $500,000',
      fee: '$1,000 - $5,000',
      notes: 'California-specific requirements effective July 1, 2026'
    })
  }
  
  if (licenses.length === 0) {
    licenses.push({
      type: 'No Specific License Required',
      required: false,
      timeline: 'N/A',
      bonding: 'None required',
      fee: 'None',
      notes: 'Business may still need general business license'
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

function generateLocalExecutiveSummary(): string {
  return `Executive summary could not be extracted from AI report. Please refer to the full report below for complete analysis.`
}

function generateLocalRegulatorySummary(location: LocationAnalysis, licensing: any): string {
  return `${location.state} has a ${licensing.cryptoFriendly} regulatory climate. ${
    licensing.cryptoFriendly === 'friendly' 
      ? 'This presents lower compliance barriers for digital asset initiatives.'
      : licensing.cryptoFriendly === 'strict'
        ? 'Expect significant compliance requirements and regulatory oversight.'
        : 'Standard compliance requirements with room to operate.'
  } Application fee is ${licensing.applicationFeeFormatted} with a bond requirement of ${licensing.bondRequirement}.`
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