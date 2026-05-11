// src/app/consultation/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User, Building2, Phone, Mail, FileText } from 'lucide-react'
import { format, addDays, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/utils'
import { useRouter } from 'next/navigation'

interface TimeSlot {
  start: string
  end: string
}

interface DayAvailability {
  isAvailable: boolean
  slots: TimeSlot[]
  duration: number
}

interface Availability {
  [key: string]: DayAvailability
}

// Days in order starting with Sunday (to match JavaScript's getDay())
const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// Consultation types that match your database
const CONSULTATION_TYPES = [
  { value: 'discovery', label: 'Discovery Call', description: '30-minute intro call to discuss your needs' },
  { value: 'strategy', label: 'Strategy Session', description: 'Deep dive into your regulatory strategy' },
  { value: 'technical', label: 'Technical Review', description: 'Technical consultation on implementation' },
  { value: 'compliance', label: 'Compliance Check', description: 'Review your compliance status' },
  { value: 'enterprise', label: 'Enterprise Strategy', description: 'Enterprise-level strategy' }
]

// Get user's local timezone
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

export default function ConsultationPage() {
  const router = useRouter()
  
  // All state variables
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>('discovery')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    notes: ''
  })

  // Load availability on mount
  useEffect(() => {
    loadAvailability()
  }, [])

  // Generate available dates when availability loads
  useEffect(() => {
    if (availability) {
      generateAvailableDates()
    }
  }, [availability, currentMonth])

  // Generate available times when date is selected
  useEffect(() => {
    if (selectedDate && availability) {
      generateAvailableTimes(selectedDate)
    }
  }, [selectedDate, availability])

  // Function to load admin availability settings
  const loadAvailability = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching availability...')
      const response = await fetch('/api/admin/availability')
      
      if (!response.ok) {
        throw new Error(`Failed to load availability: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Availability data:', data.availability)
      
      if (!data.availability) {
        throw new Error('No availability data received')
      }
      
      setAvailability(data.availability)
      
    } catch (err) {
      console.error('Error loading availability:', err)
      setError('Unable to load available time slots. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch already booked slots from the database
  const fetchBookedSlots = async (date: Date): Promise<string[]> => {
    try {
      // Format date as YYYY-MM-DD (example: 2026-03-05)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      console.log('Fetching booked slots for date:', dateStr)
      
      // Call our API endpoint
      const response = await fetch(`/api/consultations/availability?date=${dateStr}`)
      
      if (!response.ok) {
        console.error('Failed to fetch booked slots')
        return []
      }
      
      const data = await response.json()
      console.log('API returned booked slots (UTC):', data.bookedSlots)
      
      // Return the UTC times directly (like "18:00", "19:00", "21:30")
      return data.bookedSlots || []
    } catch (error) {
      console.error('Error fetching booked slots:', error)
      return []
    }
  }

  // Function to generate available dates for the calendar
  const generateAvailableDates = () => {
    if (!availability) {
      console.log('No availability data yet')
      return
    }
    
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start, end })
    
    console.log('Generating available dates for month:', format(currentMonth, 'MMMM yyyy'))
    
    // Filter days that have availability slots
    const available = daysInMonth.filter(date => {
      const dayOfWeek = DAYS_OF_WEEK[date.getDay()]
      const dayAvailability = availability[dayOfWeek]
      
      // Check if this day has any available slots
      const isAvailable = dayAvailability?.isAvailable && 
                          dayAvailability.slots && 
                          dayAvailability.slots.length > 0
      
      return isAvailable
    })
    
    console.log('Available dates found:', available.length)
    setAvailableDates(available)
  }

  // Function to generate available time slots for a selected date
  const generateAvailableTimes = async (date: Date) => {
    if (!availability) {
      console.log('No availability data')
      setAvailableTimes([])
      return
    }
    
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()]
    const dayAvailability = availability[dayOfWeek]
    
    console.log('='.repeat(50))
    console.log('GENERATING TIMES FOR DATE:', format(date, 'yyyy-MM-dd (EEEE)'))
    console.log('Day of week:', dayOfWeek)
    console.log('Day availability:', dayAvailability)
    
    if (!dayAvailability?.isAvailable || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      console.log('No available slots for this day')
      setAvailableTimes([])
      return
    }
    
    // Fetch booked slots from the database (these are in UTC)
    const bookedUtcSlots = await fetchBookedSlots(date)
    console.log('Booked UTC slots from API:', bookedUtcSlots)
    setBookedSlots(bookedUtcSlots)
    
    // Generate all possible time slots based on admin availability
    const times: string[] = []
    
    dayAvailability.slots.forEach((slot: TimeSlot, index: number) => {
      console.log(`\nProcessing availability slot ${index}:`, slot)
      
      // Get start and end times from the availability slot
      let start: string, end: string
      
      if (typeof slot === 'string') {
        // Handle old format (just start time)
        start = slot
        // Default to 30 minutes later
        const [hours, minutes] = slot.split(':').map(Number)
        const endDate = new Date()
        endDate.setHours(hours, minutes + 30)
        end = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
      } else {
        // Handle new format (object with start and end)
        start = slot.start
        end = slot.end
      }
      
      const [startHour, startMinute] = start.split(':').map(Number)
      const [endHour, endMinute] = end.split(':').map(Number)
      
      const startTotal = startHour * 60 + startMinute
      const endTotal = endHour * 60 + endMinute
      
      console.log(`Time range: ${start} to ${end}`)
      
      // Generate 30-minute slots
      for (let time = startTotal; time < endTotal; time += 30) {
        const hours = Math.floor(time / 60)
        const minutes = time % 60
        const localTimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        
        // Convert this local time to UTC to check against booked slots
        // This is the key part - we need to see what UTC time this local time would become
        const localDateTime = new Date(date)
        localDateTime.setHours(hours, minutes, 0, 0)
        
        // Convert local time to UTC to get the UTC time string
        const utcHours = localDateTime.getUTCHours().toString().padStart(2, '0')
        const utcMinutes = localDateTime.getUTCMinutes().toString().padStart(2, '0')
        const utcTimeString = `${utcHours}:${utcMinutes}`
        
        // Check if this time is in the past
        const now = new Date()
        const isPast = localDateTime < now
        
        // Check if this UTC time is already booked
        const isBooked = bookedUtcSlots.includes(utcTimeString)
        
        console.log(`  Local: ${localTimeString} -> UTC: ${utcTimeString}`, {
          isPast,
          isBooked,
          wouldEndBeforeEnd: time + 30 <= endTotal
        })
        
        // Only add if it's valid, not booked, and in the future
        if (time + 30 <= endTotal && !isBooked && !isPast) {
          times.push(localTimeString)
          console.log(`  ✅ ADDED: ${localTimeString}`)
        } else {
          if (isBooked) console.log(`  ❌ SKIPPED (booked): ${localTimeString} (UTC: ${utcTimeString})`)
          if (isPast) console.log(`  ❌ SKIPPED (past): ${localTimeString}`)
        }
      }
    })
    
    // Remove duplicates and sort
    const uniqueTimes = [...new Set(times)].sort()
    console.log('\nFinal available times (local):', uniqueTimes)
    console.log('='.repeat(50))
    
    setAvailableTimes(uniqueTimes)
    setSelectedTime(null)
  }

  // Check if a date is available for booking
  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => isSameDay(availableDate, date))
  }

  // Handle date selection
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date)
    setError(null)
    await generateAvailableTimes(date)
  }

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setError(null)
  }

  // Handle month change in calendar
  const handleMonthChange = (increment: number) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + increment)
      return newMonth
    })
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Handle continue button
  const handleContinue = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2)
    } else if (step === 2) {
      // Validate form
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError('Please fill in all required fields')
        return
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address')
        return
      }
      setStep(3)
    }
  }

  // Handle back button
  const handleBack = () => {
    setStep(prev => prev - 1)
    setError(null)
  }

  // Handle final form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError(null)

      // Double-check that the slot is still available
      if (selectedDate && selectedTime) {
        const booked = await fetchBookedSlots(selectedDate)
        
        // Convert selected local time to UTC to check against booked slots
        const [hours, minutes] = selectedTime.split(':').map(Number)
        const localDateTime = new Date(selectedDate)
        localDateTime.setHours(hours, minutes, 0, 0)
        
        const utcHours = localDateTime.getUTCHours().toString().padStart(2, '0')
        const utcMinutes = localDateTime.getUTCMinutes().toString().padStart(2, '0')
        const utcTimeString = `${utcHours}:${utcMinutes}`
        
        if (booked.includes(utcTimeString)) {
          setError('This time slot has just been booked. Please select another time.')
          await generateAvailableTimes(selectedDate)
          setSubmitting(false)
          return
        }
      }

      // Combine date and time
      const [hours, minutes] = selectedTime!.split(':')
      const consultationDate = new Date(selectedDate!)
      consultationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      // IMPORTANT: Convert to UTC ISO string for storage
      // This ensures the database stores it in UTC correctly
      const utcDateString = consultationDate.toISOString()
      
      console.log('Submitting consultation:', {
        localTime: consultationDate.toString(),
        utcTime: utcDateString
      })
      
      const response = await fetch('/api/consultations/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          company_name: formData.companyName,
          consultation_date: utcDateString, // Send UTC time to API
          consultation_type: selectedType,
          notes: formData.notes
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to schedule consultation')
      }

      // Redirect to success page
      router.push('/dashboard/consultations?booked=true')
      
    } catch (err) {
      console.error('Error scheduling consultation:', err)
      setError(err instanceof Error ? err.message : 'Failed to schedule consultation')
    } finally {
      setSubmitting(false)
    }
  }

  // Get days in month for calendar display
  const getCalendarDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    
    // Add padding days from previous month
    const firstDayOfMonth = getDay(start) // 0 = Sunday
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() - (firstDayOfMonth - i))
      return date
    })
    
    // Add padding days from next month
    const lastDayOfMonth = getDay(end) // 0 = Sunday
    const remainingDays = 6 - lastDayOfMonth
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
      const date = new Date(end)
      date.setDate(end.getDate() + i + 1)
      return date
    })
    
    return [...paddingDays, ...days, ...nextMonthDays]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    )
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 to-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
            Schedule a Consultation
          </h1>
          <p className="text-sm sm:text-base text-navy-600">
            {step === 1 && "Choose a date and time that works for you"}
            {step === 2 && "Tell us a bit about yourself"}
            {step === 3 && "Review and confirm your consultation"}
          </p>
          <p className="text-xs text-navy-400 mt-2">
            All times shown in your timezone: {TIMEZONE}
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  s === step ? "w-8 bg-gold-600" : s < step ? "bg-green-500" : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Step 1: Date & Time Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Calendar Section */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gold-600" />
                    Select Date
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMonthChange(-1)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-navy-600" />
                    </button>
                    <span className="text-sm font-medium text-navy-700 min-w-[120px] text-center">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button
                      onClick={() => handleMonthChange(1)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-navy-600" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid - Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`} className="text-center text-xs font-medium text-navy-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, i) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                    const isAvailable = isCurrentMonth && isDateAvailable(date)
                    const isSelected = selectedDate && isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, new Date())

                    const uniqueKey = `calendar-day-${date.toISOString()}-${i}`
                    
                    return (
                      <button
                        key={uniqueKey}
                        onClick={() => isAvailable && handleDateSelect(date)}
                        disabled={!isAvailable}
                        className={cn(
                          "aspect-square p-1 sm:p-2 text-xs sm:text-sm rounded-lg transition-all relative",
                          isCurrentMonth 
                            ? "text-navy-900" 
                            : "text-navy-300",
                          isAvailable && !isSelected && "hover:bg-gold-50 cursor-pointer",
                          isAvailable && isSelected && "bg-gold-600 text-white hover:bg-gold-700",
                          !isAvailable && isCurrentMonth && "text-navy-300 cursor-not-allowed",
                          isToday && !isSelected && isAvailable && "border border-gold-300"
                        )}
                      >
                        {date.getDate()}
                        {isToday && !isSelected && isAvailable && (
                          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gold-600 rounded-full" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-navy-500">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gold-600 rounded-full" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                    <span>Unavailable</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-gold-300 rounded-full" />
                    <span>Today</span>
                  </div>
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-gold-600" />
                  Select Time
                </h2>

                {!selectedDate ? (
                  <div className="text-center py-8 sm:py-12">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-navy-500">
                      Select a date to see available times
                    </p>
                  </div>
                ) : availableTimes.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="text-navy-900 font-medium mb-1">
                      No available times for this date
                    </p>
                    <p className="text-sm text-navy-500">
                      Please select another date
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-navy-500 mb-4">
                      Available times for {format(selectedDate, 'EEEE, MMMM d')}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
                      {availableTimes.map(time => {
                        const [hours, minutes] = time.split(':')
                        const slotDateTime = new Date(selectedDate)
                        slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                        const isPast = slotDateTime < new Date()
                        
                        return (
                          <button
                            key={time}
                            onClick={() => !isPast && handleTimeSelect(time)}
                            disabled={isPast}
                            className={cn(
                              "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg border transition-all",
                              selectedTime === time && !isPast
                                ? "bg-gold-600 text-white border-gold-600"
                                : isPast
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-white border-slate-200 text-navy-700 hover:border-gold-300 hover:bg-gold-50"
                            )}
                          >
                            {format(parseISO(`2000-01-01T${time}`), 'h:mm a')}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-navy-600">
                  {selectedDate && selectedTime ? (
                    <p>
                      Selected: {format(selectedDate, 'EEEE, MMMM d')} at{' '}
                      {format(parseISO(`2000-01-01T${selectedTime}`), 'h:mm a')} ({TIMEZONE})
                    </p>
                  ) : (
                    <p>Please select a date and time to continue</p>
                  )}
                </div>
                
                <button
                  onClick={handleContinue}
                  disabled={!selectedDate || !selectedTime}
                  className={cn(
                    "px-6 sm:px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl",
                    "hover:from-gold-500 hover:to-gold-400 transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto",
                    "shadow-lg shadow-gold-500/25"
                  )}
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6"
          >
            <div className="space-y-4">
              {/* Consultation Type */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Consultation Type *
                </label>
                <select
                  name="consultation_type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                >
                  {CONSULTATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Your Company, Inc."
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Additional Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-navy-400" />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any specific topics you'd like to discuss?"
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={handleBack}
                className="px-6 py-3 text-navy-600 hover:text-navy-900 font-semibold w-full sm:w-auto"
              >
                Back
              </button>
              
              <button
                onClick={handleContinue}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 w-full sm:w-auto shadow-lg shadow-gold-500/25"
              >
                Review Booking
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Review Your Booking</h2>
            
            <div className="space-y-4">
              {/* Date & Time Summary */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-navy-900 mb-2">Date & Time</h3>
                <p className="text-navy-700">
                  {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')} at{' '}
                  {selectedTime && format(parseISO(`2000-01-01T${selectedTime}`), 'h:mm a')}
                </p>
                <p className="text-sm text-navy-500 mt-1">Timezone: {TIMEZONE}</p>
                <p className="text-sm text-navy-500 mt-1">30 minute consultation</p>
              </div>

              {/* Consultation Type Summary */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-navy-900 mb-2">Consultation Type</h3>
                <p className="text-navy-700">
                  {CONSULTATION_TYPES.find(t => t.value === selectedType)?.label}
                </p>
                <p className="text-sm text-navy-500 mt-1">
                  {CONSULTATION_TYPES.find(t => t.value === selectedType)?.description}
                </p>
              </div>

              {/* Personal Information Summary */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-navy-900 mb-2">Your Information</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-navy-500">Name:</span> {formData.fullName}</p>
                  <p className="text-sm"><span className="text-navy-500">Email:</span> {formData.email}</p>
                  <p className="text-sm"><span className="text-navy-500">Phone:</span> {formData.phone}</p>
                  {formData.companyName && (
                    <p className="text-sm"><span className="text-navy-500">Company:</span> {formData.companyName}</p>
                  )}
                  {formData.notes && (
                    <p className="text-sm"><span className="text-navy-500">Notes:</span> {formData.notes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={handleBack}
                className="px-6 py-3 text-navy-600 hover:text-navy-900 font-semibold w-full sm:w-auto"
              >
                Back
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={cn(
                  "px-6 sm:px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl",
                  "hover:from-gold-500 hover:to-gold-400 transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto",
                  "shadow-lg shadow-gold-500/25 flex items-center justify-center gap-2"
                )}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Timezone Note */}
        <p className="text-center text-xs text-navy-400 mt-4">
          All times are shown in your local timezone: {TIMEZONE}
        </p>
      </div>
    </div>
  )
}