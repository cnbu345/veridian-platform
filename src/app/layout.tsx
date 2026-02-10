import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { createServer } from '@/lib/supabase'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Veridian Group - Truth in Digital Transformation',
  description: 'AI-powered Web3 strategy reports customized for your business location',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar user={user} />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Veridian Group</h3>
              <p className="text-gray-400">Truth in Digital Transformation</p>
              <p className="text-sm text-gray-500 mt-8">
                © {new Date().getFullYear()} Veridian Group. All rights reserved.
                <br />
                This platform provides educational content and should not be considered financial advice.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}