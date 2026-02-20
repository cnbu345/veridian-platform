// src/app/dashboard/settings/components/SettingsCard.tsx
'use client'

import Link from 'next/link'
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Key,
  Globe,
  CircleCheck, 
  AlertCircle, 
  Info 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

interface SettingsCardProps {
  title: string
  description: string
  iconName: string  // Now receiving the icon name as a string
  href: string
  status: 'complete' | 'incomplete' | 'attention' | 'info'
  badge?: string
  items: Array<{ label: string; value: string }>
}

// Map icon names to actual components
const iconMap: Record<string, LucideIcon> = {
  User,
  Shield,
  Bell,
  CreditCard,
  Key,
  Globe
}

const statusConfig = {
  complete: {
    icon: CircleCheck,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    iconColor: 'text-green-600'
  },
  incomplete: {
    icon: AlertCircle,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    iconColor: 'text-amber-600'
  },
  attention: {
    icon: AlertCircle,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    iconColor: 'text-rose-600'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    iconColor: 'text-blue-600'
  }
}

export default function SettingsCard({ 
  title, 
  description, 
  iconName,  // Now using iconName instead of icon
  href, 
  status,
  badge,
  items 
}: SettingsCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const Icon = iconMap[iconName] || User // Fallback to User icon if not found

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={href} className="block">
        <div className="bg-white rounded-xl border border-slate-200 hover:border-gold-300 hover:shadow-lg transition-all overflow-hidden">
          {/* Header with status bar */}
          <div className={`h-1 w-full ${config.bg}`} />
          
          <div className="p-6">
            {/* Title and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900">{title}</h3>
                  {badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                      {badge}
                    </span>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs ${config.text}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="capitalize">{status}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-navy-600 mb-4 line-clamp-2">
              {description}
            </p>

            {/* Preview Items */}
            <div className="space-y-2 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-navy-500">{item.label}</span>
                  <span className="text-navy-900 font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm text-gold-600 font-medium">Manage</span>
              <ChevronRight className="w-4 h-4 text-navy-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}