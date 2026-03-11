// src/app/api/admin/customers/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Valid customer ID is required' },
        { status: 400 }
      )
    }

    // First, get the user with basic info and health data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        company_name,
        subscription_tier,
        created_at,
        last_login,
        role,
        is_admin,
        customer_health (*),
        user_subscriptions (*)
      `)
      .eq('id', id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get reports separately (no ambiguity)
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, created_at, status, company_name')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (reportsError) {
      console.error('Reports fetch error:', reportsError)
    }

    // Get consultations separately (no ambiguity)
    const { data: consultations, error: consultationsError } = await supabase
      .from('consultations')
      .select('id, consultation_date, status, consultation_type')
      .eq('user_id', id)
      .order('consultation_date', { ascending: false })
      .limit(5)

    if (consultationsError) {
      console.error('Consultations fetch error:', consultationsError)
    }

    // Get support tickets - need to specify which relationship
    // We want tickets created BY this user, not assigned TO this user
    const { data: tickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('id, subject, status, priority, created_at')
      .eq('user_id', id)  // This is the key - we're specifying user_id, not assigned_to
      .order('created_at', { ascending: false })
      .limit(5)

    if (ticketsError) {
      console.error('Tickets fetch error:', ticketsError)
    }

    // Format the response
    const response = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at,
        last_login: user.last_login,
        role: user.role,
        is_admin: user.is_admin
      },
      health: user.customer_health?.[0] || null,
      subscription: user.user_subscriptions?.[0] || null,
      recentActivity: {
        reports: reports || [],
        consultations: consultations || [],
        tickets: tickets || []
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Failed to fetch customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Update user data
    if (body.user) {
      const { error: userError } = await supabase
        .from('users')
        .update(body.user)
        .eq('id', id)

      if (userError) throw userError
    }

    // Update health data
    if (body.health) {
      // Check if health record exists
      const { data: existingHealth } = await supabase
        .from('customer_health')
        .select('id')
        .eq('user_id', id)
        .maybeSingle()

      if (existingHealth) {
        // Update existing
        const { error: healthError } = await supabase
          .from('customer_health')
          .update({
            ...body.health,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', id)

        if (healthError) throw healthError
      } else {
        // Insert new
        const { error: healthError } = await supabase
          .from('customer_health')
          .insert({
            user_id: id,
            ...body.health,
            updated_at: new Date().toISOString()
          })

        if (healthError) throw healthError
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to update customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}