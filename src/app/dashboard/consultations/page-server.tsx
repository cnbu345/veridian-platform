// src/app/dashboard/consultations/page.tsx - Server Component
import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientConsultations from './ClientConsultations'

export default async function DashboardConsultationsPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Fetch user's consultations from the database
  const supabase = await createClient()
  
  const { data: consultations, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('user_id', user.id)
    .order('consultation_date', { ascending: false })

  if (error) {
    console.error('Error fetching consultations:', error)
    // Return empty array if error
    return <ClientConsultations initialConsultations={[]} user={user} />
  }

  return <ClientConsultations initialConsultations={consultations || []} user={user} />
}