// src/app/admin/consultations/completed/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompletedConsultationsClient from './CompletedConsultationsClient'

export default async function CompletedConsultationsPage() {
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
  
  // Fetch completed consultations
  const { data: consultations, error } = await supabase
    .from('consultations')
    .select(`
      *,
      users (
        email,
        full_name
      )
    `)
    .in('status', ['completed', 'cancelled', 'no-show'])
    .order('consultation_date', { ascending: false })
  
  return <CompletedConsultationsClient initialConsultations={consultations || []} />
}