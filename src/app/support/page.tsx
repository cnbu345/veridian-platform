// src/app/support/page.tsx - Support/Messaging System
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SupportClient from './SupportClient'

export default async function SupportPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin?redirect=/support')
  }
  
  return <SupportClient userId={user.id} />
}