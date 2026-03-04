// src/app/admin/consultations/calendar/CalendarViewClient.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, 
  User, Video, Phone, Mail, X, ChevronDown, List
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'

interface Consultation {
  id: string
  customer_name: string
  company_name: string
  consultation_date: string
  consultation_type: 'discovery' | 'strategy' | 'technical' | 'compliance'
  meeting_link?: string | null
}

interface Props {
  initialConsultations: Consultation[]
}

type ViewMode = 'month' | 'week' | 'day'

const CONSULTATION_COLORS = {
  discovery: 'bg-purple-100 border-l-4 border-purple-500 hover:bg-purple-200',
  strategy: 'bg-blue-100 border-l-4 border-blue-500 hover:bg-blue-200',
  technical: 'bg-amber-100 border-l-4 border-amber-500 hover:bg-amber-200',
  compliance: 'bg-green-100 border-l-4 border-green-500 hover:bg-green-200'
}

export default function CalendarViewClient({ initialConsultations }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [consultations] = useState(initialConsultations)
  const [showDayDetails, setShowDayDetails] = useState(false)

  const getConsultationsForDate = (date: Date) => {
    return consultations.filter(c => isSameDay(parseISO(c.consultation_date), date))
  }

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowDayDetails(true)
  }

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-50 p-3 text-center text-sm font-medium text-navy-600">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, idx) => {
          const dayConsultations = getConsultationsForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDate && isSameDay(day, selectedDate)

          return (
            <div
              key={idx}
              onClick={() => handleDateClick(day)}
              className={cn(
                "min-h-[120px] bg-white p-2 cursor-pointer transition-all",
                !isCurrentMonth && "bg-slate-50 text-navy-300",
                isToday && "ring-2 ring-gold-500 ring-inset",
                isSelected && "ring-2 ring-navy-500 ring-inset"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrentMonth ? "text-navy-900" : "text-navy-400"
                )}>
                  {format(day, 'd')}
                </span>
                {dayConsultations.length > 0 && (
                  <span className="text-xs bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full">
                    {dayConsultations.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayConsultations.slice(0, 2).map(consultation => (
                  <div
                    key={consultation.id}
                    className={cn(
                      "text-xs p-1.5 rounded truncate cursor-pointer",
                      CONSULTATION_COLORS[consultation.consultation_type]
                    )}
                  >
                    <span className="font-medium">{format(parseISO(consultation.consultation_date), 'h:mm a')}</span>
                    <span className="block truncate">{consultation.customer_name}</span>
                  </div>
                ))}
                {dayConsultations.length > 2 && (
                  <div className="text-xs text-navy-500 text-center">
                    +{dayConsultations.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      return day
    })

    const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 8 PM

    return (
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-slate-200">
          <div className="p-4 bg-slate-50 border-r border-slate-200">
            <span className="text-sm font-medium text-navy-600">Time</span>
          </div>
          {weekDays.map((day, idx) => (
            <div key={idx} className="p-4 text-center bg-slate-50">
              <div className="text-sm font-medium text-navy-900">{format(day, 'EEE')}</div>
              <div className="text-xs text-navy-500">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b border-slate-200 last:border-b-0">
            <div className="p-3 border-r border-slate-200 bg-slate-50">
              <span className="text-sm text-navy-600">{hour}:00</span>
            </div>
            {weekDays.map((day, idx) => {
              const dayConsultations = getConsultationsForDate(day).filter(c => {
                const consultHour = parseISO(c.consultation_date).getHours()
                return consultHour === hour
              })

              return (
                <div key={idx} className="p-2 min-h-[80px]">
                  {dayConsultations.map(consultation => (
                    <div
                      key={consultation.id}
                      className={cn(
                        "text-xs p-2 mb-1 rounded cursor-pointer",
                        CONSULTATION_COLORS[consultation.consultation_type]
                      )}
                    >
                      <div className="font-medium">{consultation.customer_name}</div>
                      <div className="truncate">{consultation.company_name}</div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // Day View
  const renderDayView = () => {
    if (!selectedDate) return null

    const dayConsultations = getConsultationsForDate(selectedDate).sort((a, b) => 
      parseISO(a.consultation_date).getTime() - parseISO(b.consultation_date).getTime()
    )

    return (
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-navy-900 to-navy-800 text-white">
          <h2 className="text-xl font-semibold mb-2">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
          <p className="text-navy-200">{dayConsultations.length} consultations scheduled</p>
        </div>

        <div className="divide-y divide-slate-200">
          {dayConsultations.map(consultation => (
            <div key={consultation.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-navy-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-navy-900">
                        {format(parseISO(consultation.consultation_date), 'h:mm a')}
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        CONSULTATION_COLORS[consultation.consultation_type].split(' ')[0]
                      )}>
                        {consultation.consultation_type}
                      </span>
                    </div>
                    <h3 className="font-medium text-navy-900 mb-1">{consultation.customer_name}</h3>
                    <p className="text-sm text-navy-500 mb-2">{consultation.company_name}</p>
                    {consultation.meeting_link && (
                      <a
                        href={consultation.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/consultations/${consultation.id}`}
                  className="px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}

          {dayConsultations.length === 0 && (
            <div className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-navy-300 mx-auto mb-4" />
              <p className="text-navy-500 mb-4">No consultations scheduled for this day</p>
              <Link
                href="/admin/consultations/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
              >
                Schedule Consultation
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Calendar View</h1>
          <p className="text-navy-600">View and manage consultations by date</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === 'month' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === 'week' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === 'day' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              Day
            </button>
          </div>

          <Link
            href="/admin/consultations/upcoming"
            className="px-4 py-2 border border-navy-200 text-navy-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List View
          </Link>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-navy-600" />
          </button>
          <h2 className="text-xl font-semibold text-navy-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-navy-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent">
            <option value="">All Types</option>
            <option value="discovery">Discovery</option>
            <option value="strategy">Strategy</option>
            <option value="technical">Technical</option>
            <option value="compliance">Compliance</option>
          </select>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* Day Details Modal (for month view) */}
      <AnimatePresence>
        {showDayDetails && selectedDate && viewMode === 'month' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDayDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="text-xl font-semibold text-navy-900">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-navy-500">
                    {getConsultationsForDate(selectedDate).length} consultations
                  </p>
                </div>
                <button
                  onClick={() => setShowDayDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {getConsultationsForDate(selectedDate).map(consultation => (
                  <div
                    key={consultation.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-gold-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-navy-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-navy-900">
                              {format(parseISO(consultation.consultation_date), 'h:mm a')}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              CONSULTATION_COLORS[consultation.consultation_type].split(' ')[0]
                            )}>
                              {consultation.consultation_type}
                            </span>
                          </div>
                          <h3 className="font-medium text-navy-900">{consultation.customer_name}</h3>
                          <p className="text-sm text-navy-500">{consultation.company_name}</p>
                        </div>
                      </div>
                      <Link
                        href={`/admin/consultations/${consultation.id}`}
                        className="text-gold-600 hover:text-gold-700 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}