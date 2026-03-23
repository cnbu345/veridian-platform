// src/app/api/admin/customers/[id]/templates/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: customerId } = await params

    // Get customer's subscription to check if they have template access
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier_id, status')
      .eq('user_id', customerId)
      .eq('status', 'active')
      .single()

    // Fetch templates for this customer
    const { data: templates, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('user_id', customerId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    // Format templates for display
    const formattedTemplates = (templates || []).map(template => ({
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
    }))

    return NextResponse.json({
      templates: formattedTemplates,
      hasTemplateAccess: subscription?.tier_id === 'monthly' || subscription?.tier_id === 'custom'
    })
  } catch (error) {
    console.error('Error in templates API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// src/app/api/admin/customers/[id]/templates/route.ts (update the POST method)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: customerId } = await params
    const template = await request.json()

    // Create duplicate template with fresh timestamps
    const { data, error } = await supabase
      .from('user_templates')
      .insert({
        user_id: customerId,
        name: template.name,
        description: template.description,
        logo_url: template.logo_url,
        styles: template.styles,
        sections: template.sections,
        is_default: false,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString() // ← Fresh timestamp
      })
      .select()
      .single()

    if (error) throw error

    // Create initial version history
    await supabase
      .from('template_versions')
      .insert({
        template_id: data.id,
        version: 1,
        content: template,
        created_by: user.id,
        comment: 'Duplicate of existing template',
        created_at: new Date().toISOString()
      })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to duplicate template:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate template' },
      { status: 500 }
    )
  }
}