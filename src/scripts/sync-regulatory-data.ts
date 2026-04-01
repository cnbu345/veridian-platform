// src/scripts/sync-regulatory-data.ts
// Daily sync with NMLS/CSBS APIs - ALL 50 STATES

import { syncStateData } from '../lib/regulatory/external-apis/sync-regulator'

// ALL 50 US STATES
const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

// States with confirmed NMLS/CSBS data (expand as API access grows)
const STATES_WITH_KNOWN_DATA = new Set([
  'NY', 'CA', 'TX', 'FL', 'IL', 'WA', 'MA', 'NJ', 'CO', 
  'AZ', 'NV', 'UT', 'NH', 'WY', 'PA', 'GA', 'NC', 'VA', 
  'MD', 'MI', 'OH', 'TN', 'MO', 'MN', 'WI'
])

async function syncAllStates() {
  console.log('========================================')
  console.log('SYNCING REGULATORY DATA WITH NMLS/CSBS')
  console.log(`Started: ${new Date().toISOString()}`)
  console.log(`Total states: ${ALL_STATES.length}`)
  console.log('========================================\n')

  let totalNew = 0
  let totalUpdated = 0
  let totalConflicts = 0
  let totalErrors = 0
  let successCount = 0
  let noDataCount = 0

  for (const state of ALL_STATES) {
    const hasKnownData = STATES_WITH_KNOWN_DATA.has(state)
    console.log(`Syncing ${state}${hasKnownData ? ' (has known data)' : ' (checking)...'}`)
    
    const result = await syncStateData(state)
    
    if (result.errors.length === 0 && result.newFacts === 0 && result.conflicts === 0) {
      console.log(`  ℹ️  No new data available`)
      noDataCount++
    } else if (result.errors.length > 0) {
      console.log(`  ❌ Errors: ${result.errors.join(', ')}`)
      totalErrors += result.errors.length
    } else {
      console.log(`  ✅ New facts: ${result.newFacts}`)
      console.log(`  📝 Updated: ${result.updatedFacts}`)
      console.log(`  ⚠️  Conflicts: ${result.conflicts}`)
      successCount++
    }
    
    totalNew += result.newFacts
    totalUpdated += result.updatedFacts
    totalConflicts += result.conflicts
    
    // Rate limiting to avoid API throttling
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n========================================')
  console.log('SYNC SUMMARY')
  console.log('========================================')
  console.log(`States with data updates: ${successCount}`)
  console.log(`States with no data: ${noDataCount}`)
  console.log(`States with errors: ${totalErrors > 0 ? '⚠️ ' + totalErrors : 0}`)
  console.log('---')
  console.log(`Total new facts: ${totalNew}`)
  console.log(`Total updates: ${totalUpdated}`)
  console.log(`Total conflicts (need attorney review): ${totalConflicts}`)
  console.log(`\n✅ Sync complete: ${new Date().toISOString()}`)
  
  if (totalConflicts > 0) {
    console.log(`\n⚠️  ${totalConflicts} conflicts detected. Attorneys should review these in the admin dashboard.`)
  }
}

syncAllStates().catch(console.error)