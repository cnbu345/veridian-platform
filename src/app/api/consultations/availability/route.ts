// src/app/api/consultations/availability/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    // Get the date from the URL (example: ?date=2026-03-05)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    // If no date provided, return an error
    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }
    
    console.log('Checking availability for date:', date)
    
    // Connect to Supabase
    const supabase = await createClient()
    
    // Create UTC date range for the entire selected day
    // This ensures we get all consultations from midnight to midnight UTC
    const startOfDay = new Date(`${date}T00:00:00.000Z`)
    const endOfDay = new Date(`${date}T23:59:59.999Z`)
    
    console.log('UTC Date range:', {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString()
    })
    
    // Fetch all scheduled consultations for this date
    const { data: consultations, error } = await supabase
      .from('consultations')
      .select('consultation_date, customer_name')
      .gte('consultation_date', startOfDay.toISOString())
      .lte('consultation_date', endOfDay.toISOString())
      .eq('status', 'scheduled')
    
    if (error) {
      console.error('Error fetching consultations:', error)
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
    }
    
    console.log('Found consultations:', consultations?.length || 0)
    
    // Extract just the time part from each consultation (in UTC)
    // We'll return these as UTC times (like "18:00", "19:00", "21:30")
    const bookedSlots = consultations.map(consultation => {
      const date = new Date(consultation.consultation_date)
      // Get UTC hours and minutes (this is what's stored in the database)
      const hours = date.getUTCHours().toString().padStart(2, '0')
      const minutes = date.getUTCMinutes().toString().padStart(2, '0')
      const timeString = `${hours}:${minutes}`
      
      console.log('Found booked slot:', {
        time: timeString,
        customer: consultation.customer_name,
        originalUTC: consultation.consultation_date
      })
      
      return timeString
    })
    
    console.log('All booked slots (UTC):', bookedSlots)
    
    // Return the booked slots to the client
    return NextResponse.json({ 
      bookedSlots,
      count: consultations.length,
      date: date
    })
    
  } catch (error) {
    console.error('Error in availability check:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}