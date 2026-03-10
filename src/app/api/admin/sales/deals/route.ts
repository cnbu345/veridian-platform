// src/app/api/admin/sales/deals/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or sales
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    if (userError || (!userData?.is_admin && userData?.role !== 'sales')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['company_name', 'value', 'stage']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }

    // Create the deal/lead
    const { data: deal, error: insertError } = await supabase
      .from('leads')
      .insert({
        company_name: body.company_name,
        company_website: body.company_website,
        contact_name: body.contact_name,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        value: body.value,
        probability: body.probability || 0,
        stage: body.stage,
        source: body.source || 'manual',
        assigned_to: body.assigned_to || user.id,
        notes: body.notes,
        next_action: body.next_action,
        next_action_date: body.next_action_date,
        tags: body.tags || ['manual_entry'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating deal:', insertError)
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
    }

    // Log activity
    await supabase.from('lead_activities').insert({
      lead_id: deal.id,
      type: 'note',
      description: 'Deal created manually',
      metadata: { 
        created_by: user.id,
        value: body.value,
        stage: body.stage
      },
      created_by: user.id
    })

    return NextResponse.json({ success: true, deal })

  } catch (error) {
    console.error('Deal creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}