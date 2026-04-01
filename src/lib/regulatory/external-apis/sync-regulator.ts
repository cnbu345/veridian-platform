// src/lib/regulatory/external-apis/sync-regulator.ts
// Main synchronization service that updates the database

import { createClient } from '@supabase/supabase-js'
import { fetchNMLSLicenseData, type NMLSLicenseData } from './nmls-client'
import { fetchCSBSRegulatoryActions, type CSBSStateData } from './csbs-client'
import type { SyncResult } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function syncStateData(stateCode: string): Promise<SyncResult> {
  const result: SyncResult = {
    state: stateCode,
    newFacts: 0,
    updatedFacts: 0,
    conflicts: 0,
    errors: []
  }

  try {
    const nmlsData = await fetchNMLSLicenseData(stateCode)
    const csbsData = await fetchCSBSRegulatoryActions(stateCode)

    if (!nmlsData && !csbsData) {
      result.errors.push('No external data available')
      return result
    }

    if (nmlsData) {
      const syncResult = await syncLicenseData(stateCode, nmlsData)
      result.newFacts += syncResult.newFacts
      result.updatedFacts += syncResult.updatedFacts
      result.conflicts += syncResult.conflicts
    }

    if (csbsData && csbsData.actions.length > 0) {
      const syncResult = await syncRegulatoryActions(stateCode, csbsData.actions)
      result.newFacts += syncResult.newFacts
      result.updatedFacts += syncResult.updatedFacts
    }

    await supabase.from('regulatory_audit_log').insert({
      table_name: 'external_sync',
      record_id: stateCode,
      action: 'SYNC',
      new_data: {
        nmls: nmlsData ? 'received' : 'none',
        csbs: csbsData ? `${csbsData.actions.length} actions` : 'none',
        result
      },
      changed_at: new Date().toISOString()
    })

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
  }

  return result
}

async function syncLicenseData(stateCode: string, apiData: NMLSLicenseData): Promise<{
  newFacts: number
  updatedFacts: number
  conflicts: number
}> {
  const { data: existing } = await supabase
    .from('regulatory_facts')
    .select('id, claim')
    .eq('state_code', stateCode)
    .eq('category', 'license_requirement')
    .single()

  const claim = `In ${apiData.state}, ${apiData.license_name} required for cryptocurrency and digital asset businesses.`

  if (!existing) {
    const { error } = await supabase
      .from('regulatory_facts')
      .insert({
        state_code: stateCode,
        claim: claim,
        category: 'license_requirement',
        source_name: 'NMLS API',
        source_url: apiData.source_url,
        source_date: apiData.last_updated,
        verification_status: 'needs_update',
        review_required: true,
        review_reason: 'Auto-synced from NMLS - requires attorney verification'
      })
    
    if (!error) {
      return { newFacts: 1, updatedFacts: 0, conflicts: 0 }
    }
  } else if (existing.claim !== claim) {
    await supabase
      .from('regulatory_facts')
      .update({
        review_required: true,
        review_reason: `NMLS data differs from existing fact. API says: "${claim}"`,
        verification_status: 'needs_update'
      })
      .eq('id', existing.id)
    
    return { newFacts: 0, updatedFacts: 0, conflicts: 1 }
  }

  return { newFacts: 0, updatedFacts: 0, conflicts: 0 }
}

async function syncRegulatoryActions(stateCode: string, actions: any[]): Promise<{
  newFacts: number
  updatedFacts: number
}> {
  let newFacts = 0
  
  for (const action of actions) {
    const { data: existing } = await supabase
      .from('regulatory_facts')
      .select('id')
      .eq('state_code', stateCode)
      .eq('category', 'enforcement_action')
      .eq('source_url', action.source_url)
      .single()

    if (!existing) {
      const claim = `${action.entity}: ${action.description} (${action.type}, ${action.date})`
      
      const { error } = await supabase
        .from('regulatory_facts')
        .insert({
          state_code: stateCode,
          claim: claim,
          category: 'enforcement_action',
          source_name: 'CSBS API',
          source_url: action.source_url,
          source_date: action.date,
          verification_status: 'needs_update',
          review_required: true,
          review_reason: 'Auto-synced from CSBS - requires attorney verification',
          numeric_value: action.penalty,
          numeric_unit: 'USD'
        })
      
      if (!error) {
        newFacts++
      }
    }
  }
  
  return { newFacts, updatedFacts: 0 }
}