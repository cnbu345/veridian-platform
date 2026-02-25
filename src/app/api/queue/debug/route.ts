// src/app/api/queue/debug/route.ts // Queue debug endpoint
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if the queue table exists and has records
    const { data: tables, error: tablesError } = await supabase
      .from('report_generation_queue')
      .select('*')
      .limit(10)
    
    // Check reports table
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    return NextResponse.json({
      queue: {
        exists: !tablesError,
        count: tables?.length || 0,
        data: tables || [],
        error: tablesError?.message
      },
      reports: {
        count: reports?.length || 0,
        data: reports || [],
        error: reportsError?.message
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}