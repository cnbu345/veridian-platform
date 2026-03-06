// src/app/dashboard/support/faq/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardFAQClient from './FAQClient'

export default async function DashboardFAQPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }
  
  // Fetch FAQs
  const { data: faqs } = await supabase
    .from('faq_items')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  // Group FAQs by category
  const groupedFaqs = (faqs || []).reduce((acc: any, faq) => {
    const category = faq.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(faq)
    return acc
  }, {})

  return <DashboardFAQClient groupedFaqs={groupedFaqs} />
}