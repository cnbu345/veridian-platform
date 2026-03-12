// src/app/pricing/components/EnterpriseLeadModal.tsx
'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface EnterpriseLeadModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EnterpriseLeadModal({ isOpen, onClose }: EnterpriseLeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch('/api/public/enterprise/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.get('company_name'),
          contact_name: formData.get('contact_name'),
          contact_email: formData.get('contact_email'),
          contact_phone: formData.get('contact_phone'),
          company_size: formData.get('company_size'),
          message: formData.get('message')
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to save lead')
      }

      toast.success('Thank you! Our enterprise team will contact you within 24 hours.')
      onClose()
      e.currentTarget.reset()
    } catch (error) {
      console.error('Submission error:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit. Please try again.')
      toast.error(error instanceof Error ? error.message : 'Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-navy-900">Contact Enterprise Sales</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Company Name *</label>
            <input
              type="text"
              name="company_name"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Contact Name *</label>
            <input
              type="text"
              name="contact_name"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Work Email *</label>
            <input
              type="email"
              name="contact_email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="contact_phone"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Company Size</label>
            <select
              name="company_size"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">Select...</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501+">501+ employees</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Tell us about your needs</label>
            <textarea
              name="message"
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="What compliance challenges are you facing? What features are you most interested in?"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gold-600 text-white rounded-lg font-medium hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <p className="text-xs text-center text-navy-500 mt-3">
              Our enterprise team typically responds within 24 hours
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}