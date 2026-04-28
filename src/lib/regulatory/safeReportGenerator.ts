// src/lib/regulatory/safeReportGenerator.ts
// Hallucination-free report generation with configurable AI provider
// UPDATED: Now fetches FULL licensing data from licensing_requirements table

import { hasSufficientData, type RetrievedFact, searchRelevantFacts, buildPromptFromFacts } from './simpleRag'
import { recordClaim, updateClaimVerification } from './sourceVerification'
import { getSimplifiedLicensing, type SimplifiedLicensing } from '@/lib/location/licensing'
import { getActiveProvider, type AIProviderConfig } from '@/lib/ai/config'
import { createClient } from '@/lib/supabase/server'

// Import the appropriate AI client based on provider
async function getAIClient() {
  const provider = getActiveProvider()
  
  switch (provider.name) {
    case 'deepseek':
      const { default: OpenAI } = await import('openai')
      return {
        client: new OpenAI({
          apiKey: provider.apiKey,
          baseURL: provider.apiUrl
        }),
        provider: provider.name,
        model: provider.model
      }
    
    case 'ollama-cloud':
      const { default: OllamaOpenAI } = await import('openai')
      return {
        client: new OllamaOpenAI({
          apiKey: provider.apiKey,
          baseURL: provider.apiUrl
        }),
        provider: provider.name,
        model: provider.model
      }
    
    case 'local-llama':
      return {
        client: null,
        provider: provider.name,
        model: provider.model,
        apiUrl: provider.apiUrl
      }
    
    default:
      throw new Error(`Unknown AI provider: ${provider.name}`)
  }
}

// Helper to call local Llama (Ollama)
async function callLocalLlama(prompt: string, config: AIProviderConfig): Promise<string> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: config.temperature,
        num_predict: config.maxTokens
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.response
}

// Helper to call OpenAI-compatible APIs (DeepSeek, Ollama Cloud)
async function callOpenAICompatible(prompt: string, client: any, model: string, temperature: number): Promise<string> {
  const completion = await client.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: `You are a regulatory compliance AI for financial institutions and law firms. 
                   You have ZERO tolerance for hallucinations. 
                   You ONLY use the verified facts provided in the context.
                   If information is missing, you say "INSUFFICIENT DATA" or "No verified data available".
                   You NEVER invent regulatory requirements, fees, bonds, timelines, or any compliance information.
                   You ALWAYS cite sources using the provided URLs.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: temperature,
    max_tokens: 4000
  })

  return completion.choices[0].message.content || ''
}

// 🔥 NEW: Fetch FULL licensing data from licensing_requirements table
async function fetchFullLicensingData(stateCode: string): Promise<any | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single()
    
    if (error) {
      console.warn(`[SafeReportGen] No full licensing data found for ${stateCode}:`, error.message)
      return null
    }
    
    console.log(`[SafeReportGen] ✅ Retrieved full licensing data for ${stateCode}:`, {
      application_fee: data?.application_fee,
      annual_renewal_fee: data?.annual_renewal_fee,
      bond_min: data?.bond_requirement_min,
      bond_max: data?.bond_requirement_max,
      net_worth: data?.net_worth_requirement,
      regulator_website: data?.regulator_website
    })
    
    return data
  } catch (error) {
    console.error(`[SafeReportGen] Error fetching full licensing data for ${stateCode}:`, error)
    return null
  }
}

// 🔥 NEW: Fetch FULL multi-state licensing data
async function fetchFullMultiStateLicensingData(stateCodes: string[]): Promise<any[]> {
  try {
    const supabase = await createClient()
    const upperStates = stateCodes.map(s => s.toUpperCase())
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .in('state_code', upperStates)
    
    if (error) {
      console.warn(`[SafeReportGen] Error fetching multi-state licensing data:`, error.message)
      return []
    }
    
    console.log(`[SafeReportGen] ✅ Retrieved full licensing data for ${data?.length || 0} states`)
    return data || []
  } catch (error) {
    console.error(`[SafeReportGen] Error fetching multi-state licensing data:`, error)
    return []
  }
}

export interface SafeReportParams {
  companyName: string
  industry: string
  companySize: string
  budget: string
  city: string
  state: string
  secondaryStates?: string[]
  locationTier: string
  nearestRegulatoryHub?: string
  primaryFocus: string
  secondaryFocus: string[]
  timeline: string
  concerns: string
  goals: string
  userTier?: string
}

export interface SafeReportResult {
  success: boolean
  reportContent?: string
  error?: string
  insufficientData?: boolean
  missingState?: string
  factsUsed: RetrievedFact[]
  verification?: {
    verifiedCount: number
    hallucinationCount: number
    safe: boolean
  }
  aiProvider?: string
  licensingData?: SimplifiedLicensing
  fullLicensingData?: any  // 🔥 NEW: Full licensing data
  multiStateFullLicensingData?: any[]  // 🔥 NEW: Multi-state full licensing data
  enforcementHistory?: string
  pendingLegislation?: string
}

/**
 * Fetch additional state data for comprehensive reports
 */
async function fetchStateEnforcementAndLegislation(stateCode: string) {
  const supabase = await createClient()
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  
  const { data: enforcement } = await supabase
    .from('enforcement_actions')
    .select('action_type, defendant, penalty_amount, action_date, description')
    .eq('state_code', stateCode)
    .gte('action_date', twoYearsAgo.toISOString())
    .order('action_date', { ascending: false })
    .limit(5)
  
  const { data: legislation } = await supabase
    .from('legislation_tracker')
    .select('bill_number, title, status, introduced_date, effective_date')
    .eq('state_code', stateCode)
    .not('status', 'in', '("enacted","failed","vetoed")')
    .order('introduced_date', { ascending: false })
    .limit(5)
  
  let enforcementHistory = 'No recent enforcement actions identified'
  if (enforcement && enforcement.length > 0) {
    enforcementHistory = enforcement.map(e => 
      `${e.action_type.replace('_', ' ')} against ${e.defendant}${e.penalty_amount ? ` ($${e.penalty_amount.toLocaleString()})` : ''} - ${new Date(e.action_date).toLocaleDateString()}`
    ).join('; ')
  }
  
  let pendingLegislation = 'No pending legislation identified'
  if (legislation && legislation.length > 0) {
    pendingLegislation = legislation.map(l => 
      `${l.bill_number}: ${l.title.substring(0, 80)}${l.title.length > 80 ? '...' : ''} (${l.status.replace('_', ' ')})`
    ).join('; ')
  }
  
  return { enforcementHistory, pendingLegislation, enforcementCount: enforcement?.length || 0, legislationCount: legislation?.length || 0 }
}

/**
 * Fetch data for multiple states (for multi-state reports)
 */
async function fetchMultiStateData(stateCodes: string[]) {
  const results: Record<string, any> = {}
  for (const stateCode of stateCodes) {
    const licensing = await getSimplifiedLicensing(stateCode)
    const { enforcementHistory, pendingLegislation } = await fetchStateEnforcementAndLegislation(stateCode)
    results[stateCode] = { licensing, enforcementHistory, pendingLegislation }
  }
  return results
}

/**
 * Generate a single-state report (UPDATED with full licensing data)
 */
export async function generateSafeReport(
  params: SafeReportParams,
  reportId?: string
): Promise<SafeReportResult> {
  const activeProvider = getActiveProvider()
  console.log(`[ReportGen] Generating report using AI provider: ${activeProvider.name}`)
  console.log(`[ReportGen] For ${params.companyName} in ${params.state}`)

  // STEP 1: Get licensing data from source of truth
  let licensingData: SimplifiedLicensing
  try {
    licensingData = await getSimplifiedLicensing(params.state)
    console.log(`[ReportGen] Retrieved simplified licensing data: license=${licensingData.licenseRequired}, climate=${licensingData.cryptoFriendly}`)
  } catch (error) {
    console.error('[ReportGen] Error fetching licensing data:', error)
    return {
      success: false,
      error: `Failed to fetch licensing data for ${params.state}`,
      factsUsed: []
    }
  }

  // 🔥 STEP 1.5: Fetch FULL licensing data from licensing_requirements table
  const fullLicensingData = await fetchFullLicensingData(params.state)
  console.log(`[ReportGen] Full licensing data retrieved: ${!!fullLicensingData}`)

  // STEP 2: Check if we have sufficient data
  const hasData = await hasSufficientData(params.state)
  
  if (!hasData && licensingData.licenseRequired === 'varies') {
    return {
      success: false,
      insufficientData: true,
      missingState: params.state,
      error: `Insufficient verified data for ${params.state}. Please ensure licensing requirements are entered in the admin panel.`,
      factsUsed: [],
      licensingData,
      fullLicensingData
    }
  }

  // STEP 3: Fetch enforcement and legislation data
  const { enforcementHistory, pendingLegislation, enforcementCount, legislationCount } = await fetchStateEnforcementAndLegislation(params.state)
  console.log(`[ReportGen] Found ${enforcementCount} enforcement actions, ${legislationCount} pending bills`)

  // STEP 4: Retrieve verified facts via RAG
  const query = `Generate regulatory compliance report for ${params.companyName} focusing on ${params.primaryFocus}`
  const relevantFacts = await searchRelevantFacts(query, params.state, 15)
  console.log(`[ReportGen] Found ${relevantFacts.length} relevant facts`)

  // STEP 5: Build the comprehensive safe prompt (using full licensing data when available)
  const safePrompt = buildComprehensivePrompt(params, licensingData, fullLicensingData, enforcementHistory, pendingLegislation, relevantFacts)

  // STEP 6: Generate report using the configured AI provider
  console.log(`[ReportGen] Calling ${activeProvider.name}...`)
  
  let reportContent = ''
  let aiError = null

  try {
    const { client, provider, model, apiUrl } = await getAIClient()
    
    if (provider === 'local-llama') {
      reportContent = await callLocalLlama(safePrompt, activeProvider)
    } else {
      reportContent = await callOpenAICompatible(safePrompt, client, model, activeProvider.temperature)
    }
    
    console.log(`[ReportGen] Response received: ${reportContent.length} characters`)

  } catch (error) {
    console.error(`[ReportGen] ${activeProvider.name} error:`, error)
    aiError = error instanceof Error ? error.message : 'Unknown AI error'
    return {
      success: false,
      error: `${activeProvider.name} error: ${aiError}`,
      factsUsed: relevantFacts,
      licensingData,
      fullLicensingData
    }
  }

  // STEP 7: If reportId provided, verify and save claims
  let verificationResult
  if (reportId && reportContent) {
    verificationResult = await verifyAndSaveReportClaims(reportId, reportContent, params.state)
  }

  // STEP 8: Return the result WITH full licensing data
  return {
    success: true,
    reportContent,
    factsUsed: relevantFacts,
    verification: verificationResult,
    aiProvider: activeProvider.name,
    licensingData,
    fullLicensingData,  // 🔥 RETURN FULL LICENSING DATA
    enforcementHistory,
    pendingLegislation
  }
}

/**
 * Generate a multi-state comparison report (UPDATED with full licensing data)
 */
export async function generateMultiStateReport(
  params: SafeReportParams,
  reportId?: string
): Promise<SafeReportResult> {
  const activeProvider = getActiveProvider()
  const primaryState = params.state
  const secondaryStates = params.secondaryStates || []
  const allStates = [primaryState, ...secondaryStates]
  
  console.log(`[ReportGen] Generating MULTI-STATE report for ${allStates.join(', ')}`)
  console.log(`[ReportGen] Using AI provider: ${activeProvider.name}`)

  // Fetch data for all states
  const statesData = await fetchMultiStateData(allStates)
  
  // 🔥 Fetch FULL multi-state licensing data
  const fullMultiStateLicensingData = await fetchFullMultiStateLicensingData(allStates)

  // Build multi-state prompt
  const multiStatePrompt = buildMultiStatePrompt(params, statesData, fullMultiStateLicensingData)

  let reportContent = ''
  try {
    const { client, provider, model, apiUrl } = await getAIClient()
    
    if (provider === 'local-llama') {
      reportContent = await callLocalLlama(multiStatePrompt, activeProvider)
    } else {
      reportContent = await callOpenAICompatible(multiStatePrompt, client, model, activeProvider.temperature)
    }
    
    console.log(`[ReportGen] Multi-state response received: ${reportContent.length} characters`)

  } catch (error) {
    console.error(`[ReportGen] Multi-state AI error:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown AI error',
      factsUsed: []
    }
  }

  let verificationResult
  if (reportId && reportContent) {
    verificationResult = await verifyAndSaveReportClaims(reportId, reportContent, primaryState)
  }

  // Get simplified licensing for primary state (for backward compatibility)
  const primaryLicensingData = await getSimplifiedLicensing(primaryState)

  return {
    success: true,
    reportContent,
    factsUsed: [],
    verification: verificationResult,
    aiProvider: activeProvider.name,
    licensingData: primaryLicensingData,
    fullLicensingData: fullMultiStateLicensingData.find(d => d.state_code === primaryState) || null,
    multiStateFullLicensingData: fullMultiStateLicensingData  // 🔥 RETURN MULTI-STATE FULL LICENSING DATA
  }
}

/**
 * Build a comprehensive prompt that includes ALL verified data
 * UPDATED: Uses full licensing data when available for financial values
 */
function buildComprehensivePrompt(
  params: SafeReportParams,
  licensing: SimplifiedLicensing,
  fullLicensingData: any,
  enforcementHistory: string,
  pendingLegislation: string,
  facts: any[]
): string {
  // Format facts for the prompt
  const factsSection = facts.length > 0 
    ? facts.map(f => `- ${f.fact.claim}\n  Source: ${f.fact.source_name} (${f.fact.source_url})`).join('\n')
    : 'No additional verified facts available.'

  // 🔥 Use full licensing data for financial values if available
  const applicationFee = fullLicensingData?.application_fee 
    ? `$${Number(fullLicensingData.application_fee).toLocaleString()}`
    : licensing.applicationFeeFormatted
    
  const annualRenewalFee = fullLicensingData?.annual_renewal_fee
    ? `$${Number(fullLicensingData.annual_renewal_fee).toLocaleString()}`
    : 'Varies'
    
  const bondRequirement = fullLicensingData?.bond_requirement_min && fullLicensingData?.bond_requirement_max
    ? (fullLicensingData.bond_requirement_min === fullLicensingData.bond_requirement_max 
        ? `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()}`
        : `$${Number(fullLicensingData.bond_requirement_min).toLocaleString()} - $${Number(fullLicensingData.bond_requirement_max).toLocaleString()}`)
    : licensing.bondRequirement
    
  const netWorthRequirement = fullLicensingData?.net_worth_requirement
    ? `$${Number(fullLicensingData.net_worth_requirement).toLocaleString()}`
    : 'Varies'
    
  const processingTime = fullLicensingData?.processing_time_description
    || (fullLicensingData?.processing_time_min_months && fullLicensingData?.processing_time_max_months
        ? `${fullLicensingData.processing_time_min_months}-${fullLicensingData.processing_time_max_months} months`
        : licensing.processingTime)
        
  const licenseName = fullLicensingData?.license_name 
    || (licensing.licenseRequired === 'none' ? 'No license required' 
        : licensing.licenseRequired === 'mtl' ? 'Money Transmitter License' 
        : licensing.licenseRequired === 'bitlicense' ? 'BitLicense' 
        : licensing.licenseRequired === 'dfpi' ? 'DFPI License' 
        : 'Varies by activity')
        
  const regulatorName = fullLicensingData?.regulator_name || 'State Regulator'
  const regulatorPhone = fullLicensingData?.regulator_phone || 'Check state website'
  const regulatorEmail = fullLicensingData?.regulator_email || 'Check state website'
  const regulatorWebsite = fullLicensingData?.regulator_website || ''
  const licenseDescription = fullLicensingData?.license_description || licensing.moneyTransmitter
  const notes = fullLicensingData?.notes || ''

  return `You are a regulatory compliance AI for financial institutions and law firms. You have ZERO tolerance for hallucinations.

========================================
VERIFIED REGULATORY DATA FOR ${params.state}
========================================

## LICENSING REQUIREMENTS (Source: Official State Regulator)
- License Required: ${licenseName}
- Regulatory Climate: ${fullLicensingData?.regulatory_climate || licensing.cryptoFriendly}
- Tax Treatment: ${licensing.taxTreatment}
- License Description: ${licenseDescription}
${notes ? `- Important Notes: ${notes}` : ''}

## FINANCIAL REQUIREMENTS (Verified from Official Sources)
- Application Fee: ${applicationFee}
- Annual Renewal Fee: ${annualRenewalFee}
- Bond Requirement: ${bondRequirement}
- Net Worth Requirement: ${netWorthRequirement}
- Processing Time: ${processingTime}

## REGULATOR CONTACT
- Regulator: ${regulatorName}
- Phone: ${regulatorPhone}
- Email: ${regulatorEmail}
${regulatorWebsite ? `- Website: ${regulatorWebsite}` : ''}

## ENFORCEMENT HISTORY (Last 2 years)
${enforcementHistory}

## PENDING LEGISLATION
${pendingLegislation}

## ADDITIONAL VERIFIED FACTS
${factsSection}

========================================
COMPANY INFORMATION
========================================
- Company: ${params.companyName}
- Industry: ${params.industry}
- Company Size: ${params.companySize}
- Compliance Budget: ${params.budget}
- Location: ${params.city}, ${params.state}
- Market Classification: ${params.locationTier}
- Nearest Regulatory Hub: ${params.nearestRegulatoryHub || 'Not specified'}
- Primary Compliance Focus: ${params.primaryFocus}
- Secondary Focus Areas: ${params.secondaryFocus.join(', ')}
- Target Timeline: ${params.timeline}

SPECIFIC CONCERNS TO ADDRESS:
${params.concerns}

COMPLIANCE GOALS:
${params.goals}

========================================
REPORT REQUIREMENTS
========================================

Generate a professional regulatory intelligence report with the following structure:

## 1. EXECUTIVE SUMMARY
- Summarize the regulatory climate for ${params.state}
- Highlight key licensing requirements including fees and bonds
- Note any pending legislation that may affect compliance
- Include the company name and primary compliance focus

## 2. LICENSING REQUIREMENTS
- State the license type required: ${licenseName}
- Application fee: ${applicationFee}
- Annual renewal fee: ${annualRenewalFee}
- Bond requirement: ${bondRequirement}
- Net worth requirement: ${netWorthRequirement}
- Processing time: ${processingTime}
- Cite the source for each requirement

## 3. REGULATORY CLIMATE ASSESSMENT
- Climate rating: ${fullLicensingData?.regulatory_climate || licensing.cryptoFriendly}
- Tax implications: ${licensing.taxTreatment}
- Risk level based on climate

## 4. ENFORCEMENT & LEGISLATION UPDATE
- Recent enforcement actions: ${enforcementHistory !== 'No recent enforcement actions identified' ? enforcementHistory : 'None identified in the past 2 years'}
- Pending legislation: ${pendingLegislation !== 'No pending legislation identified' ? pendingLegislation : 'None currently tracked'}

## 5. REGULATOR CONTACT INFORMATION
- ${regulatorName}
- Phone: ${regulatorPhone}
- Email: ${regulatorEmail}
${regulatorWebsite ? `- Website: ${regulatorWebsite}` : ''}

## 6. COMPLIANCE CHECKLIST
- Immediate actions (30 days)
- Short-term requirements (90 days)
- Ongoing obligations
- Based ONLY on verified data above

## 7. IMPLEMENTATION TIMELINE
- Expected processing time: ${processingTime}
- Key milestones based on verified data

## 8. RISK ASSESSMENT
- Compliance risk score based on regulatory climate
- Gap analysis for missing verified data

CRITICAL RULES (MUST FOLLOW):
1. DO NOT invent any regulatory requirements, fees, bonds, or timelines
2. DO NOT guess or estimate missing information
3. If a fact isn't in the verified data above, say "INSUFFICIENT DATA"
4. ALWAYS cite sources using the format [Source: Source Name]
5. Use exact numbers from the data - do not round or approximate
6. Include this exact disclaimer at the end:

---
**DISCLAIMER**: This report uses only verified regulatory data from official sources as cited above. Veridian Group is not a law firm. All compliance strategies should be reviewed with qualified legal counsel in ${params.state} before implementation. Regulations are subject to change without notice.
---

Generate the complete report now:`
}

/**
 * Build a multi-state comparison prompt (UPDATED with full licensing data)
 */
function buildMultiStatePrompt(
  params: SafeReportParams,
  statesData: Record<string, any>,
  fullMultiStateLicensingData: any[]
): string {
  const allStates = Object.keys(statesData)
  const primaryState = params.state
  
  let statesSection = ''
  for (const [state, data] of Object.entries(statesData)) {
    const isPrimary = state === primaryState
    const licensing = data.licensing
    const fullData = fullMultiStateLicensingData.find(d => d.state_code === state) || {}
    
    // Use full data for financial values
    const applicationFee = fullData.application_fee 
      ? `$${Number(fullData.application_fee).toLocaleString()}`
      : licensing.applicationFeeFormatted
      
    const bondRequirement = fullData.bond_requirement_min && fullData.bond_requirement_max
      ? (fullData.bond_requirement_min === fullData.bond_requirement_max 
          ? `$${Number(fullData.bond_requirement_min).toLocaleString()}`
          : `$${Number(fullData.bond_requirement_min).toLocaleString()} - $${Number(fullData.bond_requirement_max).toLocaleString()}`)
      : licensing.bondRequirement
    
    statesSection += `
${'='.repeat(60)}
${isPrimary ? 'PRIMARY STATE' : 'COMPARISON STATE'}: ${state}
${'='.repeat(60)}
- License Required: ${fullData.license_name || (licensing.licenseRequired === 'none' ? 'No license required' : licensing.licenseRequired === 'mtl' ? 'Money Transmitter License' : licensing.licenseRequired === 'bitlicense' ? 'BitLicense' : licensing.licenseRequired === 'dfpi' ? 'DFPI License' : 'Varies')}
- Regulatory Climate: ${fullData.regulatory_climate || licensing.cryptoFriendly}
- Tax Treatment: ${licensing.taxTreatment}
- License Description: ${fullData.license_description || licensing.moneyTransmitter}
- Application Fee: ${applicationFee}
- Annual Renewal Fee: ${fullData.annual_renewal_fee ? `$${Number(fullData.annual_renewal_fee).toLocaleString()}` : 'Varies'}
- Bond Requirement: ${bondRequirement}
- Net Worth Requirement: ${fullData.net_worth_requirement ? `$${Number(fullData.net_worth_requirement).toLocaleString()}` : 'Varies'}
- Processing Time: ${fullData.processing_time_description || licensing.processingTime}
- Recent Enforcement: ${data.enforcementHistory.substring(0, 150)}...
- Pending Legislation: ${data.pendingLegislation.substring(0, 150)}...
`
  }

  return `You are a regulatory compliance AI for financial institutions and law firms. You have ZERO tolerance for hallucinations.

========================================
MULTI-STATE REGULATORY COMPARISON REPORT
========================================
Primary State: ${primaryState}
States Included in Comparison: ${allStates.join(', ')}

${statesSection}

========================================
COMPANY INFORMATION
========================================
- Company: ${params.companyName}
- Industry: ${params.industry}
- Company Size: ${params.companySize}
- Compliance Budget: ${params.budget}
- Primary Location: ${params.city}, ${primaryState}
- Market Classification: ${params.locationTier}
- Primary Compliance Focus: ${params.primaryFocus}
- Secondary Focus Areas: ${params.secondaryFocus.join(', ')}
- Target Timeline: ${params.timeline}

SPECIFIC CONCERNS TO ADDRESS:
${params.concerns}

COMPLIANCE GOALS:
${params.goals}

========================================
REPORT REQUIREMENTS
========================================

Generate a professional COMPARATIVE regulatory intelligence report with the following structure:

## 1. EXECUTIVE SUMMARY
- Overview of the multi-state regulatory landscape
- Highlight key differences between states (fees, bonds, timelines)
- Preliminary recommendation on optimal state(s)

## 2. STATE-BY-STATE COMPARISON TABLE
Create a comparison table with rows for each state showing:
- License Required
- Regulatory Climate
- Tax Treatment
- Application Fee
- Annual Renewal Fee
- Bond Requirement
- Net Worth Requirement
- Processing Time

## 3. PRIMARY STATE DETAILED ANALYSIS (${primaryState})
- Full licensing requirements
- Financial requirements (fees, bonds, net worth)
- Regulator contact information
- Enforcement history
- Pending legislation
- Compliance timeline

## 4. SECONDARY STATES OVERVIEW
For each secondary state, provide a concise summary of key requirements

## 5. BEST STATE RECOMMENDATION
- Compare all states and recommend the optimal jurisdiction
- Justify based on fees, processing time, climate, and tax treatment
- Consider the company's specific focus areas

## 6. MULTI-STATE COMPLIANCE STRATEGY
- If operating in multiple states, outline the compliance approach
- Identify which state has the most stringent requirements
- Recommend a phased rollout strategy

CRITICAL RULES (MUST FOLLOW):
1. DO NOT invent any regulatory requirements, fees, bonds, or timelines
2. Use ONLY the verified data provided above
3. If a fact isn't in the data, say "INSUFFICIENT DATA"
4. ALWAYS cite sources
5. Use exact numbers from the data - do not round or approximate
6. Include this exact disclaimer at the end:

---
**DISCLAIMER**: This report uses only verified regulatory data from official sources as cited above. Veridian Group is not a law firm. All compliance strategies should be reviewed with qualified legal counsel before implementation. Regulations are subject to change without notice.
---

Generate the complete comparative report now:`
}

/**
 * Verify each sentence of a generated report against the facts database
 */
export async function verifyAndSaveReportClaims(
  reportId: string,
  reportContent: string,
  stateCode: string
): Promise<{ verifiedCount: number; hallucinationCount: number; safe: boolean }> {
  const sentences = reportContent.split(/[.!?]+/).filter(s => s.trim().length > 30)
  
  let verifiedCount = 0
  let hallucinationCount = 0
  let needsReviewCount = 0

  console.log(`[Verify] Verifying ${sentences.length} sentences...`)

  for (const sentence of sentences) {
    const regulatoryKeywords = [
      'license', 'required', 'must', 'regulation', 'compliance', 
      'fee', 'bond', 'timeline', 'deadline', 'prohibited', 
      'mandatory', 'restriction', 'penalty', 'enforcement'
    ]
    const hasRegulatoryClaim = regulatoryKeywords.some(kw => 
      sentence.toLowerCase().includes(kw)
    )
    
    if (!hasRegulatoryClaim) continue

    const { success, claimId, error } = await recordClaim(reportId, sentence.trim(), [])
    
    if (success && claimId) {
      const verification = await supabaseRpcVerify(sentence.trim(), stateCode)
      
      if (!verification) {
        await updateClaimVerification(claimId, 'needs_review', 0.5, 'Verification RPC failed')
        needsReviewCount++
      } else if (verification.is_verified && verification.confidence_score > 0.7) {
        await updateClaimVerification(claimId, 'verified', verification.confidence_score, 'Auto-verified by RAG')
        verifiedCount++
      } else if (!verification.is_verified && verification.confidence_score < 0.3) {
        await updateClaimVerification(claimId, 'hallucination', verification.confidence_score, 'Potential hallucination detected')
        hallucinationCount++
      } else {
        await updateClaimVerification(claimId, 'needs_review', verification.confidence_score, 'Ambiguous claim - human review recommended')
        needsReviewCount++
      }
    } else {
      hallucinationCount++
    }
  }

  const total = verifiedCount + hallucinationCount + needsReviewCount
  const hallucinationRate = total > 0 ? (hallucinationCount / total) * 100 : 0
  const safe = hallucinationRate < 10

  console.log(`[Verify] Complete: ${verifiedCount} verified, ${hallucinationCount} hallucinations, ${needsReviewCount} needs review (${hallucinationRate.toFixed(1)}% rate)`)

  return { verifiedCount, hallucinationCount, safe }
}

// Helper function to call Supabase RPC
async function supabaseRpcVerify(claimText: string, stateCode: string) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data, error } = await supabase.rpc('verify_claim', {
    input_claim: claimText,
    input_state_code: stateCode
  })
  
  if (error) {
    console.error('[Verify] RPC error:', error)
    return null
  }
  
  return data
}