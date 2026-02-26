// src/app/dashboard/components/ReportSummary.tsx
'use client'

import { Building2, DollarSign, AlertCircle, MapPin } from 'lucide-react'

interface ReportSummaryProps {
  institutionType: string
  annualBudget: string
  primaryConcern: string
  marketTier: string
}

export default function ReportSummary({ 
  institutionType, 
  annualBudget, 
  primaryConcern,
  marketTier 
}: ReportSummaryProps) {
  
  // Format budget for display
  const formatBudget = (budget: string) => {
    const budgets: Record<string, string> = {
      'under-50k': 'Under $50,000',
      '50k-100k': '$50,000 - $100,000',
      '100k-250k': '$100,000 - $250,000',
      '250k-500k': '$250,000 - $500,000',
      '500k-plus': '$500,000+',
    }
    return budgets[budget] || budget
  }

  // Format market tier for display
  const formatMarketTier = (tier: string) => {
    const tiers: Record<string, string> = {
      'major': 'Major Market',
      'suburban': 'Suburban Market',
      'rural': 'Rural Market',
    }
    return tiers[tier] || tier
  }

  return (
    <div className="bg-navy-50 rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold text-navy-900 mb-2">Report Summary</h4>
      
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-navy-600" />
        </div>
        <div>
          <p className="text-xs text-navy-500">Institution Type</p>
          <p className="text-sm font-medium text-navy-900">{institutionType}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center shrink-0">
          <DollarSign className="w-4 h-4 text-navy-600" />
        </div>
        <div>
          <p className="text-xs text-navy-500">Annual Budget</p>
          <p className="text-sm font-medium text-navy-900">{formatBudget(annualBudget)}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-navy-600" />
        </div>
        <div>
          <p className="text-xs text-navy-500">Market Type</p>
          <p className="text-sm font-medium text-navy-900">{formatMarketTier(marketTier)}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-navy-600" />
        </div>
        <div>
          <p className="text-xs text-navy-500">Primary Concern</p>
          <p className="text-sm font-medium text-navy-900">{primaryConcern}</p>
        </div>
      </div>
    </div>
  )
}