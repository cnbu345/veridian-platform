// src/app/admin/availability/AvailabilityClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Clock, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface TimeSlot {
  start: string
  end: string
}

interface DayAvailability {
  isAvailable: boolean
  slots: TimeSlot[]
  duration: number // duration in minutes
}

interface Availability {
  [key: string]: DayAvailability
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

const DEFAULT_DURATION = 30 // 30 minutes default
const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

export default function AvailabilityClient() {
  const [availability, setAvailability] = useState<Availability>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expandedDays, setExpandedDays] = useState<string[]>([])

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/availability')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform old format if needed
      const transformedAvailability = transformOldFormat(data.availability || {})
      setAvailability(transformedAvailability)
      
    } catch (err) {
      console.error('Error loading availability:', err)
      setError(err instanceof Error ? err.message : 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  // Transform old format to new format
  const transformOldFormat = (oldData: any): Availability => {
    const newFormat: Availability = {}
    
    DAYS.forEach(day => {
      const oldDay = oldData[day.key]
      if (oldDay && typeof oldDay === 'object') {
        // Check if it's old format (string slots) or new format (object slots)
        if (Array.isArray(oldDay.slots) && oldDay.slots.length > 0) {
          if (typeof oldDay.slots[0] === 'string') {
            // Convert old string slots to time slot objects
            newFormat[day.key] = {
              isAvailable: oldDay.isAvailable || false,
              duration: oldDay.duration || DEFAULT_DURATION,
              slots: oldDay.slots.map((time: string) => ({
                start: time,
                end: calculateEndTime(time, oldDay.duration || DEFAULT_DURATION)
              }))
            }
          } else {
            // Already in new format
            newFormat[day.key] = {
              isAvailable: oldDay.isAvailable || false,
              duration: oldDay.duration || DEFAULT_DURATION,
              slots: oldDay.slots || []
            }
          }
        } else {
          // Empty slots
          newFormat[day.key] = {
            isAvailable: oldDay.isAvailable || false,
            duration: oldDay.duration || DEFAULT_DURATION,
            slots: []
          }
        }
      } else {
        // Default for missing days
        newFormat[day.key] = {
          isAvailable: day.key !== 'saturday' && day.key !== 'sunday',
          duration: DEFAULT_DURATION,
          slots: day.key !== 'saturday' && day.key !== 'sunday' 
            ? [{ start: '09:00', end: '17:00' }]
            : []
        }
      }
    })
    
    return newFormat
  }

  const calculateEndTime = (start: string, duration: number): string => {
    const [hours, minutes] = start.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  const handleSaveAvailability = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability }),
      })
      
      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        throw new Error('Server returned invalid JSON')
      }
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`)
      }
      
      setSuccess('Availability saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      console.error('Error saving availability:', err)
      setError(err instanceof Error ? err.message : 'Failed to save availability')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (dayKey: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isAvailable: !prev[dayKey]?.isAvailable
      }
    }))
  }

  const toggleDayExpanded = (dayKey: string) => {
    setExpandedDays(prev => 
      prev.includes(dayKey)
        ? prev.filter(d => d !== dayKey)
        : [...prev, dayKey]
    )
  }

  const updateDuration = (dayKey: string, duration: number) => {
    setAvailability(prev => {
      const day = prev[dayKey]
      // Update end times for all slots based on new duration
      const updatedSlots = day.slots.map(slot => ({
        start: slot.start,
        end: calculateEndTime(slot.start, duration)
      }))
      
      return {
        ...prev,
        [dayKey]: {
          ...day,
          duration,
          slots: updatedSlots
        }
      }
    })
  }

  const addTimeSlot = (dayKey: string) => {
    setAvailability(prev => {
      const day = prev[dayKey]
      const lastSlot = day.slots[day.slots.length - 1]
      let newStart = '09:00'
      
      if (lastSlot) {
        // Start 1 hour after last slot ends
        const [hours, minutes] = lastSlot.end.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + 60
        const newHours = Math.floor(totalMinutes / 60)
        const newMinutes = totalMinutes % 60
        newStart = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
      }
      
      const newSlot = {
        start: newStart,
        end: calculateEndTime(newStart, day.duration)
      }
      
      return {
        ...prev,
        [dayKey]: {
          ...day,
          slots: [...day.slots, newSlot]
        }
      }
    })
  }

  const removeTimeSlot = (dayKey: string, index: number) => {
    setAvailability(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.filter((_, i) => i !== index)
      }
    }))
  }

  const updateTimeSlot = (dayKey: string, index: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => {
      const day = prev[dayKey]
      const updatedSlots = [...day.slots]
      updatedSlots[index] = {
        ...updatedSlots[index],
        [field]: value
      }
      
      return {
        ...prev,
        [dayKey]: {
          ...day,
          slots: updatedSlots
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">
            Consultation Availability
          </h1>
          <p className="text-navy-600 text-sm sm:text-base">
            Set your available time slots and meeting durations
          </p>
        </div>
        
        <button
          onClick={handleSaveAvailability}
          disabled={saving}
          className={cn(
            "px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl",
            "hover:from-gold-500 hover:to-gold-400 transition-all duration-300",
            "flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-lg shadow-gold-500/25 w-full sm:w-auto"
          )}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700"
        >
          {success}
        </motion.div>
      )}

      {/* Availability Cards */}
      <div className="space-y-3">
        {DAYS.map((day) => (
          <motion.div
            key={day.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            {/* Day Header - Always visible */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleDayExpanded(day.key)}
            >
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={availability[day.key]?.isAvailable || false}
                    onChange={() => toggleDay(day.key)}
                    className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
                  />
                  <span className="font-semibold text-navy-900">
                    {day.label}
                  </span>
                </label>
                
                {availability[day.key]?.isAvailable && (
                  <span className="text-xs text-navy-500 bg-slate-100 px-2 py-1 rounded-full">
                    {availability[day.key]?.slots.length || 0} slots
                  </span>
                )}
              </div>
              
              <button className="text-navy-400 hover:text-navy-600">
                {expandedDays.includes(day.key) ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedDays.includes(day.key) && availability[day.key]?.isAvailable && (
              <div className="p-4 pt-0 border-t border-slate-200">
                {/* Duration Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Meeting Duration
                  </label>
                  <select
                    value={availability[day.key]?.duration || DEFAULT_DURATION}
                    onChange={(e) => updateDuration(day.key, parseInt(e.target.value))}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white w-full sm:w-auto"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Available Time Slots
                  </label>
                  
                  {availability[day.key]?.slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                        className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                        step="1800" // 30 minute steps
                      />
                      <span className="text-navy-400">to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                        className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                        step="1800"
                      />
                      <button
                        onClick={() => removeTimeSlot(day.key, index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addTimeSlot(day.key)}
                    className="mt-2 px-4 py-2 text-sm text-gold-600 hover:text-gold-700 border border-dashed border-gold-300 rounded-lg hover:bg-gold-50 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add Time Slot
                  </button>
                </div>
              </div>
            )}

            {expandedDays.includes(day.key) && !availability[day.key]?.isAvailable && (
              <div className="p-4 pt-0 border-t border-slate-200">
                <p className="text-sm text-navy-400">
                  Enable availability for {day.label.toLowerCase()} to set time slots
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="text-center text-sm text-navy-400 border-t border-slate-200 pt-6">
        <p>Click on any day to expand and configure time slots</p>
        <p className="text-xs mt-1">All times are shown in your local timezone</p>
      </div>
    </div>
  )
}