// src/lib/regulatory/safeReportGenerator.ts
// Phase 1 Part 4: Hallucination-free report generation with configurable AI provider

import { prepareRAGContext, hasSufficientData, type RetrievedFact } from './rag'
import { recordClaim, updateClaimVerification } from './sourceVerification'
import { getStateRegulation } from '@/lib/location/regulations'
import { getActiveProvider, type AIProviderConfig } from '@/lib/ai/config'

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
      // Local Llama uses a different API format (Ollama)
      return {
        client: null, // Will use fetch directly for Ollama
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
                   You NEVER invent regulatory requirements, fees, timelines, or any compliance information.
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
  console.log(`Generating hallucination-safe report using AI provider: ${activeProvider.name}`)
  console.log(`For ${params.companyName} in ${params.state}`)

  // STEP 1: Check if we have sufficient data
  const hasData = await hasSufficientData(params.state)
  
  if (!hasData) {
    return {
      success: false,
      insufficientData: true,
      missingState: params.state,
      error: `Insufficient verified data for ${params.state}. Minimum 3 facts required.`,
      factsUsed: []
    }
  }

  // STEP 2: Retrieve verified facts
  const ragContext = await prepareRAGContext(params.state, params.state)
  
  if (!ragContext.hasData) {
    return {
      success: false,
      insufficientData: true,
      missingState: params.state,
      error: `Only ${ragContext.facts.length} verified facts found for ${params.state}. Need at least 3.`,
      factsUsed: ragContext.facts
    }
  }

  // STEP 3: Get basic state info (non-regulatory - safe to use)
  const stateInfo = getStateRegulation(params.state)

  // STEP 4: Build the safe prompt (NO empty promises, ONLY verified facts)
  const safePrompt = buildSafePrompt(params, ragContext.promptContext, stateInfo)

  // STEP 5: Generate report using the configured AI provider
  console.log(`Calling ${activeProvider.name} with safe prompt...`)
  
  let reportContent = ''
  let aiError = null

  try {
    const { client, provider, model, apiUrl } = await getAIClient()
    
    if (provider === 'local-llama') {
      // Local Llama (Ollama)
      reportContent = await callLocalLlama(safePrompt, activeProvider)
    } else {
      // OpenAI-compatible (DeepSeek, Ollama Cloud)
      reportContent = await callOpenAICompatible(safePrompt, client, model, activeProvider.temperature)
    }
    
    console.log(`AI response received from ${provider}: ${reportContent.length} characters`)

  } catch (error) {
    console.error(`${activeProvider.name} API error:`, error)
    aiError = error instanceof Error ? error.message : 'Unknown AI error'
    return {
      success: false,
      error: `${activeProvider.name} error: ${aiError}`,
      factsUsed: ragContext.facts
    }
  }

  // STEP 6: If reportId provided, verify and save claims
  let verificationResult
  if (reportId && reportContent) {
    verificationResult = await verifyAndSaveReportClaims(reportId, reportContent, params.state)
  }

  // STEP 7: Return the result
  return {
    success: true,
    reportContent,
    factsUsed: ragContext.facts,
    verification: verificationResult,
    aiProvider: activeProvider.name
  }
}

/**
 * Build a prompt that forces the AI to ONLY use verified facts
 */
function buildSafePrompt(
  params: SafeReportParams,
  verifiedContext: string,
  stateInfo: any
): string {
  return `You are a regulatory compliance AI for financial institutions. You have ZERO tolerance for hallucinations.

${verifiedContext}

COMPANY INFORMATION:
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

REPORT REQUIREMENTS:
Generate a professional regulatory intelligence report with the following structure:

## 1. EXECUTIVE SUMMARY
- ONLY summarize verified facts from the context above
- If information is missing for a section, state "No verified data available"
- Include the company name and location
- Highlight the most critical compliance requirements

## 2. STATE REGULATORY ANALYSIS (${params.state})
- List ONLY the verified license requirements from the context above
- For each requirement, cite the source name and URL
- Include regulatory climate rating if available
- If a requirement type is not listed, say "No verified data available for [requirement type]"

## 3. COMPLIANCE REQUIREMENTS CHECKLIST
- Based ONLY on verified facts
- Include: license requirements, bonding amounts, fee estimates, timeline estimates
- If numeric values exist, include them with units
- Mark items as "Verified" with source citations

## 4. IMPLEMENTATION TIMELINE
- ONLY use verified timeline facts from the context
- If no timeline data exists for a specific requirement, state "Timeline data not verified"
- Do NOT guess or estimate missing timelines

## 5. RISK ASSESSMENT
- Based ONLY on the verified regulatory climate rating above
- Identify compliance gaps based on missing verified data
- Recommend legal counsel review for any unverified areas

## 6. REGULATORY CONTACTS
- Include regulator contact information if provided in context
- If no contact info is verified, state "Contact information not available in verified sources"

CRITICAL RULES (MUST FOLLOW):
1. DO NOT invent any regulatory requirements, fees, bonds, or timelines
2. DO NOT guess or estimate missing information
3. If a fact isn't in the context above, say "INSUFFICIENT DATA" or "No verified data available"
4. ALWAYS cite sources using the provided URLs in format: [Source: Source Name]
5. Include this exact disclaimer at the end of the report:

---
DISCLAIMER: This report uses only verified regulatory data from official sources as cited above. Veridian Group is not a law firm. All compliance strategies should be reviewed with qualified legal counsel in ${params.state} before implementation. Regulations are subject to change without notice. Last verified data date: ${new Date().toISOString().split('T')[0]}
---

Generate the complete report now:`
}

/**
 * Verify each sentence of a generated report against the facts database
 * This is a post-generation safety check
 */
export async function verifyAndSaveReportClaims(
  reportId: string,
  reportContent: string,
  stateCode: string
): Promise<{ verifiedCount: number; hallucinationCount: number; safe: boolean }> {
  // Split into sentences (rough but effective)
  const sentences = reportContent.split(/[.!?]+/).filter(s => s.trim().length > 30)
  
  let verifiedCount = 0
  let hallucinationCount = 0
  let needsReviewCount = 0

  console.log(`Verifying ${sentences.length} sentences from report...`)

  for (const sentence of sentences) {
    // Check if this sentence makes a regulatory claim
    const regulatoryKeywords = [
      'license', 'required', 'must', 'regulation', 'compliance', 
      'fee', 'bond', 'timeline', 'deadline', 'prohibited', 
      'mandatory', 'restriction', 'penalty', 'enforcement'
    ]
    const hasRegulatoryClaim = regulatoryKeywords.some(kw => 
      sentence.toLowerCase().includes(kw)
    )
    
    if (!hasRegulatoryClaim) continue

    // Record the claim for verification
    const { success, claimId, error } = await recordClaim(reportId, sentence.trim(), [])
    
    if (success && claimId) {
      // Call the verify_claim RPC function
      const { data: verification, error: verifyRpcError } = await supabaseRpcVerify(sentence.trim(), stateCode)
      
      if (verifyRpcError || !verification) {
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
  const safe = hallucinationRate < 10 // Less than 10% hallucination rate is acceptable

  console.log(`Verification complete: ${verifiedCount} verified, ${hallucinationCount} hallucinations, ${needsReviewCount} needs review`)
  console.log(`Hallucination rate: ${hallucinationRate.toFixed(1)}%`)

  return {
    verifiedCount,
    hallucinationCount,
    safe
  }
}

// Helper function to call Supabase RPC
async function supabaseRpcVerify(claimText: string, stateCode: string) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  return await supabase.rpc('verify_claim', {
    claim_text: claimText,
    state_code: stateCode
  })
}