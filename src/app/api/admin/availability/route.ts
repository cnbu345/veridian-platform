// src/app/api/admin/availability/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Parse request body
    const body = await request.json()
    const { availability } = body
    
    if (!availability || typeof availability !== 'object') {
      return NextResponse.json({ 
        error: 'Invalid availability data' 
      }, { status: 400 })
    }
    
    // Validate availability structure
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for (const day of days) {
      if (availability[day] !== undefined) {
        const dayData = availability[day]
        if (dayData && typeof dayData === 'object') {
          if (typeof dayData.isAvailable !== 'boolean') {
            return NextResponse.json({ 
              error: `Invalid isAvailable for ${day}` 
            }, { status: 400 })
          }
          if (dayData.slots && !Array.isArray(dayData.slots)) {
            return NextResponse.json({ 
              error: `Invalid slots for ${day}` 
            }, { status: 400 })
          }
        }
      }
    }
    
    // Save to database (you might want to create a settings table)
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ 
        key: 'consultation_availability',
        value: availability,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'key' 
      })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to save availability' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Availability saved successfully',
      availability 
    })
    
  } catch (error) {
    console.error('Error saving availability:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get availability from database
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'consultation_availability')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch availability' 
      }, { status: 500 })
    }
    
    // Default availability if none exists
    const defaultAvailability = {
      monday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      tuesday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      wednesday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      thursday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      friday: { isAvailable: true, slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      saturday: { isAvailable: false, slots: [] },
      sunday: { isAvailable: false, slots: [] }
    }
    
    return NextResponse.json({ 
      availability: data?.value || defaultAvailability 
    })
    
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}