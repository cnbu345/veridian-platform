// src/app/api/admin/sales/leads/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // Change this line
) {
  try {
    console.log('1. Starting GET request')
    
    const supabase = await createClient()
    console.log('2. Supabase client created')
    
    // Await the params Promise before accessing its properties
    const { id } = await params
    console.log('3. Extracted ID:', id)
    
    // First, check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('4. Auth check - User:', user?.id, 'Error:', authError)
    
    if (authError || !user) {
      console.log('5. Authentication failed')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('6. Fetching lead with ID:', id)
    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
            *,
            assigned_to_user:users!leads_assigned_to_fkey (
            email,
            full_name
            )
        `)
      .eq('id', id)
      .single()
    
    console.log('7. Lead query result - Lead:', lead, 'Error:', error)
    
    if (error) {
      console.error('8. Error fetching lead:', error)
      return NextResponse.json(
        { error: 'Failed to fetch lead', details: error.message },
        { status: 500 }
      )
    }
    
    if (!lead) {
      console.log('9. No lead found')
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }
    
    console.log('10. Lead found, fetching activities')
    // Fetch lead activities
    const { data: activities, error: activitiesError } = await supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
    
    console.log('11. Activities result - Count:', activities?.length, 'Error:', activitiesError)
    
    return NextResponse.json({
      lead,
      activities: activities || []
    })
  } catch (error) {
    console.error('12. Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
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
    
    console.log('PATCH - Updating lead:', id, body)
    
    // First, get the existing lead to compare changes
    const { data: existingLead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching existing lead:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch existing lead' },
        { status: 500 }
      )
    }
    
    // Perform the update
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating lead:', updateError)
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      )
    }
    
    // Track meaningful changes
    const changes: string[] = []
    
    // Check for stage change (most important)
    if (body.stage && existingLead.stage !== body.stage) {
      changes.push(`stage changed from ${existingLead.stage} to ${body.stage}`)
      
      // Stage change is automatically recorded by database trigger
      // No need to manually insert stage history
    }
    
    // Check for value change
    if (body.value && existingLead.value !== body.value) {
      changes.push(`value changed to $${body.value.toLocaleString()}`)
    }
    
    // Check for probability change
    if (body.probability && existingLead.probability !== body.probability) {
      changes.push(`probability changed to ${body.probability}%`)
    }
    
    // Check for assignment change
    if (body.assigned_to && existingLead.assigned_to !== body.assigned_to) {
      changes.push('reassigned')
    }
    
    // Check for next action change
    if (body.next_action && existingLead.next_action !== body.next_action) {
      changes.push('next action updated')
    }
    
    // Check for contact info changes
    if (body.contact_name && existingLead.contact_name !== body.contact_name) {
      changes.push('contact name updated')
    }
    if (body.contact_email && existingLead.contact_email !== body.contact_email) {
      changes.push('contact email updated')
    }
    if (body.contact_phone && existingLead.contact_phone !== body.contact_phone) {
      changes.push('contact phone updated')
    }
    
    // Check for company info changes
    if (body.company_name && existingLead.company_name !== body.company_name) {
      changes.push('company name updated')
    }
    
    // Only log activity if there were meaningful changes
    if (changes.length > 0) {
      const activityDescription = changes.join(', ')
      
      await supabase
        .from('lead_activities')
        .insert([{
          lead_id: id,
          type: 'status_change',
          description: activityDescription,
          metadata: { 
            previous: existingLead,
            new: updatedLead,
            changes: changes
          }
        }])
    } else {
      // If no meaningful changes, log a generic update
      await supabase
        .from('lead_activities')
        .insert([{
          lead_id: id,
          type: 'note',
          description: 'Lead details updated',
          metadata: { updated: body }
        }])
    }
    
    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Unexpected error in PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // Change this line
) {
  try {
    const supabase = await createClient()
    const { id } = await params  // Await params here too
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting lead:', error)
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}