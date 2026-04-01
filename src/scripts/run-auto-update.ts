// src/scripts/run-auto-update.ts
// Phase 4: Run auto-update pipeline (simplified - no RSS)

import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env.local') })

async function runAutoUpdate() {
  console.log('========================================')
  console.log('PHASE 4: Auto-Update Pipeline (Simplified)')
  console.log(`Started: ${new Date().toISOString()}`)
  console.log('========================================\n')
  
  // Step 1: Flag aged facts for review
  console.log('📋 STEP 1: Flagging facts that need review (90+ days old)...')
  const { flagAgedFactsForReview, getReviewStats } = await import('../lib/regulatory/expirationManager.js')
  const flaggedCount = await flagAgedFactsForReview()
  console.log(`   Flagged ${flaggedCount} facts for review\n`)
  
  // Step 2: Get current review stats
  console.log('📋 STEP 2: Review Queue Status')
  const stats = await getReviewStats()
  console.log(`   Pending reviews: ${stats.pending}`)
  console.log(`   Total reviewed: ${stats.reviewed}`)
  console.log(`   By priority: Critical: ${stats.byPriority.critical}, High: ${stats.byPriority.high}, Medium: ${stats.byPriority.medium}, Low: ${stats.byPriority.low}\n`)
  
  // Step 3: Summary
  console.log('========================================')
  console.log('AUTO-UPDATE SUMMARY')
  console.log('========================================')
  console.log(`Facts flagged for review: ${flaggedCount}`)
  console.log(`Total pending reviews: ${stats.pending}`)
  console.log(`\n✅ Auto-update complete!`)
  console.log(`Finished: ${new Date().toISOString()}`)
  
  // Step 4: Alert if high priority items
  if (stats.byPriority.critical > 0) {
    console.log(`\n⚠️  ALERT: ${stats.byPriority.critical} CRITICAL facts need immediate review!`)
    console.log(`   Visit: /admin/regulatory/review-queue`)
  } else if (stats.byPriority.high > 0) {
    console.log(`\n📢 NOTICE: ${stats.byPriority.high} HIGH priority facts need review`)
  }
}

runAutoUpdate().catch(console.error)