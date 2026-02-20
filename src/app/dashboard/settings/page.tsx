// src/app/dashboard/settings/page.tsx
import { getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsCard from './components/SettingsCard'
import { Lock } from 'lucide-react'

export default async function SettingsPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  const authProvider = user.app_metadata?.provider || 'email'

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile Information',
      description: 'Manage your personal details and company information',
      iconName: 'User',  // Pass the name instead of the component
      href: '/dashboard/settings/profile',
      status: 'complete' as const,
      badge: 'Personal Info',
      items: [
        { label: 'Full Name', value: user.user_metadata?.full_name || 'Not set' },
        { label: 'Email', value: user.email },
        { label: 'Company', value: user.user_metadata?.company_name || 'Not set' }
      ]
    },
    {
      id: 'security',
      title: 'Security & Authentication',
      description: 'Password, two-factor authentication, and login methods',
      iconName: 'Shield',
      href: '/dashboard/settings/security',
      status: 'attention' as const,
      badge: authProvider === 'email' ? 'Password required' : `${authProvider} connected`,
      items: [
        { label: 'Auth Method', value: authProvider === 'email' ? 'Email/Password' : authProvider },
        { label: 'Last Login', value: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never' },
        { label: '2FA', value: user.user_metadata?.mfa_enabled ? 'Enabled' : 'Not configured' }
      ]
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      description: 'Control how and when we contact you',
      iconName: 'Bell',
      href: '/dashboard/settings/notifications',
      status: 'incomplete' as const,
      badge: '3 pending',
      items: [
        { label: 'Email Reports', value: 'Weekly digest' },
        { label: 'Security Alerts', value: 'Immediate' },
        { label: 'Marketing', value: 'Monthly' }
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      description: 'Manage your plan, invoices, and payment methods',
      iconName: 'CreditCard',
      href: '/dashboard/settings/billing',
      status: 'complete' as const,
      badge: 'Enterprise Plan',
      items: [
        { label: 'Current Plan', value: 'Enterprise' },
        { label: 'Next Billing', value: 'Apr 1, 2024' },
        { label: 'Payment Method', value: 'VISA ••4242' }
      ]
    },
    {
      id: 'api',
      title: 'API & Integrations',
      description: 'Manage API keys and connected applications',
      iconName: 'Key',
      href: '/dashboard/settings/api',
      status: 'complete' as const,
      badge: '2 active keys',
      items: [
        { label: 'Production Key', value: 'Created Mar 1' },
        { label: 'Development Key', value: 'Created Mar 15' },
        { label: 'Webhooks', value: '3 configured' }
      ]
    },
    {
      id: 'sessions',
      title: 'Active Sessions',
      description: 'Manage devices where you&apos;re logged in',
      iconName: 'Globe',
      href: '/dashboard/settings/sessions',
      status: 'info' as const,
      badge: '3 active',
      items: [
        { label: 'Current Session', value: 'MacOS • Chrome' },
        { label: 'Last Active', value: 'Now' },
        { label: 'Location', value: 'San Francisco, CA' }
      ]
    }
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with gradient */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full" />
          <h1 className="text-3xl font-bold text-navy-900">Settings</h1>
        </div>
        <p className="text-navy-600 ml-4">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {settingsSections.map((section) => (
          <SettingsCard key={section.id} {...section} />
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-br from-navy-50 to-navy-100/50 rounded-2xl p-8 border border-navy-200">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-navy-900">Need assistance?</h3>
            <p className="text-navy-600 max-w-md">
              Our support team is available 24/7 to help with any account-related questions.
            </p>
            <div className="flex gap-4 pt-2">
              <button className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium">
                Contact Support
              </button>
              <button className="px-4 py-2 border border-navy-300 text-navy-700 rounded-lg hover:bg-white transition-colors text-sm font-medium">
                View Documentation
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <Lock className="w-12 h-12 text-navy-400" />
          </div>
        </div>
      </div>
    </div>
  )
}