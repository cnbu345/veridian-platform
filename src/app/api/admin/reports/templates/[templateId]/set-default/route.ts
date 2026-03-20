// src/app/api/admin/reports/templates/[templateId]/set-default/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Verify admin access
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // CRITICAL: MUST await params BEFORE accessing templateId
    const { templateId } = await params

    // First, remove default from all templates
    await supabase
      .from('report_templates')
      .update({ is_default: false })
      .eq('is_default', true)

    // Set this template as default
    const { data, error } = await supabase
      .from('report_templates')
      .update({ is_default: true })
      .eq('id', templateId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      template: data 
    })
  } catch (error) {
    console.error('Failed to set default template:', error)
    return NextResponse.json(
      { error: 'Failed to set default template' },
      { status: 500 }
    )
  }
}