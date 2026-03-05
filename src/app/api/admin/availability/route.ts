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
    
    // Transform the availability data to match the database schema
    // The consultation_availability table stores each day as a separate row
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNumbers: { [key: string]: number } = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    }
    
    // First, delete all existing availability for this admin
    const { error: deleteError } = await supabase
      .from('consultation_availability')
      .delete()
      .eq('admin_id', user.id)
    
    if (deleteError) {
      console.error('Error deleting existing availability:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to update availability' 
      }, { status: 500 })
    }
    
    // Prepare new availability records
    const availabilityRecords = []
    
    for (const day of days) {
      const dayData = availability[day]
      if (!dayData) continue
      
      // For each time slot, create a record
      if (dayData.isAvailable && dayData.slots && dayData.slots.length > 0) {
        for (const slot of dayData.slots) {
          availabilityRecords.push({
            admin_id: user.id,
            day_of_week: dayNumbers[day],
            start_time: slot.start,
            end_time: slot.end,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      }
    }
    
    // Insert new availability records
    if (availabilityRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('consultation_availability')
        .insert(availabilityRecords)
      
      if (insertError) {
        console.error('Error inserting availability:', insertError)
        return NextResponse.json({ 
          error: 'Failed to save availability' 
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Availability saved successfully'
    })
    
  } catch (error) {
    console.error('Error saving availability:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the admin user ID (for public access, we might want to get the first admin or a default)
    // For now, let's get the first admin user
    const { data: adminUsers } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
    
    const adminId = adminUsers && adminUsers.length > 0 ? adminUsers[0].id : null
    
    if (!adminId) {
      console.log('No admin users found, using default availability')
      // Return default availability if no admin
      const defaultAvailability = {
        monday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 },
        tuesday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 },
        wednesday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 },
        thursday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 },
        friday: { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 },
        saturday: { isAvailable: false, slots: [], duration: 30 },
        sunday: { isAvailable: false, slots: [], duration: 30 }
      }
      return NextResponse.json({ availability: defaultAvailability })
    }
    
    // Get availability from consultation_availability table
    const { data, error } = await supabase
      .from('consultation_availability')
      .select('*')
      .eq('admin_id', adminId)
      .eq('is_active', true)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch availability' 
      }, { status: 500 })
    }
    
    console.log('Raw database records:', data)
    
    // Transform database records into the frontend format
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayNames: { [key: number]: string } = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    }
    
    const availability: any = {}
    
    // Initialize default structure for each day
    days.forEach(day => {
      availability[day] = {
        isAvailable: false,
        slots: [],
        duration: 30 // Default duration
      }
    })
    
    // Group slots by day
    if (data && data.length > 0) {
      data.forEach(record => {
        const dayName = dayNames[record.day_of_week]
        if (dayName) {
          availability[dayName].isAvailable = true
          availability[dayName].slots.push({
            start: record.start_time.substring(0, 5), // Format "HH:MM"
            end: record.end_time.substring(0, 5)
          })
        }
      })
      
      // Sort slots by start time for each day
      days.forEach(day => {
        if (availability[day].slots.length > 0) {
          availability[day].slots.sort((a: any, b: any) => 
            a.start.localeCompare(b.start)
          )
        }
      })
    } else {
      console.log('No availability records found, using defaults for weekdays')
      // Set defaults for weekdays
      availability.monday = { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 }
      availability.tuesday = { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 }
      availability.wednesday = { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 }
      availability.thursday = { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 }
      availability.friday = { isAvailable: true, slots: [{ start: '09:00', end: '17:00' }], duration: 30 }
    }
    
    console.log('Transformed availability:', availability)
    return NextResponse.json({ availability })
    
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}