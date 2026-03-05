'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, User, Mail, Phone, Building2, FileText, 
  Video, Link as LinkIcon, ArrowLeft, Save, X, Check
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface FormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  company_name: string
  consultation_type: 'discovery' | 'strategy' | 'technical' | 'compliance' | 'enterprise'
  consultation_date: string
  consultation_time: string
  duration_minutes: number
  notes: string
  meeting_link: string
  send_invite: boolean
}

const CONSULTATION_TYPES = [
  { value: 'discovery', label: 'Discovery Call', description: '30-minute intro call', color: 'bg-purple-100 text-purple-700' },
  { value: 'strategy', label: 'Strategy Session', description: 'Deep dive strategy', color: 'bg-blue-100 text-blue-700' },
  { value: 'technical', label: 'Technical Review', description: 'Technical consultation', color: 'bg-amber-100 text-amber-700' },
  { value: 'compliance', label: 'Compliance Check', description: 'Compliance review', color: 'bg-green-100 text-green-700' },
  { value: 'enterprise', label: 'Enterprise Strategy', description: 'Enterprise-level strategy', color: 'bg-indigo-100 text-indigo-700' }
]

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
]

export default function NewConsultationClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    company_name: '',
    consultation_type: 'discovery',
    consultation_date: '',
    consultation_time: '',
    duration_minutes: 30,
    notes: '',
    meeting_link: '',
    send_invite: true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.consultation_date || !formData.consultation_time) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.customer_email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)

      // Combine date and time
      const consultationDateTime = new Date(`${formData.consultation_date}T${formData.consultation_time}`)

      const response = await fetch('/api/admin/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          consultation_date: consultationDateTime.toISOString()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule consultation')
      }

      toast.success('Consultation scheduled successfully!')
      
      // Redirect based on whether we send invite or not
      if (formData.send_invite) {
        toast.success(`Calendar invite sent to ${formData.customer_email}`)
      }
      
      router.push('/admin/consultations/upcoming')
      router.refresh()
      
    } catch (error) {
      console.error('Error scheduling consultation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to schedule consultation')
    } finally {
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/consultations/upcoming"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Schedule New Consultation</h1>
          <p className="text-navy-600">Manually schedule a consultation for a client</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Customer Information Section */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gold-600" />
            Customer Information
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
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
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Acme Inc."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
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
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Details Section */}
        <div className="p-6 border-y border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-600" />
            Consultation Details
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Consultation Type <span className="text-red-500">*</span>
              </label>
              <select
                name="consultation_type"
                value={formData.consultation_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                required
              >
                {CONSULTATION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Duration <span className="text-red-500">*</span>
              </label>
              <select
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                required
              >
                {DURATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="date"
                  name="consultation_date"
                  value={formData.consultation_date}
                  onChange={handleInputChange}
                  min={today}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="time"
                  name="consultation_time"
                  value={formData.consultation_time}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting & Notes Section */}
        <div className="p-6 border-y border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-gold-600" />
            Meeting & Notes
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Meeting Link (Optional)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="url"
                name="meeting_link"
                value={formData.meeting_link}
                onChange={handleInputChange}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-navy-400 mt-1">
              Leave blank to generate a Google Meet link automatically
            </p>
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
                placeholder="Any specific topics to discuss, client notes, etc."
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Send Invite Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="send_invite"
              id="send_invite"
              checked={formData.send_invite}
              onChange={(e) => setFormData(prev => ({ ...prev, send_invite: e.target.checked }))}
              className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
            />
            <label htmlFor="send_invite" className="text-sm text-navy-700">
              Send calendar invitation to customer
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-navy-500">
            <span className="text-red-500">*</span> Required fields
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/consultations/upcoming"
              className="flex-1 sm:flex-none px-6 py-3 border border-slate-200 text-navy-600 rounded-xl hover:bg-slate-100 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl",
                "hover:from-gold-500 hover:to-gold-400 transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg shadow-gold-500/25 flex items-center justify-center gap-2 min-w-[140px]"
              )}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </motion.form>

      {/* Timezone Note */}
      <p className="text-center text-xs text-navy-400">
        All times are shown in your local timezone
      </p>
    </div>
  )
}