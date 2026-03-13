// src/app/dashboard/feedback/nps/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NPSHistory from './NPSHistory'

export default async function NPSHistoryPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  return <NPSHistory />
}