// src/app/generate/components/ReviewStep.tsx - Review and payment initiation with template support
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
  Clock,
  Scale,
  Landmark,
  Gavel,
  AlertTriangle,
  Layout,
  Palette
} from 'lucide-react'
import { CompanyFormData, LocationFormData, StrategyFormData } from '@/lib/reports/validation'
import { createClient } from '@/lib/supabase/client'

interface ReviewStepProps {
  user: User
  companyData: CompanyFormData
  locationData: LocationFormData & {
    tier?: string;
    nearestRegulatoryHub?: string;
    regulatoryClimate?: string;
    licenseRequired?: string;
  }
  strategyData: StrategyFormData
  selectedTemplateId: string | null
  onBack: () => void
  onComplete: () => void
}

export default function ReviewStep({ 
  user, 
  companyData, 
  locationData, 
  strategyData, 
  selectedTemplateId,
  onBack,
  onComplete 
}: ReviewStepProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'review' | 'payment' | 'processing'>('review')
  const [spotsLeft] = useState(38) // Founder's spots remaining

  // Helper to format budget for display
  const formatBudget = (budget: string) => {
    const budgets: Record<string, string> = {
      'under-50k': 'Under $50,000',
      '50k-100k': '$50,000 - $100,000',
      '100k-250k': '$100,000 - $250,000',
      '250k-500k': '$250,000 - $500,000',
      '500k-plus': '$500,000+'
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
      '501-1000': '501-1,000 employees',
      '1000-plus': '1,000+ employees'
    }
    return sizes[size] || size
  }

  // Helper to format primary focus
  const formatPrimaryFocus = (focus: string) => {
    const focuses: Record<string, string> = {
      'compliance': 'Regulatory Compliance',
      'licensing': 'Multi-State Licensing',
      'risk': 'Risk Assessment',
      'monitoring': 'Compliance Monitoring',
      'talent': 'Compliance Talent',
      'strategy': 'Market Entry Strategy'
    }
    return focuses[focus] || focus
  }

  // Helper to format secondary focus
  const formatSecondaryFocus = (focus: string) => {
    const focuses: Record<string, string> = {
      'compliance': 'Regulatory Compliance',
      'licensing': 'Licensing',
      'risk': 'Risk Assessment',
      'monitoring': 'Monitoring',
      'talent': 'Talent Acquisition',
      'strategy': 'Market Strategy',
      'reporting': 'Regulatory Reporting',
      'audit': 'Compliance Audits',
      'policy': 'Policy Development',
      'training': 'Staff Training'
    }
    return focuses[focus] || focus
  }

  // Helper to format timeline
  const formatTimeline = (timeline: string) => {
    const timelines: Record<string, string> = {
      '3-months': '3 Months (Immediate)',
      '6-months': '6 Months (Standard)',
      '12-months': '12 Months (Strategic)'
    }
    return timelines[timeline] || timeline
  }

  // Helper to format location tier
  const formatLocationTier = (tier: string) => {
    const tiers: Record<string, string> = {
      'major': 'Major Market',
      'suburban': 'Suburban Market',
      'rural': 'Rural Market',
      'unknown': 'Analysis Pending'
    }
    return tiers[tier] || tier
  }

  // Handle report generation with template support
  const handleGenerateReport = async () => {
    setIsProcessing(true)
    setError(null)
    setStep('payment')

    try {
      // Determine location tier
      const locationTierValue = locationData.tier || 
        (locationData.city?.toLowerCase() === 'austin' && locationData.state === 'TX' ? 'major' :
         locationData.city?.toLowerCase() === 'dallas' && locationData.state === 'TX' ? 'major' :
         locationData.city?.toLowerCase() === 'houston' && locationData.state === 'TX' ? 'major' :
         locationData.city?.toLowerCase() === 'new york' && locationData.state === 'NY' ? 'major' :
         locationData.city?.toLowerCase() === 'los angeles' && locationData.state === 'CA' ? 'major' :
         locationData.city?.toLowerCase() === 'san francisco' && locationData.state === 'CA' ? 'major' :
         locationData.city?.toLowerCase() === 'chicago' && locationData.state === 'IL' ? 'major' :
         locationData.city?.toLowerCase() === 'miami' && locationData.state === 'FL' ? 'major' :
         'rural')

      // Truncate long fields to stay under Stripe's 500 char limit
      const concerns = strategyData.concerns || ''
      const goals = strategyData.goals || ''
      
      const truncatedConcerns = concerns.length > 200 
        ? concerns.substring(0, 197) + '...' 
        : concerns
      
      const truncatedGoals = goals.length > 200 
        ? goals.substring(0, 197) + '...' 
        : goals

      // Structure the metadata with template ID
      const reportMetadata = {
        // User info
        userId: user.id,
        productType: 'single',
        
        // Company info
        companyName: companyData.name,
        industry: companyData.industry,
        companySize: companyData.size,
        budget: companyData.budget,
        
        // Location info
        city: locationData.city,
        state: locationData.state,
        locationTier: locationTierValue,
        nearestRegulatoryHub: locationData.nearestRegulatoryHub || '',
        regulatoryClimate: locationData.regulatoryClimate || '',
        
        // Strategy info
        primaryFocus: strategyData.primary,
        secondaryFocus: JSON.stringify(strategyData.secondary),
        timeline: strategyData.timeline,
        concerns: truncatedConcerns,
        goals: truncatedGoals,
        
        // Template info - CRITICAL: Pass template ID to Stripe
        templateId: selectedTemplateId,
        
        // Metadata
        timestamp: new Date().toISOString()
      }

      console.log('📤 Sending to checkout API with:', {
        templateId: selectedTemplateId,
        locationTier: locationTierValue,
        secondaryFocusCount: strategyData.secondary.length
      })

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'single',
          metadata: reportMetadata
        }),
      })

      const checkoutData = await checkoutResponse.json()

      if (!checkoutResponse.ok) {
        console.error('❌ Checkout response error:', checkoutData)
        throw new Error(checkoutData.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (err: any) {
      console.error('❌ Generation error:', err)
      setError(err.message || 'Failed to generate report. Please try again.')
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
              <Scale className="w-12 h-12 text-gold-600" />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-navy-900 mb-3">
          {step === 'payment' ? 'Preparing Secure Checkout' : 'Generating Your Regulatory Intelligence Report'}
        </h2>
        
        <p className="text-navy-600 mb-8 max-w-md mx-auto">
          {step === 'payment' 
            ? 'Redirecting you to our secure payment processor...'
            : 'Our AI compliance engine is analyzing state regulations, licensing requirements, and compliance risks. This typically takes 2-3 minutes.'}
        </p>

        <div className="w-64 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold-600 to-gold-500 
                       rounded-full animate-pulse"
            style={{ width: step === 'payment' ? '50%' : '75%' }} 
          />
        </div>

        {step === 'processing' && (
          <div className="mt-8 space-y-2 text-sm text-navy-500">
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Analyzing {locationData.state} regulatory framework
            </p>
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Identifying license requirements
            </p>
            <p className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-gold-600 animate-spin" />
              Generating compliance roadmap
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold">Generation Failed</p>
            </div>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => setStep('review')}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg 
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

      {/* Founder's Pricing Banner */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-500 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gold-100">Founder's Circle Pricing</p>
              <p className="text-lg font-bold">{spotsLeft} spots remaining at $997</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm line-through text-gold-200">$2,497</p>
            <p className="text-sm font-semibold">Save $1,500</p>
          </div>
        </div>
      </div>

      {/* Company Summary Card */}
      <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl 
                      border border-navy-200 overflow-hidden">
        <div className="bg-navy-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-semibold">Institution Information</h3>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-white/80 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-navy-500 mb-1">Institution Name</p>
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
              <p className="text-sm text-navy-500 mb-1">Institution Size</p>
              <p className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-navy-400" />
                {formatSize(companyData.size)}
              </p>
            </div>
            <div>
              <p className="text-sm text-navy-500 mb-1">Compliance Budget</p>
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
              <p className="text-sm text-navy-500 mb-2">Institution Description</p>
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
            <h3 className="text-white font-semibold">Jurisdiction Analysis</h3>
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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-navy-500">Market Classification:</span>
                <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                  {formatLocationTier(locationData.tier || 'unknown')}
                </span>
              </div>
              <p className="text-sm text-navy-600">What we'll analyze:</p>
              <ul className="grid grid-cols-2 gap-2 mt-2">
                <li className="flex items-center gap-1 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  State regulations
                </li>
                <li className="flex items-center gap-1 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  License requirements
                </li>
                <li className="flex items-center gap-1 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Enforcement history
                </li>
                <li className="flex items-center gap-1 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Pending legislation
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
            <h3 className="text-white font-semibold">Compliance Focus</h3>
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
                    {formatSecondaryFocus(focus)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm text-navy-500 mb-1">Compliance Concerns</p>
              <p className="text-navy-700 bg-white p-4 rounded-xl border border-navy-200">
                {strategyData.concerns}
              </p>
            </div>
            <div>
              <p className="text-sm text-navy-500 mb-1">Compliance Goals</p>
              <p className="text-navy-700 bg-white p-4 rounded-xl border border-navy-200">
                {strategyData.goals}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Summary Card - NEW */}
      {selectedTemplateId && (
        <div className="bg-gradient-to-br from-gold-50 to-amber-50 rounded-2xl 
                        border border-gold-200 overflow-hidden">
          <div className="bg-gold-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">Template Applied</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Palette className="w-6 h-6 text-gold-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-navy-900 mb-1">
                  Custom Brand Template Selected
                </p>
                <p className="text-sm text-navy-600">
                  Your report will include your custom branding, logo, and selected sections.
                </p>
              </div>
              <button
                onClick={() => onBack()}
                className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* What's Included */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-4">Your Report Includes:</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className="font-semibold">Regulatory Analysis</p>
              <p className="text-sm text-navy-300">State-by-state framework breakdown</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Gavel className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className="font-semibold">Licensing Matrix</p>
              <p className="text-sm text-navy-300">Requirements, fees, timelines</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className="font-semibold">Regulatory Contacts</p>
              <p className="text-sm text-navy-300">State regulators & legal counsel</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className="font-semibold">Risk Assessment</p>
              <p className="text-sm text-navy-300">Gap analysis & mitigation</p>
            </div>
          </div>
        </div>
        
        {/* Template-specific feature badge */}
        {selectedTemplateId && (
          <div className="mt-4 pt-4 border-t border-navy-700">
            <div className="flex items-center gap-2 text-sm text-gold-400">
              <Layout className="w-4 h-4" />
              <span>✓ White-label branding included</span>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Summary */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-navy-300 text-sm mb-1">Founder's Circle Investment</p>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold">$997</p>
              <p className="text-lg line-through text-navy-400">$2,497</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2">
            <p className="text-sm font-semibold text-gold-400">Save $1,500</p>
            <p className="text-xs text-navy-300">{spotsLeft} spots left</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <Shield className="w-5 h-5 mx-auto mb-1 text-gold-400" />
            <p className="text-xs">30-Day Guarantee</p>
          </div>
          <div className="text-center">
            <Lock className="w-5 h-5 mx-auto mb-1 text-gold-400" />
            <p className="text-xs">Secure Payment</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-gold-400" />
            <p className="text-xs">24-Hour Delivery</p>
          </div>
          <div className="text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-gold-400" />
            <p className="text-xs">PDF Export</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGenerateReport}
            disabled={isProcessing}
            className="w-full py-4 bg-gold-500 text-navy-900 font-semibold 
                     rounded-xl hover:bg-gold-400 disabled:opacity-50
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
                Purchase Report - $997
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-xs text-center text-navy-400">
            Regular price $2,497 • Founder's pricing for first 50 customers
          </p>
          
          {selectedTemplateId && (
            <p className="text-xs text-center text-gold-400">
              ✓ Custom template branding will be applied to your report
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-navy-400 text-center">
        By proceeding, you agree to our Terms of Service and Privacy Policy. 
        Your payment is securely processed by Stripe. Purchase orders accepted for enterprise clients.
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