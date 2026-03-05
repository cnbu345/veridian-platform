// src/app/admin/consultations/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewConsultationClient from './NewConsultationClient'

export default async function NewConsultationPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated and is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }
  
  // Check if user is admin (you might have an is_admin column in users table)
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  // For now, we'll allow any authenticated user to schedule
  // You can uncomment this if you have an admin flag
  // if (!profile?.is_admin) {
  //   redirect('/dashboard')
  // }
  
  return <NewConsultationClient />
}