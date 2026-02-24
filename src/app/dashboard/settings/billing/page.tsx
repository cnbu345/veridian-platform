// src/app/dashboard/settings/billing/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  tier_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  is_founder: boolean
  created_at: string
}

interface Payment {
  id: string
  amount: number
  tier: string
  status: string
  created_at: string
  metadata: any
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Get user's subscription
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubscription(subscriptionData)

      // Get payment history
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setPayments(paymentsData || [])

      // If there's an active subscription, get invoices from Stripe
      if (subscriptionData?.stripe_subscription_id) {
        const response = await fetch('/api/billing/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: subscriptionData.stripe_subscription_id
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setInvoices(data.invoices || [])
        }
      }

    } catch (err) {
      console.error('Error loading billing data:', err)
      setError('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Error opening billing portal:', err)
      setError('Failed to open billing portal')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTierName = (tierId: string) => {
    const tiers: Record<string, string> = {
      'single': 'Single Report',
      'quarterly': 'Quarterly Intelligence',
      'monthly': 'Enterprise Suite',
      'custom': 'Custom Enterprise'
    }
    return tiers[tierId] || tierId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
        <span className="ml-3 text-navy-600">Loading billing information...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Billing & Subscription</h1>
        <p className="text-navy-600">Manage your subscription and view payment history</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-rose-800 font-medium">Error</p>
            <p className="text-rose-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-navy-50 border-b border-slate-200">
          <h2 className="font-semibold text-navy-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold-600" />
            Current Subscription
          </h2>
        </div>
        
        <div className="p-6">
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">
                    {getTierName(subscription.tier_id)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'past_due'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {subscription.status}
                    </span>
                    {subscription.is_founder && (
                      <span className="px-2 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-medium">
                        Founder's Circle
                      </span>
                    )}
                    {subscription.cancel_at_period_end && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                        Cancels at period end
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleManageSubscription}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm"
                >
                  Manage Subscription
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-navy-500 mb-1">Current Period Start</div>
                  <div className="font-medium text-navy-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-navy-400" />
                    {formatDate(subscription.current_period_start)}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-navy-500 mb-1">Current Period End</div>
                  <div className="font-medium text-navy-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-navy-400" />
                    {formatDate(subscription.current_period_end)}
                  </div>
                </div>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    Your subscription will end on {formatDate(subscription.current_period_end)}. 
                    You can reactivate at any time before then.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-navy-600 mb-4">No active subscription</p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 text-white rounded-xl hover:bg-gold-500 transition-colors"
              >
                View Pricing Plans
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-navy-50 border-b border-slate-200">
          <h2 className="font-semibold text-navy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-600" />
            Payment History
          </h2>
        </div>
        
        <div className="p-6">
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-navy-600" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">
                        {getTierName(payment.tier)}
                      </p>
                      <p className="text-sm text-navy-500">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy-900">
                      ${payment.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-navy-500 text-center py-4">No payment history</p>
          )}
        </div>
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-navy-50 border-b border-slate-200">
            <h2 className="font-semibold text-navy-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-gold-600" />
              Invoices
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <a
                  key={invoice.id}
                  href={invoice.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-navy-900">
                      Invoice {invoice.number}
                    </p>
                    <p className="text-sm text-navy-500">
                      {formatDate(invoice.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-navy-900">
                      ${invoice.amount.toLocaleString()}
                    </span>
                    <Download className="w-4 h-4 text-navy-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Need Help */}
      <div className="bg-navy-50 rounded-2xl border border-navy-200 p-6">
        <h3 className="font-semibold text-navy-900 mb-2">Need help with billing?</h3>
        <p className="text-navy-600 text-sm mb-4">
          Contact our support team for assistance with invoices, subscriptions, or payment issues.
        </p>
        <a
          href="mailto:billing@veridiangroup.com"
          className="inline-flex items-center gap-2 text-gold-600 font-semibold hover:text-gold-700"
        >
          billing@veridiangroup.com
          <span className="text-lg">→</span>
        </a>
      </div>
    </div>
  )
}