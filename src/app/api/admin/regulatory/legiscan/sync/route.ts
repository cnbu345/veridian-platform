// src/app/api/admin/regulatory/legiscan/sync/route.ts
// POST - Sync bills from LegiScan API for any state or all states

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUsageStats, recordSyncUsage } from '@/lib/regulatory/legiscan-usage'

const LEGISCAN_API_KEY = process.env.LEGISCAN_API_KEY
const LEGISCAN_API_URL = 'https://api.legiscan.com'
const MONTHLY_LIMIT = 30000

// Complete list of all 50 states with their LegiScan IDs
const LEGISCAN_STATES = [
  { id: 1, code: 'AK', name: 'Alaska' }, { id: 2, code: 'AL', name: 'Alabama' },
  { id: 3, code: 'AR', name: 'Arkansas' }, { id: 4, code: 'AZ', name: 'Arizona' },
  { id: 5, code: 'CA', name: 'California' }, { id: 6, code: 'CO', name: 'Colorado' },
  { id: 7, code: 'CT', name: 'Connecticut' }, { id: 8, code: 'DE', name: 'Delaware' },
  { id: 9, code: 'FL', name: 'Florida' }, { id: 10, code: 'GA', name: 'Georgia' },
  { id: 11, code: 'HI', name: 'Hawaii' }, { id: 12, code: 'IA', name: 'Iowa' },
  { id: 13, code: 'ID', name: 'Idaho' }, { id: 14, code: 'IL', name: 'Illinois' },
  { id: 15, code: 'IN', name: 'Indiana' }, { id: 16, code: 'KS', name: 'Kansas' },
  { id: 17, code: 'KY', name: 'Kentucky' }, { id: 18, code: 'LA', name: 'Louisiana' },
  { id: 19, code: 'MA', name: 'Massachusetts' }, { id: 20, code: 'MD', name: 'Maryland' },
  { id: 21, code: 'ME', name: 'Maine' }, { id: 22, code: 'MI', name: 'Michigan' },
  { id: 23, code: 'MN', name: 'Minnesota' }, { id: 24, code: 'MO', name: 'Missouri' },
  { id: 25, code: 'MS', name: 'Mississippi' }, { id: 26, code: 'MT', name: 'Montana' },
  { id: 27, code: 'NC', name: 'North Carolina' }, { id: 28, code: 'ND', name: 'North Dakota' },
  { id: 29, code: 'NE', name: 'Nebraska' }, { id: 30, code: 'NH', name: 'New Hampshire' },
  { id: 31, code: 'NJ', name: 'New Jersey' }, { id: 32, code: 'NM', name: 'New Mexico' },
  { id: 33, code: 'NV', name: 'Nevada' }, { id: 34, code: 'NY', name: 'New York' },
  { id: 35, code: 'OH', name: 'Ohio' }, { id: 36, code: 'OK', name: 'Oklahoma' },
  { id: 37, code: 'OR', name: 'Oregon' }, { id: 38, code: 'PA', name: 'Pennsylvania' },
  { id: 39, code: 'RI', name: 'Rhode Island' }, { id: 40, code: 'SC', name: 'South Carolina' },
  { id: 41, code: 'SD', name: 'South Dakota' }, { id: 42, code: 'TN', name: 'Tennessee' },
  { id: 43, code: 'TX', name: 'Texas' }, { id: 44, code: 'UT', name: 'Utah' },
  { id: 45, code: 'VA', name: 'Virginia' }, { id: 46, code: 'VT', name: 'Vermont' },
  { id: 47, code: 'WA', name: 'Washington' }, { id: 48, code: 'WI', name: 'Wisconsin' },
  { id: 49, code: 'WV', name: 'West Virginia' }, { id: 50, code: 'WY', name: 'Wyoming' }
]

// Crypto-related keywords
const CRYPTO_KEYWORDS = [
  'cryptocurrency', 'digital asset', 'virtual currency', 'bitcoin', 'crypto', 'kiosk'
]

// Skip ceremonial keywords
const SKIP_KEYWORDS = [
  'recognize', 'honor', 'commend', 'memorial', 'commemorate', 'celebrate',
  'congratulate', 'in memory of', 'declaring', 'designating', 'week of', 'month of',
  'resolution', 'commending', 'birthday', 'anniversary', 'tax on stocks', 'wealth tax',
  'unclaimed property', 'energy use'
]

// Helper function to normalize date (preserve the exact date from API, no timezone conversion)
function normalizeDate(dateString: string | null): string | null {
  if (!dateString) return null
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : dateString.split('T')[0]
}

// Check if bill is relevant
function isRelevantBill(title: string, billNumber: string): boolean {
  const lowerTitle = title.toLowerCase()
  
  for (const skip of SKIP_KEYWORDS) {
    if (lowerTitle.includes(skip)) return false
  }
  
  const cryptoTerms = ['cryptocurrency', 'digital asset', 'virtual currency', 'bitcoin', 'crypto', 'kiosk', 'blockchain']
  return cryptoTerms.some(term => lowerTitle.includes(term))
}

// Normalize bill number for display
function normalizeBillNumber(billNumber: string): string {
  return billNumber
}

// Determine status from last action text and progress
function determineStatusFromLastAction(progress: number, lastAction: string): string {
  const lowerAction = lastAction.toLowerCase()
  
  // ========== ENACTED / APPROVED ==========
  if (lowerAction.includes('chapter') || 
      lowerAction.includes('enacted') || 
      lowerAction.includes('approved by governor') ||
      lowerAction.includes('signed by governor') ||
      lowerAction.includes('became law')) {
    return 'enacted'
  }
  
  // ========== PASSED / ENGROSSED / ENROLLED ==========
  if (lowerAction.includes('engrossed') || 
      lowerAction.includes('enrolled') ||
      lowerAction.includes('passed house') ||
      lowerAction.includes('passed senate') ||
      lowerAction.includes('passed legislature') ||
      lowerAction.includes('third reading passed') ||
      lowerAction.includes('ordered transmitted') ||
      lowerAction.includes('sent to governor')) {
    return 'passed_house'
  }
  
  // ========== FAILED / DIED ==========
  if (lowerAction.includes('died') || 
      lowerAction.includes('failed') || 
      lowerAction.includes('rejected') ||
      lowerAction.includes('defeated') ||
      lowerAction.includes('not passed') ||
      (lowerAction.includes('laid on table') && !lowerAction.includes('refer'))) {
    return 'failed'
  }
  
  // ========== VETOED ==========
  if (lowerAction.includes('veto')) {
    return 'vetoed'
  }
  
  // ========== IN COMMITTEE ==========
  if (lowerAction.includes('committee') ||
      lowerAction.includes('subcommittee') ||
      lowerAction.includes('referred to') ||
      lowerAction.includes('favorable')) {
    return 'in_committee'
  }
  
  // ========== Use progress codes ==========
  if (progress === 5) return 'enacted'
  if (progress === 6) return 'failed'
  if (progress === 7) return 'vetoed'
  if (progress === 3 || progress === 4) return 'passed_house'
  if (progress === 2) return 'in_committee'
  
  return 'introduced'
}

// Fetch full bill details from LegiScan
async function fetchFullBillDetails(billId: number) {
  try {
    const url = `${LEGISCAN_API_URL}/?key=${LEGISCAN_API_KEY}&op=getBill&id=${billId}`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.bill) {
      return null
    }
    
    const bill = data.bill
    
    // Extract introduced date from history
    let introducedDate: string | null = null
    let progress = bill.progress || 1
    let lastAction = ''
    let lastActionDate: string | null = null
    
    // Parse history to find introduction date and last action
    if (bill.history && Array.isArray(bill.history) && bill.history.length > 0) {
      // Look for the earliest date that indicates introduction
      // Introduction can be: "Introduced", "Filed", "First reading", "Prefiled", "Referred to committee"
      for (const event of bill.history) {
        const action = event.action?.toLowerCase() || ''
        const date = event.date
        
        // Look for introduction-related actions
        if (action.includes('introduc') || 
            action.includes('filed') || 
            action.includes('first reading') ||
            action.includes('prefiled')) {
          if (date && !introducedDate) {
            introducedDate = normalizeDate(date)
          }
        }
        
        // Also track progress based on history
        if (action.includes('pass')) progress = Math.max(progress, 3)
        if (action.includes('enact')) progress = 5
        if (action.includes('fail')) progress = 6
        if (action.includes('veto')) progress = 7
      }
      
      // Get the most recent action for last_action
      const latestEvent = bill.history[bill.history.length - 1]
      if (latestEvent && latestEvent.action) {
        lastAction = latestEvent.action
        if (latestEvent.date) {
          lastActionDate = normalizeDate(latestEvent.date)
        }
      }
    }
    
    // If no introduction date found from history, use the status_date
    if (!introducedDate && bill.status_date) {
      introducedDate = normalizeDate(bill.status_date)
    }
    
    // If still no introduction date, use the bill's created date
    if (!introducedDate && bill.created) {
      introducedDate = normalizeDate(bill.created)
    }
    
    // Final fallback - DO NOT use last_action_date as introduced date
    if (!introducedDate) {
      introducedDate = new Date().toISOString().split('T')[0]
    }
    
    // If we have a last action from bill directly, use that (as fallback)
    if (bill.last_action && !lastAction) {
      lastAction = bill.last_action
      if (bill.last_action_date) {
        lastActionDate = normalizeDate(bill.last_action_date)
      }
    }
    
    // Build formatted last action string
    let formattedLastAction = lastAction
    if (lastActionDate && lastAction) {
      formattedLastAction = `${lastActionDate}: ${lastAction}`
    } else if (lastActionDate) {
      formattedLastAction = `${lastActionDate}: Status update`
    }
    
    console.log(`      📅 Found introduced date: ${introducedDate} from history for ${bill.bill_number}`)
    
    return {
      bill_id: bill.bill_id,
      bill_number: bill.bill_number,
      title: bill.title || '',
      progress: progress,
      introduced_date: introducedDate,
      last_action: formattedLastAction,
      raw_last_action: lastAction
    }
  } catch (error) {
    console.error(`Error fetching bill ${billId}:`, error)
    return null
  }
}

// Search bills using state code
async function searchBills(stateCode: string, keyword: string, year: number) {
  try {
    const url = `${LEGISCAN_API_URL}/?key=${LEGISCAN_API_KEY}&op=getSearch&state=${stateCode}&query=${encodeURIComponent(keyword)}&year=${year}`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status !== 'OK') {
      console.log(`   ⚠️ Search failed: ${data.status}`)
      return []
    }
    
    const searchResult = data.searchresult
    if (!searchResult) {
      return []
    }
    
    // Extract bills from the response (they are stored as numeric keys)
    const bills = []
    for (let i = 0; i < 100; i++) {
      if (searchResult[i]) {
        bills.push(searchResult[i])
      } else {
        break
      }
    }
    
    return bills
  } catch (error) {
    console.error(`Error searching bills for ${stateCode}:`, error)
    return []
  }
}

// Sync a single state
async function syncSingleState(stateCode: string, year: number, userId: string) {
  const supabase = await createClient()
  let totalAdded = 0
  let totalUpdated = 0
  let totalQueries = 0
  const allBills = new Map()

  const stateInfo = LEGISCAN_STATES.find(s => s.code === stateCode)
  console.log(`\n📍 Processing ${stateInfo?.name || stateCode} (${stateCode})...`)

  for (const keyword of CRYPTO_KEYWORDS) {
    console.log(`   🔍 Searching for "${keyword}"...`)
    
    const bills = await searchBills(stateCode, keyword, year)
    totalQueries++
    
    console.log(`   📊 Found ${bills.length} total results for "${keyword}"`)
    
    let relevantCount = 0
    for (const bill of bills) {
      // Skip if not the right state
      if (bill.state !== stateCode) {
        continue
      }
      
      // Check if relevant
      if (!isRelevantBill(bill.title, bill.bill_number)) {
        continue
      }
      
      relevantCount++
      
      if (!allBills.has(bill.bill_id)) {
        console.log(`   📄 Fetching details for ${bill.bill_number}...`)
        const billDetails = await fetchFullBillDetails(bill.bill_id)
        totalQueries++
        
        if (billDetails) {
          allBills.set(bill.bill_id, {
            bill_id: bill.bill_id,
            bill_number: bill.bill_number,
            title: billDetails.title,
            progress: billDetails.progress,
            introduced_date: billDetails.introduced_date,
            last_action: billDetails.last_action,
            raw_last_action: billDetails.raw_last_action
          })
        } else {
          // Fallback to search result data
          const lastActionDate = normalizeDate(bill.last_action_date)
          const lastAction = lastActionDate ? `${lastActionDate}: ${bill.last_action || 'Status update'}` : bill.last_action
          allBills.set(bill.bill_id, {
            bill_id: bill.bill_id,
            bill_number: bill.bill_number,
            title: bill.title,
            progress: 1,
            introduced_date: normalizeDate(bill.last_action_date),
            last_action: lastAction,
            raw_last_action: bill.last_action || ''
          })
        }
      }
    }
    
    console.log(`   📊 Found ${relevantCount} relevant ${stateCode} bills for "${keyword}"`)
    
    // Rate limiting between keyword searches
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n   📋 Total relevant ${stateCode} bills found: ${allBills.size}`)

  for (const bill of allBills.values()) {
    const normalizedBillNumber = normalizeBillNumber(bill.bill_number)
    const status = determineStatusFromLastAction(bill.progress, bill.raw_last_action || '')
    const introducedDate = bill.introduced_date || new Date().toISOString().split('T')[0]
    const billUrl = `https://legiscan.com/${stateCode}/bill/${bill.bill_number}/${year}`
    
    // Use last_action as description
    const description = bill.last_action || ''
    
    console.log(`   📝 Bill: ${normalizedBillNumber} - Status: ${status} (progress: ${bill.progress}) - Introduced: ${introducedDate}`)
    if (description) {
      console.log(`      📋 Last Action: ${description.substring(0, 80)}...`)
    }
    
    // Check if bill already exists
    const { data: existing } = await supabase
      .from('legislation_tracker')
      .select('id, status')
      .eq('state_code', stateCode)
      .eq('bill_number', normalizedBillNumber)
      .maybeSingle()

    if (existing) {
      if (existing.status !== status || existing.introduced_date !== introducedDate) {
        await supabase
          .from('legislation_tracker')
          .update({
            status: status,
            introduced_date: introducedDate,
            description: description,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
        totalUpdated++
        console.log(`      🔄 Updated: ${normalizedBillNumber} (${existing.status} → ${status}, date: ${introducedDate})`)
      }
    } else {
      const { error } = await supabase
        .from('legislation_tracker')
        .insert({
          state_code: stateCode,
          bill_number: normalizedBillNumber,
          title: bill.title,
          description: description,
          status: status,
          introduced_date: introducedDate,
          bill_url: billUrl,
          legiscan_bill_id: bill.bill_id,
          created_by: userId
        })

      if (!error) {
        totalAdded++
        console.log(`✅ Added: ${normalizedBillNumber} - ${status} (Introduced: ${introducedDate})`)
      } else {
        console.log(`❌ Error adding ${normalizedBillNumber}: ${error.message}`)
      }
    }
  }

  return { added: totalAdded, updated: totalUpdated, queries: totalQueries }
}

export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 LEGISCAN SYNC STARTED')
  console.log('='.repeat(60) + '\n')
  
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!LEGISCAN_API_KEY) {
      return NextResponse.json({ error: 'LegiScan API key not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { year = new Date().getFullYear(), stateCode } = body

    // Check usage limit before starting
    const usageStats = await getUsageStats()
    if (usageStats.isOverLimit) {
      return NextResponse.json({ 
        error: `Monthly API limit reached (${MONTHLY_LIMIT.toLocaleString()} queries). Please try again next month.`,
        limitReached: true,
        remainingQueries: 0
      }, { status: 429 })
    }

    let totalAdded = 0
    let totalUpdated = 0
    let totalQueries = 0

    // If stateCode is provided, sync only that state
    if (stateCode) {
      console.log(`🎯 Target: Single state (${stateCode})`)
      console.log(`📅 Year: ${year}\n`)
      
      const result = await syncSingleState(stateCode, year, user.id)
      totalAdded = result.added
      totalUpdated = result.updated
      totalQueries = result.queries
    } 
    // Otherwise, sync all 50 states
    else {
      console.log(`🎯 Target: All 50 states`)
      console.log(`📅 Year: ${year}\n`)
      
      for (const state of LEGISCAN_STATES) {
        const result = await syncSingleState(state.code, year, user.id)
        totalAdded += result.added
        totalUpdated += result.updated
        totalQueries += result.queries
        
        // Rate limiting between states
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Record the usage
    await recordSyncUsage(totalQueries)

    console.log('\n' + '='.repeat(60))
    console.log('📊 SYNC SUMMARY')
    console.log('='.repeat(60))
    console.log(`   Added: ${totalAdded}`)
    console.log(`   Updated: ${totalUpdated}`)
    console.log(`   API Queries: ${totalQueries}`)
    console.log('='.repeat(60) + '\n')

    return NextResponse.json({
      success: true,
      message: `Added ${totalAdded} bills, updated ${totalUpdated}. Used ${totalQueries} API queries.`,
      added: totalAdded,
      updated: totalUpdated,
      queries: totalQueries
    })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}