// src/lib/consultations/server.ts
// This file can ONLY be imported in Server Components
import { createClient } from '@/lib/supabase/server'

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

export async function getConsultations(filters?: {
  status?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('consultations')
    .select('*')
    .order('consultation_date', { ascending: true })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.startDate) {
    query = query.gte('consultation_date', filters.startDate)
  }
  
  if (filters?.endDate) {
    query = query.lte('consultation_date', filters.endDate)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Consultation[]
}

export async function getConsultationById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Consultation
}

export async function createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('consultations')
    .insert([consultation])
    .select()
    .single()
  
  if (error) throw error
  return data as Consultation
}

export async function updateConsultation(id: string, updates: Partial<Consultation>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('consultations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Consultation
}