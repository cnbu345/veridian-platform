// src/app/dashboard/settings/profile/ProfileForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProfileFormProps {
  user: User
  profile: any
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user.user_metadata?.full_name || '',
    company_name: profile?.company_name || user.user_metadata?.company_name || '',
    company_size: profile?.company_size || '',
    industry: profile?.industry || ''
  })
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // First update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          company_name: formData.company_name,
          company_size: formData.company_size,
          industry: formData.industry
        }
      })

      if (authError) {
        throw new Error(`Auth update failed: ${authError.message}`)
      }

      // Then update users table - use upsert with proper error handling
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: formData.full_name,
          company_name: formData.company_name,
          company_size: formData.company_size,
          industry: formData.industry,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (dbError) {
        throw new Error(`Database update failed: ${dbError.message}`)
      }

      setSuccess(true)
      router.refresh()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Profile update error:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email (read-only) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <label className="block text-sm font-medium text-navy-700 mb-2">
          Email Address
        </label>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-navy-500"
          />
          {user.email_confirmed ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <AlertCircle className="w-3 h-3" />
              Unverified
            </span>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-medium text-navy-900 pb-2 border-b border-slate-100">
          Personal Information
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
            placeholder="Enter your full name"
          />
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-medium text-navy-900 pb-2 border-b border-slate-100">
          Company Information
        </h3>

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            placeholder="Enter your company name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Company Size
            </label>
            <select
              value={formData.company_size}
              onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501+">501+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="">Select industry</option>
              <option value="blockchain">Blockchain / Crypto</option>
              <option value="finance">Financial Services</option>
              <option value="tech">Technology</option>
              <option value="consulting">Consulting</option>
              <option value="legal">Legal / Regulatory</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages and Submit */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">Profile updated successfully!</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          
          {loading && (
            <span className="text-sm text-navy-500">Updating your profile...</span>
          )}
        </div>
      </div>
    </form>
  )
}