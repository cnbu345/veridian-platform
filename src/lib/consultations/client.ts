// src/lib/consultations/client.ts
// This file can ONLY be imported in Client Components
import { createClient } from '@/lib/supabase/client'

export interface Consultation {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  company_name: string
  consultation_date: string
  duration_minutes: number
  consultation_type: 'discovery' | 'compliance' | 'enterprise'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  converted_to_sale: boolean
  sale_amount?: number
  calendar_event_id?: string
  meeting_link?: string
  reschedule_token?: string
}

export async function getClientConsultations() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('user_id', user.id)
    .order('consultation_date', { ascending: true })
  
  if (error) throw error
  return data as Consultation[]
}

export async function getAvailableSlots(date: string) {
  const supabase = createClient()
  
  // Get day of week (0-6)
  const dayOfWeek = new Date(date).getDay()
  
  // Get availability for that day
  const { data: availability, error: availError } = await supabase
    .from('consultation_availability')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
  
  if (availError) throw availError
  
  // Get already booked slots for that date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  const { data: booked, error: bookedError } = await supabase
    .from('consultations')
    .select('consultation_date, duration_minutes')
    .eq('status', 'scheduled')
    .gte('consultation_date', startOfDay.toISOString())
    .lte('consultation_date', endOfDay.toISOString())
  
  if (bookedError) throw bookedError
  
  // Generate available time slots
  const slots: { time: string; available: boolean }[] = []
  
  availability?.forEach((avail: any) => {
    const [startHour, startMinute] = avail.start_time.split(':').map(Number)
    const [endHour, endMinute] = avail.end_time.split(':').map(Number)
    
    let currentHour = startHour
    let currentMinute = startMinute
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      // Check if slot is booked
      const slotDateTime = new Date(date)
      slotDateTime.setHours(currentHour, currentMinute, 0, 0)
      
      const isBooked = booked?.some(b => {
        const bookedTime = new Date(b.consultation_date)
        const slotEnd = new Date(slotDateTime)
        slotEnd.setMinutes(slotEnd.getMinutes() + 30)
        
        return (
          (slotDateTime >= bookedTime && slotDateTime < new Date(bookedTime.getTime() + b.duration_minutes * 60000)) ||
          (slotEnd > bookedTime && slotEnd <= new Date(bookedTime.getTime() + b.duration_minutes * 60000))
        )
      })
      
      slots.push({
        time: timeString,
        available: !isBooked
      })
      
      // Increment by 30 minutes
      currentMinute += 30
      if (currentMinute >= 60) {
        currentHour += 1
        currentMinute = 0
      }
    }
  })
  
  return slots
}

export async function bookConsultation(data: {
  customer_name: string
  customer_email: string
  customer_phone: string
  company_name: string
  consultation_date: string
  consultation_type: 'discovery' | 'compliance' | 'enterprise'
  notes?: string
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to book a consultation')
  
  const consultation = {
    user_id: user.id,
    ...data,
    duration_minutes: 30,
    status: 'scheduled',
    converted_to_sale: false
  }
  
  const { data: result, error } = await supabase
    .from('consultations')
    .insert([consultation])
    .select()
    .single()
  
  if (error) throw error
  
  return result
}

export async function cancelConsultation(id: string, reason?: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('consultations')
    .update({ 
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user'
    })
    .eq('id', id)
  
  if (error) throw error
  
  return true
}

export async function rescheduleConsultation(id: string, newDate: string, token?: string) {
  const supabase = createClient()
  
  // If token provided, verify it
  if (token) {
    const { data: consultation, error: verifyError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .eq('reschedule_token', token)
      .single()
    
    if (verifyError || !consultation) {
      throw new Error('Invalid reschedule token')
    }
  }
  
  const { error } = await supabase
    .from('consultations')
    .update({ consultation_date: newDate })
    .eq('id', id)
  
  if (error) throw error
  
  return true
}