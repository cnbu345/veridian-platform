// src/app/admin/consultations/calendar/CalendarViewClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, 
  User, Video, Phone, Mail, X, ChevronDown, List, ExternalLink, Copy,
  FileText
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'
import NewConsultationClient from '@/app/admin/consultations/'

interface Consultation {
  id: string
  customer_name: string
  company_name: string
  consultation_date: string
  consultation_type: 'discovery' | 'strategy' | 'technical' | 'compliance' | 'enterprise'
  meeting_link?: string | null
  notes?: string | null
}

interface Props {
  initialConsultations: Consultation[]
}

type ViewMode = 'month' | 'week' | 'day'

const CONSULTATION_COLORS: Record<string, string> = {
  discovery: 'bg-purple-100 border-l-4 border-purple-500 hover:bg-purple-200 text-purple-800',
  strategy: 'bg-blue-100 border-l-4 border-blue-500 hover:bg-blue-200 text-blue-800',
  technical: 'bg-amber-100 border-l-4 border-amber-500 hover:bg-amber-200 text-amber-800',
  compliance: 'bg-green-100 border-l-4 border-green-500 hover:bg-green-200 text-green-800',
  enterprise: 'bg-indigo-100 border-l-4 border-indigo-500 hover:bg-indigo-200 text-indigo-800'
}

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  discovery: 'Discovery Call',
  strategy: 'Strategy Session',
  technical: 'Technical Review',
  compliance: 'Compliance Check',
  enterprise: 'Enterprise Strategy'
}

export default function CalendarViewClient({ initialConsultations }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()) // Default to today
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [consultations] = useState(initialConsultations)
  const [showDayDetails, setShowDayDetails] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [showConsultationModal, setShowConsultationModal] = useState(false)

  // Update selected date when view mode changes to ensure we have a valid date
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date())
    }
  }, [selectedDate])

  const getConsultationsForDate = (date: Date) => {
    return consultations.filter(c => isSameDay(parseISO(c.consultation_date), date))
  }

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (viewMode === 'day' && selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setDate(selectedDate.getDate() - 1)
      setSelectedDate(newDate)
      setCurrentDate(newDate)
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (viewMode === 'day' && selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setDate(selectedDate.getDate() + 1)
      setSelectedDate(newDate)
      setCurrentDate(newDate)
    }
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    if (viewMode === 'month') {
      setShowDayDetails(true)
    } else if (viewMode === 'day') {
      // In day view, just update the selected date
      setCurrentDate(date)
    }
  }

  const handleConsultationClick = (consultation: Consultation, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedConsultation(consultation)
    setShowConsultationModal(true)
  }

  const handleCopyMeetingLink = (link: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(link)
    toast.success('Meeting link copied to clipboard')
  }

  const handleJoinMeeting = (link: string, e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(link, '_blank', 'noopener,noreferrer')
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
                "min-h-[120px] bg-white p-2 cursor-pointer transition-all group",
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
                    onClick={(e) => handleConsultationClick(consultation, e)}
                    className={cn(
                      "text-xs p-1.5 rounded truncate relative group/item",
                      CONSULTATION_COLORS[consultation.consultation_type] || 'bg-slate-100 border-l-4 border-slate-500'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {format(parseISO(consultation.consultation_date), 'h:mm a')}
                      </span>
                      {consultation.meeting_link && (
                        <button
                          onClick={(e) => handleJoinMeeting(consultation.meeting_link!, e)}
                          className="opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5 hover:bg-white/30 rounded"
                          title="Join meeting"
                        >
                          <Video className="w-3 h-3" />
                        </button>
                      )}
                    </div>
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
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, new Date())
            return (
              <div 
                key={idx} 
                className={cn(
                  "p-4 text-center cursor-pointer hover:bg-slate-100",
                  isToday ? "bg-gold-50" : "bg-slate-50"
                )}
                onClick={() => {
                  setSelectedDate(day)
                  setViewMode('day')
                }}
              >
                <div className="text-sm font-medium text-navy-900">{format(day, 'EEE')}</div>
                <div className={cn(
                  "text-xs",
                  isToday ? "text-gold-600 font-bold" : "text-navy-500"
                )}>
                  {format(day, 'MMM d')}
                </div>
              </div>
            )
          })}
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
                <div key={idx} className="p-2 min-h-[80px] border-r border-slate-200 last:border-r-0">
                  {dayConsultations.map(consultation => (
                    <div
                      key={consultation.id}
                      onClick={(e) => handleConsultationClick(consultation, e)}
                      className={cn(
                        "text-xs p-2 mb-1 rounded cursor-pointer group relative",
                        CONSULTATION_COLORS[consultation.consultation_type] || 'bg-slate-100'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{consultation.customer_name}</div>
                          <div className="truncate">{consultation.company_name}</div>
                        </div>
                        {consultation.meeting_link && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleJoinMeeting(consultation.meeting_link!, e)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/30 rounded"
                            title="Join meeting"
                          >
                            <Video className="w-3 h-3" />
                          </button>
                        )}
                      </div>
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
  // Day View - Updated to show only scheduled consultations with standard time format
  const renderDayView = () => {
    if (!selectedDate) {
      setSelectedDate(new Date())
      return null
    }

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
          {dayConsultations.length > 0 ? (
            dayConsultations.map(consultation => {
              const consultationDate = parseISO(consultation.consultation_date)
              const endTime = new Date(consultationDate)
              endTime.setMinutes(endTime.getMinutes() + 30) // Assuming 30-minute consultations
              
              return (
                <div
                  key={consultation.id}
                  onClick={(e) => handleConsultationClick(consultation, e)}
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Time Column */}
                    <div className="w-32 flex-shrink-0">
                      <div className="text-lg font-semibold text-navy-900">
                        {format(consultationDate, 'h:mm a')}
                      </div>
                      <div className="text-sm text-navy-500">
                        {format(endTime, 'h:mm a')}
                      </div>
                    </div>

                    {/* Consultation Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          CONSULTATION_COLORS[consultation.consultation_type]?.split(' ')[0] || 'bg-slate-100'
                        )}>
                          {CONSULTATION_TYPE_LABELS[consultation.consultation_type] || consultation.consultation_type}
                        </span>
                        {consultation.meeting_link && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Video className="w-3 h-3" />
                            Video Call
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-navy-900 text-lg">{consultation.customer_name}</h3>
                      <p className="text-navy-600 mb-2">{consultation.company_name}</p>
                      
                      {consultation.notes && (
                        <p className="text-sm text-navy-500 bg-slate-50 p-3 rounded-lg line-clamp-2">
                          📝 {consultation.notes}
                        </p>
                      )}

                      {/* Quick Actions */}
                      {consultation.meeting_link && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleJoinMeeting(consultation.meeting_link!, e)
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyMeetingLink(consultation.meeting_link!, e)
                            }}
                            className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Arrow Indicator */}
                    <div className="flex-shrink-0 self-center">
                      <ChevronRight className="w-5 h-5 text-navy-300" />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-navy-300" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">No consultations scheduled</h3>
              <p className="text-navy-500 mb-6">This day has no scheduled consultations.</p>
              <Link
                href="/admin/consultations/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
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
              onClick={() => {
                setViewMode('day')
                if (!selectedDate) setSelectedDate(new Date())
              }}
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
            onClick={handlePrev}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-navy-600" />
          </button>
          <h2 className="text-xl font-semibold text-navy-900">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
            {viewMode === 'day' && selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-navy-600" />
          </button>
          <button
            onClick={handleToday}
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
            <option value="enterprise">Enterprise</option>
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
                    onClick={(e) => {
                      handleConsultationClick(consultation, e)
                      setShowDayDetails(false)
                    }}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-gold-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-navy-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-navy-900">
                              {format(parseISO(consultation.consultation_date), 'h:mm a')}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              CONSULTATION_COLORS[consultation.consultation_type]?.split(' ')[0] || 'bg-slate-100'
                            )}>
                              {CONSULTATION_TYPE_LABELS[consultation.consultation_type] || consultation.consultation_type}
                            </span>
                          </div>
                          <h3 className="font-medium text-navy-900">{consultation.customer_name}</h3>
                          <p className="text-sm text-navy-500 mb-2">{consultation.company_name}</p>
                          {consultation.notes && (
                            <p className="text-xs text-navy-600 bg-slate-50 p-2 rounded-lg line-clamp-2 mb-2">
                              <span className="font-medium">📝</span> {consultation.notes}
                            </p>
                          )}
                          {consultation.meeting_link && (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleJoinMeeting(consultation.meeting_link!, e)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                <Video className="w-4 h-4" />
                                Join
                              </button>
                              <button
                                onClick={(e) => handleCopyMeetingLink(consultation.meeting_link!, e)}
                                className="p-1 text-navy-400 hover:text-navy-600"
                                title="Copy link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <a
                                href={consultation.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-navy-400 hover:text-navy-600"
                                title="Opens in new tab"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-gold-600 text-sm font-medium ml-4">View Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consultation Details Modal */}
      <AnimatePresence>
        {showConsultationModal && selectedConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConsultationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-semibold text-navy-900">Consultation Details</h2>
                <button
                  onClick={() => setShowConsultationModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Customer Info */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-navy-500 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-navy-400">Name</p>
                      <p className="text-navy-900 font-medium">{selectedConsultation.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-400">Company</p>
                      <p className="text-navy-900">{selectedConsultation.company_name}</p>
                    </div>
                  </div>
                </div>

                {/* Consultation Details */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-navy-500 mb-3">Consultation Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-navy-400" />
                      <span className="text-navy-900">
                        {format(parseISO(selectedConsultation.consultation_date), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-navy-400" />
                      <span className="text-navy-900">
                        {format(parseISO(selectedConsultation.consultation_date), 'h:mm a')}
                      </span>
                    </div>
                    <div>
                      <span className={cn(
                        "inline-block px-2 py-1 rounded-full text-xs font-medium",
                        CONSULTATION_COLORS[selectedConsultation.consultation_type]?.split(' ')[0] || 'bg-slate-100'
                      )}>
                        {CONSULTATION_TYPE_LABELS[selectedConsultation.consultation_type] || selectedConsultation.consultation_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedConsultation.notes ? (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-navy-500" />
                      <h3 className="text-sm font-medium text-navy-500">Notes</h3>
                    </div>
                    <p className="text-navy-700 whitespace-pre-wrap text-sm bg-white p-3 rounded-lg border border-slate-200">
                      {selectedConsultation.notes}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-navy-400" />
                      <h3 className="text-sm font-medium text-navy-500">Notes</h3>
                    </div>
                    <p className="text-navy-400 text-sm italic bg-white p-3 rounded-lg border border-slate-200">
                      No notes added for this consultation
                    </p>
                  </div>
                )}

                {/* Meeting Link */}
                {selectedConsultation.meeting_link ? (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-navy-500 mb-3">Meeting Link</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={selectedConsultation.meeting_link}
                          readOnly
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                        />
                        <a
                          href={selectedConsultation.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-navy-400 hover:text-navy-600"
                          title="Opens in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleJoinMeeting(selectedConsultation.meeting_link!, e)}
                          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Video className="w-5 h-5" />
                          Join Meeting Now
                        </button>
                        <button
                          onClick={(e) => handleCopyMeetingLink(selectedConsultation.meeting_link!, e)}
                          className="px-4 py-3 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors text-sm flex items-center justify-center"
                          title="Copy link"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-navy-500 mb-3">Meeting Link</h3>
                    <p className="text-navy-400 text-sm italic bg-white p-3 rounded-lg border border-slate-200">
                      No meeting link provided
                    </p>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowConsultationModal(false)}
                    className="w-full px-4 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}