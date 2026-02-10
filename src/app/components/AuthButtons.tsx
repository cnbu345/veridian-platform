'use client'

import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

  if (loading) return <div>Loading...</div>

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Welcome, {user.email}</span>
        <button
          onClick={handleSignOut}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={() => router.push('/auth')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Sign In
      </button>
      <button
        onClick={() => router.push('/auth')}
        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        Sign Up
      </button>
    </div>
  )
}