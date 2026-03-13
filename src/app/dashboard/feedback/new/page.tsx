// src/app/dashboard/feedback/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProvideFeedbackModal from './ProvideFeedbackModal'

export default async function NewFeedbackPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Get available feedback types
  const { data: feedbackTypes } = await supabase
    .from('feedback_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return <ProvideFeedbackModal user={user} feedbackTypes={feedbackTypes || []} />
}