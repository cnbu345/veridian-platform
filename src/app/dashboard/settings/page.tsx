// src/app/dashboard/settings/page.tsx
import { getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsCard from './components/SettingsCard'
import { Lock, Sparkles, Shield, Settings as SettingsIcon } from 'lucide-react'

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
      iconName: 'User',
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
    <div className="mx-auto space-y-8">
      {/* Premium Header matching Dashboard and Reports */}
      <div className="relative">
        {/* Decorative gradient line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold-400 via-gold-600 to-gold-400 rounded-full" />
        
        <div className="pl-6">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent">
              Settings
            </h1>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gold-50 rounded-full">
              <SettingsIcon className="w-4 h-4 text-gold-600" />
              <span className="text-xs font-semibold text-gold-700">
                Account Configuration
              </span>
            </div>
          </div>
          
          <p className="text-navy-600 text-lg max-w-2xl">
            Manage your account settings, security preferences, and subscription details. 
            Customize your experience and keep your information up to date.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <SettingsCard key={section.id} {...section} />
        ))}
      </div>

      {/* Premium Help Section */}
      <div className="relative bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold-400 rounded-full blur-3xl" />
        </div>
        
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">
                    Need expert assistance?
                  </h3>
                  <p className="text-navy-300">
                    Our dedicated support team is available 24/7
                  </p>
                </div>
              </div>
              
              <p className="text-navy-200 max-w-xl text-lg">
                Whether you need help with account settings, billing questions, or technical support, 
                we're here to ensure your experience is seamless.
              </p>
              
              <div className="flex gap-4 pt-4">
                <button className="px-6 py-3 bg-gold-500 text-navy-900 font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/25">
                  Contact Support
                </button>
                <button className="px-6 py-3 bg-navy-700 text-white font-semibold rounded-xl hover:bg-navy-600 transition-all duration-300 border border-navy-600">
                  View Documentation
                </button>
              </div>
            </div>
            
            <div className="hidden md:block">
              <Lock className="w-16 h-16 text-gold-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}