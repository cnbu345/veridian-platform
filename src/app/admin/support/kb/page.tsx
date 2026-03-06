// src/app/admin/support/kb/page.tsx - Knowledge Base Page Route
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KBClient from './KBClient'

export default async function AdminKBPage() {
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

  return <KBClient />
}