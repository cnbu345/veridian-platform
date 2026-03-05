// src/app/admin/support/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSupportClient from './AdminSupportClient'

export default async function AdminSupportPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated and is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }
  
  // Verify admin status
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!userData?.is_admin) {
    redirect('/dashboard')
  }
  
  // Fetch all tickets for admin view
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select(`
      *,
      users:user_id (
        full_name,
        email,
        company_name,
        subscription_tier
      ),
      messages:support_messages (
        id,
        created_at,
        user_id,
        message,
        is_internal
      )
    `)
    .order('created_at', { ascending: false })
  
  return <AdminSupportClient initialTickets={tickets || []} />
}