// src/app/admin/customers/feedback/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminFeedbackDetail from './AdminFeedbackDetail'

export default async function AdminFeedbackDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  // Fetch the feedback details
  const { data: feedback, error } = await supabase
    .from('feedback_submissions')
    .select(`
      *,
      feedback_type:feedback_type_id (
        id,
        name,
        category
      ),
      users!feedback_submissions_user_id_fkey (
        id,
        email,
        full_name,
        company_name,
        subscription_tier,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !feedback) {
    console.error('Error fetching feedback:', error)
    redirect('/admin/customers/feedback')
  }

  return <AdminFeedbackDetail feedback={feedback} />
}