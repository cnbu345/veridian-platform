// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createClient, getServerUser } from '@/lib/supabase/server'
import AdminNav from './components/AdminNav'
import AdminHeader from './components/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }
  
  // Check if user is admin
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
    
  if (!profile?.is_admin) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader user={user} />
      <div className="flex">
        <AdminNav />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}