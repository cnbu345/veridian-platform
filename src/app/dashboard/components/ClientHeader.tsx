// src/app/dashboard/components/ClientHeader.tsx
'use client'

import { useState } from 'react'
import { 
  User, 
  LogOut, 
  Settings, 
  HelpCircle,
  ChevronDown,
  Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import NotificationBell from '@/components/notifications/NotificationBell'
import { cn } from '@/lib/utils/utils'

interface ClientHeaderProps {
  user: any
  pageTitle?: string
}

export default function ClientHeader({ user, pageTitle }: ClientHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Page Title - Optional, can be passed from page */}
        {pageTitle && (
          <h1 className="text-xl font-semibold text-navy-900">
            {pageTitle}
          </h1>
        )}
        
        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <NotificationBell isAdmin={false} />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-navy-600" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-navy-900">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-navy-500">
                  {user?.user_metadata?.subscription_tier || 'Free'} Plan
                </div>
              </div>
              <ChevronDown className="hidden sm:block w-4 h-4 text-navy-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                <Link
                  href="/dashboard/settings/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-slate-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-slate-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  href="/dashboard/support"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-slate-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </Link>
                <hr className="my-2 border-slate-200" />
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleSignOut()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}