// src/app/admin/support/faqs/page.tsx - Admin FAQ Page Route
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FAQClient from './FAQClient'

export default async function AdminFAQPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    redirect('/dashboard')
  }

  return <FAQClient />
}