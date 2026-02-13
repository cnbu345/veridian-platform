import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { getUserReports } from '@/lib/reports/storage'

export default async function DashboardPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  try {
    const reports = await getUserReports(user.id)
    
    return (
      <DashboardClient 
        user={user}
        initialReports={reports || []}
      />
    )
  } catch (error) {
    console.error('Error loading dashboard:', error)
    return (
      <DashboardClient 
        user={user}
        initialReports={[]}
        error="Failed to load reports"
      />
    )
  }
}