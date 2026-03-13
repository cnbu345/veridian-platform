// src/app/dashboard/feedback/requests/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeatureRequests from './FeatureRequests'

export default async function FeatureRequestsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  return <FeatureRequests />
}