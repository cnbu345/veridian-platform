// src/app/api/admin/customers/[id]/templates/[templateId]/set-default/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

    // First, remove default from all templates for this customer
    await supabase
      .from('user_templates')
      .update({ 
        is_default: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', customerId)

    // Set this template as default with updated timestamp
    const { data: template, error } = await supabase
      .from('user_templates')
      .update({ 
        is_default: true,
        updated_at: new Date().toISOString() // ← Update timestamp
      })
      .eq('id', templateId)
      .eq('user_id', customerId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Failed to set default template:', error)
    return NextResponse.json(
      { error: 'Failed to set default template' },
      { status: 500 }
    )
  }
}