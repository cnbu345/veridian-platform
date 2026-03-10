// src/app/admin/sales/components/AddDealModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface AddDealModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface SalesRep {
  id: string
  email: string
  full_name: string
}

export default function AddDealModal({ isOpen, onClose, onSuccess }: AddDealModalProps) {
  const [loading, setLoading] = useState(false)
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [formData, setFormData] = useState({
    company_name: '',
    company_website: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    value: '',
    probability: '20',
    stage: 'new',
    source: 'manual',
    assigned_to: '',
    notes: '',
    next_action: '',
    next_action_date: '',
    tags: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchSalesReps()
    }
  }, [isOpen])

  const fetchSalesReps = async () => {
    try {
      const res = await fetch('/api/admin/users?role=sales')
      const data = await res.json()
      setSalesReps(data.users || [])
    } catch (error) {
      console.error('Failed to fetch sales reps:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/sales/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseInt(formData.value) || 0,
          probability: parseInt(formData.probability) || 0,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      })

      if (!res.ok) throw new Error('Failed to create deal')

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        company_name: '',
        company_website: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        value: '',
        probability: '20',
        stage: 'new',
        source: 'manual',
        assigned_to: '',
        notes: '',
        next_action: '',
        next_action_date: '',
        tags: ''
      })

    } catch (error) {
      console.error('Error creating deal:', error)
      alert('Failed to create deal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-900">Add New Deal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="font-medium text-navy-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.company_website}
                  onChange={(e) => setFormData({...formData, company_website: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-medium text-navy-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Deal Information */}
          <div>
            <h3 className="font-medium text-navy-900 mb-4">Deal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Deal Value ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Probability (%) *
                </label>
                <select
                  value={formData.probability}
                  onChange={(e) => setFormData({...formData, probability: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="10">10% - Initial Contact</option>
                  <option value="20">20% - Interest</option>
                  <option value="40">40% - Consultation Scheduled</option>
                  <option value="60">60% - Proposal Sent</option>
                  <option value="80">80% - Negotiation</option>
                  <option value="90">90% - Verbal Commitment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Stage *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({...formData, stage: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="consultation_scheduled">Consultation Scheduled</option>
                  <option value="consultation_completed">Consultation Completed</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="direct">Direct</option>
                  <option value="conference">Conference</option>
                  <option value="outbound">Outbound</option>
                  <option value="partner">Partner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Assign To
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select Sales Rep</option>
                  {salesReps.map(rep => (
                    <option key={rep.id} value={rep.id}>
                      {rep.full_name || rep.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="enterprise, follow-up, hot"
                />
              </div>
            </div>
          </div>

          {/* Next Actions */}
          <div>
            <h3 className="font-medium text-navy-900 mb-4">Next Steps</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Next Action
                </label>
                <input
                  type="text"
                  value={formData.next_action}
                  onChange={(e) => setFormData({...formData, next_action: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Send proposal, Schedule call, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Next Action Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.next_action_date}
                  onChange={(e) => setFormData({...formData, next_action_date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Add any additional details about this deal..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}