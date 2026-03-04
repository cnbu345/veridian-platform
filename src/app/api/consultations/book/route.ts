// src/app/api/consultations/book/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConsultationConfirmation } from '@/lib/email/service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Create consultation
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .insert([{
        user_id: user.id,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        company_name: body.company_name,
        consultation_date: body.consultation_date,
        duration_minutes: 30,
        consultation_type: body.consultation_type,
        notes: body.notes,
        status: 'scheduled',
        converted_to_sale: false
      }])
      .select()
      .single()
    
    if (consultationError) {
      console.error('Error creating consultation:', consultationError)
      return NextResponse.json({ error: 'Failed to create consultation' }, { status: 500 })
    }
    
    // Send confirmation email
    try {
      await sendConsultationConfirmation(consultation, user)
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the booking if email fails
    }
    
    return NextResponse.json({ success: true, consultation })
    
  } catch (error) {
    console.error('Error in consultation booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}