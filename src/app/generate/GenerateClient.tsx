// src/app/generate/GenerateClient.tsx
// Main client component with form steps and template selector integration
'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Scale } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import ProgressSteps from './components/ProgressSteps'
import CompanyStep from './components/CompanyStep'
import LocationStep from './components/LocationStep'
import StrategyStep from './components/StrategyStep'
import ReviewStep from './components/ReviewStep'
import TemplateSelector from './components/TemplateSelector'
import { CompanyFormData, LocationFormData, StrategyFormData } from '@/lib/reports/validation'

interface GenerateClientProps {
  user: User
}

const STEPS = [
  { id: 1, name: 'Institution', description: 'Business details' },
  { id: 2, name: 'Jurisdiction', description: 'State analysis' },
  { id: 3, name: 'Compliance', description: 'Focus areas' },
  { id: 4, name: 'Review', description: 'Confirm & purchase' }
]

export default function GenerateClient({ user }: GenerateClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form data state
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    name: '',
    website: '',
    industry: '',
    size: '1-10',
    budget: 'under-50k',
    founded: '',
    description: ''
  })

  const [locationData, setLocationData] = useState<LocationFormData & {
    tier?: string;
    nearestRegulatoryHub?: string;
    regulatoryClimate?: string;
    licenseRequired?: string;
  }>({
    city: '',
    state: '',
    tier: 'unknown',
    nearestRegulatoryHub: '',
    regulatoryClimate: '',
    licenseRequired: ''
  })

  const [strategyData, setStrategyData] = useState<StrategyFormData>({
    primary: 'compliance',
    secondary: [],
    timeline: '6-months',
    concerns: '',
    goals: ''
  })

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleComplete = async () => {
    // After successful report generation, redirect to dashboard
    router.push('/dashboard/reports')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-20 pb-32">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Header with Premium Styling */}
        <div className="text-center mb-12 relative">
          {/* Decorative gradient element */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-32 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent rounded-full" />
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-navy-900 mb-4 bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent">
            Generate Your Regulatory Report
          </h1>
          <p className="text-lg text-navy-600 max-w-2xl mx-auto">
            Complete the 4-step process to get your comprehensive state-by-state 
            compliance analysis delivered within 24 hours.
          </p>
          
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gold-50 rounded-full border border-gold-200">
            <Scale className="w-4 h-4 text-gold-600" />
            <span className="text-xs font-medium text-gold-700">
              Enterprise-Grade Regulatory Intelligence
            </span>
          </div>
        </div>

        {/* Progress Steps - Enhanced with animations */}
        <div className="mb-12">
          <ProgressSteps currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Form Container - Premium Card Design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl shadow-navy-900/5 overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            {/* Step 1: Institution Information */}
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <CompanyStep
                  data={companyData}
                  onUpdate={setCompanyData}
                  onNext={handleNext}
                />
              </div>
            )}

            {/* Step 2: Jurisdiction Analysis */}
            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <LocationStep
                  data={locationData}
                  onUpdate={setLocationData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              </div>
            )}

            {/* Step 3: Compliance Strategy + Template Selector */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-fadeIn">
                <StrategyStep
                  data={strategyData}
                  onUpdate={setStrategyData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
                
                {/* Divider with decorative element */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm text-navy-500">
                      Optional Premium Feature
                    </span>
                  </div>
                </div>
                
                {/* Template Selector - Only shows if user has templates */}
                <div className="pt-2">
                  <TemplateSelector
                    userId={user.id}
                    selectedTemplateId={selectedTemplateId}
                    onTemplateSelect={setSelectedTemplateId}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review & Payment */}
            {currentStep === 4 && (
              <div className="animate-fadeIn">
                <ReviewStep
                  user={user}
                  companyData={companyData}
                  locationData={locationData}
                  strategyData={strategyData}
                  selectedTemplateId={selectedTemplateId}
                  onBack={handleBack}
                  onComplete={handleComplete}
                />
              </div>
            )}
          </div>
        </div>

        {/* Trust & Security Footer */}
        <div className="mt-12 text-center">
          <div className={cn(
            "inline-flex flex-wrap items-center justify-center gap-6",
            "bg-white px-6 py-4 rounded-full border border-slate-200 shadow-soft"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-navy-600">256-bit SSL Encrypted</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-gold-600" />
              <span className="text-xs text-navy-600">SOC2 Type II Compliant</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-navy-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-navy-600">30-Day Money-Back Guarantee</span>
            </div>
          </div>
          <p className="text-xs text-navy-400 mt-4">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Reports are typically delivered within 24 hours of purchase.
          </p>
        </div>
      </div>

      {/* Add CSS animation for fadeIn */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}