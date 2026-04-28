// src/app/report/[id]/page.tsx
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

    // Check if user has an active subscription
    const supabase = await createClient()
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    // Determine if upsell should be shown
    const showQuarterlyUpsell = !subscription || 
      subscription.plan_tier === 'single' ||
      report.subscription_tier === 'single'

    return (
      <ReportViewClient 
        report={report} 
        showQuarterlyUpsell={showQuarterlyUpsell}
        userSubscription={subscription}
      />
    )
  } catch (error) {
    console.error('Error loading report:', error)
    redirect('/dashboard')
  }
}