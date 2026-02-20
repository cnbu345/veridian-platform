// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerUser } from '@/lib/supabase/server'
import { Analytics } from '@vercel/analytics/react'
import RootLayoutClient from '@/components/layout/RootLayoutClient'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A1A2F'
}

export const metadata: Metadata = {
  title: 'Veridian Group - Executive Web3 Strategy & Location Intelligence',
  description: 'The only location-intelligent Web3 strategy platform trusted by Fortune 500 executives. AI-powered analysis, human-validated strategy, 50-state regulatory mapping.',
  // ... rest of your metadata stays the same
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <RootLayoutClient initialUser={user}>
          {children}
        </RootLayoutClient>
        <Analytics />
      </body>
    </html>
  )
}