// src/app/api/admin/reports/templates/[templateId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: { templateId: string } }
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

    const { templateId } = params
    const updates = await request.json()

    // Get current template for versioning
    const { data: currentTemplate } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    // Update template
    const { data, error } = await supabase
      .from('report_templates')
      .update({
        name: updates.name,
        description: updates.description,
        type: updates.type,
        thumbnail: updates.thumbnail,
        sections: updates.sections,
        styles: updates.styles,
        is_active: updates.is_active,
        is_default: updates.is_default,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single()

    if (error) throw error

    // Get latest version number
    const { data: versions } = await supabase
      .from('template_versions')
      .select('version')
      .eq('template_id', templateId)
      .order('version', { ascending: false })
      .limit(1)

    const newVersion = (versions?.[0]?.version || 0) + 1

    // Create new version
    await supabase
      .from('template_versions')
      .insert({
        template_id: templateId,
        version: newVersion,
        content: updates,
        created_by: user.id,
        comment: updates.version_comment || `Version ${newVersion}`,
        created_at: new Date().toISOString()
      })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { templateId: string } }
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

    const { templateId } = params

    // Check if template is default
    const { data: template } = await supabase
      .from('report_templates')
      .select('is_default')
      .eq('id', templateId)
      .single()

    if (template?.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default template' },
        { status: 400 }
      )
    }

    // Delete versions first (foreign key constraint)
    await supabase
      .from('template_versions')
      .delete()
      .eq('template_id', templateId)

    // Delete template
    const { error } = await supabase
      .from('report_templates')
      .delete()
      .eq('id', templateId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}