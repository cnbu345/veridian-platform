// src/app/report/layout.tsx
import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase/server'
import DashboardSidebar from '../dashboard/components/DashboardSidebar'

export default async function ReportLayout({
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
      <main className="flex-1 ml-64">
        <div className="pt-7 px-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}