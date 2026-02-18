// src/app/admin/components/QuickActions.tsx // Quick Actions to Schedule Consultation
'use client'

import {
  Plus,
  FileText,
  Calendar,
  Mail,
  MessageSquare,
  Upload,
  Users,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: any
  color: string
  bgColor: string
  href?: string
  action?: () => void
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      title: 'New Report',
      description: 'Generate compliance report',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/reports/new'
    },
    {
      title: 'Schedule Consultation',
      description: 'Book enterprise call',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/consultations/schedule'
    },
    {
      title: 'Send Newsletter',
      description: 'Regulatory updates',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/marketing/email'
    },
    {
      title: 'Update Pricing',
      description: 'Modify subscription tiers',
      icon: Settings,
      color: 'text-navy-600',
      bgColor: 'bg-navy-100',
      href: '/admin/revenue/pricing'
    },
    {
      title: 'Import Data',
      description: 'Bulk customer import',
      icon: Upload,
      color: 'text-gold-600',
      bgColor: 'bg-gold-100',
      href: '/admin/customers/import'
    },
    {
      title: 'Export Reports',
      description: 'Download all reports',
      icon: Download,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      href: '/admin/reports/export'
    }
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <a
              key={index}
              href={action.href}
              className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group cursor-pointer"
            >
              <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <h3 className="font-medium text-navy-900 text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-navy-500">{action.description}</p>
            </a>
          )
        })}
      </div>
    </div>
  )
}