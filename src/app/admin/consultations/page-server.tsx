// src/app/admin/consultations/page-server.tsx
// This is a SERVER COMPONENT that fetches data
import { getConsultations } from '@/lib/consultations/server'
import ConsultationManagementClient from './page-client'

interface PageProps {
  searchParams?: {
    status?: string
    dateRange?: string
    search?: string
  }
}

export default async function AdminConsultationsPage({ searchParams }: PageProps) {
  // Fetch data on the server
  const filters: any = {}
  
  if (searchParams?.status && searchParams.status !== 'all') {
    filters.status = searchParams.status
  }
  
  // You can add more server-side filtering here if needed
  
  const consultations = await getConsultations(filters)
  
  // Pass data to client component
  return <ConsultationManagementClient initialConsultations={consultations} />
}