// src/app/admin/page.tsx
// Main Admin Dashboard
import { createClient } from '@/lib/supabase/server'
import { AdminDashboardStats } from '@/types/admin'
import DashboardStats from './components/DashboardStats'
import RecentReports from './components/RecentReports'
import RevenueChart from './components/RevenueChart'
import ConsultationQueue from './components/ConsultationQueue'
import RegulatoryAlerts from './components/RegulatoryAlerts'
import QuickActions from './components/QuickActions'
import FounderCircleTracker from './components/FounderCircleTracker'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Fetch real-time stats
  const [
    revenueData,
    reportsData,
    customersData,
    consultationsData,
    founderCircleData
  ] = await Promise.all([
    getRevenueStats(supabase),
    getReportStats(supabase),
    getCustomerStats(supabase),
    getConsultationStats(supabase),
    getFounderCircleStats(supabase)
  ])
  
  const stats: AdminDashboardStats = {
    revenue: revenueData,
    reports: reportsData,
    customers: customersData,
    consultations: consultationsData,
    founderCircle: founderCircleData
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-navy-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button className="px-4 py-2 bg-navy-900 text-white rounded-lg text-sm">
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <DashboardStats stats={stats} />
      
      {/* Founder's Circle Alert */}
      <FounderCircleTracker stats={stats} />
      
      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Revenue Chart */}
        <div className="col-span-2 space-y-6">
          <RevenueChart />
          <RecentReports />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <ConsultationQueue />
          <RegulatoryAlerts />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

async function getRevenueStats(supabase: any) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  // Get revenue from Stripe (you'd need to sync this)
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, created_at, tier')
    .gte('created_at', thirtyDaysAgo.toISOString())
    
  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  
  // Calculate MRR (Monthly Recurring Revenue)
  const subscriptions = payments?.filter(p => p.tier !== 'single') || []
  const mrr = subscriptions.reduce((sum, s) => {
    if (s.tier === 'monthly') return sum + 7997 / 12
    if (s.tier === 'quarterly') return sum + 3997 / 12
    return sum
  }, 0)
  
  return {
    mrr,
    arr: mrr * 12,
    totalRevenue,
    avgDealSize: payments?.length ? totalRevenue / payments.length : 0,
    founderCircleRemaining: 38 // This would come from a settings table
  }
}

async function getReportStats(supabase: any) {
  const { data: reports } = await supabase
    .from('reports')
    .select('status, created_at')
    
  return {
    total: reports?.length || 0,
    generating: reports?.filter(r => r.status === 'generating').length || 0,
    ready: reports?.filter(r => r.status === 'ready').length || 0,
    failed: reports?.filter(r => r.status === 'failed').length || 0,
    avgGenerationTime: 4.2 // This would come from actual metrics
  }
}

async function getCustomerStats(supabase: any) {
  const { data: users } = await supabase
    .from('users')
    .select('subscription_tier, created_at')
    
  const total = users?.length || 0
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const activeLast30Days = users?.filter(u => 
    new Date(u.created_at) > thirtyDaysAgo
  ).length || 0
  
  return {
    total,
    active: activeLast30Days,
    enterprise: users?.filter(u => u.subscription_tier === 'enterprise').length || 0,
    churnRate: 0.02, // This would come from actual metrics
    byTier: {
      single: users?.filter(u => u.subscription_tier === 'single').length || 0,
      quarterly: users?.filter(u => u.subscription_tier === 'quarterly').length || 0,
      monthly: users?.filter(u => u.subscription_tier === 'monthly').length || 0,
      enterprise: users?.filter(u => u.subscription_tier === 'enterprise').length || 0
    }
  }
}

async function getConsultationStats(supabase: any) {
  const { data: consultations } = await supabase
    .from('consultations')
    .select('status, created_at')
    
  return {
    scheduled: consultations?.filter(c => c.status === 'scheduled').length || 0,
    completed: consultations?.filter(c => c.status === 'completed').length || 0,
    upcoming: consultations?.filter(c => c.status === 'scheduled' && new Date(c.created_at) > new Date()).length || 0,
    conversionRate: 0.35 // This would come from actual metrics
  }
}

async function getFounderCircleStats(supabase: any) {
  const { data: settings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'founder_circle_spots')
    .single()
    
  const spotsRemaining = settings?.value || 38
  const spotsTotal = 50
  
  return {
    spotsRemaining,
    spotsTotal,
    spotsUsed: spotsTotal - spotsRemaining
  }
}