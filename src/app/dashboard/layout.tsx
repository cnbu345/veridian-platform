// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { createClient, getServerUser } from '@/lib/supabase/server'
import DashboardSidebar from './components/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar user={user} />
      <main className="flex-1 ml-64"> {/* ml-64 matches sidebar width */}
        <div className="pt-7 px-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}