import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getServerUser } from '@/lib/supabase/server'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Veridian Group - Executive Web3 Strategy & Location Intelligence',
  description: 'The only location-intelligent Web3 strategy platform trusted by Fortune 500 executives. AI-powered analysis, human-validated strategy, 50-state regulatory mapping.',
  keywords: 'Web3 strategy, blockchain consulting, crypto regulation, digital transformation, executive strategy',
  authors: [{ name: 'Veridian Group' }],
  creator: 'Veridian Group',
  publisher: 'Veridian Group',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Veridian Group - Executive Web3 Strategy',
    description: 'Location-intelligent Web3 strategy for executives',
    siteName: 'Veridian Group',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veridian Group - Executive Web3 Strategy',
    description: 'Location-intelligent Web3 strategy for executives',
    creator: '@veridiangroup',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0A1A2F',
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
        <Navbar initialUser={user} />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}