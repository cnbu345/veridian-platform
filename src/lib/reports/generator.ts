// src/lib/reports/generator.ts
// Production-ready regulatory report generation with AI fallback
// ENHANCED: Full licensing data integration from licensing_requirements table

import { CompanyFormData } from './validation'
import { LocationAnalysis } from '../location/analyzer'
import { StrategyFormData } from './validation'
import { getSimplifiedLicensingClient } from '../location/licensing-client'
import { getTalentScoreForLocation, getTalentRecommendations } from '../location/talent'
import { generateRegulatoryReport } from '../openai/openai'
import { GeneratedReport } from './types'
import { fetchLicensingData, fetchMultiStateLicensingData } from './storage'

export interface GenerationResult {
  executive_summary: string
  location_analysis: LocationAnalysisResult
  regulatory_analysis: RegulatoryAnalysisResult
  talent_analysis: TalentAnalysisResult
  licensing_matrix: LicensingMatrixResult
  compliance_roadmap: ComplianceRoadmapResult
  regulatory_contacts: RegulatoryContactsResult
  risk_assessment: RiskAssessmentResult
  full_report?: string
  full_licensing_data?: any
  multi_state_licensing_data?: any[]
}

export interface LocationAnalysisResult {
  marketTier: string
  nearestRegulatoryHub: string | null
  hubDistance: number
  talentScore: number
  talentRank: string
  complianceProfessionals: number
  growthRate: string
  msaInfo: { name: string; population: number } | null
  summary: string
}

export interface RegulatoryAnalysisResult {
  climate: string
  moneyTransmitter: string
  taxTreatment: string
  notes: string | null
  checklist: string[]
  lastUpdated: string
  licenseRequired: string
  applicationFee: string
  bondRequirement: string
  processingTime: string
  summary: string
  fullAnalysis: string | null
}

export interface TalentAnalysisResult {
  score: number
  rank: string
  estimatedComplianceProfessionals: number
  growthRate: string
  remoteCapability: boolean
  hiringStrategy: string
  approach: string
  salaryMultiplier: number
  channels: string[]
  timeToHire: string
}

export interface LicensingMatrixResult {
  state: string
  licenses: LicenseRequirement[]
  summary: string
  fullMatrix: string | null
}

export interface LicenseRequirement {
  type: string
  required: boolean
  timeline: string
  bonding: string
  fee: string
  notes: string
}

export interface ComplianceRoadmapResult {
  timeline: string
  phases: RoadmapPhase[]
  milestones: string[]
  fullRoadmap: string | null
}

export interface RoadmapPhase {
  month: number
  focus: string
  tasks: string[]
}

export interface RegulatoryContactsResult {
  stateRegulator: RegulatorContact
  legalFirms: LegalFirm[]
  consultants: ServiceProvider[]
  technologyProviders: ServiceProvider[]
  industryAssociations: ServiceProvider[]
  fullResources: string | null
}

export interface RegulatorContact {
  name: string
  phone: string
  email: string
}

export interface LegalFirm {
  name: string
  focus: string
}

export interface ServiceProvider {
  name: string
  focus: string
}

export interface RiskAssessmentResult {
  risks: RiskItem[]
  overall: string
  recommendations: string[]
  fullAssessment: string | null
}

export interface RiskItem {
  category: string
  risk: string
  likelihood: string
  impact: string
  mitigation: string
}

/**
 * Fetch full licensing data from the database
 * This gets ALL fields from the licensing_requirements table
 */
async function getFullLicensingData(stateCode: string): Promise<any> {
  return await fetchLicensingData(stateCode)
}

/**
 * Build a comprehensive compliance checklist for a given state
 * Based on verified regulatory requirements from the licensing database
 */
async function buildComplianceChecklist(stateCode: string, fullLicensingData?: any): Promise<string[]> {
  const licensing = await getSimplifiedLicensingClient(stateCode)
  
  const checklist: string[] = [
    'Register business entity with Secretary of State',
    'Obtain EIN from IRS',
    'Determine money transmitter license requirements',
  ]
  
  // Use full licensing data if available for more detailed requirements
  if (fullLicensingData) {
    if (fullLicensingData.license_required !== 'none') {
      checklist.push(`Apply for ${fullLicensingData.license_name || fullLicensingData.license_required} license`)
      checklist.push(`Processing time: ${fullLicensingData.processing_time_description || `${fullLicensingData.processing_time_min_months}-${fullLicensingData.processing_time_max_months} months`}`)
      checklist.push('Prepare audited financial statements')
      
      if (fullLicensingData.bond_requirement_min) {
        const bondMin = fullLicensingData.bond_requirement_min
        const bondMax = fullLicensingData.bond_requirement_max
        const bondRange = bondMin === bondMax ? `$${bondMin.toLocaleString()}` : `$${bondMin.toLocaleString()} - $${bondMax.toLocaleString()}`
        checklist.push(`Meet surety bond requirement: ${bondRange}`)
      }
      
      if (fullLicensingData.application_fee) {
        checklist.push(`Submit application fee: $${Number(fullLicensingData.application_fee).toLocaleString()}`)
      }
      
      if (fullLicensingData.net_worth_requirement) {
        checklist.push(`Maintain minimum net worth: $${Number(fullLicensingData.net_worth_requirement).toLocaleString()}`)
      }
      
      checklist.push('Implement AML/KYC procedures with blockchain analytics tools')
      checklist.push('Designate qualified Compliance Officer (CAMS certification preferred)')
      checklist.push('Establish physical commercial office (no virtual offices or P.O. boxes)')
    }
  } else {
    // Fallback to simplified data
    if (licensing.licenseRequired !== 'none') {
      checklist.push(`Apply for ${licensing.licenseRequired} license (${licensing.processingTime})`)
      checklist.push('Prepare audited financial statements')
      checklist.push(`Meet surety bond requirement: ${licensing.bondRequirement}`)
      checklist.push(`Submit application fee: ${licensing.applicationFeeFormatted}`)
      checklist.push('Implement AML/KYC procedures with blockchain analytics tools')
      checklist.push('Designate qualified Compliance Officer (CAMS certification preferred)')
      checklist.push('Establish physical commercial office (no virtual offices or P.O. boxes)')
    }
  }
  
  // State-specific requirements
  const stateSpecificRequirements: Record<string, string[]> = {
    'NY': [
      'Apply for BitLicense (12-18 months processing time)',
      'Budget $250k-$1M for legal, compliance, and cybersecurity',
      'Maintain enhanced capital reserves',
      'Implement real-time blockchain analytics',
      'Designate Chief Information Security Officer (CISO)'
    ],
    'CA': [
      'Register with DFPI by July 1, 2026 deadline',
      'Comply with California Consumer Privacy Act (CCPA)',
      'Prepare for Digital Financial Assets Law (DFAL) licensing requirements'
    ],
    'FL': [
      'Register with Office of Financial Regulation as money services business',
      'For kiosk operators: comply with CS/CS/SB 198 (2026) registration requirements',
      'Implement daily transaction limits where applicable'
    ],
    'CO': [
      'Register with Colorado Division of Banking',
      'Comply with Colorado Money Transmitter Act',
      'File annual reports with the Division'
    ]
  }
  
  if (stateSpecificRequirements[stateCode]) {
    checklist.push(...stateSpecificRequirements[stateCode])
  }
  
  // Tax-exempt states
  const taxExemptStates = ['TX', 'WY', 'FL', 'NV', 'SD', 'NH', 'TN']
  if (taxExemptStates.includes(stateCode)) {
    checklist.push('Review state-specific tax exemptions (no state income tax)')
  }
  
  // Strict regulatory climates
  const climate = fullLicensingData?.regulatory_climate || licensing.cryptoFriendly
  if (climate === 'strict') {
    checklist.push('Budget for higher compliance costs (20-30% of staff in compliance roles)')
    checklist.push('Prepare for rigorous regulatory examinations')
    checklist.push('Maintain enhanced documentation for all compliance activities')
  }
  
  return checklist
}

/**
 * Main report generation function
 * Attempts AI generation first, falls back to local data if AI fails
 */
export async function generateReport(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData & { secondaryStates?: string[] },
  userId: string
): Promise<GenerationResult> {
  console.log(`[ReportGen] Starting regulatory report generation for: ${company.name}`)
  const startTime = Date.now()
  
  // Fetch full licensing data from database for primary state
  const fullLicensingData = await getFullLicensingData(location.state)
  console.log(`[ReportGen] Full licensing data for ${location.state}:`, fullLicensingData ? 'Found' : 'Not found')
  
  // Fetch multi-state licensing data if secondary states exist
  let multiStateLicensingData: any[] = []
  const secondaryStates = strategy.secondaryStates || []
  if (secondaryStates.length > 0) {
    const allStates = [location.state, ...secondaryStates]
    multiStateLicensingData = await fetchMultiStateLicensingData(allStates)
    console.log(`[ReportGen] Multi-state licensing data: ${multiStateLicensingData.length} states found`)
  }
  
  try {
    // Attempt AI-powered report generation
    const aiResponse = await generateRegulatoryReport({
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

    // Handle various AI response formats
    let fullReport: string
    if (typeof aiResponse === 'string') {
      fullReport = aiResponse
    } else if (aiResponse && typeof aiResponse === 'object') {
      fullReport = aiResponse.reportContent || aiResponse.content || aiResponse.report || JSON.stringify(aiResponse)
    } else {
      fullReport = ''
    }
    
    console.log(`[ReportGen] AI response type: ${typeof aiResponse}, length: ${fullReport.length}`)

    // Parse AI report into structured sections
    const executive_summary = extractExecutiveSummary(fullReport)
    const regulatory_analysis = await extractRegulatoryAnalysis(fullReport, location, strategy, fullLicensingData)
    const licensing_matrix = await extractLicensingMatrix(fullReport, location, fullLicensingData)
    const compliance_roadmap = extractComplianceRoadmap(fullReport, strategy)
    const regulatory_contacts = extractRegulatoryContacts(fullReport, location, fullLicensingData)
    const risk_assessment = extractRiskAssessment(fullReport, location, strategy)

    // Supplement with verified data from our database
    const licensing = await getSimplifiedLicensingClient(location.state)
    const talentScore = getTalentScoreForLocation(location.city, location.state)
    const talentRecs = getTalentRecommendations(location.city, location.state, location.tier)
    const complianceChecklist = await buildComplianceChecklist(location.state, fullLicensingData)

    const generationTime = Date.now() - startTime
    console.log(`[ReportGen] Report generation completed in ${generationTime}ms`)

    return {
      executive_summary,
      location_analysis: buildLocationAnalysis(location, talentScore),
      regulatory_analysis: {
        ...regulatory_analysis,
        checklist: complianceChecklist
      },
      talent_analysis: buildTalentAnalysis(location, talentScore, talentRecs),
      licensing_matrix,
      compliance_roadmap,
      regulatory_contacts,
      risk_assessment,
      full_report: fullReport,
      full_licensing_data: fullLicensingData,
      multi_state_licensing_data: multiStateLicensingData
    }
  } catch (error) {
    console.error('[ReportGen] AI generation failed, using local fallback:', error)
    
    // Fallback to local generation using verified database content
    const result = await generateLocalReport(company, location, strategy, fullLicensingData)
    return {
      ...result,
      full_licensing_data: fullLicensingData,
      multi_state_licensing_data: multiStateLicensingData
    }
  }
}

/**
 * Extract executive summary from AI-generated report
 */
function extractExecutiveSummary(fullReport: string): string {
  if (!fullReport || typeof fullReport !== 'string') {
    console.warn('[ReportGen] Invalid report content, using fallback executive summary')
    return buildFallbackExecutiveSummary()
  }
  
  const patterns = [
    /## 1\. EXECUTIVE SUMMARY([\s\S]*?)(?=## 2\.|$)/,
    /# Executive Summary([\s\S]*?)(?=##|# [^#]|$)/i,
    /Executive Summary([\s\S]*?)(?=##|\n#|$)/i,
    /\*\*1\. EXECUTIVE SUMMARY\*\*([\s\S]*?)(?=\*\*2\.|$)/
  ]
  
  for (const pattern of patterns) {
    const match = fullReport.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  return buildFallbackExecutiveSummary()
}

/**
 * Extract regulatory analysis section from AI report
 */
async function extractRegulatoryAnalysis(
  fullReport: string, 
  location: LocationAnalysis, 
  strategy: StrategyFormData,
  fullLicensingData?: any
): Promise<RegulatoryAnalysisResult> {
  let match: RegExpMatchArray | null = null
  if (fullReport && typeof fullReport === 'string') {
    const regex = /## 2\. STATE REGULATORY ANALYSIS[\s\S]*?\([A-Z]{2}\)([\s\S]*?)(?=## 3\.|$)/
    match = fullReport.match(regex)
  }
  
  const licensing = await getSimplifiedLicensingClient(location.state)
  const checklist = await buildComplianceChecklist(location.state, fullLicensingData)
  
  // Use full licensing data if available for more accurate values
  const applicationFee = fullLicensingData?.application_fee 
    ? `$${Number(fullLicensingData.application_fee).toLocaleString()}`
    : licensing.applicationFeeFormatted
    
  const bondRequirement = fullLicensingData?.bond_requirement_min && fullLicensingData?.bond_requirement_max
    ? (fullLicensingData.bond_requirement_min === fullLicensingData.bond_requirement_max 
        ? `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()}`
        : `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()} - $${Number(fullLicensingData.bond_requirement_max).toLocaleString()}`)
    : licensing.bondRequirement
    
  const processingTime = fullLicensingData?.processing_time_description
    || (fullLicensingData?.processing_time_min_months && fullLicensingData?.processing_time_max_months
        ? `${fullLicensingData.processing_time_min_months}-${fullLicensingData.processing_time_max_months} months`
        : licensing.processingTime)
  
  const climate = fullLicensingData?.regulatory_climate || licensing.cryptoFriendly
  
  return {
    climate,
    moneyTransmitter: fullLicensingData?.license_description || licensing.moneyTransmitter,
    taxTreatment: licensing.taxTreatment,
    notes: fullLicensingData?.notes || licensing.notes,
    checklist,
    lastUpdated: fullLicensingData?.last_reviewed_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    licenseRequired: fullLicensingData?.license_required || location.licenseRequired,
    applicationFee,
    bondRequirement,
    processingTime,
    summary: match ? match[1].trim() : buildRegulatorySummary(location, licensing, fullLicensingData),
    fullAnalysis: match ? match[0].trim() : null
  }
}

/**
 * Extract licensing matrix from AI report
 */
async function extractLicensingMatrix(
  fullReport: string, 
  location: LocationAnalysis,
  fullLicensingData?: any
): Promise<LicensingMatrixResult> {
  let match: RegExpMatchArray | null = null
  if (fullReport && typeof fullReport === 'string') {
    const regex = /## 3\. MULTI-STATE LICENSING MATRIX([\s\S]*?)(?=## 4\.|$)/
    match = fullReport.match(regex)
  }
  
  const licensing = await getSimplifiedLicensingClient(location.state)
  const licenses: LicenseRequirement[] = []
  
  // Use full licensing data if available
  if (fullLicensingData && fullLicensingData.license_required !== 'none') {
    const timeline = fullLicensingData.processing_time_description 
      || `${fullLicensingData.processing_time_min_months}-${fullLicensingData.processing_time_max_months} months`
    
    const bonding = fullLicensingData.bond_requirement_min && fullLicensingData.bond_requirement_max
      ? (fullLicensingData.bond_requirement_min === fullLicensingData.bond_requirement_max 
          ? `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()}`
          : `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()} - $${Number(fullLicensingData.bond_requirement_max).toLocaleString()}`)
      : 'Varies'
    
    const fee = fullLicensingData.application_fee
      ? `$${Number(fullLicensingData.application_fee).toLocaleString()}`
      : 'Varies'
    
    licenses.push({
      type: fullLicensingData.license_name || formatLicenseType(fullLicensingData.license_required),
      required: true,
      timeline,
      bonding,
      fee,
      notes: fullLicensingData.license_description || fullLicensingData.notes || ''
    })
  } else if (licensing.licenseRequired !== 'none') {
    licenses.push({
      type: formatLicenseType(licensing.licenseRequired),
      required: true,
      timeline: licensing.processingTime,
      bonding: licensing.bondRequirement,
      fee: licensing.applicationFeeFormatted,
      notes: licensing.moneyTransmitter
    })
  }
  
  // State-specific additional licenses
  const additionalLicenses: Record<string, LicenseRequirement[]> = {
    'NY': [{
      type: 'BitLicense',
      required: true,
      timeline: '12-18 months',
      bonding: '$250,000 - $500,000',
      fee: '$5,000',
      notes: 'Comprehensive compliance program required'
    }],
    'CA': [{
      type: 'DFPI License',
      required: true,
      timeline: '9-12 months',
      bonding: '$250,000 - $500,000',
      fee: '$1,000 - $5,000',
      notes: 'California-specific requirements effective July 1, 2026'
    }]
  }
  
  if (additionalLicenses[location.state]) {
    licenses.push(...additionalLicenses[location.state])
  }
  
  if (licenses.length === 0) {
    licenses.push({
      type: 'No Specific License Required',
      required: false,
      timeline: 'N/A',
      bonding: 'None required',
      fee: 'None',
      notes: fullLicensingData?.license_description || 'Business may still need general business license and money transmitter exemptions'
    })
  }
  
  return {
    state: location.state,
    licenses,
    summary: match ? match[1].trim() : `${location.state} requires ${licenses.length} license(s) for digital asset activities.`,
    fullMatrix: match ? match[0].trim() : null
  }
}

/**
 * Extract compliance roadmap from AI report
 */
function extractComplianceRoadmap(fullReport: string, strategy: StrategyFormData): ComplianceRoadmapResult {
  let match: RegExpMatchArray | null = null
  if (fullReport && typeof fullReport === 'string') {
    const regex = /## 5\. COMPLIANCE IMPLEMENTATION ROADMAP([\s\S]*?)(?=## 6\.|$)/
    match = fullReport.match(regex)
  }
  
  const months = strategy.timeline === '3-months' ? 3 : strategy.timeline === '6-months' ? 6 : 12
  
  return {
    timeline: strategy.timeline,
    phases: [
      {
        month: 1,
        focus: 'Foundation & Legal Setup',
        tasks: [
          'Engage qualified legal counsel with digital asset expertise',
          'Determine specific license requirements',
          'Begin license application preparation',
          'Designate compliance officer',
          'Draft initial compliance policies and procedures'
        ]
      },
      {
        month: Math.floor(months / 3),
        focus: 'Licensing & Policy Development',
        tasks: [
          'Submit all required license applications',
          'Finalize compliance policies and procedures',
          'Select and implement compliance technology solutions',
          'Begin AML/KYC program implementation',
          'Establish regulatory reporting protocols'
        ]
      },
      {
        month: Math.floor(months * 0.66),
        focus: 'Implementation & Monitoring',
        tasks: [
          'Complete license processing and approvals',
          'Full compliance system implementation',
          'Conduct comprehensive staff training',
          'Submit initial regulatory reports',
          'Schedule independent compliance audit'
        ]
      }
    ],
    milestones: [
      `Legal counsel engaged by end of Week 1`,
      `License applications submitted by end of Month 1`,
      `Compliance systems operational by Month ${Math.floor(months / 2)}`,
      `Full regulatory compliance achieved by Month ${months}`
    ],
    fullRoadmap: match ? match[0].trim() : null
  }
}

/**
 * Extract regulatory contacts and resources from AI report
 */
function extractRegulatoryContacts(
  fullReport: string, 
  location: LocationAnalysis,
  fullLicensingData?: any
): RegulatoryContactsResult {
  let match: RegExpMatchArray | null = null
  if (fullReport && typeof fullReport === 'string') {
    const regex = /## 6\. REGULATORY RESOURCES([\s\S]*?)(?=## 7\.|$)/
    match = fullReport.match(regex)
  }
  
  // Use full licensing data for regulator contact if available
  const regulatorContact: RegulatorContact = fullLicensingData ? {
    name: fullLicensingData.regulator_name || getRegulatorContact(location.state).name,
    phone: fullLicensingData.regulator_phone || getRegulatorContact(location.state).phone,
    email: fullLicensingData.regulator_email || getRegulatorContact(location.state).email
  } : getRegulatorContact(location.state)
  
  return {
    stateRegulator: regulatorContact,
    legalFirms: getLegalFirms(location.state),
    consultants: [
      { name: 'Compliance Partners Inc.', focus: 'Full-service compliance consulting' },
      { name: 'Regulatory Solutions Group', focus: 'Multi-state licensing specialists' },
      { name: 'AML Consultants Network', focus: 'KYC/AML program development' }
    ],
    technologyProviders: [
      { name: 'ComplyAdvantage', focus: 'AML monitoring and screening' },
      { name: 'Chainalysis', focus: 'Blockchain analytics and compliance' },
      { name: 'Elliptic', focus: 'Crypto compliance and risk screening' }
    ],
    industryAssociations: [
      { name: 'Blockchain Association', focus: 'National advocacy and policy' },
      { name: 'Chamber of Digital Commerce', focus: 'Digital asset policy development' },
      { name: `${location.state} Bankers Association`, focus: 'State-specific banking resources' }
    ],
    fullResources: match ? match[0].trim() : null
  }
}

/**
 * Extract risk assessment from AI report
 */
function extractRiskAssessment(
  fullReport: string, 
  location: LocationAnalysis, 
  strategy: StrategyFormData
): RiskAssessmentResult {
  let match: RegExpMatchArray | null = null
  if (fullReport && typeof fullReport === 'string') {
    const regex = /## 7\. RISK ASSESSMENT([\s\S]*?)(?=## 8\.|$|DISCLAIMER)/
    match = fullReport.match(regex)
  }
  
  const risks: RiskItem[] = [
    {
      category: 'Regulatory Change',
      risk: `Evolving regulatory framework in ${location.state}`,
      likelihood: location.regulatoryClimate === 'strict' ? 'High' : 'Medium',
      impact: 'High',
      mitigation: 'Quarterly legal reviews, regulatory monitoring subscription, active industry association participation'
    },
    {
      category: 'License Processing Delays',
      risk: 'Extended processing times for required licenses',
      likelihood: 'Medium',
      impact: 'Medium',
      mitigation: 'Begin applications early, engage experienced counsel, maintain open communication with regulators'
    },
    {
      category: 'Enforcement Action',
      risk: `Regulatory enforcement activity in ${location.state}`,
      likelihood: location.regulatoryClimate === 'strict' ? 'Medium' : 'Low',
      impact: 'Critical',
      mitigation: 'Proactive compliance program, documented procedures, regular independent audits'
    },
    {
      category: 'Examination Findings',
      risk: 'Compliance gaps identified during regulatory examination',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'Regular compliance audits, third-party reviews, continuous improvement program'
    }
  ]
  
  return {
    risks,
    overall: location.regulatoryClimate === 'strict' ? 'Elevated' : 'Moderate',
    recommendations: [
      'Maintain retainer with qualified digital asset compliance counsel',
      'Implement comprehensive regulatory monitoring system',
      'Conduct quarterly internal compliance audits',
      'Document all compliance activities and decisions',
      'Establish proactive relationships with state regulators',
      'Join relevant industry associations for regulatory updates'
    ],
    fullAssessment: match ? match[0].trim() : null
  }
}

/**
 * Fallback: Generate report entirely from local verified data
 */
async function generateLocalReport(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData,
  fullLicensingData?: any
): Promise<GenerationResult> {
  console.log('[ReportGen] Generating local report from verified database content')
  
  const licensing = await getSimplifiedLicensingClient(location.state)
  const talentScore = getTalentScoreForLocation(location.city, location.state)
  const talentRecs = getTalentRecommendations(location.city, location.state, location.tier)
  const complianceChecklist = await buildComplianceChecklist(location.state, fullLicensingData)
  
  return {
    executive_summary: buildExecutiveSummary(company, location, strategy, licensing, fullLicensingData),
    location_analysis: buildLocationAnalysis(location, talentScore),
    regulatory_analysis: buildRegulatoryAnalysis(location, licensing, complianceChecklist, fullLicensingData),
    talent_analysis: buildTalentAnalysis(location, talentScore, talentRecs),
    licensing_matrix: buildLicensingMatrix(location, licensing, fullLicensingData),
    compliance_roadmap: buildComplianceRoadmap(strategy),
    regulatory_contacts: buildRegulatoryContacts(location, fullLicensingData),
    risk_assessment: buildRiskAssessment(location, strategy)
  }
}

/**
 * Build executive summary from local data
 */
function buildExecutiveSummary(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData,
  licensing: any,
  fullLicensingData?: any
): string {
  const marketDesc = location.tier === 'major' 
    ? 'major market with established regulatory infrastructure'
    : location.tier === 'suburban'
      ? `suburban market with access to ${location.nearestRegulatoryHub || location.nearestMajorCity}`
      : 'rural market requiring remote compliance resources'
  
  const applicationFee = fullLicensingData?.application_fee 
    ? `$${Number(fullLicensingData.application_fee).toLocaleString()}`
    : licensing.applicationFeeFormatted
    
  const bondRequirement = fullLicensingData?.bond_requirement_min && fullLicensingData?.bond_requirement_max
    ? (fullLicensingData.bond_requirement_min === fullLicensingData.bond_requirement_max 
        ? `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()}`
        : `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()} - $${Number(fullLicensingData.bond_requirement_max).toLocaleString()}`)
    : licensing.bondRequirement
    
  const processingTime = fullLicensingData?.processing_time_description
    || (fullLicensingData?.processing_time_min_months && fullLicensingData?.processing_time_max_months
        ? `${fullLicensingData.processing_time_min_months}-${fullLicensingData.processing_time_max_months} months`
        : licensing.processingTime)
  
  const climate = fullLicensingData?.regulatory_climate || licensing.cryptoFriendly
  
  return `# Executive Summary: ${company.name} Regulatory Intelligence Report

## Institution Overview
${company.name} operates in the ${company.industry} sector with ${company.size} employees. 
With a compliance budget of ${formatBudget(company.budget)}, the institution is positioned to develop comprehensive digital asset compliance programs.

## Jurisdiction Analysis
Based in ${location.city}, ${location.state}, your institution operates in a ${marketDesc}. 
This jurisdiction offers a ${climate} regulatory climate with ${location.talentDensity} compliance talent density.

## Financial Requirements Summary
- Application Fee: ${applicationFee}
- Bond Requirement: ${bondRequirement}
- Estimated Processing Time: ${processingTime}

## Regulatory Focus
Based on your primary focus on ${formatPrimaryFocus(strategy.primary)}, 
we have developed a ${strategy.timeline} compliance roadmap that addresses your key concerns.

## Key Compliance Recommendations
1. ${location.licenseRequired !== 'none' ? `Prioritize license applications in ${location.state} - begin within 30 days (${processingTime})` : 'Leverage favorable regulatory environment for rapid market entry'}
2. ${climate === 'strict' ? 'Implement enhanced compliance infrastructure immediately' : 'Establish standard compliance protocols aligned with industry best practices'}
3. Focus on ${strategy.secondary.slice(0, 2).map(formatSecondaryFocus).join(' and ')} as secondary priorities

## Expected Outcomes
Within ${strategy.timeline}, your institution can expect to have established a compliant framework for digital asset activities, with appropriate licenses and regulatory relationships in place.
`
}

function buildFallbackExecutiveSummary(): string {
  return `Executive summary could not be extracted from the AI-generated report. Please refer to the full report content below for complete analysis and recommendations.`
}

function buildRegulatorySummary(
  location: LocationAnalysis, 
  licensing: any, 
  fullLicensingData?: any
): string {
  const climate = fullLicensingData?.regulatory_climate || licensing.cryptoFriendly
  
  return `${location.state} has a ${climate} regulatory climate for digital asset activities. ${
    climate === 'friendly' 
      ? 'This presents lower compliance barriers for digital asset initiatives.'
      : climate === 'strict'
        ? 'Expect significant compliance requirements and enhanced regulatory oversight.'
        : 'Standard compliance requirements apply with reasonable operating conditions.'
  }`
}

function buildLocationAnalysis(location: LocationAnalysis, talentScore: any): LocationAnalysisResult {
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
    } compliance talent availability. ${location.nearestRegulatoryHub ? `Nearest regulatory hub: ${location.nearestRegulatoryHub}.` : ''}`
  }
}

function buildRegulatoryAnalysis(
  location: LocationAnalysis, 
  licensing: any, 
  checklist: string[],
  fullLicensingData?: any
): RegulatoryAnalysisResult {
  const applicationFee = fullLicensingData?.application_fee 
    ? `$${Number(fullLicensingData.application_fee).toLocaleString()}`
    : licensing.applicationFeeFormatted
    
  const bondRequirement = fullLicensingData?.bond_requirement_min && fullLicensingData?.bond_requirement_max
    ? (fullLicensingData.bond_requirement_min === fullLicensingData.bond_requirement_max 
        ? `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()}`
        : `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()} - $${Number(fullLicensingData.bond_requirement_max).toLocaleString()}`)
    : licensing.bondRequirement
    
  const processingTime = fullLicensingData?.processing_time_description
    || (fullLicensingData?.processing_time_min_months && fullLicensingData?.processing_time_max_months
        ? `${fullLicensingData.processing_time_min_months}-${fullLicensingData.processing_time_max_months} months`
        : licensing.processingTime)
  
  const climate = fullLicensingData?.regulatory_climate || licensing.cryptoFriendly
  
  return {
    climate,
    moneyTransmitter: fullLicensingData?.license_description || licensing.moneyTransmitter,
    taxTreatment: licensing.taxTreatment,
    notes: fullLicensingData?.notes || licensing.notes,
    checklist,
    lastUpdated: fullLicensingData?.last_reviewed_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    licenseRequired: fullLicensingData?.license_required || location.licenseRequired,
    applicationFee,
    bondRequirement,
    processingTime,
    summary: buildRegulatorySummary(location, licensing, fullLicensingData),
    fullAnalysis: null
  }
}

function buildTalentAnalysis(location: LocationAnalysis, talentScore: any, recs: any): TalentAnalysisResult {
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

function buildLicensingMatrix(
  location: LocationAnalysis, 
  licensing: any, 
  fullLicensingData?: any
): LicensingMatrixResult {
  const licenses: LicenseRequirement[] = []
  
  if (fullLicensingData && fullLicensingData.license_required !== 'none') {
    const timeline = fullLicensingData.processing_time_description 
      || `${fullLicensingData.processing_time_min_months}-${fullLicensingData.processing_time_max_months} months`
    
    const bonding = fullLicensingData.bond_requirement_min && fullLicensingData.bond_requirement_max
      ? (fullLicensingData.bond_requirement_min === fullLicensingData.bond_requirement_max 
          ? `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()}`
          : `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()} - $${Number(fullLicensingData.bond_requirement_max).toLocaleString()}`)
      : 'Varies'
    
    const fee = fullLicensingData.application_fee
      ? `$${Number(fullLicensingData.application_fee).toLocaleString()}`
      : 'Varies'
    
    licenses.push({
      type: fullLicensingData.license_name || formatLicenseType(fullLicensingData.license_required),
      required: true,
      timeline,
      bonding,
      fee,
      notes: fullLicensingData.license_description || fullLicensingData.notes || ''
    })
  } else if (licensing.licenseRequired !== 'none') {
    licenses.push({
      type: formatLicenseType(licensing.licenseRequired),
      required: true,
      timeline: licensing.processingTime,
      bonding: licensing.bondRequirement,
      fee: licensing.applicationFeeFormatted,
      notes: licensing.moneyTransmitter
    })
  }
  
  const additionalLicenses: Record<string, LicenseRequirement[]> = {
    'NY': [{
      type: 'BitLicense',
      required: true,
      timeline: '12-18 months',
      bonding: '$250,000 - $500,000',
      fee: '$5,000',
      notes: 'Comprehensive compliance program required'
    }],
    'CA': [{
      type: 'DFPI License',
      required: true,
      timeline: '9-12 months',
      bonding: '$250,000 - $500,000',
      fee: '$1,000 - $5,000',
      notes: 'California-specific requirements effective July 1, 2026'
    }]
  }
  
  if (additionalLicenses[location.state]) {
    licenses.push(...additionalLicenses[location.state])
  }
  
  if (licenses.length === 0) {
    licenses.push({
      type: 'No Specific License Required',
      required: false,
      timeline: 'N/A',
      bonding: 'None required',
      fee: 'None',
      notes: fullLicensingData?.license_description || 'Business may still need general business license and money transmitter exemptions'
    })
  }
  
  return {
    state: location.state,
    licenses,
    summary: `${location.state} requires ${licenses.length} license(s) for digital asset activities.`,
    fullMatrix: null
  }
}

function buildComplianceRoadmap(strategy: StrategyFormData): ComplianceRoadmapResult {
  const months = strategy.timeline === '3-months' ? 3 : strategy.timeline === '6-months' ? 6 : 12
  
  return {
    timeline: strategy.timeline,
    phases: [
      {
        month: 1,
        focus: 'Foundation & Legal Setup',
        tasks: [
          'Engage qualified legal counsel with digital asset expertise',
          'Determine specific license requirements',
          'Begin license application preparation',
          'Designate compliance officer',
          'Draft initial compliance policies and procedures'
        ]
      },
      {
        month: Math.floor(months / 3),
        focus: 'Licensing & Policy Development',
        tasks: [
          'Submit all required license applications',
          'Finalize compliance policies and procedures',
          'Select and implement compliance technology solutions',
          'Begin AML/KYC program implementation',
          'Establish regulatory reporting protocols'
        ]
      },
      {
        month: Math.floor(months * 0.66),
        focus: 'Implementation & Monitoring',
        tasks: [
          'Complete license processing and approvals',
          'Full compliance system implementation',
          'Conduct comprehensive staff training',
          'Submit initial regulatory reports',
          'Schedule independent compliance audit'
        ]
      }
    ],
    milestones: [
      `Legal counsel engaged by end of Week 1`,
      `License applications submitted by end of Month 1`,
      `Compliance systems operational by Month ${Math.floor(months / 2)}`,
      `Full regulatory compliance achieved by Month ${months}`
    ],
    fullRoadmap: null
  }
}

function buildRegulatoryContacts(location: LocationAnalysis, fullLicensingData?: any): RegulatoryContactsResult {
  const regulatorContact: RegulatorContact = fullLicensingData ? {
    name: fullLicensingData.regulator_name || getRegulatorContact(location.state).name,
    phone: fullLicensingData.regulator_phone || getRegulatorContact(location.state).phone,
    email: fullLicensingData.regulator_email || getRegulatorContact(location.state).email
  } : getRegulatorContact(location.state)
  
  return {
    stateRegulator: regulatorContact,
    legalFirms: getLegalFirms(location.state),
    consultants: [
      { name: 'Compliance Partners Inc.', focus: 'Full-service compliance consulting' },
      { name: 'Regulatory Solutions Group', focus: 'Multi-state licensing specialists' },
      { name: 'AML Consultants Network', focus: 'KYC/AML program development' }
    ],
    technologyProviders: [
      { name: 'ComplyAdvantage', focus: 'AML monitoring and screening' },
      { name: 'Chainalysis', focus: 'Blockchain analytics and compliance' },
      { name: 'Elliptic', focus: 'Crypto compliance and risk screening' }
    ],
    industryAssociations: [
      { name: 'Blockchain Association', focus: 'National advocacy and policy' },
      { name: 'Chamber of Digital Commerce', focus: 'Digital asset policy development' },
      { name: `${location.state} Bankers Association`, focus: 'State-specific banking resources' }
    ],
    fullResources: null
  }
}

function buildRiskAssessment(location: LocationAnalysis, strategy: StrategyFormData): RiskAssessmentResult {
  const risks: RiskItem[] = [
    {
      category: 'Regulatory Change',
      risk: `Evolving regulatory framework in ${location.state}`,
      likelihood: location.regulatoryClimate === 'strict' ? 'High' : 'Medium',
      impact: 'High',
      mitigation: 'Quarterly legal reviews, regulatory monitoring subscription, active industry association participation'
    },
    {
      category: 'License Processing Delays',
      risk: 'Extended processing times for required licenses',
      likelihood: 'Medium',
      impact: 'Medium',
      mitigation: 'Begin applications early, engage experienced counsel, maintain open communication with regulators'
    },
    {
      category: 'Enforcement Action',
      risk: `Regulatory enforcement activity in ${location.state}`,
      likelihood: location.regulatoryClimate === 'strict' ? 'Medium' : 'Low',
      impact: 'Critical',
      mitigation: 'Proactive compliance program, documented procedures, regular independent audits'
    },
    {
      category: 'Examination Findings',
      risk: 'Compliance gaps identified during regulatory examination',
      likelihood: 'Medium',
      impact: 'High',
      mitigation: 'Regular compliance audits, third-party reviews, continuous improvement program'
    }
  ]
  
  return {
    risks,
    overall: location.regulatoryClimate === 'strict' ? 'Elevated' : 'Moderate',
    recommendations: [
      'Maintain retainer with qualified digital asset compliance counsel',
      'Implement comprehensive regulatory monitoring system',
      'Conduct quarterly internal compliance audits',
      'Document all compliance activities and decisions',
      'Establish proactive relationships with state regulators',
      'Join relevant industry associations for regulatory updates'
    ],
    fullAssessment: null
  }
}

// Utility functions
function formatLicenseType(licenseType: string): string {
  const types: Record<string, string> = {
    'mtl': 'Money Transmitter License',
    'bitlicense': 'BitLicense',
    'dfpi': 'DFPI License',
    'none': 'No License Required',
    'varies': 'Varies by Activity'
  }
  return types[licenseType] || licenseType.toUpperCase()
}

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
    'talent': 'compliance talent acquisition',
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

function getRegulatorContact(state: string): RegulatorContact {
  const regulators: Record<string, RegulatorContact> = {
    'NY': { name: 'New York Department of Financial Services (NYDFS)', phone: '(212) 709-3500', email: 'licensing@dfs.ny.gov' },
    'CA': { name: 'California Department of Financial Protection and Innovation (DFPI)', phone: '(866) 275-2677', email: 'licensing@dfpi.ca.gov' },
    'TX': { name: 'Texas Department of Banking', phone: '(877) 276-5554', email: 'info@dob.texas.gov' },
    'FL': { name: 'Florida Office of Financial Regulation', phone: '(850) 487-9687', email: 'licensing@flofr.gov' },
    'WY': { name: 'Wyoming Division of Banking', phone: '(307) 777-7797', email: 'banking@wyo.gov' },
    'CO': { name: 'Colorado Division of Banking', phone: '(303) 894-7575', email: 'DORA_BankingWebsite@state.co.us' },
    'IL': { name: 'Illinois Department of Financial and Professional Regulation', phone: '(888) 473-4858', email: 'fpr.licensing@illinois.gov' }
  }
  
  return regulators[state] || { 
    name: `${state} Department of Banking and Financial Institutions`, 
    phone: 'Check state website', 
    email: 'Check state website' 
  }
}

function getLegalFirms(state: string): LegalFirm[] {
  const firms: Record<string, LegalFirm[]> = {
    'NY': [
      { name: 'Perkins Coie LLP', focus: 'Blockchain, Crypto, and Digital Assets' },
      { name: 'Sullivan & Cromwell LLP', focus: 'FinTech and Digital Assets' },
      { name: 'Willkie Farr & Gallagher LLP', focus: 'Digital Asset Regulatory Compliance' }
    ],
    'CA': [
      { name: 'Cooley LLP', focus: 'Digital Assets and Blockchain' },
      { name: 'Fenwick & West LLP', focus: 'Cryptocurrency and Blockchain Compliance' },
      { name: 'Wilson Sonsini Goodrich & Rosati', focus: 'FinTech and Digital Assets' }
    ],
    'TX': [
      { name: 'Baker Botts LLP', focus: 'Blockchain and Digital Assets Practice' },
      { name: 'Haynes and Boone LLP', focus: 'FinTech and Digital Currency' }
    ],
    'FL': [
      { name: 'Greenberg Traurig LLP', focus: 'Blockchain and Digital Assets Practice' },
      { name: 'Holland & Knight LLP', focus: 'Digital Assets and FinTech' }
    ],
    'WY': [
      { name: 'Crowley Fleck PLLP', focus: 'DAO and Digital Asset Specialists' },
      { name: 'Williams Porter Day & Neville PC', focus: 'Wyoming Digital Asset Law' }
    ],
    'CO': [
      { name: 'Davis Graham & Stubbs LLP', focus: 'Blockchain and Digital Assets' },
      { name: 'Perkins Coie LLP', focus: 'Denver Digital Assets Practice' }
    ]
  }
  
  return firms[state] || [
    { name: 'Contact State Bar Association', focus: 'For digital asset law referrals' },
    { name: 'Major National Law Firms', focus: 'Most have digital asset practices with multi-state coverage' }
  ]
}