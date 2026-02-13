'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  MapPin, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Edit,
  CreditCard,
  Lock,
  FileText,
  Clock
} from 'lucide-react'
import { CompanyFormData, LocationFormData, StrategyFormData } from '@/lib/reports/validation'
import { createClient } from '@/lib/supabase/client'

interface ReviewStepProps {
  user: User
  companyData: CompanyFormData
  locationData: LocationFormData
  strategyData: StrategyFormData
  onBack: () => void
  onComplete: () => void
}

export default function ReviewStep({ 
  user, 
  companyData, 
  locationData, 
  strategyData, 
  onBack,
  onComplete 
}: ReviewStepProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'review' | 'payment' | 'processing'>('review')

  // Helper to format budget for display
  const formatBudget = (budget: string) => {
    const budgets: Record<string, string> = {
      'under-10k': 'Under $10,000',
      '10k-50k': '$10,000 - $50,000',
      '50k-100k': '$50,000 - $100,000',
      '100k-250k': '$100,000 - $250,000',
      '250k-plus': '$250,000+'
    }
    return budgets[budget] || budget
  }

  // Helper to format company size
  const formatSize = (size: string) => {
    const sizes: Record<string, string> = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '500+': '500+ employees'
    }
    return sizes[size] || size
  }

  // Helper to format primary focus
  const formatPrimaryFocus = (focus: string) => {
    const focuses: Record<string, string> = {
      'compliance': 'Regulatory Compliance',
      'talent': 'Talent Acquisition',
      'fundraising': 'Fundraising & Investment',
      'product': 'Product Development',
      'go-to-market': 'Go-to-Market Strategy',
      'partnerships': 'Strategic Partnerships'
    }
    return focuses[focus] || focus
  }

  // Helper to format timeline
  const formatTimeline = (timeline: string) => {
    const timelines: Record<string, string> = {
      '3-months': '3 Months (Aggressive)',
      '6-months': '6 Months (Moderate)',
      '12-months': '12 Months (Conservative)'
    }
    return timelines[timeline] || timeline
  }

  // Handle payment and report generation
  const handleGenerateReport = async () => {
    setIsProcessing(true)
    setError(null)
    setStep('payment')

    try {
      // Step 1: Create checkout session
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'single',
          reportData: {
            companyName: companyData.name,
            industry: companyData.industry,
            city: locationData.city,
            state: locationData.state,
            companySize: companyData.size,
            budget: companyData.budget,
            concerns: strategyData.concerns
          }
        }),
      })

      const checkoutData = await checkoutResponse.json()

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || 'Failed to create checkout session')
      }

      // Step 2: Save report request to database (pending payment)
      const reportResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyData.name,
          industry: companyData.industry,
          companySize: companyData.size,
          budget: companyData.budget,
          concerns: strategyData.concerns,
          goals: strategyData.goals,
          city: locationData.city,
          state: locationData.state,
          primaryFocus: strategyData.primary,
          secondaryFocus: strategyData.secondary,
          timeline: strategyData.timeline,
          status: 'pending_payment'
        }),
      })

      const reportData = await reportResponse.json()

      if (!reportResponse.ok) {
        console.warn('Report save warning:', reportData)
        // Continue with payment even if report save fails
      }

      // Step 3: Redirect to Stripe checkout
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Failed to process payment. Please try again.')
      setIsProcessing(false)
      setStep('review')
    }
  }

  // Handle free sample (for testing)
  const handleGenerateSample = async () => {
    setIsProcessing(true)
    setError(null)
    setStep('processing')

    try {
      // Generate report without payment (for testing)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyData.name,
          industry: companyData.industry,
          companySize: companyData.size,
          budget: companyData.budget,
          concerns: strategyData.concerns,
          goals: strategyData.goals,
          city: locationData.city,
          state: locationData.state,
          primaryFocus: strategyData.primary,
          secondaryFocus: strategyData.secondary,
          timeline: strategyData.timeline,
          isSample: true
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to the new report
        router.push(`/report/${data.reportId}`)
      } else {
        throw new Error(data.error || 'Failed to generate report')
      }
    } catch (err: any) {
      console.error('Sample generation error:', err)
      setError(err.message || 'Failed to generate sample. Please try again.')
      setIsProcessing(false)
      setStep('review')
    }
  }

  // Loading state for payment processing
  if (step === 'payment' || step === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-gold-500/20 to-gold-600/20 
                        rounded-full flex items-center justify-center">
            {step === 'payment' ? (
              <CreditCard className="w-12 h-12 text-gold-600" />
            ) : (
              <FileText className="w-12 h-12 text-gold-600" />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-navy-900 mb-3">
          {step === 'payment' ? 'Preparing Secure Checkout' : 'Generating Your Report'}
        </h2>
        
        <p className="text-navy-600 mb-8 max-w-md mx-auto">
          {step === 'payment' 
            ? 'Redirecting you to our secure payment processor...'
            : 'Our AI is analyzing your data. This will take about 2-3 minutes.'}
        </p>

        <div className="w-64 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold-600 to-gold-500 
                        rounded-full animate-pulse"
               style={{ width: step === 'payment' ? '50%' : '75%' }} />
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setStep('review')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg 
                       hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Review Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-2">
          Review Your Information
        </h2>
        <p className="text-navy-600">
          Please confirm all details before proceeding to payment
        </p>
      </div>

      {/* Company Summary Card */}
      <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl 
                      border border-navy-200 overflow-hidden">
        <div className="bg-navy-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-semibold">Company Information</h3>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-white/80 hover:text-white flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-navy-500 mb-1">Company Name</p>
              <p className="text-lg font-semibold text-navy-900">{companyData.name}</p>
              {companyData.website && (
                <p className="text-sm text-navy-600 mt-1">{companyData.website}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-navy-500 mb-1">Industry</p>
              <p className="text-lg font-semibold text-navy-900">{companyData.industry}</p>
            </div>
            <div>
              <p className="text-sm text-navy-500 mb-1">Company Size</p>
              <p className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-navy-400" />
                {formatSize(companyData.size)}
              </p>
            </div>
            <div>
              <p className="text-sm text-navy-500 mb-1">Budget Range</p>
              <p className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-navy-400" />
                {formatBudget(companyData.budget)}
              </p>
            </div>
            {companyData.founded && (
              <div>
                <p className="text-sm text-navy-500 mb-1">Year Founded</p>
                <p className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-navy-400" />
                  {companyData.founded}
                </p>
              </div>
            )}
          </div>

          {companyData.description && (
            <div className="mt-4 pt-4 border-t border-navy-200">
              <p className="text-sm text-navy-500 mb-2">Company Description</p>
              <p className="text-navy-700">{companyData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Summary Card */}
      <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl 
                      border border-navy-200 overflow-hidden">
        <div className="bg-navy-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-semibold">Location Analysis</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-navy-100 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold text-navy-900">
                {locationData.city}
              </p>
              <p className="text-sm text-navy-600">{locationData.state}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-navy-600 mb-1">What we'll analyze:</p>
              <ul className="grid grid-cols-2 gap-2">
                <li className="flex items-center gap-1 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  State regulations
                </li>
                <li className="flex items-center gap-1 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Talent density
                </li>
                <li className="flex items-center gap-1 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Web3 hub proximity
                </li>
                <li className="flex items-center gap-1 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Market opportunity
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Summary Card */}
      <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl 
                      border border-navy-200 overflow-hidden">
        <div className="bg-navy-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-semibold">Strategy Focus</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-navy-500 mb-1">Primary Focus</p>
              <p className="text-lg font-semibold text-navy-900">
                {formatPrimaryFocus(strategyData.primary)}
              </p>
            </div>
            <div>
              <p className="text-sm text-navy-500 mb-1">Timeline</p>
              <p className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-navy-400" />
                {formatTimeline(strategyData.timeline)}
              </p>
            </div>
          </div>

          {strategyData.secondary.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-navy-500 mb-2">Secondary Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {strategyData.secondary.map((focus) => (
                  <span key={focus} 
                        className="px-3 py-1 bg-navy-100 text-navy-700 
                                 rounded-full text-sm">
                    {focus.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm text-navy-500 mb-1">Primary Concerns</p>
              <p className="text-navy-700 bg-white p-4 rounded-xl border border-navy-200">
                {strategyData.concerns}
              </p>
            </div>
            <div>
              <p className="text-sm text-navy-500 mb-1">Key Goals</p>
              <p className="text-navy-700 bg-white p-4 rounded-xl border border-navy-200">
                {strategyData.goals}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gold-100 text-sm mb-1">Total Investment</p>
            <p className="text-4xl font-bold">$497</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-sm line-through text-gold-200">$2,847</p>
            <p className="text-sm font-semibold">You save $2,350</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Shield className="w-5 h-5 mx-auto mb-1 text-gold-200" />
            <p className="text-xs">30-Day Guarantee</p>
          </div>
          <div className="text-center">
            <Lock className="w-5 h-5 mx-auto mb-1 text-gold-200" />
            <p className="text-xs">Secure Payment</p>
          </div>
          <div className="text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-gold-200" />
            <p className="text-xs">Instant Access</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGenerateReport}
            disabled={isProcessing}
            className="w-full py-4 bg-white text-navy-900 font-semibold 
                     rounded-xl hover:bg-gold-50 disabled:opacity-50
                     transition-all duration-300 hover:scale-105
                     flex items-center justify-center gap-2 group"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment
                <CreditCard className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <button
            onClick={handleGenerateSample}
            disabled={isProcessing}
            className="w-full py-3 bg-transparent border border-white/30 
                     text-white font-medium rounded-xl hover:bg-white/10
                     transition-colors disabled:opacity-50"
          >
            Generate Sample Report (No Payment)
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-navy-400 text-center">
        By proceeding, you agree to our Terms of Service and Privacy Policy. 
        Your payment is securely processed by Stripe. We do not store your payment information.
      </p>

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="text-navy-600 hover:text-navy-900 transition-colors"
        >
          ← Back to edit information
        </button>
      </div>
    </div>
  )
}