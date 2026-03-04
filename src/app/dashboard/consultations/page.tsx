// src/app/dashboard/consultations/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Video, ChevronRight, AlertCircle, Check, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { getClientConsultations, cancelConsultation } from '@/lib/consultations/client'
import toast from 'react-hot-toast'

interface Consultation {
  id: string
  consultation_date: string
  duration_minutes: number
  consultation_type: 'discovery' | 'compliance' | 'enterprise'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  meeting_link?: string
}

export default function ClientConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      const data = await getClientConsultations()
      setConsultations(data)
    } catch (error) {
      console.error('Error loading consultations:', error)
      toast.error('Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelConsultation(id, cancelReason)
      await loadConsultations()
      setShowCancelModal(null)
      setCancelReason('')
      toast.success('Consultation cancelled successfully')
    } catch (error) {
      console.error('Error cancelling consultation:', error)
      toast.error('Failed to cancel consultation')
    }
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'discovery': return 'Discovery Call'
      case 'compliance': return 'Compliance Review'
      case 'enterprise': return 'Enterprise Strategy'
      default: return 'Consultation'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Scheduled</span>
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>
      case 'no-show':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Missed</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-navy-200 border-t-navy-900 rounded-full animate-spin"></div>
          <p className="text-navy-600 mt-4">Loading consultations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Consultations</h1>
          <p className="text-navy-600 mt-1">Manage your scheduled calls with our team</p>
        </div>
        <Link
          href="/consultation"
          className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
        >
          Schedule New
        </Link>
      </div>

      {/* Upcoming Consultations */}
      {consultations.filter(c => c.status === 'scheduled').length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="font-semibold text-navy-900">Upcoming Consultations</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {consultations
              .filter(c => c.status === 'scheduled')
              .sort((a, b) => new Date(a.consultation_date).getTime() - new Date(b.consultation_date).getTime())
              .map((consultation) => (
                <div key={consultation.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-navy-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy-900">
                          {getTypeLabel(consultation.consultation_type)}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-navy-600">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(consultation.consultation_date), 'MMMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-navy-600">
                            <Clock className="w-4 h-4" />
                            {format(parseISO(consultation.consultation_date), 'h:mm a')} ({consultation.duration_minutes} min)
                          </span>
                        </div>
                        {consultation.meeting_link && (
                          <a
                            href={consultation.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 text-sm text-gold-600 hover:text-gold-700"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(consultation.status)}
                      <button
                        onClick={() => setShowCancelModal(consultation.id)}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Reminder Banner */}
                  {(() => {
                    const consultDate = new Date(consultation.consultation_date)
                    const now = new Date()
                    const hoursUntil = (consultDate.getTime() - now.getTime()) / (1000 * 60 * 60)
                    
                    if (hoursUntil > 0 && hoursUntil < 24) {
                      return (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-yellow-800 font-medium">Your consultation is coming up soon!</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Please ensure you have a stable internet connection and a quiet space for the call.
                            </p>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Past Consultations */}
      {consultations.filter(c => c.status !== 'scheduled').length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="font-semibold text-navy-900">Past Consultations</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {consultations
              .filter(c => c.status !== 'scheduled')
              .sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime())
              .map((consultation) => (
                <div key={consultation.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy-900">
                          {getTypeLabel(consultation.consultation_type)}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-navy-500">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(consultation.consultation_date), 'MMMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-navy-500">
                            <Clock className="w-4 h-4" />
                            {format(parseISO(consultation.consultation_date), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {getStatusBadge(consultation.status)}
                  </div>

                  {consultation.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-navy-600">{consultation.notes}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {consultations.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-navy-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-navy-900 mb-2">No Consultations Yet</h3>
          <p className="text-navy-600 mb-6">
            Schedule your free 30-minute consultation to discuss your compliance needs with our team.
          </p>
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
          >
            Schedule Your Free Consultation
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-navy-900">Cancel Consultation</h3>
            </div>
            <div className="p-6">
              <p className="text-navy-600 mb-4">
                Are you sure you want to cancel this consultation? This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Tell us why you're cancelling..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCancel(showCancelModal)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(null)
                    setCancelReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  No, Keep It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}