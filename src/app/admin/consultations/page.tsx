// src/app/admin/consultations/page.tsx
// Consultation Management
'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Phone, Mail, Building2, Check, X, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'

interface Consultation {
  id: string
  customerName: string
  companyName: string
  email: string
  phone: string
  date: string
  duration: number // minutes
  type: 'discovery' | 'compliance' | 'enterprise'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  convertedToSale: boolean
}

export default function ConsultationManagement() {
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: '1',
      customerName: 'Sarah Mitchell',
      companyName: 'Midwest Regional Bank',
      email: 'sarah@midwestbank.com',
      phone: '(312) 555-0123',
      date: '2026-02-17T14:00:00',
      duration: 30,
      type: 'compliance',
      status: 'scheduled',
      convertedToSale: false
    },
    {
      id: '2',
      customerName: 'James Chen',
      companyName: 'Chen & Associates Law',
      email: 'james@chenlaw.com',
      phone: '(212) 555-0456',
      date: '2026-02-17T15:30:00',
      duration: 45,
      type: 'enterprise',
      status: 'scheduled',
      convertedToSale: false
    }
  ])
  
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('scheduled')
  
  const filteredConsultations = consultations.filter(c => {
    if (filter === 'all') return true
    return c.status === filter
  })
  
  const handleStatusChange = (id: string, status: Consultation['status']) => {
    setConsultations(consultations.map(c =>
      c.id === id ? { ...c, status } : c
    ))
  }
  
  const handleConvertToSale = (id: string) => {
    setConsultations(consultations.map(c =>
      c.id === id ? { ...c, convertedToSale: true, status: 'completed' } : c
    ))
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Consultation Management</h1>
        <button className="px-4 py-2 bg-navy-900 text-white rounded-lg">
          Schedule New Consultation
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('scheduled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'scheduled'
              ? 'bg-navy-900 text-white'
              : 'bg-white text-navy-600 hover:bg-slate-50'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-navy-900 text-white'
              : 'bg-white text-navy-600 hover:bg-slate-50'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-navy-900 text-white'
              : 'bg-white text-navy-600 hover:bg-slate-50'
          }`}
        >
          All
        </button>
      </div>
      
      {/* Consultation List */}
      <div className="space-y-4">
        {filteredConsultations.map((consultation) => (
          <div
            key={consultation.id}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-navy-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900">{consultation.customerName}</h3>
                  <p className="text-sm text-navy-600">{consultation.companyName}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-navy-500">
                      <Mail className="w-3 h-3" />
                      {consultation.email}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-navy-500">
                      <Phone className="w-3 h-3" />
                      {consultation.phone}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${consultation.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                  ${consultation.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${consultation.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {consultation.status}
                </span>
                <button className="p-2 hover:bg-slate-100 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-navy-500" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-navy-400" />
                <span>{format(new Date(consultation.date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-navy-400" />
                <span>{format(new Date(consultation.date), 'h:mm a')} ({consultation.duration} min)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-navy-400" />
                <span className="capitalize">{consultation.type}</span>
              </div>
            </div>
            
            {consultation.status === 'scheduled' && (
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleStatusChange(consultation.id, 'completed')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Mark Completed
                </button>
                <button
                  onClick={() => handleStatusChange(consultation.id, 'cancelled')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={() => handleConvertToSale(consultation.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700"
                >
                  Convert to Sale
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}