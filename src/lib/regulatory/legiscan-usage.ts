// src/lib/regulatory/legiscan-usage.ts
// LegiScan API usage tracking

import { createClient } from '@/lib/supabase/server'

const MONTHLY_LIMIT = 30000
const SYNC_BUFFER = 500 // Buffer to prevent hitting the limit

export interface UsageStats {
  currentMonth: number
  remaining: number
  percentageUsed: number
  isNearLimit: boolean
  isOverLimit: boolean
  lastSyncDate: string | null
  syncsThisMonth: number
}

export async function getUsageStats(): Promise<UsageStats> {
  const supabase = await createClient()
  
  // Get first day of current month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  // Get all sync logs for this month
  const { data: syncs, error } = await supabase
    .from('regulatory_audit_log')
    .select('new_data, changed_at')
    .eq('table_name', 'legiscan_sync')
    .eq('action', 'SYNC')
    .gte('changed_at', firstDayOfMonth)
    .order('changed_at', { ascending: false })

  if (error) {
    console.error('Error fetching usage stats:', error)
    return {
      currentMonth: 0,
      remaining: MONTHLY_LIMIT,
      percentageUsed: 0,
      isNearLimit: false,
      isOverLimit: false,
      lastSyncDate: null,
      syncsThisMonth: 0
    }
  }

  // Calculate total queries used this month
  let totalQueries = 0
  let lastSyncDate: string | null = null
  
  for (const sync of syncs || []) {
    const queries = sync.new_data?.queries || 0
    totalQueries += queries
    if (!lastSyncDate && sync.changed_at) {
      lastSyncDate = sync.changed_at
    }
  }

  const remaining = MONTHLY_LIMIT - totalQueries
  const percentageUsed = (totalQueries / MONTHLY_LIMIT) * 100
  const isNearLimit = remaining <= SYNC_BUFFER
  const isOverLimit = remaining <= 0

  return {
    currentMonth: totalQueries,
    remaining: Math.max(0, remaining),
    percentageUsed,
    isNearLimit,
    isOverLimit,
    lastSyncDate,
    syncsThisMonth: syncs?.length || 0
  }
}

export async function canSync(): Promise<{ allowed: boolean; reason?: string; stats?: UsageStats }> {
  const stats = await getUsageStats()
  
  if (stats.isOverLimit) {
    return {
      allowed: false,
      reason: `Monthly API limit reached (${MONTHLY_LIMIT.toLocaleString()} queries). Reset on ${new Date().toLocaleDateString()}`,
      stats
    }
  }
  
  if (stats.isNearLimit) {
    return {
      allowed: true,
      reason: `Warning: Only ${stats.remaining.toLocaleString()} API queries remaining this month`,
      stats
    }
  }
  
  return { allowed: true, stats }
}

export async function recordSyncUsage(queriesUsed: number): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get current month's usage
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  const { data: existing } = await supabase
    .from('regulatory_audit_log')
    .select('id, new_data')
    .eq('table_name', 'legiscan_usage')
    .eq('action', 'MONTHLY')
    .gte('changed_at', firstDayOfMonth)
    .maybeSingle()
  
  if (existing) {
    const currentQueries = existing.new_data?.total_queries || 0
    await supabase
      .from('regulatory_audit_log')
      .update({
        new_data: {
          total_queries: currentQueries + queriesUsed,
          last_sync: new Date().toISOString(),
          syncs: (existing.new_data?.syncs || 0) + 1
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('regulatory_audit_log')
      .insert({
        table_name: 'legiscan_usage',
        record_id: new Date().toISOString(),
        action: 'MONTHLY',
        new_data: {
          total_queries: queriesUsed,
          last_sync: new Date().toISOString(),
          syncs: 1,
          month: now.getMonth() + 1,
          year: now.getFullYear()
        },
        changed_by: user?.id,
        changed_by_name: user?.email,
        changed_at: new Date().toISOString()
      })
  }
}