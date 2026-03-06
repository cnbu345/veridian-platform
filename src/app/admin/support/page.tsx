// src/app/admin/support/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSupportClient from './AdminSupportClient'

// IMPORTANT: The component must be async to await searchParams
export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>
}) {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }
  
  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!userData?.is_admin) {
    redirect('/dashboard')
  }
  
  // Fetch all tickets with user info
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select(`
      *,
      users:user_id (
        full_name,
        email,
        company_name,
        subscription_tier
      )
    `)
    .order('created_at', { ascending: false })
  
  // AWAIT the searchParams Promise before accessing its properties
  const params = await searchParams
  const initialTicketId = params.ticket
  
  return (
    <AdminSupportClient 
      initialTickets={tickets || []} 
      initialTicketId={initialTicketId}
    />
  )
}