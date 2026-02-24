// src/app/api/debug/payment-flow/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the most recent data from all relevant tables
    const [reports, queue, payments, users] = await Promise.all([
      supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('report_generation_queue').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('users').select('id, email, company_name, subscription_tier').limit(5)
    ])
    
    return NextResponse.json({
      reports: reports.data || [],
      queue: queue.data || [],
      payments: payments.data || [],
      users: users.data || [],
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}