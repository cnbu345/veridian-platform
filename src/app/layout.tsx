// src/app/layout.tsx // app layout
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerUser } from '@/lib/supabase/server'
import { Analytics } from '@vercel/analytics/react'
import RootLayoutClient from '@/components/layout/RootLayoutClient'
import DevToolbar from '@/components/admin/DevToolbar'

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
  title: {
    default: 'Veridian Group - Enterprise Regulatory Intelligence for Digital Assets',
    template: '%s | Veridian Group'
  },
  description: 'The leading AI-powered regulatory intelligence platform for digital assets. Real-time compliance monitoring across all 50 states, automated risk assessment, and enterprise-grade regulatory analysis for financial institutions.',
  keywords: [
    'regulatory intelligence',
    'digital assets compliance',
    'cryptocurrency regulation',
    'state-by-state compliance',
    'financial regulation',
    'AI compliance platform',
    'enterprise regulatory software',
    'BitLicense compliance',
    'money transmitter license',
    'regulatory technology'
  ],
  authors: [{ name: 'Veridian Group' }],
  creator: 'Veridian Group',
  publisher: 'Veridian Group',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://veridiangroup.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Veridian Group - Enterprise Regulatory Intelligence for Digital Assets',
    description: 'AI-powered regulatory intelligence platform trusted by financial institutions. Real-time compliance monitoring across all 50 states.',
    url: 'https://veridiangroup.com',
    siteName: 'Veridian Group',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Veridian Group - Enterprise Regulatory Intelligence Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veridian Group - Enterprise Regulatory Intelligence for Digital Assets',
    description: 'AI-powered regulatory intelligence platform trusted by financial institutions. Real-time compliance monitoring across all 50 states.',
    images: ['/twitter-image.png'],
    creator: '@veridiangroup',
    site: '@veridiangroup',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/veridian-logo-blue-192X192.png', sizes: '192x192', type: 'image/png' },
      { url: '/veridian-logo-blue-512X512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/veridian-logo-gold-192X192.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#0A1A2F',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Veridian Group',
  },
  applicationName: 'Veridian Group',
  category: 'enterprise-software',
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
        <DevToolbar />
      </body>
    </html>
  )
}