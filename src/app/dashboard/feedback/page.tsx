// src/app/dashboard/feedback/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedbackHistory from './FeedbackHistory'

export default async function FeedbackPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  return <FeedbackHistory />
}