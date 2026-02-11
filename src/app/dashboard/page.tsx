import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <h1 className="heading-1 mb-8">Dashboard</h1>
        <p className="text-xl text-navy-600 mb-8">
          Welcome back, {user.email}
        </p>
        <Button >
          <Link href="/generate">Generate New Report</Link>
        </Button>
      </div>
    </div>
  )
}