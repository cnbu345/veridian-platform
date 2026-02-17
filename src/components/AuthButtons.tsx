// src/components/AuthButtons.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, UserPlus, LogOut, User } from 'lucide-react'

export default function AuthButtons() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-8 bg-slate-200 rounded-lg animate-pulse" />
        <div className="w-20 h-8 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-gold-600 transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="hidden md:inline">Dashboard</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-navy-200 
                   text-navy-700 text-sm font-medium rounded-lg
                   hover:bg-slate-50 hover:border-gold-500 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <Link
        href="/auth"
        className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white 
                 text-sm font-medium rounded-lg hover:bg-navy-800 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </Link>
      <Link
        href="/auth?signup=true"
        className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-navy-900 
                 text-sm font-medium rounded-lg hover:bg-gold-500 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        <span>Sign Up</span>
      </Link>
    </div>
  )
}