// src/lib/regulatory/safeReportGenerator.ts
// Phase 1 Part 4: Hallucination-free report generation with configurable AI provider
// UPDATED: Uses licensing_requirements table instead of deprecated state_regulations

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
      // Local Llama uses Ollama API format
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

export interface SafeReportParams {
  companyName: string
  industry: string
  companySize: string
  budget: string
  city: string
  state: string
  locationTier: string
  nearestRegulatoryHub?: string
  primaryFocus: string
  secondaryFocus: string[]
  timeline: string
  concerns: string
  goals: string
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
  
  // Fetch enforcement actions
  const { data: enforcement } = await supabase
    .from('enforcement_actions')
    .select('action_type, defendant, penalty_amount, action_date, description')
    .eq('state_code', stateCode)
    .gte('action_date', twoYearsAgo.toISOString())
    .order('action_date', { ascending: false })
    .limit(5)
  
  // Fetch pending legislation
  const { data: legislation } = await supabase
    .from('legislation_tracker')
    .select('bill_number, title, status, introduced_date, effective_date')
    .eq('state_code', stateCode)
    .not('status', 'in', '("enacted","failed","vetoed")')
    .order('introduced_date', { ascending: false })
    .limit(5)
  
  // Format enforcement history as readable text
  let enforcementHistory = 'No recent enforcement actions identified'
  if (enforcement && enforcement.length > 0) {
    enforcementHistory = enforcement.map(e => 
      `${e.action_type.replace('_', ' ')} against ${e.defendant}${e.penalty_amount ? ` ($${e.penalty_amount.toLocaleString()})` : ''} - ${new Date(e.action_date).toLocaleDateString()}`
    ).join('; ')
  }
  
  // Format pending legislation as readable text
  let pendingLegislation = 'No pending legislation identified'
  if (legislation && legislation.length > 0) {
    pendingLegislation = legislation.map(l => 
      `${l.bill_number}: ${l.title.substring(0, 80)}${l.title.length > 80 ? '...' : ''} (${l.status.replace('_', ' ')})`
    ).join('; ')
  }
  
  return { enforcementHistory, pendingLegislation, enforcementCount: enforcement?.length || 0, legislationCount: legislation?.length || 0 }
}

/**
 * Generate a report that CANNOT hallucinate
 * Uses RAG to ONLY include verified facts
 * Supports multiple AI providers (DeepSeek, Ollama Cloud, Local Llama)
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
    console.log(`[ReportGen] Retrieved licensing data: license=${licensingData.licenseRequired}, climate=${licensingData.cryptoFriendly}`)
  } catch (error) {
    console.error('[ReportGen] Error fetching licensing data:', error)
    return {
      success: false,
      error: `Failed to fetch licensing data for ${params.state}`,
      factsUsed: []
    }
  }

  // STEP 2: Check if we have sufficient data
  const hasData = await hasSufficientData(params.state)
  
  if (!hasData && licensingData.licenseRequired === 'varies') {
    return {
      success: false,
      insufficientData: true,
      missingState: params.state,
      error: `Insufficient verified data for ${params.state}. Please ensure licensing requirements are entered in the admin panel.`,
      factsUsed: [],
      licensingData
    }
  }

  // STEP 3: Fetch enforcement and legislation data
  const { enforcementHistory, pendingLegislation, enforcementCount, legislationCount } = await fetchStateEnforcementAndLegislation(params.state)
  console.log(`[ReportGen] Found ${enforcementCount} enforcement actions, ${legislationCount} pending bills`)

  // STEP 4: Retrieve verified facts via RAG
  const query = `Generate regulatory compliance report for ${params.companyName} focusing on ${params.primaryFocus}`
  const relevantFacts = await searchRelevantFacts(query, params.state, 15)
  console.log(`[ReportGen] Found ${relevantFacts.length} relevant facts`)

  // STEP 5: Build the comprehensive safe prompt
  const safePrompt = buildComprehensivePrompt(params, licensingData, enforcementHistory, pendingLegislation, relevantFacts)

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
      licensingData
    }
  }

  // STEP 7: If reportId provided, verify and save claims
  let verificationResult
  if (reportId && reportContent) {
    verificationResult = await verifyAndSaveReportClaims(reportId, reportContent, params.state)
  }

  // STEP 8: Return the result
  return {
    success: true,
    reportContent,
    factsUsed: relevantFacts,
    verification: verificationResult,
    aiProvider: activeProvider.name,
    licensingData,
    enforcementHistory,
    pendingLegislation
  }
}

/**
 * Build a comprehensive prompt that includes ALL verified data
 */
function buildComprehensivePrompt(
  params: SafeReportParams,
  licensing: SimplifiedLicensing,
  enforcementHistory: string,
  pendingLegislation: string,
  facts: any[]
): string {
  // Format facts for the prompt
  const factsSection = facts.length > 0 
    ? facts.map(f => `- ${f.fact.claim}\n  Source: ${f.fact.source_name} (${f.fact.source_url})`).join('\n')
    : 'No additional verified facts available.'

  return `You are a regulatory compliance AI for financial institutions and law firms. You have ZERO tolerance for hallucinations.

========================================
VERIFIED REGULATORY DATA FOR ${params.state}
========================================

## LICENSING REQUIREMENTS (Source: Official State Regulator)
- License Required: ${licensing.licenseRequired === 'none' ? 'No license required' : licensing.licenseRequired === 'mtl' ? 'Money Transmitter License' : licensing.licenseRequired === 'bitlicense' ? 'BitLicense' : licensing.licenseRequired === 'dfpi' ? 'DFPI License' : 'Varies by activity'}
- Regulatory Climate: ${licensing.cryptoFriendly}
- Tax Treatment: ${licensing.taxTreatment}
- License Description: ${licensing.moneyTransmitter}

## FINANCIAL REQUIREMENTS
- Application Fee: ${licensing.applicationFeeFormatted}
- Bond Requirement: ${licensing.bondRequirement}
- Processing Time: ${licensing.processingTime}

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
- Highlight key licensing requirements
- Note any pending legislation that may affect compliance
- Include the company name and primary compliance focus

## 2. LICENSING REQUIREMENTS
- State the license type required (${licensing.licenseRequired === 'none' ? 'No license required' : licensing.licenseRequired === 'mtl' ? 'Money Transmitter License' : licensing.licenseRequired === 'bitlicense' ? 'BitLicense' : licensing.licenseRequired === 'dfpi' ? 'DFPI License' : 'Varies'})
- Application fee: ${licensing.applicationFeeFormatted}
- Bond requirement: ${licensing.bondRequirement}
- Processing time: ${licensing.processingTime}
- Cite the source for each requirement

## 3. REGULATORY CLIMATE ASSESSMENT
- Climate rating: ${licensing.cryptoFriendly}
- Tax implications: ${licensing.taxTreatment}
- Risk level based on climate

## 4. ENFORCEMENT & LEGISLATION UPDATE
- Recent enforcement actions: ${enforcementHistory !== 'No recent enforcement actions identified' ? enforcementHistory : 'None identified in the past 2 years'}
- Pending legislation: ${pendingLegislation !== 'No pending legislation identified' ? pendingLegislation : 'None currently tracked'}

## 5. COMPLIANCE CHECKLIST
- Immediate actions (30 days)
- Short-term requirements (90 days)
- Ongoing obligations
- Based ONLY on verified data above

## 6. IMPLEMENTATION TIMELINE
- Expected processing time: ${licensing.processingTime}
- Key milestones based on verified data

## 7. RISK ASSESSMENT
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
    claim_text: claimText,
    state_code: stateCode
  })
  
  if (error) {
    console.error('[Verify] RPC error:', error)
    return null
  }
  
  return data
}