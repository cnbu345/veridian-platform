// src/app/generate/GenerateClient.tsx
// Main client component for report generation

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  MapPin, 
  Target, 
  Calendar,
  ArrowRight,
  CheckCircle,
  Loader2,
  Shield
} from 'lucide-react'
import CompanyStep from './components/CompanyStep'
import LocationStep from './components/LocationStep'
import StrategyStep from './components/StrategyStep'
import ReviewStep from './components/ReviewStep'
import { createClient } from '@/lib/supabase/client'

type Step = 'company' | 'location' | 'strategy' | 'review'

interface FormData {
  // Company info
  name: string
  industry: string
  size: string
  budget: string
  website?: string
  founded?: string
  description?: string
  
  // Location info (primary state + city)
  city: string
  state: string
  primaryState: string
  secondaryStates: string[]
  locationTier: string
  nearestRegulatoryHub?: string
  regulatoryClimate?: string
  licenseRequired?: string
  
  // Strategy info
  primary: string
  secondary: string[]
  timeline: string
  concerns: string
  goals: string
}

export default function GenerateClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState<Step>('company')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    industry: '',
    size: '',
    budget: '',
    website: '',
    founded: '',
    description: '',
    city: '',
    state: '',
    primaryState: 'TX',
    secondaryStates: [],
    locationTier: '',
    nearestRegulatoryHub: '',
    regulatoryClimate: '',
    licenseRequired: '',
    primary: 'compliance',
    secondary: [],
    timeline: '3-months',
    concerns: '',
    goals: ''
  })
  const [userTier, setUserTier] = useState<'free' | 'single' | 'quarterly' | 'monthly' | 'enterprise'>('single')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Get user and tier
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      const tier = searchParams.get('tier')
      if (tier === 'single' || tier === 'quarterly' || tier === 'monthly' || tier === 'enterprise') {
        setUserTier(tier)
      }
      setIsLoading(false)
    }
    init()
  }, [searchParams, supabase])
  
  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }
  
  const handleLocationUpdate = (locationData: any) => {
    setFormData(prev => ({ 
      ...prev, 
      ...locationData,
      primaryState: locationData.state || prev.primaryState,
      state: locationData.state || prev.state
    }))
  }
  
  const handleTemplateSelect = (templateId: string | null) => {
    setSelectedTemplateId(templateId)
  }
  
  const handleComplete = () => {
    // After successful report generation, redirect to dashboard or report page
    router.push('/dashboard/reports')
  }
  
  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
    { id: 'location', label: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { id: 'strategy', label: 'Strategy', icon: <Target className="w-4 h-4" /> },
    { id: 'review', label: 'Review', icon: <Shield className="w-4 h-4" /> }
  ]
  
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
      </div>
    )
  }
  
  if (!user) {
    router.push('/auth?redirect=/generate')
    return null
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy-900 mb-3">
            Generate Your Compliance Report
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Complete the steps below to receive a comprehensive regulatory intelligence report
            tailored to your business needs.
          </p>
        </div>
        
        {/* Step Progress */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-between items-center">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex-1 text-center">
                <button
                  onClick={() => idx <= currentIndex && setCurrentStep(step.id)}
                  disabled={idx > currentIndex}
                  className={`flex flex-col items-center gap-1 sm:gap-2 w-full transition-all ${
                    idx <= currentIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
                    idx < currentIndex
                      ? 'bg-green-600 text-white'
                      : idx === currentIndex
                      ? 'bg-gold-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {idx < currentIndex ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-gray-600">
                    {step.icon}
                    {step.label}
                  </div>
                  <span className="text-[10px] sm:hidden text-gray-500">{step.label}</span>
                </button>
              </div>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="relative mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gold-600 transition-all duration-300 rounded-full"
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            {currentStep === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CompanyStep
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={() => setCurrentStep('location')}
                />
              </motion.div>
            )}
            
            {currentStep === 'location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LocationStep
                  data={{
                    city: formData.city,
                    state: formData.primaryState,
                    locationTier: formData.locationTier,
                    nearestRegulatoryHub: formData.nearestRegulatoryHub,
                    secondaryStates: formData.secondaryStates
                  }}
                  userTier={userTier}
                  onUpdate={handleLocationUpdate}
                  onNext={() => setCurrentStep('strategy')}
                  onBack={() => setCurrentStep('company')}
                />
              </motion.div>
            )}
            
            {currentStep === 'strategy' && (
              <motion.div
                key="strategy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StrategyStep
                  data={{
                    primary: formData.primary,
                    secondary: formData.secondary,
                    timeline: formData.timeline,
                    concerns: formData.concerns,
                    goals: formData.goals
                  }}
                  onUpdate={updateFormData}
                  onBack={() => setCurrentStep('location')}
                  onNext={() => setCurrentStep('review')}
                />
              </motion.div>
            )}
            
            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ReviewStep
                  user={user}
                  companyData={{
                    name: formData.name,
                    industry: formData.industry,
                    size: formData.size,
                    budget: formData.budget,
                    website: formData.website,
                    founded: formData.founded,
                    description: formData.description
                  }}
                  locationData={{
                    city: formData.city,
                    state: formData.primaryState,
                    tier: formData.locationTier,
                    nearestRegulatoryHub: formData.nearestRegulatoryHub,
                    regulatoryClimate: formData.regulatoryClimate,
                    licenseRequired: formData.licenseRequired
                  }}
                  strategyData={{
                    primary: formData.primary,
                    secondary: formData.secondary,
                    timeline: formData.timeline,
                    concerns: formData.concerns,
                    goals: formData.goals
                  }}
                  selectedTemplateId={selectedTemplateId}
                  onBack={() => setCurrentStep('strategy')}
                  onComplete={handleComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Attorney-verified data</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Hallucination-free AI</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>24-hour delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Source citations included</span>
          </div>
        </div>
      </div>
    </div>
  )
}