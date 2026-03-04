// src/app/admin/consultations/upcoming/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpcomingConsultationsClient from './UpcomingConsultationsClient'

export default async function UpcomingConsultationsPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated and is admin
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
  
  // Fetch upcoming consultations
  const now = new Date().toISOString()
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
    .order('consultation_date', { ascending: true })
  
  if (error) {
    console.error('Error fetching consultations:', error)
    // You might want to handle this with an error boundary
  }
  
  return <UpcomingConsultationsClient initialConsultations={consultations || []} />
}