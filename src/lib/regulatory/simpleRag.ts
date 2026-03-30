// src/lib/regulatory/simpleRag.ts
// Simplified RAG - no embeddings required, works with any AI provider

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Helper function to get Supabase client (lazy initialization)
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null
let initAttempted = false

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance
  if (initAttempted) return null
  
  initAttempted = true
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Log what we have (without exposing full keys)
  console.log(`[SimpleRAG] Init - URL: ${supabaseUrl ? '✅' : '❌'}`)
  console.log(`[SimpleRAG] Service Role Key: ${supabaseServiceKey ? '✅' : '❌'}`)
  console.log(`[SimpleRAG] Anon Key: ${supabaseAnonKey ? '✅' : '❌'}`)
  
  // Use service role first, fall back to anon key
  const supabaseKey = supabaseServiceKey || supabaseAnonKey
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[SimpleRAG] Missing Supabase credentials')
    return null
  }
  
  console.log(`[SimpleRAG] Using ${supabaseServiceKey ? 'SERVICE ROLE' : 'ANON'} key`)
  
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey)
  return supabaseInstance
}

export interface RegulatoryFact {
  id: string
  state_code: string
  claim: string
  category: string
  source_name: string
  source_url: string
  source_date: string
  numeric_value: number | null
  numeric_unit: string | null
}

export interface SearchResult {
  fact: RegulatoryFact
  relevanceScore: number
  matchReason: 'category' | 'keyword' | 'exact'
}

/**
 * Search for relevant facts using keyword and category matching
 */
export async function searchRelevantFacts(
  query: string,
  stateCode: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error('[SimpleRAG] searchRelevantFacts: No client')
    return []
  }

  // SIMPLIFIED QUERY
  const { data: facts, error } = await supabase
    .from('regulatory_facts')
    .select('*')
    .eq('state_code', stateCode)
    .eq('verification_status', 'verified')
    .is('expires_at', null)

  if (error) {
    console.error('[SimpleRAG] Error fetching facts:', error.message)
    return []
  }

  if (!facts || facts.length === 0) {
    console.log(`[SimpleRAG] No facts found for ${stateCode}`)
    return []
  }

  console.log(`[SimpleRAG] Found ${facts.length} total facts for ${stateCode}`)

  const queryLower = query.toLowerCase()
  const scored: SearchResult[] = facts.map(fact => {
    let score = 0
    let matchReason: 'category' | 'keyword' | 'exact' = 'keyword'
    const claimLower = fact.claim.toLowerCase()
    
    // Exact phrase match (highest score)
    if (claimLower.includes(queryLower)) {
      score += 50
      matchReason = 'exact'
    }
    
    // Category-based keyword matching
    const categoryKeywords: Record<string, string[]> = {
      'license_requirement': ['license', 'required', 'must', 'need', 'permit', 'registration', 'bitlicense', 'money transmitter'],
      'timeline': ['time', 'month', 'day', 'week', 'process', 'duration', 'wait', 'period', 'long', 'how long', 'take'],
      'fee_amount': ['fee', 'cost', 'price', 'charge', 'payment', 'dollar', '$'],
      'bonding_amount': ['bond', 'surety', 'insurance', 'guarantee'],
      'tax_treatment': ['tax', 'income', 'federal', 'state tax', 'deduction', 'pay', 'irs'],
      'pending_legislation': ['bill', 'act', 'law', 'legislation', 'proposed', 'pending', 'effective'],
      'enforcement_action': ['enforcement', 'fine', 'penalty', 'action', 'settlement']
    }
    
    const keywords = categoryKeywords[fact.category] || []
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        score += 15
        if (matchReason !== 'exact') matchReason = 'category'
        break
      }
    }
    
    // Individual keyword matching
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3)
    for (const word of queryWords) {
      if (claimLower.includes(word)) {
        score += 5
      }
    }
    
    // Boost for recent sources
    const sourceDate = new Date(fact.source_date)
    const daysOld = (Date.now() - sourceDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysOld < 90) score += 10
    else if (daysOld < 180) score += 5
    
    return {
      fact: fact as RegulatoryFact,
      relevanceScore: score,
      matchReason
    }
  })
  
  const results = scored
    .filter(s => s.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
  
  console.log(`[SimpleRAG] Found ${results.length} relevant facts for ${stateCode}`)
  return results
}

/**
 * Build a prompt from relevant facts
 */
export function buildPromptFromFacts(
  query: string,
  stateCode: string,
  stateName: string,
  facts: SearchResult[]
): string {
  if (facts.length === 0) {
    return `
[INSUFFICIENT DATA FOR ${stateCode}]

WARNING: No verified regulatory facts exist in the database for ${stateName} (${stateCode}).

The AI cannot generate ANY regulatory claims for this state.

Please respond with: "Insufficient verified data available for ${stateName}. A compliance specialist must review this jurisdiction manually."

DO NOT generate any speculative or unverified regulatory information.
`
  }

  let prompt = `VERIFIED REGULATORY FACTS FOR ${stateName} (${stateCode})\n`
  prompt += `=============================================\n\n`
  prompt += `Query: ${query}\n\n`
  prompt += `Use ONLY the following verified facts to answer. DO NOT invent any information.\n\n`
  
  const grouped: Record<string, SearchResult[]> = {}
  for (const result of facts) {
    if (!grouped[result.fact.category]) {
      grouped[result.fact.category] = []
    }
    grouped[result.fact.category].push(result)
  }
  
  for (const [category, results] of Object.entries(grouped)) {
    prompt += `${category.toUpperCase().replace('_', ' ')}:\n`
    for (const result of results) {
      const relevanceStar = result.relevanceScore > 30 ? '★' : '☆'
      prompt += `${relevanceStar} ${result.fact.claim}\n`
      prompt += `   Source: ${result.fact.source_name} (${result.fact.source_date})\n`
      prompt += `   URL: ${result.fact.source_url}\n\n`
    }
  }
  
  prompt += `=============================================\n`
  prompt += `INSTRUCTIONS:\n`
  prompt += `1. ONLY use the facts listed above\n`
  prompt += `2. If information is missing, say "No verified data available"\n`
  prompt += `3. ALWAYS cite the source URL for each claim\n`
  prompt += `4. Never invent or hallucinate regulatory requirements\n`
  
  return prompt
}

/**
 * Check if a state has sufficient data
 */
export async function hasSufficientData(stateCode: string, minFacts: number = 3): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error('[SimpleRAG] hasSufficientData: No client')
    return false
  }
  
  // SIMPLIFIED QUERY - removed .or() which might be causing issues
  const { count, error } = await supabase
    .from('regulatory_facts')
    .select('*', { count: 'exact', head: true })
    .eq('state_code', stateCode)
    .eq('verification_status', 'verified')
    // Only check non-expired facts
    .filter('expires_at', 'is', null)

  if (error) {
    console.error(`[SimpleRAG] hasSufficientData error for ${stateCode}:`, error.message)
    return false
  }
  
  console.log(`[SimpleRAG] hasSufficientData(${stateCode}) = ${count || 0} facts, need ${minFacts}`)
  return (count || 0) >= minFacts
}

/**
 * Get data coverage summary
 */
export async function getDataCoverage(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient()
  if (!supabase) return {}
  
  const { data, error } = await supabase
    .from('regulatory_facts')
    .select('state_code')
    .eq('verification_status', 'verified')

  if (error || !data) {
    console.error('[SimpleRAG] Error getting coverage:', error?.message)
    return {}
  }

  const coverage: Record<string, number> = {}
  for (const fact of data) {
    coverage[fact.state_code] = (coverage[fact.state_code] || 0) + 1
  }
  return coverage
}