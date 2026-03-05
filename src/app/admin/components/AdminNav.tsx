// src/app/admin/components/AdminNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/utils'
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Settings,
  DollarSign,
  Shield,
  AlertCircle,
  BarChart3,
  Mail,
  Phone,
  MessageSquare,
  Download,
  Upload,
  Tag,
  Percent,
  CreditCard,
  Building2,
  Scale,
  Gavel,
  Bell,
  PlusCircleIcon,
  PlusSquareIcon,
  BarChart3Icon
} from 'lucide-react'
import { title } from 'process'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Revenue',
    href: '/admin/revenue/pricing',
    icon: DollarSign,
    subItems: [
      { title: 'Overview', href: '/admin/revenue' },
      { title: 'Pricing Management', href: '/admin/revenue/pricing' },
      { title: 'Invoices', href: '/admin/revenue/invoices' },
      { title: 'Coupons', href: '/admin/revenue/coupons' }
    ]
  },
  {
    title: 'Sales',
    href: '/admin/sales/leads',
    icon: BarChart3Icon,
    subItems: [
      { title: 'Leads', href: '/admin/sales/leads' },
      { title: 'Pipeline', href: '/admin/sales/pipeline' }
    ]
  },
  {
    title: 'Reports',
    href: '/admin/reports/queue',
    icon: FileText,
    subItems: [
      { title: 'All Reports', href: '/admin/reports' },
      { title: 'Generation Queue', href: '/admin/reports/queue' },
      { title: 'Failed Reports', href: '/admin/reports/failed' },
      { title: 'Templates', href: '/admin/reports/templates' }
    ]
  },
  {
    title: 'Consultations',
    href: '/admin/consultations',
    icon: Calendar,
    subItems: [
      { title: 'Schedule', href: '/admin/consultations' },
      { title: 'Upcoming', href: '/admin/consultations/upcoming' },
      { title: 'Completed', href: '/admin/consultations/completed' },
      { title: 'Calendar Sync', href: '/admin/consultations/calendar' }
    ]
  },
  {
    title: 'Customers',
    href: '/admin/customers/health',
    icon: Users,
    subItems: [
      { title: 'All Customers', href: '/admin/customers' },
      { title: 'Enterprise', href: '/admin/customers/enterprise' },
      { title: 'Churned', href: '/admin/customers/churned' },
      { title: 'Feedback', href: '/admin/customers/feedback' }
    ]
  },
  {
    title: 'Regulatory',
    href: '/admin/regulatory',
    icon: Scale,
    subItems: [
      { title: 'State Updates', href: '/admin/regulatory' },
      { title: 'Legislation Tracker', href: '/admin/regulatory/legislation' },
      { title: 'Enforcement Actions', href: '/admin/regulatory/enforcement' },
      { title: 'Content Updates', href: '/admin/regulatory/content' }
    ]
  },
  {
    title: 'Marketing',
    href: '/admin/marketing/content',
    icon: TrendingUp,
    subItems: [
      { title: 'Analytics', href: '/admin/marketing' },
      { title: 'Email Campaigns', href: '/admin/marketing/email' },
      { title: 'Landing Pages', href: '/admin/marketing/pages' },
      { title: 'SEO', href: '/admin/marketing/seo' },
      { title: 'Competitors', href: '/admin/marketing/competitors' }
    ]
  },
  {
    title: 'Health',
    href: '/admin/health/alerts',
    icon: PlusSquareIcon,
    subItems: [
      { title: 'Alerts', href: '/admin/health/alerts' },
      { title: 'FAQs', href: '/admin/support/faqs' },
      { title: 'Knowledge Base', href: '/admin/support/kb' }
    ]
  },
  {
    title: 'Support',
    href: '/admin/support',
    icon: MessageSquare,
    subItems: [
      { title: 'Tickets', href: '/admin/support' },
      { title: 'FAQs', href: '/admin/support/faqs' },
      { title: 'Knowledge Base', href: '/admin/support/kb' }
    ]
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    subItems: [
      { title: 'General', href: '/admin/settings' },
      { title: 'Team', href: '/admin/settings/team' },
      { title: 'API Keys', href: '/admin/settings/api' },
      { title: 'Webhooks', href: '/admin/settings/webhooks' }
    ]
  }
]

export default function AdminNav() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.subItems?.some(sub => pathname === sub.href))
          
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-navy-50 text-navy-900"
                    : "text-navy-600 hover:bg-slate-50 hover:text-navy-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.title}
              </Link>
              
              {item.subItems && isActive && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        "block px-3 py-1.5 text-xs rounded-lg transition-colors",
                        pathname === sub.href
                          ? "text-gold-600 font-medium"
                          : "text-navy-500 hover:text-navy-700"
                      )}
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}