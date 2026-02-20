// src/components/layout/RootLayoutClient.tsx
'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

interface RootLayoutClientProps {
  children: React.ReactNode
  initialUser: any
}

export default function RootLayoutClient({ children, initialUser }: RootLayoutClientProps) {
  const pathname = usePathname()
  
  // Define routes where we want to hide the marketing navbar and footer
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isAuthRoute = pathname?.startsWith('/auth')
  const isAppRoute = isDashboardRoute || isAuthRoute

  return (
    <>
      {!isAppRoute && <Navbar initialUser={initialUser} />}
      <main className={`min-h-screen ${!isAppRoute ? 'pt-20' : ''}`}>
        {children}
      </main>
      {!isAppRoute && <Footer />}
    </>
  )
}