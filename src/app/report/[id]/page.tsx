import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getReport } from '@/lib/reports/storage'
import ReportViewClient from './ReportViewClient'

export default async function ReportPage({ params }: { params: { id: string } }) {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  try {
    const report = await getReport(params.id, user.id)
    
    if (!report) {
      redirect('/dashboard')
    }

    return <ReportViewClient report={report} />
  } catch (error) {
    console.error('Error loading report:', error)
    redirect('/dashboard')
  }
}