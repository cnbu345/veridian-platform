// src/app/generate/page.tsx // Server component that renders the generate page
import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GenerateClient from './GenerateClient'

export default async function GeneratePage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  return <GenerateClient user={user} />
}