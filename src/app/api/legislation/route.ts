// src/app/api/legislation/route.ts
// GET /api/legislation?state=WA - Public endpoint for legislation data

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get('state')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log(`📡 [API] Fetching legislation for state: ${state || 'ALL'}`)

    let query = supabase
      .from('legislation_tracker')
      .select('*')
      .order('introduced_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (state) {
      query = query.eq('state_code', state.toUpperCase())
    }
    
    if (status) {
      query = query.eq('status', status)
    } else {
      // Default to active bills only
      query = query.in('status', ['introduced', 'in_committee', 'passed_chamber', 'pending', 'enacted'])
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ [API] Error fetching legislation:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log(`✅ [API] Retrieved ${data?.length || 0} bills for ${state || 'all states'}`)

    // Transform data for client display
    const transformedData = data?.map(bill => ({
      id: bill.id,
      billNumber: bill.bill_number,
      title: bill.title,
      description: bill.description,
      status: formatBillStatus(bill.status),
      stateCode: bill.state_code,
      introducedDate: bill.introduced_date,
      lastActionDate: bill.updated_at,
      lastAction: extractLastAction(bill.description),
      progress: calculateProgress(bill.status),
      relevanceScore: bill.impact_assessment === 'high' ? 85 : 
                      bill.impact_assessment === 'medium' ? 50 : 
                      bill.impact_assessment === 'low' ? 25 : 50,
      category: detectCategory(bill.title, bill.description),
      officialUrl: bill.bill_url,
      summary: bill.summary
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length
    })
  } catch (error) {
    console.error('❌ [API] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper to format bill status
function formatBillStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'introduced': 'Introduced',
    'in_committee': 'In Committee',
    'passed_chamber': 'Passed Chamber',
    'passed': 'Passed',
    'enacted': 'Enacted',
    'failed': 'Failed',
    'vetoed': 'Vetoed',
    'pending': 'Pending'
  }
  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Helper to extract last action from description
function extractLastAction(description: string | null): string {
  if (!description) return 'No recent action'
  
  // Try to extract date and action (format: "2026-03-12: Action description")
  const match = description.match(/\d{4}-\d{2}-\d{2}:\s*(.+)/)
  if (match) {
    return match[1]
  }
  
  // Return first 100 chars if no date format found
  return description.length > 100 ? description.substring(0, 97) + '...' : description
}

// Helper to calculate progress based on status
function calculateProgress(status: string): number {
  const progressMap: Record<string, number> = {
    'introduced': 20,
    'in_committee': 40,
    'passed_chamber': 60,
    'passed': 80,
    'enacted': 100,
    'failed': 0,
    'vetoed': 0,
    'pending': 10
  }
  return progressMap[status] || 25
}

// Helper to detect category from title/description
function detectCategory(title: string, description: string | null): string {
  const text = `${title} ${description || ''}`.toLowerCase()
  
  if (text.includes('kiosk') || text.includes('atm')) return 'Kiosks'
  if (text.includes('money transmi')) return 'Money Transmission'
  if (text.includes('digital asset') || text.includes('virtual currency')) return 'Digital Assets'
  if (text.includes('blockchain')) return 'Blockchain'
  if (text.includes('crypto')) return 'Cryptocurrency'
  if (text.includes('consumer protect')) return 'Consumer Protection'
  if (text.includes('licens')) return 'Licensing'
  
  return 'General'
}