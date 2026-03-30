// src/lib/regulatory/rag.ts
// Phase 1 Part 4: Retrieval Augmented Generation for regulatory reports

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export interface RetrievedFact {
  id: string
  claim: string
  source_name: string
  source_url: string
  source_date: string
  category: string
  numeric_value: number | null
  numeric_unit: string | null
}

export interface RAGResult {
  hasData: boolean
  facts: RetrievedFact[]
  promptContext: string
  insufficientStates: string[]
}

/**
 * Retrieve ALL verified facts for a given state
 * This is the source of truth - AI cannot invent anything not here
 */
export async function retrieveVerifiedFacts(stateCode: string): Promise<RetrievedFact[]> {
  const { data, error } = await supabase
    .from('regulatory_facts')
    .select(`
      id,
      claim,
      source_name,
      source_url,
      source_date,
      category,
      numeric_value,
      numeric_unit
    `)
    .eq('state_code', stateCode)
    .eq('verification_status', 'verified')
    .is('expires_at', null)
    .or(`expires_at.gt.now(),expires_at.is.null`)

  if (error) {
    console.error('❌ RAG retrieval error:', error)
    return []
  }

  return data || []
}

/**
 * Build a prompt context from verified facts
 * This ensures AI only has access to truth
 */
export function buildPromptContext(facts: RetrievedFact[], stateCode: string, stateName: string): string {
  if (facts.length === 0) {
    return `
[INSUFFICIENT DATA FOR ${stateCode}]

WARNING: No verified regulatory facts exist in the database for ${stateName} (${stateCode}).

The AI cannot generate ANY regulatory claims for this state because there is no source-of-truth data available.

Please respond with: "Insufficient verified data available for ${stateName}. A compliance specialist must review this jurisdiction manually."

DO NOT generate any speculative or unverified regulatory information.
`
  }

  // Group facts by category
  const grouped: Record<string, RetrievedFact[]> = {}
  for (const fact of facts) {
    if (!grouped[fact.category]) {
      grouped[fact.category] = []
    }
    grouped[fact.category].push(fact)
  }

  let context = `VERIFIED REGULATORY FACTS FOR ${stateName} (${stateCode}):\n`
  context += `=============================================\n\n`
  context += `IMPORTANT: The following information is VERIFIED and can be cited. DO NOT generate any regulatory claims that are not listed below.\n\n`

  // License requirements
  if (grouped['license_requirement']) {
    context += `LICENSE REQUIREMENTS:\n`
    for (const fact of grouped['license_requirement']) {
      context += `- ${fact.claim}\n`
      context += `  Source: ${fact.source_name} (${fact.source_date})\n`
      context += `  URL: ${fact.source_url}\n`
    }
    context += `\n`
  }

  // Timeline facts
  if (grouped['timeline']) {
    context += `PROCESSING TIMELINES:\n`
    for (const fact of grouped['timeline']) {
      context += `- ${fact.claim}\n`
      if (fact.numeric_value) {
        context += `  Estimated: ${fact.numeric_value} ${fact.numeric_unit || 'units'}\n`
      }
      context += `  Source: ${fact.source_name} (${fact.source_date})\n`
    }
    context += `\n`
  }

  // Tax treatment
  if (grouped['tax_treatment']) {
    context += `TAX TREATMENT:\n`
    for (const fact of grouped['tax_treatment']) {
      context += `- ${fact.claim}\n`
      context += `  Source: ${fact.source_name} (${fact.source_date})\n`
    }
    context += `\n`
  }

  // Pending legislation
  if (grouped['pending_legislation']) {
    context += `PENDING LEGISLATION:\n`
    for (const fact of grouped['pending_legislation']) {
      context += `- ${fact.claim}\n`
      context += `  Source: ${fact.source_name} (${fact.source_date})\n`
    }
    context += `\n`
  }

  // Enforcement actions
  if (grouped['enforcement_action']) {
    context += `ENFORCEMENT HISTORY:\n`
    for (const fact of grouped['enforcement_action']) {
      context += `- ${fact.claim}\n`
      context += `  Source: ${fact.source_name} (${fact.source_date})\n`
    }
    context += `\n`
  }

  context += `=============================================\n`
  context += `CRITICAL INSTRUCTION:\n`
  context += `- ONLY use the verified facts listed above\n`
  context += `- If a regulatory requirement is NOT listed above, state "No verified data available for [requirement type]"\n`
  context += `- NEVER invent or hallucinate regulatory information\n`
  context += `- ALWAYS cite the source for each claim using the provided URL\n`
  context += `- If insufficient facts exist (<3 facts), return "INSUFFICIENT DATA" and recommend manual review\n`

  return context
}

/**
 * Main RAG function - gets facts and builds prompt context
 */
export async function prepareRAGContext(
  stateCode: string,
  stateName: string
): Promise<RAGResult> {
  const facts = await retrieveVerifiedFacts(stateCode)
  
  const hasData = facts.length >= 3 // Minimum 3 facts to generate a report
  const promptContext = buildPromptContext(facts, stateCode, stateName)
  
  return {
    hasData,
    facts,
    promptContext,
    insufficientStates: hasData ? [] : [stateCode]
  }
}

/**
 * Check if we have sufficient data for a state
 */
export async function hasSufficientData(stateCode: string): Promise<boolean> {
  const facts = await retrieveVerifiedFacts(stateCode)
  return facts.length >= 3
}

/**
 * Get all states that have sufficient data
 */
export async function getStatesWithSufficientData(): Promise<string[]> {
  const { data, error } = await supabase
    .from('regulatory_facts')
    .select('state_code')
    .eq('verification_status', 'verified')
    .is('expires_at', null)
    .or(`expires_at.gt.now(),expires_at.is.null`)

  if (error) {
    console.error('Error fetching states:', error)
    return []
  }

  // Count facts per state
  const counts: Record<string, number> = {}
  for (const fact of data) {
    counts[fact.state_code] = (counts[fact.state_code] || 0) + 1
  }

  // Return states with at least 3 facts
  return Object.entries(counts)
    .filter(([_, count]) => count >= 3)
    .map(([state]) => state)
}