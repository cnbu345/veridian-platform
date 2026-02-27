// src/app/dashboard/page.tsx // Dashboard main page
import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { getUserReports } from '@/lib/reports/storage'


export default async function DashboardPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Fetch profile data from users table
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, company_name')
    .eq('id', user.id)
    .single()

  try {
    const reports = await getUserReports(user.id)
    
    return (
      <DashboardClient 
        user={user}
        profile={profile}
        initialReports={reports || []}
      />
    )
  } catch (error) {
    console.error('Error loading dashboard:', error)
    return (
      <DashboardClient 
        user={user}
        profile={profile}
        initialReports={[]}
        error="Failed to load reports"
      />
    )
  }
}