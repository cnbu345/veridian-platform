// src/app/api/admin/regulatory/state-links/[stateCode]/route.ts
// PUT - Update a state's regulator links

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ stateCode: string }> }
) {
  try {
    const { stateCode } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('state_regulator_links')
      .update({
        regulator_name: body.regulator_name,
        website_url: body.website_url,
        license_page_url: body.license_page_url,
        enforcement_page_url: body.enforcement_page_url,
        updated_at: new Date().toISOString()
      })
      .eq('state_code', stateCode)
      .select()
      .single()

    if (error) {
      console.error('Error updating regulator link:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the change
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'state_regulator_links',
      record_id: stateCode,
      action: 'UPDATE',
      new_data: data,
      changed_by: user.id,
      changed_by_name: user.email,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}