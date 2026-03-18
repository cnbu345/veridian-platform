// src/app/dashboard/feedback/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientFeedbackDetail from './ClientFeedbackDetail'

export default async function ClientFeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { id } = await params

  // Fetch the feedback details
  const { data: feedback, error } = await supabase
    .from('feedback_submissions')
    .select(`
      *,
      feedback_type:feedback_type_id (
        id,
        name,
        category
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns this feedback
    .single()

  if (error || !feedback) {
    console.error('Error fetching feedback:', error)
    redirect('/dashboard/feedback')
  }

  return <ClientFeedbackDetail feedback={feedback} />
}