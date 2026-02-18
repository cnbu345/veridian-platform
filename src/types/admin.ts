// src/types/admin.ts
export interface AdminDashboardStats {
  // Revenue metrics
  revenue: {
    mrr: number          // Monthly Recurring Revenue
    arr: number           // Annual Run Rate
    totalRevenue: number
    avgDealSize: number
    founderCircleRemaining: number  // Founder's pricing spots left
  }
  
  // Report metrics
  reports: {
    total: number
    generating: number
    ready: number
    failed: number
    avgGenerationTime: number // in minutes
  }
  
  // Customer metrics
  customers: {
    total: number
    active: number
    enterprise: number
    churnRate: number
    byTier: {
      single: number
      quarterly: number
      monthly: number
      enterprise: number
    }
  }
  
  // Compliance metrics
  compliance: {
    statesAnalyzed: number
    mostRequestedStates: { state: string; count: number }[]
    regulatoryAlerts: number // states with pending legislation
  }
  
  // Consultation metrics
  consultations: {
    scheduled: number
    completed: number
    upcoming: number
    conversionRate: number // consultation to sale
  }
}