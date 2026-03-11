// src/app/admin/customers/components/MobileCustomerCard.tsx
'use client'

import Link from 'next/link'
import { ChevronRight, Mail, Calendar, FileText } from 'lucide-react'

interface MobileCustomerCardProps {
  customer: {
    id: string
    company_name: string
    email: string
    health_score: number
    risk_level: string
    churn_probability: number
    report_count: number
    last_login: string
  }
}

export default function MobileCustomerCard({ customer }: MobileCustomerCardProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }
  
  const getRiskBadge = () => {
    switch(customer.risk_level) {
      case 'healthy':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Healthy</span>
      case 'moderate':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Moderate</span>
      case 'at_risk':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">At Risk</span>
      default:
        return null
    }
  }
  
  return (
    <Link 
      href={`/admin/customers/${customer.id}`}
      className="block bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-navy-900 truncate">{customer.company_name}</h3>
          <div className="flex items-center gap-1 text-sm text-navy-500 mt-0.5">
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        </div>
        {getRiskBadge()}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-navy-500 mb-1">Health Score</div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(customer.health_score)}`}>
            {customer.health_score}
          </div>
        </div>
        <div>
          <div className="text-xs text-navy-500 mb-1">Churn Risk</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[60px]">
              <div
                className={`h-full ${
                  customer.churn_probability > 0.5 ? 'bg-red-600' : 'bg-amber-600'
                }`}
                style={{ width: `${customer.churn_probability * 100}%` }}
              />
            </div>
            <span className="text-xs text-navy-600">
              {(customer.churn_probability * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-navy-500">
            <FileText className="w-3.5 h-3.5" />
            <span>{customer.report_count}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-navy-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(customer.last_login).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-center">
          <ChevronRight className="w-4 h-4 text-navy-400 mx-auto" />
        </div>
      </div>
    </Link>
  )
}