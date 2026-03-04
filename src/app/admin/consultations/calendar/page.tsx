// src/app/admin/consultations/calendar/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarViewClient from './CalendarViewClient'

export default async function CalendarPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    redirect('/dashboard')
  }
  
  // Fetch all scheduled consultations for the next 90 days
  const now = new Date().toISOString()
  const ninetyDaysFromNow = new Date()
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
  
  const { data: consultations, error } = await supabase
    .from('consultations')
    .select(`
      *,
      users (
        email,
        full_name
      )
    `)
    .eq('status', 'scheduled')
    .gte('consultation_date', now)
    .lte('consultation_date', ninetyDaysFromNow.toISOString())
    .order('consultation_date', { ascending: true })
  
  return <CalendarViewClient initialConsultations={consultations || []} />
}