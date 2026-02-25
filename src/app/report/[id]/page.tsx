// src/app/report/[id]/page.tsx // Individual report page
import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getReport } from '@/lib/reports/storage'
import ReportViewClient from './ReportViewClient'

export default async function ReportPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await the params
  const { id } = await params
  
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  try {
    const report = await getReport(id, user.id)
    
    if (!report) {
      redirect('/dashboard')
    }

    return <ReportViewClient report={report} />
  } catch (error) {
    console.error('Error loading report:', error)
    redirect('/dashboard')
  }
}