// src/app/consultation/eligibility-check.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, MessageCircle, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'

interface EligibilityData {
  eligible: boolean
  credits?: {
    total: number
    used: number
    remaining: number
  }
  tier: string
  canPurchase: boolean
  purchasePrice: number
  message: string
  requiresAuth?: boolean
}

export default function EligibilityCheck() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    checkEligibility()
  }, [])

  const checkEligibility = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/consultations/eligibility')
      const data = await response.json()

      if (response.status === 401) {
        // User not logged in
        setEligibility({
          eligible: false,
          requiresAuth: true,
          canPurchase: false,
          purchasePrice: 50000,
          tier: 'guest',
          message: 'Please sign in to schedule a consultation'
        })
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check eligibility')
      }

      setEligibility(data)
    } catch (err) {
      console.error('Error checking eligibility:', err)
      setError('Unable to verify consultation eligibility')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseConsultation = async () => {
    try {
      setPurchasing(true)
      // This would integrate with Stripe
      const response = await fetch('/api/consultations/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: eligibility?.purchasePrice })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed')
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Error purchasing consultation:', err)
      setError('Failed to process purchase')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={checkEligibility}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!eligibility) {
    return null
  }

  // Guest user - not logged in
  if (eligibility.requiresAuth) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gold-600" />
        </div>
        <h2 className="text-2xl font-bold text-navy-900 text-center mb-2">
          Sign In Required
        </h2>
        <p className="text-navy-600 text-center mb-6">
          Please sign in or create an account to schedule a consultation
        </p>
        <div className="space-y-3">
          <Link
            href="/auth/signin?redirect=/consultation"
            className="block w-full py-3 px-4 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors text-center"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup?redirect=/consultation"
            className="block w-full py-3 px-4 border border-slate-200 text-navy-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-center"
          >
            Create Account
          </Link>
        </div>
      </motion.div>
    )
  }

  // Free/Purchasable user
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
          eligibility.eligible ? "bg-green-100" : "bg-amber-100"
        )}>
          {eligibility.eligible ? (
            <Check className="w-8 h-8 text-green-600" />
          ) : (
            <CreditCard className="w-8 h-8 text-amber-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-navy-900 mb-2">
          {eligibility.eligible ? 'Consultation Available' : 'Consultation Required'}
        </h2>
        <p className="text-navy-600">
          {eligibility.message}
        </p>
      </div>

      {/* Credits Display */}
      {eligibility.credits && (
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-navy-600">Your Credits:</span>
            <span className="font-bold text-navy-900">
              {eligibility.credits.remaining} / {eligibility.credits.total}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gold-600 h-2 rounded-full"
              style={{
                width: `${(eligibility.credits.used / eligibility.credits.total) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {eligibility.eligible ? (
          <Link
            href="/consultation/schedule"
            className="block w-full py-3 px-4 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 text-center"
          >
            Schedule Your Free Consultation
          </Link>
        ) : (
          <>
            {eligibility.canPurchase && (
              <button
                onClick={handlePurchaseConsultation}
                disabled={purchasing}
                className="w-full py-3 px-4 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Purchase Consultation (${eligibility.purchasePrice / 100})
                  </>
                )}
              </button>
            )}
            <Link
              href="/support"
              className="block w-full py-3 px-4 border border-slate-200 text-navy-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-center"
            >
              Contact Support Instead
            </Link>
          </>
        )}
      </div>

      {/* Upgrade Link */}
      {eligibility.tier === 'free' && (
        <p className="text-center text-sm text-navy-500 mt-4">
          Want free consultations?{' '}
          <Link href="/pricing" className="text-gold-600 hover:text-gold-700 font-medium">
            View our plans →
          </Link>
        </p>
      )}
    </motion.div>
  )
}