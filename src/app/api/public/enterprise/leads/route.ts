// src/app/api/public/enterprise/leads/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a Supabase client with the service role key (this bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received lead submission:', body)
    
    const { 
      company_name, 
      contact_name, 
      contact_email, 
      contact_phone, 
      company_size, 
      message 
    } = body

    // Validate required fields
    if (!company_name || !contact_name || !contact_email) {
      return NextResponse.json(
        { error: 'Company name, contact name, and email are required' },
        { status: 400 }
      )
    }

    console.log('Attempting to insert into Supabase...')

    // Insert the lead using admin client (bypasses RLS)
    const { data: lead, error } = await supabaseAdmin
      .from('enterprise_leads')
      .insert({
        company_name,
        contact_name,
        contact_email,
        contact_phone: contact_phone || null,
        company_size: company_size || null,
        message: message || null,
        source: 'pricing_page',
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error details:', error)
      return NextResponse.json(
        { error: 'Failed to save lead', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    console.log('Lead saved successfully:', lead)

    // Create notifications for all admin users
    try {
      // Get all admin users
      const { data: admins, error: adminError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('is_admin', true)

      if (adminError) {
        console.error('Error fetching admins:', adminError)
      } else if (admins && admins.length > 0) {
        // Create notification for each admin
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'enterprise_lead',
          title: 'New Enterprise Lead',
          message: `${company_name} (${contact_name}) is interested in enterprise solutions`,
          data: {
            lead_id: lead.id,
            company_name,
            contact_name,
            contact_email,
            contact_phone,
            company_size,
            message_preview: message ? message.substring(0, 100) + (message.length > 100 ? '...' : '') : null
          },
          priority: 'high', // Enterprise leads are high priority
          link: `/admin/customers/enterprise/builder?lead=${lead.id}`,
          created_at: new Date().toISOString()
        }))

        const { error: notifError } = await supabaseAdmin
          .from('notifications')
          .insert(notifications)

        if (notifError) {
          console.error('Error creating notifications:', notifError)
        } else {
          console.log(`Created ${notifications.length} admin notifications`)
        }
      }
    } catch (notifError) {
      console.error('Failed to create notifications:', notifError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      message: 'Lead submitted successfully' 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}