// src/app/dashboard/support/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SupportClient from './SupportClient'

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }
  
  // Await the searchParams
  const params = await searchParams
  const ticketId = params.ticket
  
  return <SupportClient userId={user.id} initialTicketId={ticketId} />
}