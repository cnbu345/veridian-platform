// src/app/api/admin/sales/leads/[id]/stage-history/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: history, error } = await supabase
      .from('deal_stage_history')
      .select(`
        *,
        changed_by_user:users!changed_by (
          email,
          full_name
        )
      `)
      .eq('lead_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error('Error fetching stage history:', error)
    return NextResponse.json({ error: 'Failed to fetch stage history' }, { status: 500 })
  }
}