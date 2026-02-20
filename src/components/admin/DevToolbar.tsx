// src/app/components/DevToolbar.tsx // Dev Toolbar - Admin
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, X } from 'lucide-react'
import Link from 'next/link'

export default function DevToolbar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        setIsAdmin(data?.is_admin || false)
      }
    }
    checkAdmin()
  }, [])

  if (!isAdmin || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-navy-900 text-white rounded-lg shadow-xl border border-gold-500/20 z-50">
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-navy-700 rounded"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-xs text-gold-400 px-2">DEV MODE</span>
        <Link
          href="/admin"
          className="flex items-center gap-1 px-3 py-1 bg-navy-800 rounded text-sm hover:bg-navy-700"
        >
          <LayoutDashboard className="w-3 h-3" />
          Admin
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 px-3 py-1 bg-navy-800 rounded text-sm hover:bg-navy-700"
        >
          <Users className="w-3 h-3" />
          Client
        </Link>
      </div>
    </div>
  )
}