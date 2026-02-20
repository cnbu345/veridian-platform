// src/app/dashboard/settings/security/page.tsx
import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SecurityClient from './SecurityClient'

export default async function SecurityPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  const supabase = await createClient()
  
  // Get user's auth provider
  const { data: userData } = await supabase
    .from('users')
    .select('auth_provider, mfa_enabled, last_login_method')
    .eq('id', user.id)
    .single()

  // Get login history
  const { data: loginHistory } = await supabase
    .from('login_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <SecurityClient 
      user={user}
      userData={userData}
      loginHistory={loginHistory || []}
    />
  )
}