// src/app/dashboard/settings/profile/page.tsx
import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Get additional profile data if needed
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Profile Settings</h1>
      <p className="text-navy-600">Manage your personal information</p>

      <ProfileForm user={user} profile={profile} />
    </div>
  )
}