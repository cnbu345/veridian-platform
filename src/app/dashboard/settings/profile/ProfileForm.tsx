// src/app/dashboard/settings/profile/ProfileForm.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { 
  Save, 
  AlertCircle, 
  CheckCircle,
  Camera,
  User as UserIcon,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ProfileFormProps {
  user: User
  profile: any
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user.user_metadata?.full_name || '',
    company_name: profile?.company_name || user.user_metadata?.company_name || '',
    company_size: profile?.company_size || user.user_metadata?.company_size || '',
    industry: profile?.industry || user.user_metadata?.industry || '',
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      setError(null)

      // Upload to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath)

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          ...user.user_metadata,
          avatar_url: publicUrl
        }
      })

      if (authError) throw authError

      // Update users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (dbError) throw dbError

      // Update local state
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      router.refresh()

    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          company_name: formData.company_name,
          company_size: formData.company_size,
          industry: formData.industry,
          avatar_url: formData.avatar_url
        }
      })

      if (authError) throw authError

      // Update database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          company_name: formData.company_name,
          company_size: formData.company_size,
          industry: formData.industry,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (dbError) throw dbError

      setSuccess(true)
      router.refresh()
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
      {/* Profile Image Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-medium text-navy-900 pb-2 border-b border-slate-100 mb-4">
          Profile Picture
        </h3>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <button
              type="button"
              onClick={handleImageClick}
              disabled={uploadingImage}
              className="w-24 h-24 rounded-full overflow-hidden bg-navy-100 flex items-center justify-center ring-2 ring-gold-500/50 group-hover:ring-gold-500 transition-all disabled:opacity-50"
            >
              {uploadingImage ? (
                <Loader2 className="w-8 h-8 text-navy-400 animate-spin" />
              ) : formData.avatar_url ? (
                <Image
                  src={formData.avatar_url}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-navy-400" />
              )}
            </button>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-navy-900" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-navy-600 mb-2">
              Upload a profile picture to personalize your account.
            </p>
            <p className="text-xs text-navy-500">
              Recommended: Square image, at least 200x200px, max 5MB
            </p>
          </div>
        </div>
      </div>

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
          {user.email_confirmed_at ? (
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
              <option value="blockchain">Banking / Financial Services</option>
              <option value="finance">Insurance</option>
              <option value="tech">Law Firm /Legal Services</option>
              <option value="consulting">Investment Managment</option>
              <option value="legal">Consulting</option>
              <option value="legal">Techonolgy</option>
              <option value="legal">Healthcare</option>
              <option value="legal">Real Estate</option>
              <option value="legal">Retail</option>
              <option value="legal">Manufacturing</option>
              <option value="legal">Energy / Utilities</option>
              <option value="legal">Education</option>
              <option value="legal">Nonprofit</option>
              <option value="legal">Government</option>
              <option value="legal">Other</option>
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
            disabled={loading || uploadingImage}
            className="flex items-center gap-2 px-6 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          
          {uploadingImage && (
            <span className="text-sm text-navy-500">Uploading image...</span>
          )}
        </div>
      </div>
    </form>
  )
}