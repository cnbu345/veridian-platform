// src/app/admin/components/ConsultationQueue.tsx // Consultation Queue
'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Mail, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Consultation {
  id: string
  customer_name: string
  company_name: string
  consultation_date: string
  duration_minutes: number
  consultation_type: string
  status: string
}

export default function ConsultationQueue() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchConsultations()

    // Subscribe to new consultations
    const subscription = supabase
      .channel('consultations-channel')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'consultations' },
        (payload) => {
          setConsultations(prev => [payload.new as Consultation, ...prev].slice(0, 5))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchConsultations = async () => {
    try {
      const { data } = await supabase
        .from('consultations')
        .select('*')
        .eq('status', 'scheduled')
        .order('consultation_date', { ascending: true })
        .limit(5)
      
      setConsultations(data || [])
    } catch (error) {
      console.error('Failed to fetch consultations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'discovery':
        return 'bg-blue-100 text-blue-800'
      case 'compliance':
        return 'bg-purple-100 text-purple-800'
      case 'enterprise':
        return 'bg-gold-100 text-gold-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-navy-900">Upcoming Consultations</h2>
        <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">
          View All
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500">No upcoming consultations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-navy-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-navy-900 truncate">
                    {consultation.customer_name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(consultation.consultation_type)}`}>
                    {consultation.consultation_type}
                  </span>
                </div>
                
                <p className="text-sm text-navy-600 mb-2 truncate">
                  {consultation.company_name}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-navy-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(consultation.consultation_date), 'MMM d')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(consultation.consultation_date), 'h:mm a')} ({consultation.duration_minutes}min)
                  </span>
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-navy-400 group-hover:text-navy-600 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}