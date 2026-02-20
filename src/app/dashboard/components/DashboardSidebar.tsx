// src/app/dashboard/components/DashboardSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/utils'
import { 
  FileText, 
  Settings, 
  User, 
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Tooltip from '@/components/ui/Tooltip'

interface DashboardSidebarProps {
  user: any
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'My Reports',
      href: '/dashboard/reports',
      icon: FileText
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-30 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo - Fixed height, no scroll */}
      <div className="h-20 flex items-center px-4 border-b border-slate-200 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg shrink-0 group-hover:scale-105 transition-transform" />
          {!collapsed && (
            <span className="font-display font-bold text-navy-900">
              Veridian
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-navy-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-navy-500" />
          )}
        </button>
      </div>

      {/* User Info - Fixed height, no scroll */}
      <div className="p-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-navy-100 to-navy-200 rounded-full flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-navy-700" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-900 truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-navy-500 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - ONLY scroll if content overflows, but with proper containment */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-visible">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return collapsed ? (
              <Tooltip key={item.href} text={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-navy-50 text-navy-900"
                      : "text-navy-600 hover:bg-slate-50 hover:text-navy-900"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 shrink-0",
                    active && "text-gold-600"
                  )} />
                </Link>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-navy-50 text-navy-900"
                    : "text-navy-600 hover:bg-slate-50 hover:text-navy-900"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 shrink-0",
                  active && "text-gold-600"
                )} />
                <span className="flex-1">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sign Out - Fixed at bottom, no scroll */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        {collapsed ? (
          <Tooltip text="Sign Out">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center px-3 py-2 w-full text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors group"
          >
            <LogOut className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}