// src/app/api/admin/regulatory/state-links/sync/route.ts
// POST - Sync all facts with updated regulator links

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all state regulator links
    const { data: links, error: linksError } = await supabase
      .from('state_regulator_links')
      .select('*')

    if (linksError) {
      return NextResponse.json({ error: linksError.message }, { status: 500 })
    }

    let updatedCount = 0

    // Update each state's facts with the correct source URL
    for (const link of links) {
      const sourceUrl = link.license_page_url || link.website_url
      
      const { data, error } = await supabase
        .from('regulatory_facts')
        .update({
          source_url: sourceUrl,
          source_name: link.regulator_name,
          updated_at: new Date().toISOString()
        })
        .eq('state_code', link.state_code)
        .select()

      if (!error && data) {
        updatedCount += data.length
      }
    }

    // Log the sync action
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'state_regulator_links',
      record_id: 'sync',
      action: 'SYNC',
      new_data: { updated_facts: updatedCount, timestamp: new Date().toISOString() },
      changed_by: user.id,
      changed_by_name: user.email,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} facts with current regulator URLs`,
      updatedCount
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}