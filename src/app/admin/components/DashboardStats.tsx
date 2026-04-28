// src/app/admin/components/DashboardStats.tsx
'use client'

import { AdminDashboardStats } from '@/types/admin'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/utils'
import { 
  DollarSign, 
  FileText, 
  Users, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle
} from 'lucide-react'

interface DashboardStatsProps {
  stats: AdminDashboardStats
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Monthly Recurring Revenue',
      value: formatCurrency(stats.revenue.mrr),
      subValue: `ARR: ${formatCurrency(stats.revenue.arr)}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Total Reports',
      value: formatNumber(stats.reports.total),
      subValue: `${stats.reports.generating} generating, ${stats.reports.failed} failed`,
      icon: FileText,
      trend: `${stats.reports.avgGenerationTime} min avg`,
      trendUp: null,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Active Customers',
      value: formatNumber(stats.customers.active),
      subValue: `${stats.customers.enterprise} enterprise`,
      icon: Users,
      trend: `${formatPercentage(stats.customers.churnRate)} churn`,
      trendUp: false,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Consultations',
      value: formatNumber(stats.consultations.scheduled),
      subValue: `${stats.consultations.upcoming} upcoming`,
      icon: Calendar,
      trend: `${formatPercentage(stats.consultations.conversionRate)} conversion`,
      trendUp: true,
      color: 'bg-gold-100 text-gold-600'
    }
  ]

  return (
    <div className="grid grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              {card.trend && card.trendUp !== null && (
                <div className={`flex items-center gap-1 text-sm font-medium
                  ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}
                >
                  {card.trendUp ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{card.trend}</span>
                </div>
              )}
            </div>
            
            <h3 className="text-sm text-navy-500 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-navy-900 mb-1">{card.value}</p>
            <p className="text-xs text-navy-400">{card.subValue}</p>
          </div>
        )
      })}
    </div>
  )
}