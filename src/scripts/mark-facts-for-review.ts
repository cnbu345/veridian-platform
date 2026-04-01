// src/scripts/mark-facts-for-review.ts
// Mark all AI-generated facts for manual verification

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function markFactsForReview() {
  console.log('========================================')
  console.log('MARKING FACTS FOR MANUAL REVIEW')
  console.log('========================================\n')

  // Get all verified facts
  const { data: facts, error } = await supabase
    .from('regulatory_facts')
    .select('id, state_code, claim, source_name')
    .eq('verification_status', 'verified')

  if (error) {
    console.error('Error fetching facts:', error.message)
    return
  }

  console.log(`Found ${facts?.length || 0} facts that need manual review\n`)

  // Mark each fact for review
  let updated = 0
  for (const fact of facts || []) {
    const { error: updateError } = await supabase
      .from('regulatory_facts')
      .update({
        review_required: true,
        review_reason: 'AI-generated fact - requires attorney verification against official source',
        verification_status: 'needs_update'
      })
      .eq('id', fact.id)

    if (updateError) {
      console.error(`Error updating fact ${fact.id}:`, updateError.message)
    } else {
      updated++
      console.log(`✓ Marked for review: ${fact.state_code} - ${fact.claim.substring(0, 60)}...`)
    }
  }

  console.log(`\n✅ Marked ${updated} facts for manual review`)
  console.log('\n⚠️  These facts now appear in the review queue for attorneys.')
  console.log('   Visit: /admin/regulatory/review-queue')
}

markFactsForReview().catch(console.error)