// src/app/api/admin/customers/[id]/templates/[templateId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> }
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

    const { id: customerId, templateId } = await params

    // Fetch the specific template
    const { data: template, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', customerId)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        logo_url: template.logo_url,
        styles: template.styles,
        sections: template.sections,
        is_default: template.is_default,
        created_at: template.created_at,
        updated_at: template.updated_at,
        usage_count: template.usage_count || 0
      }
    })
  } catch (error) {
    console.error('Error in template details API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> }
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

    const { id: customerId, templateId } = await params
    const updates = await request.json()

    // Update the template with new timestamp
    const { data: template, error } = await supabase
      .from('user_templates')
      .update({
        name: updates.name,
        description: updates.description,
        logo_url: updates.logo_url,
        styles: updates.styles,
        sections: updates.sections,
        updated_at: new Date().toISOString() // ← Update timestamp
      })
      .eq('id', templateId)
      .eq('user_id', customerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    // Create a version history entry
    await supabase
      .from('template_versions')
      .insert({
        template_id: templateId,
        version: (updates.version || 1) + 1,
        content: updates,
        created_by: user.id,
        comment: 'Admin updated template',
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        logo_url: template.logo_url,
        styles: template.styles,
        sections: template.sections,
        is_default: template.is_default,
        created_at: template.created_at,
        updated_at: template.updated_at,
        usage_count: template.usage_count || 0
      }
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; templateId: string }> }
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

    const { id: customerId, templateId } = await params

    // Check if this is the default template
    const { data: template } = await supabase
      .from('user_templates')
      .select('is_default')
      .eq('id', templateId)
      .eq('user_id', customerId)
      .single()

    if (template?.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete the default template' },
        { status: 400 }
      )
    }

    // Delete version history first (foreign key constraint)
    await supabase
      .from('template_versions')
      .delete()
      .eq('template_id', templateId)

    // Delete the template
    const { error } = await supabase
      .from('user_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', customerId)

    if (error) {
      console.error('Error deleting template:', error)
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}