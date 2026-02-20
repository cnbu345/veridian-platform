// src/app/dashboard/settings/security/SecurityClient.tsx
'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { 
  Shield, 
  Key, 
  History, 
  Smartphone, 
  Laptop, 
  Globe,
  Mail,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface SecurityClientProps {
  user: User
  userData: any
  loginHistory: any[]
}

export default function SecurityClient({ user, userData, loginHistory }: SecurityClientProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const supabase = createClient()
  const authProvider = userData?.auth_provider || 'email'
  const isEmailUser = authProvider === 'email'

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    if (passwordData.new.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password updated successfully' })
      setShowPasswordForm(false)
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="w-4 h-4" />
    if (userAgent.includes('Tablet')) return <Smartphone className="w-4 h-4" />
    return <Laptop className="w-4 h-4" />
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full" />
          <h1 className="text-3xl font-bold text-navy-900">Security Settings</h1>
        </div>
        <p className="text-navy-600 ml-4">
          Manage your account security and authentication methods
        </p>
      </div>

      {/* Auth Method Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy-900">Authentication Method</h2>
            <p className="text-sm text-navy-600">How you sign in to your account</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEmailUser ? (
                <Mail className="w-5 h-5 text-navy-600" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs">
                  {authProvider[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-navy-900">
                  {isEmailUser ? 'Email & Password' : `Continue with ${authProvider}`}
                </p>
                <p className="text-sm text-navy-600">
                  {user.email}
                </p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
        </div>

        {/* Password Change Form - Only for email users */}
        {isEmailUser && (
          <div className="mt-6">
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex items-center gap-2 text-gold-600 hover:text-gold-700 font-medium"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Two-Factor Authentication Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Two-Factor Authentication</h2>
              <p className="text-sm text-navy-600">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 text-sm font-medium">
            Enable 2FA
          </button>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <History className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy-900">Login History</h2>
            <p className="text-sm text-navy-600">Recent sign-in activity on your account</p>
          </div>
        </div>

        <div className="space-y-4">
          {loginHistory.length === 0 ? (
            <p className="text-center py-8 text-navy-500">No login history available</p>
          ) : (
            loginHistory.map((record, index) => (
              <div key={record.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-start gap-3">
                  {getDeviceIcon(record.user_agent)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        record.method === 'oauth' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {record.method === 'oauth' ? record.provider : 'Email/Password'}
                      </span>
                      <span className="text-xs text-navy-500">
                        {record.ip_address}
                      </span>
                    </div>
                    <p className="text-sm text-navy-600">
                      {record.user_agent}
                    </p>
                    <p className="text-xs text-navy-500 mt-1">
                      {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                {index === 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-gradient-to-br from-navy-50 to-navy-100/50 rounded-xl p-6 border border-navy-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-navy-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-navy-900 mb-3">Security Best Practices</h3>
            <ul className="space-y-2">
              {[
                'Use a strong, unique password that you don\'t use elsewhere',
                'Enable two-factor authentication for additional security',
                'Review your login history regularly for suspicious activity',
                'Log out of devices you\'re not actively using'
              ].map((tip, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-navy-700">
                  <div className="w-1 h-1 bg-navy-400 rounded-full" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}