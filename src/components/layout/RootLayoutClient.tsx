// src/components/layout/RootLayoutClient.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { User } from '@supabase/supabase-js'

interface RootLayoutClientProps {
  children: React.ReactNode
  initialUser: User | null
}

export default function RootLayoutClient({ children, initialUser }: RootLayoutClientProps) {
  const pathname = usePathname()
  
  // Check if current route is admin or dashboard
  const isAdminRoute = pathname?.startsWith('/admin')
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  
  // Don't show navbar/footer on admin or dashboard routes
  const showNavbarAndFooter = !isAdminRoute && !isDashboardRoute

  return (
    <>
      {showNavbarAndFooter && <Navbar initialUser={initialUser} />}
      
      {/* Main content - NO PADDING HERE */}
      <main className={!showNavbarAndFooter ? '' : ''}>
        {children}
      </main>
      
      {showNavbarAndFooter && <Footer />}
    </>
  )
}