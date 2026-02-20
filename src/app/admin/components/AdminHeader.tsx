// src/app/admin/components/AdminHeader.tsx // Admin Header
'use client'

import { useState } from 'react'
import { 
  User, 
  Bell, 
  Search, 
  LogOut, 
  Settings, 
  HelpCircle,
  ChevronDown,
  LayoutDashboard, // Add this import
  Users // Add this import
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link' // Add this import

interface AdminHeaderProps {
  user: any
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/auth'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Dashboard Switcher - Add this right here */}
          <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 bg-navy-900 text-white rounded-lg text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 bg-white text-navy-600 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
            >
              <Users className="w-4 h-4" />
              Client View
            </Link>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search reports, customers, consultations..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-100 rounded-lg"
            >
              <Bell className="w-5 h-5 text-navy-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                <div className="px-4 py-2 border-b border-slate-200">
                  <h3 className="font-semibold text-navy-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-slate-50">
                    <p className="text-sm text-navy-900 mb-1">New report ready</p>
                    <p className="text-xs text-navy-500">Midwest Regional Bank - 2 min ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50">
                    <p className="text-sm text-navy-900 mb-1">Consultation scheduled</p>
                    <p className="text-xs text-navy-500">James Chen - 15 min ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-navy-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-navy-900">
                  {user?.email?.split('@')[0] || 'Admin'}
                </div>
                <div className="text-xs text-navy-500">Administrator</div>
              </div>
              <ChevronDown className="w-4 h-4 text-navy-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                <a 
                  href="/admin/settings" 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-slate-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
                <a 
                  href="/admin/support" 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-navy-700 hover:bg-slate-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </a>
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