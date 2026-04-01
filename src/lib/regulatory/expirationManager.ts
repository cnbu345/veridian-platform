// src/lib/regulatory/expirationManager.ts
// Phase 4: Auto-expiration and manual review (no RSS)

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: ReturnType<typeof createClient<Database>> | null = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
}

export interface ReviewItem {
  id: string
  fact_id: string
  state_code: string
  claim: string
  category: string
  reason: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  source_name: string
  source_url: string
  source_date: string
}

/**
 * Flag facts that need review based on age
 * Run this daily via cron job
 */
export async function flagAgedFactsForReview(): Promise<number> {
  if (!supabase) {
    console.error('[ExpirationManager] No Supabase client')
    return 0
  }

  // Facts older than 90 days need review
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString()

  console.log(`[ExpirationManager] Looking for facts last reviewed before: ${ninetyDaysAgoStr}`)

  // Find facts that haven't been reviewed in 90+ days
  const { data: oldFacts, error } = await supabase
    .from('regulatory_facts')
    .select('*')
    .eq('verification_status', 'verified')
    .eq('review_required', false)
    .or(`last_reviewed_at.is.null,last_reviewed_at.lt.${ninetyDaysAgoStr}`)

  if (error) {
    console.error('[ExpirationManager] Error finding old facts:', error.message)
    return 0
  }

  if (!oldFacts || oldFacts.length === 0) {
    console.log('[ExpirationManager] No facts need review')
    return 0
  }

  console.log(`[ExpirationManager] Found ${oldFacts.length} facts needing review`)

  let flagged = 0
  for (const fact of oldFacts) {
    let daysOld = 90 // default
    
    if (fact.last_reviewed_at) {
      const lastReviewed = new Date(fact.last_reviewed_at)
      daysOld = Math.floor((Date.now() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24))
    }

    console.log(`[ExpirationManager] Fact ${fact.id} (${fact.state_code}) is ${daysOld} days old`)

    // Update the fact to require review
    const { error: updateError } = await supabase
      .from('regulatory_facts')
      .update({
        review_required: true,
        review_reason: `Fact not reviewed in ${daysOld} days. Please verify if still accurate.`,
        verification_status: 'needs_update'
      })
      .eq('id', fact.id)

    if (updateError) {
      console.error(`[ExpirationManager] Error updating fact ${fact.id}:`, updateError.message)
      continue
    }

    // Determine priority based on category and age
    const priority = determinePriority(fact.category, daysOld)

    // Add to review queue (avoid duplicates)
    const { data: existing } = await supabase
      .from('regulatory_review_queue')
      .select('id')
      .eq('fact_id', fact.id)
      .eq('status', 'pending')
      .single()

    if (!existing) {
      const { error: queueError } = await supabase
        .from('regulatory_review_queue')
        .insert({
          fact_id: fact.id,
          reason: `Fact not reviewed in ${daysOld} days. Please verify accuracy.`,
          priority: priority,
          status: 'pending'
        })

      if (queueError) {
        console.error(`[ExpirationManager] Error adding to queue:`, queueError.message)
      } else {
        console.log(`[ExpirationManager] Added fact ${fact.id} to review queue with priority ${priority}`)
      }
    }

    flagged++
  }

  console.log(`[ExpirationManager] Flagged ${flagged} facts for review`)
  return flagged
}

/**
 * Determine priority based on category and age
 */
function determinePriority(category: string, daysOld: number): 'low' | 'medium' | 'high' | 'critical' {
  // Base priority by category
  let basePriority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  
  const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'license_requirement': 'high',
    'bonding_amount': 'medium',
    'fee_amount': 'medium',
    'timeline': 'medium',
    'regulator_contact': 'low',
    'enforcement_action': 'high',
    'pending_legislation': 'critical',
    'tax_treatment': 'medium',
    'reporting_requirement': 'low',
    'capital_requirement': 'high'
  }
  
  basePriority = priorityMap[category] || 'medium'
  
  // Age multiplier
  if (daysOld > 180) {
    // Escalate priority if very old
    if (basePriority === 'low') return 'medium'
    if (basePriority === 'medium') return 'high'
    if (basePriority === 'high') return 'critical'
  } else if (daysOld > 120) {
    if (basePriority === 'low') return 'medium'
    if (basePriority === 'medium') return 'high'
  }
  
  return basePriority
}

/**
 * Get all facts pending review
 */
export async function getPendingReviews(
  limit: number = 50,
  priority?: 'low' | 'medium' | 'high' | 'critical'
): Promise<ReviewItem[]> {
  if (!supabase) return []

  let query = supabase
    .from('regulatory_review_queue')
    .select(`
      id,
      fact_id,
      reason,
      priority,
      status,
      created_at,
      regulatory_facts!inner (
        id,
        state_code,
        claim,
        category,
        source_name,
        source_url,
        source_date
      )
    `)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)

  if (priority) {
    query = query.eq('priority', priority)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('[ExpirationManager] Error fetching pending reviews:', error?.message)
    return []
  }

  return data.map(item => {
    const fact = item.regulatory_facts as any
    return {
      id: item.id,
      fact_id: item.fact_id,
      state_code: fact?.state_code || 'unknown',
      claim: fact?.claim || 'Unknown',
      category: fact?.category || 'unknown',
      reason: item.reason,
      priority: item.priority,
      created_at: item.created_at,
      source_name: fact?.source_name || 'Unknown',
      source_url: fact?.source_url || '',
      source_date: fact?.source_date || ''
    }
  })
}

/**
 * Get review statistics
 */
export async function getReviewStats(): Promise<{
  pending: number
  reviewed: number
  byPriority: { critical: number; high: number; medium: number; low: number }
  byCategory: Record<string, number>
}> {
  if (!supabase) {
    return { pending: 0, reviewed: 0, byPriority: { critical: 0, high: 0, medium: 0, low: 0 }, byCategory: {} }
  }

  // Get total pending count
  const { count: pending } = await supabase
    .from('regulatory_review_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get total reviewed count
  const { count: reviewed } = await supabase
    .from('regulatory_review_queue')
    .select('*', { count: 'exact', head: true })
    .not('status', 'eq', 'pending')

  // Get priority counts by fetching all pending items and counting manually
  const { data: pendingItems, error } = await supabase
    .from('regulatory_review_queue')
    .select('priority')
    .eq('status', 'pending')

  const byPriority = { critical: 0, high: 0, medium: 0, low: 0 }
  
  if (pendingItems && !error) {
    for (const item of pendingItems) {
      if (item.priority === 'critical') byPriority.critical++
      else if (item.priority === 'high') byPriority.high++
      else if (item.priority === 'medium') byPriority.medium++
      else if (item.priority === 'low') byPriority.low++
    }
  }

  return {
    pending: pending || 0,
    reviewed: reviewed || 0,
    byPriority,
    byCategory: {}
  }
}

/**
 * Approve a fact (keep as is, reset review timer)
 */
export async function approveFact(factId: string, reviewerNotes?: string): Promise<boolean> {
  if (!supabase) return false

  // Update the fact
  const { error: factError } = await supabase
    .from('regulatory_facts')
    .update({
      review_required: false,
      review_reason: null,
      last_reviewed_at: new Date().toISOString(),
      verification_status: 'verified'
    })
    .eq('id', factId)

  if (factError) {
    console.error('[ExpirationManager] Error approving fact:', factError.message)
    return false
  }

  // Update the review queue
  const { error: queueError } = await supabase
    .from('regulatory_review_queue')
    .update({
      status: 'approved',
      reviewer_notes: reviewerNotes,
      resolved_at: new Date().toISOString()
    })
    .eq('fact_id', factId)
    .eq('status', 'pending')

  if (queueError) {
    console.error('[ExpirationManager] Error updating queue:', queueError.message)
  }

  return true
}

/**
 * Reject a fact (deprecate it)
 */
export async function rejectFact(factId: string, reason: string): Promise<boolean> {
  if (!supabase) return false

  // Deprecate the fact
  const { error: factError } = await supabase
    .from('regulatory_facts')
    .update({
      verification_status: 'deprecated',
      review_required: false,
      review_reason: `Rejected: ${reason}`,
      last_reviewed_at: new Date().toISOString()
    })
    .eq('id', factId)

  if (factError) {
    console.error('[ExpirationManager] Error rejecting fact:', factError.message)
    return false
  }

  // Update the review queue
  const { error: queueError } = await supabase
    .from('regulatory_review_queue')
    .update({
      status: 'rejected',
      reviewer_notes: reason,
      resolved_at: new Date().toISOString()
    })
    .eq('fact_id', factId)
    .eq('status', 'pending')

  if (queueError) {
    console.error('[ExpirationManager] Error updating queue:', queueError.message)
  }

  return true
}

/**
 * Update a fact with new information
 */
export async function updateFact(
  factId: string,
  updates: {
    claim?: string
    source_name?: string
    source_url?: string
    source_date?: string
    numeric_value?: number | null
    numeric_unit?: string | null
    notes?: string
    expires_at?: string | null
  },
  reviewerNotes?: string
): Promise<boolean> {
  if (!supabase) return false

  // Update the fact
  const { error: factError } = await supabase
    .from('regulatory_facts')
    .update({
      ...updates,
      review_required: false,
      review_reason: null,
      last_reviewed_at: new Date().toISOString(),
      verification_status: 'verified'
    })
    .eq('id', factId)

  if (factError) {
    console.error('[ExpirationManager] Error updating fact:', factError.message)
    return false
  }

  // Update the review queue
  const { error: queueError } = await supabase
    .from('regulatory_review_queue')
    .update({
      status: 'updated',
      reviewer_notes: reviewerNotes,
      suggested_update: updates.claim,
      resolved_at: new Date().toISOString()
    })
    .eq('fact_id', factId)
    .eq('status', 'pending')

  if (queueError) {
    console.error('[ExpirationManager] Error updating queue:', queueError.message)
  }

  return true
}