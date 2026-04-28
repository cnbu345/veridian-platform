// src/app/report/[id]/ReportViewClient.tsx
// PREMIUM 10-PAGE REGULATORY REPORT VIEWER
// V3.0 - FULL INTEGRATION: Database-driven via reportData.ts + Enhanced UI from v2
// INCLUDES: All 10 sections, Dynamic Licensing Matrix, Multi-state, Legislation Tracker, High Contrast, etc.
// COMPLETE FILE WITH ALL SECTIONS

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Download, FileText, Building2, MapPin, Calendar, CheckCircle, Clock, AlertCircle, Printer,
  Loader2, Scale, Gavel, Landmark, Shield, AlertTriangle, Copy, Check, Target, Award, TrendingUp, Users,
  Briefcase, Cpu, DollarSign, CalendarCheck, RefreshCw, ExternalLink, ChevronDown, Globe, Info, X,
  ChevronLeft, ChevronRight, BookOpen, Phone, Mail, Link2, BarChart3, PieChart, Activity, Zap, Eye, EyeOff,
  Search, Filter, Sliders, MoreHorizontal, Share2, Bookmark, BookmarkCheck, Flag, ThumbsUp, ThumbsDown, MessageSquare,
  Send, Edit, Save, Plus, Minus, RotateCcw, HelpCircle, Settings, Menu, Home, LayoutDashboard, Sparkles,
  TrendingDown, Wallet, CreditCard, Receipt, PiggyBank, Banknote, Coins, Gem, Crown, Star, ArrowUp, ArrowDown,
  ArrowRight, ChevronUp, Lock, Unlock, Key, Fingerprint, Scan, QrCode, Wifi, WifiOff, Cloud, CloudOff, Server,
  Database, HardDrive, CpuIcon, Monitor, Smartphone, Tablet, Laptop, Watch, Radio, Bluetooth, Headphones, Mic,
  Video, Camera, Image, File, Folder, Archive, Trash, Undo, Redo, ZoomIn, ZoomOut, Maximize, Minimize, Fullscreen,
  Minimize2, Bell, Clipboard
} from 'lucide-react'
import { downloadReportPDF } from '@/lib/pdf/generator'
import { format } from 'date-fns'
import { 
  buildReportData, 
  formatPrimaryFocus, 
  formatTimeline, 
  formatSecondaryFocus,
  formatCurrency,
  type ReportData 
} from '@/lib/reports/reportData'
import { QuarterlyUpsell } from '@/components/reports/QuarterlyUpsell'

// Constants for configuration
const REFRESH_INTERVAL = 5000 // 5 seconds
const MAX_REFRESH_TIME = 180000 // 3 minutes
const AI_CONTENT_PREVIEW_LENGTH = 2000
const CONCERNS_PREVIEW_LENGTH = 150
const GOALS_PREVIEW_LENGTH = 150
const VERIFIED_FACTS_PREVIEW_COUNT = 5
const METRICS_PREVIEW_COUNT = 6

interface ReportViewClientProps {
  report: any
  showQuarterlyUpsell?: boolean
  userSubscription?: { plan_tier: string; status: string } | null
}

// Custom hook for media query
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Custom hook for local storage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  return [storedValue, setValue]
}

// Custom hook for debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Helper function to safely access nested properties
const getNestedValue = (obj: any, path: string, defaultValue: any = null): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue
  }, obj)
}

// Helper function to clean and format string values
const cleanString = (value: any): string => {
  if (value === null || value === undefined) return ''
  let str = String(value)
  str = str.replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim()
  str = str.replace(/^["']+|["']+$/g, '').trim()
  return str
}

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, char => char.toUpperCase())
}

// Helper function to format phone number
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return 'N/A'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

// Helper function to format date safely
const formatDateSafe = (date: any, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    return format(dateObj, formatStr)
  } catch {
    return 'Invalid date'
  }
}

// Helper to format money from licensing data
const formatMoney = (value: any): string => {
  if (value === undefined || value === null || value === '') return 'Varies'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 'Varies'
  return `$${num.toLocaleString()}`
}

// Helper to format bond range
const formatBondRange = (min: any, max: any): string => {
  if (!min && !max) return 'Varies'
  if (min && max) {
    return min === max ? formatMoney(min) : `${formatMoney(min)} - ${formatMoney(max)}`
  }
  if (min) return formatMoney(min)
  if (max) return formatMoney(max)
  return 'Varies'
}

export default function ReportViewClient({ report, showQuarterlyUpsell = false, userSubscription = null }: ReportViewClientProps) {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  const contentRef = useRef<HTMLDivElement>(null)

   // Report content extraction
  const reportContent = useMemo(() => report?.report_content || {}, [report])
  const createdAt = useMemo(() => report?.created_at ? new Date(report.created_at) : new Date(), [report?.created_at])
  const status = useMemo(() => report?.status || 'pending', [report?.status])
  const reportId = useMemo(() => report?.id || 'N/A', [report?.id])
  
  // Check if this is a multi-state report
  const secondaryStates = useMemo(() => {
    const states = reportContent.secondaryStates || report.secondary_states || []
    return Array.isArray(states) ? states.filter(Boolean) : []
  }, [reportContent.secondaryStates, report.secondary_states])
  
  const isMultiState = useMemo(() => secondaryStates.length > 0, [secondaryStates])
  
  const allStates = useMemo(() => {
    const primaryState = report?.state || ''
    return isMultiState ? [primaryState, ...secondaryStates].filter(Boolean) : [primaryState].filter(Boolean)
  }, [isMultiState, report?.state, secondaryStates])

  // Parse secondary focus
  const secondaryFocus = useMemo(() => {
    const processValue = (value: any): string[] => {
      if (!value) return []
      
      if (Array.isArray(value)) {
        return value.map(cleanString).filter(Boolean)
      }
      
      if (typeof value === 'string') {
        const trimmed = value.trim()
        
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) {
              return parsed.map(cleanString).filter(Boolean)
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        if (trimmed.includes(',')) {
          return trimmed.split(',').map(cleanString).filter(Boolean)
        }
        
        const cleaned = cleanString(trimmed)
        return cleaned ? [cleaned] : []
      }
      
      return []
    }
    
    let result: string[] = []
    
    if (reportContent.secondaryFocus) {
      result = processValue(reportContent.secondaryFocus)
    } else if (reportContent.strategy_focus?.secondary) {
      result = processValue(reportContent.strategy_focus.secondary)
    }
    
    return result
      .map(item => capitalizeWords(item))
      .filter((item, index, self) => item && self.indexOf(item) === index)
  }, [reportContent])

  // State management
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState('executive-summary')
  const [copied, setCopied] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [mobileTabDropdownOpen, setMobileTabDropdownOpen] = useState(false)
  const [dataLoadAttempted, setDataLoadAttempted] = useState(false)
  const [dataLoadError, setDataLoadError] = useState<string | null>(null)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [showMobileUpsell, setShowMobileUpsell] = useState(showQuarterlyUpsell)
  const [bookmarked, setBookmarked] = useLocalStorage(`report-bookmark-${report?.id}`, false)
  const [userNotes, setUserNotes] = useLocalStorage(`report-notes-${report?.id}`, '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState(userNotes)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [fullLicensingData, setFullLicensingData] = useState<any>(null)
  const [isLoadingLicensing, setIsLoadingLicensing] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [fontSize, setFontSize] = useLocalStorage('report-font-size', 'medium')
  const [highContrast, setHighContrast] = useLocalStorage('report-high-contrast', false)
  const [legislationData, setLegislationData] = useState<any[]>([])
  const [isLoadingLegislation, setIsLoadingLegislation] = useState(false)

  // Derived state for licensing data availability
  const hasFullLicensingData = fullLicensingData && Object.keys(fullLicensingData).length > 0

  // derived licensing data object that falls back to reportContent
  const effectiveLicensingData = fullLicensingData || reportContent?.licensing_data || {}
  

  // Fetch full licensing data from the API
  const fetchLicensingData = useCallback(async () => {
    if (!report?.state) return null
    
    // First check if it's in the report content AND has actual financial data
    const contentData = reportContent.licensing_data
    if (contentData && (contentData.application_fee || contentData.annual_renewal_fee)) {
      console.log('✅ Using licensing data from report_content:', contentData)
      return contentData
    }
    
    // Otherwise fetch from API
    setIsLoadingLicensing(true)
    try {
      console.log(`📡 Fetching licensing data for ${report.state} from API...`)
      const response = await fetch(`/api/licensing/${report.state}`)
      
      if (!response.ok) {
        console.warn(`⚠️ API returned ${response.status} for ${report.state}`)
        return null
      }
      
      const result = await response.json()
      
      if (result.data) {
        console.log('✅ Licensing data fetched from API:', {
          application_fee: result.data.application_fee,
          annual_renewal_fee: result.data.annual_renewal_fee,
          bond_min: result.data.bond_requirement_min,
          bond_max: result.data.bond_requirement_max,
          net_worth: result.data.net_worth_requirement
        })
        return result.data
      } else {
        console.warn('⚠️ API returned success but no data')
        return null
      }
    } catch (error) {
      console.error('❌ Error fetching licensing data:', error)
      return null
    } finally {
      setIsLoadingLicensing(false)
    }
  }, [report?.state, reportContent.licensing_data])

  // Fetch state-specific legislation from LegiScan
  const fetchLegislationData = useCallback(async () => {
    if (!report?.state) {
      console.log('📡 No state provided, skipping legislation fetch')
      return []
    }
    
    setIsLoadingLegislation(true)
    try {
      console.log(`📡 Fetching legislation for ${report.state}...`)
      const response = await fetch(`/api/legislation?state=${report.state}&limit=10`)
      
      if (!response.ok) {
        console.warn(`⚠️ API returned ${response.status} for ${report.state}`)
        return []
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log(`✅ Retrieved ${result.data.length} bills for ${report.state}`)
        return result.data
      } else {
        console.warn(`⚠️ No legislation data found for ${report.state}`)
        return []
      }
    } catch (error) {
      console.error('❌ Error fetching legislation data:', error)
      return []
    } finally {
      setIsLoadingLegislation(false)
    }
  }, [report?.state])

  // Load real report data from database using enhanced buildReportData
  const loadAllData = useCallback(async () => {
    if (dataLoadAttempted && reportData && !dataLoadError) return
    
    setIsLoadingData(true)
    setDataLoadError(null)
    
    try {
      console.log('📡 Starting to fetch licensing data...')
      const licensingData = await fetchLicensingData()
      console.log('📡 Licensing data result:', licensingData ? 'SUCCESS' : 'NULL')
      setFullLicensingData(licensingData)

      console.log('📡 Starting to fetch legislation data...')
      const legislation = await fetchLegislationData()
      setLegislationData(legislation)

      // Get regulatory climate from licensing data or reportContent
      const regulatoryClimate = licensingData?.regulatory_climate || 
                              reportContent.licensing_data?.cryptoFriendly || 
                              'moderate'
      
      const licenseRequired = licensingData?.license_required || 
                            reportContent.licensing_data?.licenseRequired || 
                            'varies'

      // Build location object for reportData
      const locationObj = {
        city: report?.city || '',
        state: report?.state || '',
        tier: (report?.location_tier as any) || 'major',
        nearestRegulatoryHub: report?.nearest_regulatory_hub || report?.nearest_major_city || '',
        regulatoryClimate,
        licenseRequired,
        talentDensity: 'moderate',
        msaName: null,
        msaPopulation: null,
        distanceToMajor: null,
        nearestMajorCity: report?.nearest_major_city || null,
        secondaryStates: secondaryStates,
      }

      // Build company object
      const companyObj = {
        name: report?.company_name || 'Company',
        industry: report?.industry || 'Financial Services',
        size: reportContent.company?.size || '1-10',
        budget: reportContent.company?.budget || 'under-50k',
      }

      // Build strategy object
      const strategyObj = {
        primary: reportContent.strategy_focus?.primary || reportContent.primaryFocus || 'compliance',
        secondary: secondaryFocus,
        timeline: reportContent.strategy_focus?.timeline || reportContent.timeline || '6-months',
        concerns: reportContent.concerns || 'No specific concerns provided.',
        goals: reportContent.goals || 'No specific goals provided.',
      }

      // Build options object with AI content and fetched data
      const optionsObj = {
        aiGeneratedContent: reportContent.content,
        verifiedFacts: reportContent.facts_used || [],
        enforcementHistory: reportContent.enforcement_history,
        pendingLegislation: reportContent.pending_legislation,
        fullLicensingData: licensingData, // Pass full licensing data for budget calculations
      }

      // Call the enhanced buildReportData which now queries all database tables
      const data = await buildReportData(companyObj, locationObj, strategyObj, optionsObj)
      setReportData(data)
      setDataLoadAttempted(true)
      setDataLoadError(null)
    } catch (error) {
      console.error('Error loading report data:', error)
      setDataLoadError(error instanceof Error ? error.message : 'Failed to load report data')
    } finally {
      setIsLoadingData(false)
    }
  }, [report, reportContent, secondaryFocus, secondaryStates, dataLoadAttempted, reportData, dataLoadError, fetchLicensingData, fetchLegislationData])

  // Load data when status is ready
  useEffect(() => {
    if (status !== 'generating' && status !== 'pending' && !dataLoadAttempted) {
      loadAllData()
    }
  }, [status, loadAllData, dataLoadAttempted])

  // Reload data when licensing data is fetched
  useEffect(() => {
    if (fullLicensingData && reportData && !dataLoadAttempted) {
      // Refresh report data with licensing information
      loadAllData()
    }
  }, [fullLicensingData])

  // Auto-refresh while generating
  useEffect(() => {
    if (status === 'generating' || status === 'pending') {
      const interval = setInterval(() => {
        router.refresh()
        setRefreshCount(prev => prev + 1)
      }, REFRESH_INTERVAL)
      
      const timeout = setTimeout(() => {
        clearInterval(interval)
      }, MAX_REFRESH_TIME)
      
      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [status, router])

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileTabDropdownOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('.mobile-tab-dropdown')) {
          setMobileTabDropdownOpen(false)
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileTabDropdownOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + D for download
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        if (status === 'ready' || status === 'completed') {
          handleDownloadPDF()
        }
      }
      
      // Ctrl/Cmd + P for print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        window.print()
      }
      
      // Escape to close dropdown
      if (e.key === 'Escape' && mobileTabDropdownOpen) {
        setMobileTabDropdownOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, mobileTabDropdownOpen])

  // Static tabs - Licensing Matrix is ALWAYS included
  const tabs = useMemo(() => {
    return [
      { id: 'executive-summary', label: 'Executive Summary', icon: FileText, shortLabel: 'Summary', color: 'gold' },
      { id: 'market-talent', label: 'Market & Talent', icon: TrendingUp, shortLabel: 'Market', color: 'purple' },
      { id: 'regulatory', label: 'Regulatory Analysis', icon: Scale, shortLabel: 'Regulatory', color: 'blue' },
      { id: 'licensing', label: 'Licensing Matrix', icon: Gavel, shortLabel: 'Licensing', color: 'amber' },
      { id: 'compliance', label: 'Compliance Roadmap', icon: Clock, shortLabel: 'Roadmap', color: 'green' },
      { id: 'technology', label: 'Tech & Tools', icon: Cpu, shortLabel: 'Tech', color: 'cyan' },
      { id: 'resources', label: 'Resources', icon: Landmark, shortLabel: 'Resources', color: 'indigo' },
      { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle, shortLabel: 'Risk', color: 'red' },
      { id: 'budget', label: 'Budget Guide', icon: DollarSign, shortLabel: 'Budget', color: 'emerald' },
      { id: 'next-steps', label: 'Next Steps', icon: CalendarCheck, shortLabel: 'Next Steps', color: 'teal' },
    ]
  }, [])

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // Handle saving notes
  const handleSaveNotes = () => {
    setUserNotes(tempNotes)
    setIsEditingNotes(false)
  }

  // Handle canceling notes edit
  const handleCancelNotes = () => {
    setTempNotes(userNotes)
    setIsEditingNotes(false)
  }

  // Get font size class
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-xs'
      case 'large': return 'text-base'
      default: return 'text-sm'
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)
      // Pass ALL data sources to ensure consistency!
      const blob = await downloadReportPDF(
        report, 
        reportData || undefined, 
        fullLicensingData || undefined,
        legislationData || undefined  // Pass legislation data
      )
      if (!blob || blob.size === 0) throw new Error('Generated PDF is empty')
      
      const sanitizedName = (report?.company_name || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const filename = `Veridian_Regulatory_Report_${sanitizedName}_${dateStr}.pdf`
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Regulatory Report - ${report?.company_name || 'Company'}`,
          text: `Check out this regulatory compliance report for ${report?.company_name || 'Company'}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Loading state
  if (status === 'generating' || status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20 pb-20 sm:pb-32">
        <div className="container-custom max-w-6xl px-4 text-center py-12 sm:py-20">
          <div className="relative inline-block mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-full flex items-center justify-center">
              <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-gold-600" />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-gold-600 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2 sm:mb-3">Your Report is Being Generated</h2>
          <p className="text-sm sm:text-base text-navy-600 mb-6 sm:mb-8 max-w-md mx-auto">
            Our AI compliance engine is generating your comprehensive {isMultiState ? 'multi-state' : 'single-state'} report.
          </p>
          <div className="w-48 sm:w-64 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold-600 to-gold-500 rounded-full animate-pulse w-3/4" />
          </div>
          <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-navy-400">
            Refreshed {refreshCount} times • Usually takes 2-3 minutes
          </p>
          <p className="mt-4 text-xs text-navy-400">
            This page will auto-refresh every 5 seconds
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20 pb-20 sm:pb-32">
        <div className="container-custom max-w-6xl px-4 text-center py-12 sm:py-20">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2 sm:mb-3">Report Generation Failed</h2>
          <p className="text-sm sm:text-base text-navy-600 mb-6 sm:mb-8 max-w-md mx-auto">
            We encountered an error while generating your report. Please try again or contact support if the issue persists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button 
              onClick={() => router.push('/generate')} 
              className="w-full sm:w-auto px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="w-full sm:w-auto px-6 py-3 border border-navy-300 text-navy-700 rounded-lg hover:bg-navy-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Data loading state
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20 pb-20 sm:pb-32">
        <div className="container-custom max-w-7xl px-4 text-center py-12 sm:py-20">
          <Loader2 className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading report data from database...</p>
          <p className="text-xs text-navy-400 mt-2">This may take a moment</p>
        </div>
      </div>
    )
  }

  // Data error state
  if (dataLoadError || !reportData) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20 pb-20 sm:pb-32">
        <div className="container-custom max-w-7xl px-4 text-center py-12 sm:py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">Unable to Load Report Data</h3>
          <p className="text-navy-600 mb-4 max-w-md mx-auto">
            {dataLoadError || 'There was an issue loading your report data.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => {
                setDataLoadAttempted(false)
                setDataLoadError(null)
                loadAllData()
              }}
              className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-navy-300 text-navy-700 rounded-lg hover:bg-navy-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Extract data for rendering
  const locationData = reportData.location || { tier: 'major', regulatoryClimate: 'moderate' }
  const aiContent = reportData.aiGeneratedContent || reportContent.content
  const verifiedFacts = reportData.verifiedFacts || reportContent.facts_used || []
  const enforcementHistory = reportData.enforcementHistory || reportContent.enforcement_history
  const pendingLegislation = reportData.pendingLegislation || reportContent.pending_legislation
  const licensingData = fullLicensingData || reportContent.licensing_data || {}

  // Helper functions for licensing data display
  const getProcessingTime = (): string => {
    if (licensingData.processing_time_description) {
      return licensingData.processing_time_description
    }
    const min = licensingData.processing_time_min_months
    const max = licensingData.processing_time_max_months
    if (min && max) {
      return min === max ? `${min} months` : `${min}-${max} months`
    }
    if (min) return `${min}+ months`
    return '3-6 months'
  }
  
  const getLicenseRequiredDisplay = (): string => {
    const req = licensingData.license_required
    if (req === 'none') return 'No'
    if (req === 'mtl') return 'Yes (MTL)'
    if (req === 'bitlicense') return 'Yes (BitLicense)'
    if (req === 'dfpi') return 'Yes (DFPI)'
    if (req === 'varies') return 'Varies'
    return req ? 'Yes' : 'Varies'
  }
  
  const hasFinancialData = licensingData.application_fee || 
                          licensingData.annual_renewal_fee || 
                          licensingData.bond_requirement_min

  const fontSizeClass = getFontSizeClass()
  const bondRangeDisplay = formatBondRange(licensingData.bond_requirement_min, licensingData.bond_requirement_max)

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-white' : 'bg-slate-50'} pt-14 sm:pt-20 pb-16 sm:pb-32 print:bg-white print:pt-0`}>
      <div className="container-custom max-w-7xl px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-8 print:hidden">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-navy-600 hover:text-navy-900 text-sm sm:text-base w-fit transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            {/* Download button */}
            <button 
              onClick={handleDownloadPDF} 
              disabled={isDownloading} 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 disabled:opacity-50 text-sm transition-colors"
              aria-label="Download PDF"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                  <span className="sm:hidden">PDF</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Header */}
        <div className={`${highContrast ? 'bg-white border-2 border-black' : 'bg-white border border-slate-200'} rounded-xl sm:rounded-2xl shadow-soft overflow-hidden mb-4 sm:mb-8 print:shadow-none print:border print:border-black`}>
          <div className={`${highContrast ? 'bg-black' : 'bg-gradient-to-r from-navy-900 to-navy-800'} px-4 sm:px-8 py-4 sm:py-6`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className={`flex items-center gap-1.5 sm:gap-2 ${highContrast ? 'text-white' : 'text-gold-400'} text-xs sm:text-sm mb-1 sm:mb-2`}>
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>CONFIDENTIAL • PREMIUM REPORT {isMultiState && '• MULTI-STATE'}</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1 break-words">
                  {report?.company_name || 'Company'}
                  {bookmarked && (
                    <BookmarkCheck className="inline-block w-4 h-4 ml-2 text-gold-400" />
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-navy-300 text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    {report?.industry || 'Financial Services'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {isMultiState ? `${allStates.length} States` : `${report?.city || ''}, ${report?.state || ''}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formatDateSafe(createdAt)}
                  </span>
                </div>
                {isMultiState && (
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    <Globe className="w-3 h-3 text-gold-400" />
                    <span className="text-navy-300 text-xs">
                      {allStates.join(' • ')}
                    </span>
                  </div>
                )}
              </div>
              <div className={`${highContrast ? 'bg-gray-700' : 'bg-white/10'} rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 self-start`}>
                <span className="text-[10px] sm:text-xs text-navy-300">Report ID</span>
                <p className="text-xs sm:text-sm font-mono text-gold-400">{reportId.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Market Tier Badges - Using reportData values */}
          <div className={`px-3 sm:px-8 py-2.5 sm:py-4 border-b ${highContrast ? 'border-black' : 'border-slate-200'} ${highContrast ? 'bg-gray-100' : 'bg-navy-50/50'}`}>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-4">
              <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-600'} hidden sm:inline`}>Analysis:</span>
              
              {/* Market Tier Badge */}
              <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                highContrast ? 'bg-purple-200 text-purple-900 border border-purple-900' : 'bg-purple-100 text-purple-800'
              }`}>
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                {reportData.marketAnalysis?.tier || (locationData.tier === 'major' ? 'Major Market' : locationData.tier === 'suburban' ? 'Suburban Market' : 'Rural Market')}
              </span>
              
              {/* Regulatory Climate Badge */}
              <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                highContrast ? 
                  (locationData.regulatoryClimate === 'friendly' ? 'bg-green-200 text-green-900 border border-green-900' :
                   locationData.regulatoryClimate === 'strict' ? 'bg-red-200 text-red-900 border border-red-900' : 
                   'bg-yellow-200 text-yellow-900 border border-yellow-900') :
                  (locationData.regulatoryClimate === 'friendly' ? 'bg-green-100 text-green-800' :
                   locationData.regulatoryClimate === 'strict' ? 'bg-red-100 text-red-800' : 
                   'bg-yellow-100 text-yellow-800')
              }`}>
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                Climate: {locationData.regulatoryClimate === 'friendly' ? 'Friendly' : locationData.regulatoryClimate === 'strict' ? 'Strict' : 'Moderate'}
              </span>
              
              {/* Talent Badge */}
              <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                highContrast ? 'bg-blue-200 text-blue-900 border border-blue-900' : 'bg-blue-100 text-blue-800'
              }`}>
                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                Talent: {reportData.talentAnalysis?.talentRank === 'high' ? 'High Density' : reportData.talentAnalysis?.talentRank === 'medium' ? 'Medium Density' : 'Developing'}
              </span>
              
              {isMultiState && (
                <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                  highContrast ? 'bg-amber-200 text-amber-900 border border-amber-900' : 'bg-amber-100 text-amber-800'
                }`}>
                  <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  {allStates.length} States
                </span>
              )}
              
              {/* Debug toggle - only visible in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="ml-auto text-xs text-navy-400 hover:text-navy-600"
                >
                  {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
                </button>
              )}
            </div>
          </div>

          {/* Debug Info Panel */}
          {showDebugInfo && (
            <div className="p-4 bg-gray-100 border-b border-gray-300 text-xs font-mono">
              <p><strong>Debug Info:</strong></p>
              <p>Status: {status}</p>
              <p>Report ID: {reportId}</p>
              <p>Data Load Attempted: {dataLoadAttempted ? 'Yes' : 'No'}</p>
              <p>Licensing Data Keys: {Object.keys(licensingData).join(', ')}</p>
              <p>Has Financial Data: {hasFinancialData ? 'Yes' : 'No'}</p>
              <p>Secondary States: {secondaryStates.join(', ') || 'None'}</p>
              <p>Secondary Focus: {secondaryFocus.join(', ') || 'None'}</p>
              <p>Compliance Phases: {reportData.compliancePhases?.length || 0}</p>
              <p>Risk Factors: {reportData.risks?.length || 0}</p>
            </div>
          )}

          {/* Quarterly Upsell Banner */}
          {showQuarterlyUpsell && (
            <div className="px-3 sm:px-8 py-3 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <QuarterlyUpsell 
                variant="banner" 
                reportId={report?.id}
                companyName={report?.company_name}
              />
            </div>
          )}

          {/* Mobile Tab Dropdown */}
          <div className={`sm:hidden border-b ${highContrast ? 'border-black' : 'border-slate-200'} mobile-tab-dropdown print:hidden`}>
            <button 
              onClick={() => setMobileTabDropdownOpen(!mobileTabDropdownOpen)} 
              className={`w-full px-4 py-3 flex items-center justify-between text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-900'} ${highContrast ? 'bg-white hover:bg-gray-100' : 'hover:bg-slate-50'}`}
              aria-expanded={mobileTabDropdownOpen}
              aria-haspopup="true"
            >
              <span className="flex items-center gap-2">
                {(() => { 
                  const currentTab = tabs.find(t => t.id === activeTab)
                  const Icon = currentTab?.icon
                  return Icon ? <Icon className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} /> : null
                })()}
                {tabs.find(t => t.id === activeTab)?.shortLabel || tabs.find(t => t.id === activeTab)?.label}
              </span>
              <ChevronDown className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-navy-500'} transition-transform ${mobileTabDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileTabDropdownOpen && (
              <div className={`border-t ${highContrast ? 'border-black bg-white' : 'border-slate-200 bg-white'} py-1 max-h-64 overflow-y-auto`}>
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button 
                      key={tab.id} 
                      onClick={() => { 
                        setActiveTab(tab.id)
                        setMobileTabDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                        activeTab === tab.id 
                          ? highContrast ? 'bg-gray-200 text-black font-medium' : 'bg-gold-50 text-navy-900 font-medium' 
                          : highContrast ? 'text-black hover:bg-gray-100' : 'text-navy-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${activeTab === tab.id ? (highContrast ? 'text-black' : 'text-gold-600') : (highContrast ? 'text-gray-600' : 'text-navy-400')}`} />
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Desktop Tab Navigation */}
          <div className={`hidden sm:block border-b ${highContrast ? 'border-black' : 'border-slate-200'} overflow-x-auto print:hidden`}>
            <div className="flex px-6 lg:px-8 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-3 lg:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                      ${activeTab === tab.id 
                        ? highContrast 
                          ? 'border-black text-black' 
                          : 'border-gold-600 text-navy-900'
                        : highContrast 
                          ? 'border-transparent text-gray-600 hover:text-black'
                          : 'border-transparent text-navy-500 hover:text-navy-700'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${activeTab === tab.id ? (highContrast ? 'text-black' : 'text-gold-600') : (highContrast ? 'text-gray-600' : 'text-navy-400')}`} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* User Notes Section */}
          <div className={`px-4 sm:px-8 py-3 border-b ${highContrast ? 'border-black bg-gray-50' : 'border-slate-200 bg-amber-50/30'} print:hidden`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                  <span className={`text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Your Notes</span>
                </div>
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      className={`w-full p-2 text-sm border rounded-lg ${highContrast ? 'border-black bg-white text-black' : 'border-navy-200 bg-white text-navy-900'} focus:outline-none focus:ring-2 focus:ring-gold-500`}
                      rows={3}
                      placeholder="Add your private notes here..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveNotes}
                        className={`px-3 py-1 text-xs rounded ${highContrast ? 'bg-black text-white hover:bg-gray-800' : 'bg-gold-600 text-white hover:bg-gold-500'} transition-colors`}
                      >
                        <Save className="w-3 h-3 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelNotes}
                        className={`px-3 py-1 text-xs rounded border ${highContrast ? 'border-black text-black hover:bg-gray-100' : 'border-navy-300 text-navy-700 hover:bg-navy-50'} transition-colors`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`text-sm ${highContrast ? 'text-black' : 'text-navy-700'} cursor-pointer hover:opacity-80`}
                    onClick={() => {
                      setTempNotes(userNotes)
                      setIsEditingNotes(true)
                    }}
                  >
                    {userNotes || (
                      <span className={highContrast ? 'text-gray-600' : 'text-navy-400'}>
                        Click to add private notes about this report...
                      </span>
                    )}
                  </div>
                )}
              </div>
              {!isEditingNotes && userNotes && (
                <button
                  onClick={() => {
                    setTempNotes(userNotes)
                    setIsEditingNotes(true)
                  }}
                  className={`p-1.5 rounded ${highContrast ? 'hover:bg-gray-200' : 'hover:bg-amber-100'} transition-colors`}
                  aria-label="Edit notes"
                >
                  <Edit className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-navy-600'}`} />
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className={`p-3 sm:p-6 lg:p-8 ${fontSizeClass} print:p-4`}>
            
            {/* ============================================
                PAGE 1: EXECUTIVE SUMMARY - COMPLETE
                ============================================ */}
            {activeTab === 'executive-summary' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-gold-500 to-gold-600'}`}>
                      <FileText className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Executive Summary</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Strategic overview for {report?.company_name || 'Company'}</p>
                    </div>
                  </div>
                </div>

                {/* Quarterly Inline upsell */}
                {showQuarterlyUpsell && (
                  <div className={`rounded-xl p-5 border ${
                    highContrast 
                      ? 'bg-amber-100 border-amber-900' 
                      : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        highContrast ? 'bg-amber-200' : 'bg-amber-100'
                      }`}>
                        <Bell className={`w-5 h-5 ${highContrast ? 'text-amber-900' : 'text-amber-700'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${highContrast ? 'text-amber-900' : 'text-amber-900'}`}>
                          Want automatic updates when regulations change?
                        </h4>
                        <p className={`text-sm mb-3 ${highContrast ? 'text-amber-800' : 'text-amber-800'}`}>
                          Quarterly Intelligence subscribers receive real-time alerts, renewal reminders, and expert strategy calls.
                        </p>
                        <a
                          href={`/pricing?plan=quarterly${report?.id ? `&report_id=${report.id}` : ''}`}
                          className={`inline-flex items-center gap-2 text-sm font-medium hover:underline ${
                            highContrast ? 'text-amber-900' : 'text-amber-700'
                          }`}
                        >
                          Learn about Quarterly Intelligence
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Generated Content Section */}
                {aiContent && (
                  <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-gradient-to-br from-gold-50 to-white border-gold-200'}`}>
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-gradient-to-r from-gold-600 to-gold-500'}`}>
                      <h3 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                        AI-Generated Regulatory Analysis
                      </h3>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className={`prose prose-sm sm:prose max-w-none ${highContrast ? 'text-black' : 'text-navy-700'}`}>
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                          {typeof aiContent === 'string' 
                            ? aiContent.substring(0, AI_CONTENT_PREVIEW_LENGTH) + (aiContent.length > AI_CONTENT_PREVIEW_LENGTH ? '...' : '')
                            : 'Report content is being processed...'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Overview Card */}
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-navy-900 to-navy-800'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-6">
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
                        <span className="text-gold-400 font-medium text-xs sm:text-sm">INSTITUTION PROFILE</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{report?.company_name || 'Company'}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-navy-200 text-xs sm:text-sm">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 sm:w-4 sm:h-4" />{report?.city || ''}, {report?.state || ''}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3 sm:w-4 sm:h-4" />{report?.industry || 'Financial Services'}</span>
                      </div>
                    </div>
                    <div className={`rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm self-start ${highContrast ? 'bg-gray-700' : 'bg-white/10'}`}>
                      <p className="text-[10px] sm:text-xs text-navy-300">Report Date</p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gold-400">{formatDateSafe(createdAt, 'MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
                    {reportData.metrics.slice(0, METRICS_PREVIEW_COUNT).map((metric, index) => (
                      <div key={index} className={`rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm border ${highContrast ? 'bg-gray-800 border-gray-600' : 'bg-white/5 border-white/10'}`}>
                        <p className="text-[10px] sm:text-xs text-navy-300 mb-0.5 sm:mb-1">{metric.label}</p>
                        <p className={`text-sm sm:text-base lg:text-lg font-semibold ${metric.color}`}>{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client's Specific Input Card */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200'}`}>
                  <div className={`px-4 sm:px-6 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-gradient-to-r from-amber-600 to-amber-500'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                      Your Custom Compliance Request
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${highContrast ? 'text-black' : 'text-amber-600'}`}>Primary Focus</p>
                        <p className={`text-sm sm:text-base font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>{formatPrimaryFocus(reportData.strategy.primary)}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${highContrast ? 'text-black' : 'text-amber-600'}`}>Timeline</p>
                        <p className={`text-sm sm:text-base font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>{formatTimeline(reportData.strategy.timeline)}</p>
                      </div>
                    </div>

                    {reportData.strategy.secondary.length > 0 && (
                      <div>
                        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 ${highContrast ? 'text-black' : 'text-amber-600'}`}>
                          Secondary Focus ({reportData.strategy.secondary.length} areas)
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {reportData.strategy.secondary.map((focus, idx) => (
                            <span key={idx} className={`px-2 sm:px-3 py-0.5 sm:py-1 border rounded-full text-xs sm:text-sm ${highContrast ? 'bg-white text-black border-black' : 'bg-white text-navy-700 border-amber-200'}`}>
                              {formatSecondaryFocus(focus)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {reportData.strategy.concerns && reportData.strategy.concerns !== 'No specific concerns provided.' && (
                        <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border ${highContrast ? 'bg-white border-black' : 'bg-white border-amber-200'}`}>
                          <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-2 ${highContrast ? 'text-black' : 'text-amber-600'}`}>Your Concerns</p>
                          <p className={`text-xs sm:text-sm italic ${highContrast ? 'text-black' : 'text-navy-700'}`}>
                            "{reportData.strategy.concerns.substring(0, CONCERNS_PREVIEW_LENGTH)}{reportData.strategy.concerns.length > CONCERNS_PREVIEW_LENGTH ? '...' : ''}"
                          </p>
                        </div>
                      )}
                      {reportData.strategy.goals && reportData.strategy.goals !== 'No specific goals provided.' && (
                        <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border ${highContrast ? 'bg-white border-black' : 'bg-white border-amber-200'}`}>
                          <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-2 ${highContrast ? 'text-black' : 'text-amber-600'}`}>Your Goals</p>
                          <p className={`text-xs sm:text-sm italic ${highContrast ? 'text-black' : 'text-navy-700'}`}>
                            "{reportData.strategy.goals.substring(0, GOALS_PREVIEW_LENGTH)}{reportData.strategy.goals.length > GOALS_PREVIEW_LENGTH ? '...' : ''}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className={`mt-2 pt-4 border-t ${highContrast ? 'border-black' : 'border-amber-200'}`}>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-600'}`}>
                        <span className={`font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>✓ How this report addresses your needs:</span> Tailored to your {formatPrimaryFocus(reportData.strategy.primary).toLowerCase()} priorities within your {formatTimeline(reportData.strategy.timeline).toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verified Facts Section */}
                {verifiedFacts.length > 0 && (
                  <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-r from-green-50 to-transparent border-navy-100'}`}>
                      <h3 className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${highContrast ? 'text-black' : 'text-green-600'}`} />
                        Verified Regulatory Facts ({verifiedFacts.length})
                      </h3>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                        {verifiedFacts.slice(0, VERIFIED_FACTS_PREVIEW_COUNT).map((fact: any, idx: number) => (
                          <div key={idx} className={`pb-2 sm:pb-3 last:pb-0 ${idx < verifiedFacts.length - 1 ? (highContrast ? 'border-b border-gray-300' : 'border-b border-navy-100') : ''}`}>
                            <p className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{fact.claim}</p>
                            {fact.source_name && (
                              <a 
                                href={fact.source_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`text-[10px] sm:text-xs hover:underline flex items-center gap-1 mt-1 ${highContrast ? 'text-black' : 'text-gold-600'}`}
                              >
                                Source: {fact.source_name} <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Strategic Overview */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-3 sm:py-4 border-b ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-r from-gold-50 to-transparent border-navy-100'}`}>
                    <h3 className={`text-sm sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${highContrast ? 'bg-black' : 'bg-gold-600'}`} />
                      Strategic Overview
                    </h3>
                  </div>
                  <div className="p-4 sm:p-8">
                    <p className={`text-xs sm:text-sm lg:text-base leading-relaxed ${highContrast ? 'text-black' : 'text-navy-700'}`}>
                      This comprehensive {isMultiState ? 'multi-state' : '10-page'} regulatory intelligence report provides detailed compliance analysis for {report?.company_name || 'Company'} in {isMultiState ? `${allStates.length} states` : `${report?.city || ''}, ${report?.state || ''}`}. 
                      Key requirements include {formatMoney(licensingData.application_fee)} application fee, {bondRangeDisplay} bond requirement, 
                      and {getProcessingTime()} processing time{isMultiState ? ' (varies by state)' : ''}.
                    </p>
                  </div>
                </div>

                {/* Key Findings */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className={`text-base sm:text-lg font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Key Findings</h4>
                  <div className="grid gap-2 sm:gap-3">
                    {[
                      { icon: Scale, text: `${report?.state || 'Your state'} maintains a ${locationData.regulatoryClimate} regulatory climate` },
                      { icon: Gavel, text: `${isMultiState ? `Multi-state licensing requirements span ${allStates.length} jurisdictions` : 'Single-state licensing applies'}` },
                      { icon: Clock, text: `Critical compliance deadlines require immediate action (30-90 days)` },
                      { icon: Shield, text: `${reportData.overallRisk || 'Moderate'} risk based on current compliance posture` }
                    ].map((finding, i) => {
                      const Icon = finding.icon
                      return (
                        <div key={i} className={`flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                          <p className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{finding.text}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Risk and Strategy Cards */}
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className={`border rounded-xl p-4 sm:p-5 ${
                    highContrast ? 
                      (reportData.overallRisk === 'Elevated' ? 'bg-red-100 border-red-900' : 
                       reportData.overallRisk === 'Low' ? 'bg-green-100 border-green-900' : 
                       'bg-yellow-100 border-yellow-900') :
                      (reportData.overallRisk === 'Elevated' ? 'bg-red-50 border-red-200' : 
                       reportData.overallRisk === 'Low' ? 'bg-green-50 border-green-200' : 
                       'bg-amber-50 border-amber-200')
                  }`}>
                    <h5 className={`font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base ${
                      highContrast ? 
                        (reportData.overallRisk === 'Elevated' ? 'text-red-900' : 
                         reportData.overallRisk === 'Low' ? 'text-green-900' : 
                         'text-yellow-900') :
                        (reportData.overallRisk === 'Elevated' ? 'text-red-800' : 
                         reportData.overallRisk === 'Low' ? 'text-green-800' : 
                         'text-amber-800')
                    }`}>
                      <AlertTriangle className="w-4 h-4" /> Risk Summary
                    </h5>
                    <p className={`text-xs sm:text-sm ${
                      highContrast ? 
                        (reportData.overallRisk === 'Elevated' ? 'text-red-900' : 
                         reportData.overallRisk === 'Low' ? 'text-green-900' : 
                         'text-yellow-900') :
                        (reportData.overallRisk === 'Elevated' ? 'text-red-700' : 
                         reportData.overallRisk === 'Low' ? 'text-green-700' : 
                         'text-amber-700')
                    }`}>
                      {reportData.overallRisk === 'Elevated' ? 'Enhanced compliance measures recommended.' : 
                       reportData.overallRisk === 'Low' ? 'Favorable risk profile.' : 
                       'Moderate risk profile.'}
                    </p>
                  </div>
                  <div className={`border rounded-xl p-4 sm:p-5 ${highContrast ? 'bg-blue-100 border-blue-900' : 'bg-blue-50 border-blue-200'}`}>
                    <h5 className={`font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-blue-900' : 'text-blue-800'}`}>
                      <Target className="w-4 h-4" /> Strategic Focus
                    </h5>
                    <p className={`text-xs sm:text-sm ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>
                      Prioritize license applications in Q{Math.ceil(new Date().getMonth()/3)+1} while building compliance infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2: Market & Talent Analysis - COMPLETE */}
            {activeTab === 'market-talent' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
                      <TrendingUp className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Market & Talent Analysis</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Local market conditions and compliance talent availability</p>
                    </div>
                  </div>
                </div>

                {/* Market Analysis */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-3 sm:py-4 border-b ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-r from-purple-50 to-transparent border-navy-100'}`}>
                    <h3 className={`text-sm sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                      <MapPin className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-purple-600'}`} />
                      Market Overview: {reportData.marketAnalysis?.tier || 'Major'}
                    </h3>
                  </div>
                  <div className="p-4 sm:p-8">
                    <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${highContrast ? 'text-black' : 'text-navy-700'}`}>{reportData.marketAnalysis?.description || 'Market analysis in progress.'}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>Growth Rate</p>
                        <p className={`text-lg sm:text-2xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.marketAnalysis?.growthRate || 12}%</p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>Competitors</p>
                        <p className={`text-lg sm:text-2xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.marketAnalysis?.competitorDensity || 'Medium'}</p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>Opportunity</p>
                        <p className={`text-lg sm:text-2xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.marketAnalysis?.opportunityScore || 75}/100</p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>Key Industries</p>
                        <p className={`text-xs sm:text-sm font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{(reportData.marketAnalysis?.keyIndustries || ['FinTech', 'Banking']).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Talent Analysis */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-3 sm:py-4 border-b ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-r from-purple-50 to-transparent border-navy-100'}`}>
                    <h3 className={`text-sm sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                      <Users className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-purple-600'}`} />
                      Compliance Talent Analysis
                    </h3>
                  </div>
                  <div className="p-4 sm:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>Talent Score</p>
                        <p className={`text-lg sm:text-2xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.talentAnalysis?.talentScore || 65}/100</p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>Talent Rank</p>
                        <p className={`text-lg sm:text-2xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                          {reportData.talentAnalysis?.talentRank === 'high' ? 'High' : reportData.talentAnalysis?.talentRank === 'medium' ? 'Medium' : 'Developing'}
                        </p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>Professionals</p>
                        <p className={`text-lg sm:text-2xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{(reportData.talentAnalysis?.totalProfessionals || 1250).toLocaleString()}</p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>Avg. Salary</p>
                        <p className={`text-sm sm:text-2xl font-bold ${highContrast ? 'text-black' : 'text-gold-600'}`}>{formatCurrency(reportData.talentAnalysis?.avgSalary || 95000)}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h4 className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>Hiring Strategy</h4>
                        <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${highContrast ? 'text-black' : 'text-navy-700'}`}>{reportData.talentAnalysis?.hiringStrategy || 'Hybrid approach recommended'}</p>
                        
                        <h4 className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>Top Recruitment Channels</h4>
                        <ul className="space-y-1.5 sm:space-y-2">
                          {(reportData.talentAnalysis?.topChannels || ['LinkedIn', 'Industry Job Boards', 'Recruitment Firms']).map((channel: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-black' : 'text-green-600'}`} />
                              <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{channel}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className={`rounded-lg sm:rounded-xl p-4 sm:p-6 border ${highContrast ? 'bg-purple-100 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                          <h4 className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>Time to Hire</h4>
                          <p className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 ${highContrast ? 'text-purple-900' : 'text-purple-900'}`}>{reportData.talentAnalysis?.timeToHire || '4-6 weeks'}</p>
                          <p className={`text-xs sm:text-sm ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>Estimated from engagement to offer acceptance</p>
                          
                          <div className={`mt-4 sm:mt-6 pt-3 sm:pt-4 border-t ${highContrast ? 'border-purple-900' : 'border-purple-200'}`}>
                            <p className={`text-xs sm:text-sm ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>
                              <span className="font-bold">Growth Rate:</span> {reportData.talentAnalysis?.growthRate || '8%'} YoY increase in compliance professionals
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 3: Regulatory Analysis - ENHANCED with Legislation */}
            {activeTab === 'regulatory' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                      <Scale className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        Regulatory Analysis: {isMultiState ? `${allStates.length} States` : report.state || 'State'}
                      </h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Detailed framework, requirements, and active legislation</p>
                    </div>
                  </div>
                </div>

                {/* Regulatory Summary - Enhanced with licensing data */}
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                  <p className="text-sm sm:text-base leading-relaxed ${highContrast ? 'text-black' : 'text-navy-700'}">
                    {hasFullLicensingData && licensingData.license_description ? (
                      licensingData.license_description
                    ) : (
                      <>
                        {report.state || 'Your state'} maintains a {
                          locationData.regulatoryClimate === 'friendly' ? 'business-friendly' : 
                          locationData.regulatoryClimate === 'strict' ? 'strict' : 'moderate'
                        } regulatory environment
                        {hasFullLicensingData && licensingData.license_required === 'none' 
                          ? ' with no specific money transmitter license requirements.' 
                          : ` requiring ${licensingData.license_name || 'Money Transmitter License'} registration.`
                        } The state follows a {
                          locationData.regulatoryClimate === 'friendly' ? 'principles-based' : 
                          locationData.regulatoryClimate === 'strict' ? 'comprehensive' : 'balanced'
                        } approach to digital asset regulation.
                      </>
                    )}
                  </p>
                </div>

                {/* Multi-State Regulatory Overview (if applicable) */}
                {isMultiState && reportData.multiStateLicenses && reportData.multiStateLicenses.length > 0 && (
                  <div className="space-y-4">
                    <h4 className={`text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                      <Globe className={`w-5 h-5 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                      Multi-State Regulatory Overview
                    </h4>
                    <p className={`text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                      Your multi-state operation spans {allStates.length} jurisdictions. Below is a summary of regulatory climates and requirements:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {reportData.multiStateLicenses.slice(0, 8).map((license: any) => (
                        <div key={license.state} className={`rounded-lg p-4 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                          <p className={`font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{license.state}</p>
                          <p className={`text-sm ${
                            license.climate === 'friendly' ? 'text-green-600' : 
                            license.climate === 'strict' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {license.climate === 'friendly' ? '🟢 Friendly' : 
                             license.climate === 'strict' ? '🔴 Strict' : '🟡 Moderate'}
                          </p>
                          <p className={`text-xs ${highContrast ? 'text-gray-600' : 'text-navy-500'} mt-1`}>{license.licenseType}</p>
                        </div>
                      ))}
                    </div>
                    {reportData.multiStateLicenses.length > 8 && (
                      <p className={`text-xs text-center ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>
                        +{reportData.multiStateLicenses.length - 8} additional states
                      </p>
                    )}
                  </div>
                )}

                {/* Regulatory Climate & License Summary - Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
                  <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                    <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Regulatory Climate</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        locationData.regulatoryClimate === 'friendly' ? 'bg-green-500' : 
                        locationData.regulatoryClimate === 'strict' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <p className={`text-lg sm:text-xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        {locationData.regulatoryClimate === 'friendly' ? 'Friendly' : 
                         locationData.regulatoryClimate === 'strict' ? 'Strict' : 'Moderate'}
                      </p>
                    </div>
                    {hasFullLicensingData && licensingData.notes && (
                      <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'} mt-2`}>{licensingData.notes}</p>
                    )}
                    {!hasFullLicensingData && (
                      <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'} mt-2`}>
                        {locationData.regulatoryClimate === 'friendly' 
                          ? 'Pro-business environment with streamlined application processes.'
                          : locationData.regulatoryClimate === 'strict'
                          ? 'Comprehensive oversight with detailed compliance requirements.'
                          : 'Balanced approach with standard regulatory expectations.'}
                      </p>
                    )}
                  </div>
                  <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                    <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Primary License Required</p>
                    <p className={`text-lg sm:text-xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                      {hasFullLicensingData && licensingData.license_name ? (
                        licensingData.license_name
                      ) : (
                        (reportData.licenses || []).length > 0 ? reportData.licenses[0].licenseType : 'Money Transmitter License'
                      )}
                    </p>
                    <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'} mt-2`}>
                      {hasFullLicensingData && licensingData.license_required === 'none' 
                        ? 'No license required for digital asset activities' 
                        : 'Registration required before commencing operations'}
                    </p>
                  </div>
                </div>

                {/* Licensing Requirements Table */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Licensing Requirements</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] sm:min-w-full">
                      <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                        <tr>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>License Type</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Requirement</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Timeline</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Fee</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Bonding</th>
                        </tr>
                      </thead>
                      <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                        {(reportData.licenses || []).length > 0 ? (
                          reportData.licenses.map((license: any, i: number) => (
                            <tr key={i} className="hover:bg-navy-50">
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>{license.licenseType}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{license.required ? 'Required' : 'May be required'}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{license.timeline || getProcessingTime()}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{license.fees || formatMoney(licensingData.application_fee)}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{license.bonding || bondRangeDisplay}</td>
                            </tr>
                          ))
                        ) : (
                          <>
                            <tr className="hover:bg-navy-50">
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                                {hasFullLicensingData && licensingData.license_name ? licensingData.license_name : 'Money Transmitter License'}
                              </td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>
                                {hasFullLicensingData && licensingData.license_required === 'none' ? 'Not Required' : 'Required'}
                              </td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{getProcessingTime()}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{formatMoney(licensingData.application_fee)}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{bondRangeDisplay}</td>
                            </tr>
                            <tr className="hover:bg-navy-50">
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>AML/KYC Program</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Mandatory</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>2-3 months</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Varies</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>N/A</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Regulator Contact Information - ENHANCED (merged from v1) */}
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                  <h4 className={`font-semibold mb-3 text-sm sm:text-base flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                    <Building2 className={`w-4 h-4 sm:w-5 sm:h-5 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                    Regulator Contact Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className={`font-medium text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-800'}`}>
                        {licensingData.regulator_name || reportData.providers?.regulator?.name || 'State Banking Department'}
                      </p>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'} mt-2 flex items-center gap-2`}>
                        <Phone className="w-3.5 h-3.5" />
                        {formatPhoneNumber(licensingData.regulator_phone || reportData.providers?.regulator?.phone || 'Check state website')}
                      </p>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'} flex items-center gap-2 mt-1`}>
                        <Mail className="w-3.5 h-3.5" />
                        {licensingData.regulator_email || reportData.providers?.regulator?.email || 'Check state website'}
                      </p>
                      {licensingData.regulator_website && (
                        <a 
                          href={licensingData.regulator_website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-gold-600'} hover:underline flex items-center gap-1 mt-2`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit Official Website
                        </a>
                      )}
                    </div>
                    <div className={`rounded-lg p-4 border ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                      <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Regulatory Approach</p>
                      <p className={`text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>
                        {reportData.providers?.regulator?.specialty || 'The state takes a balanced approach to digital asset regulation, focusing on consumer protection while fostering innovation.'}
                      </p>
                      {hasFullLicensingData && licensingData.effective_date && (
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-3 pt-2 border-t ${highContrast ? 'border-gray-300' : 'border-navy-200'}`}>
                          Requirements effective: {new Date(licensingData.effective_date).toLocaleDateString()}
                        </p>
                      )}
                      {hasFullLicensingData && licensingData.last_reviewed_at && (
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-1`}>
                          Last verified: {new Date(licensingData.last_reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enforcement History */}
                {enforcementHistory && enforcementHistory !== 'No recent enforcement actions identified' && (
                  <div className={`rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                    <h4 className={`font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      Recent Enforcement Activity
                    </h4>
                    <p className={`text-xs sm:text-sm ${highContrast ? 'text-amber-900' : 'text-amber-700'}`}>{enforcementHistory}</p>
                  </div>
                )}

                {/* Pending Legislation Summary */}
                {pendingLegislation && pendingLegislation !== 'No pending legislation identified' && (
                  <div className={`rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-blue-100 border-blue-900' : 'bg-blue-50 border-blue-200'}`}>
                    <h4 className={`font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-blue-900' : 'text-blue-800'}`}>
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Pending Legislation Summary
                    </h4>
                    <p className={`text-xs sm:text-sm ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>{pendingLegislation}</p>
                  </div>
                )}

                {/* State Legislation Tracker - LegiScan Data (FULL FEATURE from v1) */}
                {legislationData && legislationData.length > 0 && (
                  <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                    <div className={`px-4 sm:px-8 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-gradient-to-r from-blue-700 to-blue-800'}`}>
                      <h4 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                        Active Legislation Tracker - {report?.state}
                      </h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] sm:min-w-full">
                        <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                          <tr>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Bill Number</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Title / Description</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Status</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Last Action</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Relevance</th>
                          </tr>
                        </thead>
                        <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                          {legislationData.slice(0, 6).map((bill: any) => (
                            <tr key={bill.id} className="hover:bg-navy-50">
                              <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                <a 
                                  href={bill.officialUrl || `https://legiscan.com/${report?.state}/bill/${bill.billNumber}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`font-medium ${highContrast ? 'text-black' : 'text-navy-900'} hover:text-gold-600 text-xs sm:text-sm flex items-center gap-1`}
                                >
                                  {bill.billNumber}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                <div className="max-w-md">
                                  <p className={`text-xs sm:text-sm truncate ${highContrast ? 'text-black' : 'text-navy-700'}`}>{bill.title}</p>
                                  {bill.description && (
                                    <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-gray-600' : 'text-navy-500'} truncate mt-0.5`}>{bill.description}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                  bill.status === 'Enacted' || bill.status === 'Passed' ? 'bg-green-100 text-green-800' :
                                  bill.status === 'Failed' || bill.status === 'Died' || bill.status === 'Vetoed' ? 'bg-red-100 text-red-800' :
                                  bill.status === 'Passed Chamber' || bill.status === 'Committee' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {bill.status || 'Active'}
                                </span>
                              </td>
                              <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                                  {bill.lastActionDate ? formatDateSafe(bill.lastActionDate, 'MMM d, yyyy') : '—'}
                                </p>
                                {bill.lastAction && (
                                  <p className={`text-[9px] sm:text-[10px] ${highContrast ? 'text-gray-600' : 'text-navy-400'} truncate max-w-[120px]`}>
                                    {bill.lastAction}
                                  </p>
                                )}
                              </td>
                              <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-1.5 bg-navy-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-gold-500" 
                                      style={{ width: `${Math.min(100, Math.max(0, bill.relevanceScore || 50))}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] sm:text-xs text-navy-600">{bill.relevanceScore || 50}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {legislationData.length > 6 && (
                      <div className={`px-4 sm:px-6 py-3 border-t ${highContrast ? 'border-black bg-gray-100' : 'border-navy-200 bg-navy-50'}`}>
                        <p className={`text-xs text-center ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>
                          +{legislationData.length - 6} more bills tracked for {report?.state}
                        </p>
                      </div>
                    )}
                    <div className={`px-4 sm:px-6 py-3 ${highContrast ? 'bg-gray-100 border-t border-black' : 'bg-blue-50 border-t border-blue-200'}`}>
                      <p className={`text-xs flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-600'}`}>
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        Legislation data provided by LegiScan • Updated daily • Monitor these bills for potential compliance impacts
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading State for Legislation */}
                {isLoadingLegislation && (
                  <div className={`rounded-xl p-8 border text-center ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                    <Loader2 className="w-6 h-6 text-gold-600 animate-spin mx-auto mb-3" />
                    <p className={`text-sm ${highContrast ? 'text-black' : 'text-navy-600'}`}>Loading active legislation from LegiScan...</p>
                  </div>
                )}

                {/* Empty Legislation State */}
                {!isLoadingLegislation && legislationData.length === 0 && report?.state && (
                  <div className={`rounded-xl p-6 border text-center ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                    <FileText className={`w-8 h-8 ${highContrast ? 'text-gray-600' : 'text-navy-400'} mx-auto mb-2`} />
                    <p className={`text-sm ${highContrast ? 'text-black' : 'text-navy-600'}`}>No active legislation currently tracked for {report?.state}</p>
                    <p className={`text-xs ${highContrast ? 'text-gray-600' : 'text-navy-400'} mt-1`}>Check back for updates on pending regulatory bills</p>
                  </div>
                )}

                {/* Key Regulatory Considerations - Enhanced */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-700'}`}>
                    <h4 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
                      Key Regulatory Considerations
                    </h4>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { icon: Scale, text: `Maintain compliance with ${report.state || 'state'} and federal regulations including BSA/AML requirements` },
                        { icon: Shield, text: 'Implement robust AML/KYC programs with ongoing transaction monitoring and suspicious activity reporting' },
                        { icon: Clock, text: 'Monitor regulatory changes and proposed legislation regularly - track bills from LegiScan above' },
                        { icon: AlertTriangle, text: 'Prepare for potential examinations and enforcement inquiries from state regulators' },
                        { icon: FileText, text: 'Maintain comprehensive documentation, audit trails, and compliance records for at least 5 years' },
                        { icon: Users, text: 'Designate qualified compliance personnel with appropriate training and reporting structures' },
                        { icon: RefreshCw, text: 'Schedule quarterly compliance reviews and annual risk assessments' },
                        { icon: Calendar, text: 'Track license renewal deadlines - most states require annual renewal 30-60 days before expiration' }
                      ].map((item, i) => {
                        const Icon = item.icon
                        return (
                          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                            <Icon className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'} mt-0.5 flex-shrink-0`} />
                            <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Source Verification & Data Freshness */}
                {(hasFullLicensingData && (licensingData.source_name || licensingData.source_url || licensingData.last_reviewed_at)) && (
                  <div className={`rounded-xl p-4 border ${highContrast ? 'bg-green-100 border-green-900' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${highContrast ? 'text-green-900' : 'text-green-600'}`} />
                        <span className={`text-xs font-semibold ${highContrast ? 'text-green-900' : 'text-green-800'}`}>Verified Source Data</span>
                      </div>
                      {licensingData.source_name && (
                        <span className={`text-xs ${highContrast ? 'text-green-900' : 'text-green-700'}`}>
                          Source: {licensingData.source_name}
                          {licensingData.source_url && (
                            <a href={licensingData.source_url} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 hover:underline">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </span>
                      )}
                      {licensingData.last_reviewed_at && (
                        <span className={`text-xs ${highContrast ? 'text-green-900' : 'text-green-700'}`}>
                          Last verified: {new Date(licensingData.last_reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAGE 4: Licensing Matrix - DYNAMIC (Single or Multi-State) with Full API Data */}
            {activeTab === 'licensing' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`}>
                      <Gavel className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        {isMultiState ? 'Multi-State Licensing Matrix' : 'Licensing Requirements Matrix'}
                      </h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>
                        {isMultiState 
                          ? `Comparative requirements across ${allStates.length} jurisdictions` 
                          : `Comprehensive requirements for ${report.state || 'your state'}`}
                      </p>
                    </div>
                  </div>
                </div>

                {isLoadingLicensing ? (
                  <div className={`rounded-xl p-8 text-center border ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                    <Loader2 className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-4" />
                    <p className={`${highContrast ? 'text-black' : 'text-navy-600'}`}>Loading licensing data from database...</p>
                  </div>
                ) : !fullLicensingData || Object.keys(fullLicensingData).length === 0 ? (
                  <div className={`rounded-xl p-6 text-center border ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                    <AlertCircle className={`w-12 h-12 ${highContrast ? 'text-amber-900' : 'text-amber-500'} mx-auto mb-4`} />
                    <h3 className={`text-lg font-semibold mb-2 ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>Licensing Data Not Available</h3>
                    <p className={`mb-4 ${highContrast ? 'text-amber-900' : 'text-amber-700'}`}>
                      Unable to load licensing data for {report.state}. Please try refreshing the page.
                    </p>
                    <button onClick={() => { setDataLoadAttempted(false); setFullLicensingData(null); loadAllData(); }} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                      Retry
                    </button>
                  </div>
                ) : isMultiState && reportData.multiStateLicenses && reportData.multiStateLicenses.length > 0 ? (
                  // Multi-state view
                  <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                    <div className={`px-4 sm:px-8 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                      <h3 className="text-white font-semibold text-sm sm:text-base">Multi-State Comparison</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] sm:min-w-full">
                        <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                          <tr>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>State</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>License Type</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Timeline</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Bonding</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Climate</th>
                          </tr>
                        </thead>
                        <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                          {reportData.multiStateLicenses.slice(0, 10).map((license: any, i: number) => (
                            <tr key={i} className="hover:bg-navy-50">
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm ${license.isPrimary ? (highContrast ? 'font-bold text-black' : 'font-bold text-navy-900') : (highContrast ? 'text-black' : 'text-navy-700')}`}>
                                {license.state}
                                {license.isPrimary && <span className="ml-2 text-[10px] text-gold-600">(Primary)</span>}
                              </td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{license.licenseType}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{license.timeline}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{license.bonding}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm capitalize ${highContrast ? 'text-black' : license.climate === 'friendly' ? 'text-green-600' : license.climate === 'strict' ? 'text-red-600' : 'text-yellow-600'}`}>
                                {license.climate}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // Single-state view with full licensing data
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className={`rounded-xl p-4 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-br from-navy-50 to-navy-100 border-navy-200'}`}>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>License Required</p>
                        <p className={`text-xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{getLicenseRequiredDisplay()}</p>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-1`}>{licensingData.license_name || 'Money Transmitter License'}</p>
                      </div>
                      <div className={`rounded-xl p-4 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-br from-gold-50 to-gold-100 border-gold-200'}`}>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Application Fee</p>
                        <p className={`text-xl font-bold ${highContrast ? 'text-black' : 'text-gold-700'}`}>{formatMoney(licensingData.application_fee)}</p>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-1`}>Non-refundable</p>
                      </div>
                      <div className={`rounded-xl p-4 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Processing Time</p>
                        <p className={`text-xl font-bold ${highContrast ? 'text-black' : 'text-blue-700'}`}>{getProcessingTime()}</p>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-1`}>Estimated</p>
                      </div>
                      <div className={`rounded-xl p-4 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Bond Requirement</p>
                        <p className={`text-lg font-bold ${highContrast ? 'text-black' : 'text-purple-700'}`}>{bondRangeDisplay}</p>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-1`}>Surety Bond</p>
                      </div>
                    </div>

                    {/* Regulatory Climate Badge */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        licensingData.regulatory_climate === 'friendly' ? 'bg-green-100 text-green-800' :
                        licensingData.regulatory_climate === 'strict' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        <Shield className="w-4 h-4 mr-1.5" />
                        Regulatory Climate: {licensingData.regulatory_climate === 'friendly' ? 'Friendly' : licensingData.regulatory_climate === 'strict' ? 'Strict' : 'Moderate'}
                      </span>
                    </div>

                    {/* Financial Requirements */}
                    <div className={`rounded-xl border overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                      <div className={`px-4 sm:px-6 py-2.5 sm:py-3 ${highContrast ? 'bg-black' : 'bg-navy-700'}`}>
                        <h4 className="text-white font-medium text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gold-400" />
                          Financial Requirements
                        </h4>
                      </div>
                      <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className={`rounded-lg p-4 ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Application Fee</p>
                            <p className={`text-lg font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{formatMoney(licensingData.application_fee)}</p>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-400'} mt-1`}>One-time, non-refundable</p>
                          </div>
                          <div className={`rounded-lg p-4 ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Annual Renewal Fee</p>
                            <p className={`text-lg font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{formatMoney(licensingData.annual_renewal_fee)}</p>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-400'} mt-1`}>Due annually on anniversary</p>
                          </div>
                          <div className={`rounded-lg p-4 ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Net Worth Requirement</p>
                            <p className={`text-lg font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{formatMoney(licensingData.net_worth_requirement)}</p>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-400'} mt-1`}>Minimum tangible net worth</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* License Description & Notes */}
                    {(licensingData.license_description || licensingData.notes) && (
                      <div className={`rounded-xl border overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                        <div className={`px-4 sm:px-6 py-2.5 sm:py-3 ${highContrast ? 'bg-black' : 'bg-navy-700'}`}>
                          <h4 className="text-white font-medium text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gold-400" />
                            License Details & Important Notes
                          </h4>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3">
                          {licensingData.license_description && (
                            <p className={`text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{licensingData.license_description}</p>
                          )}
                          {licensingData.notes && (
                            <p className={`text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{licensingData.notes}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Standard Application Requirements */}
                    <div className={`rounded-xl p-4 sm:p-6 border ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-gold-50 border-gold-200'}`}>
                      <h5 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                        Standard Application Requirements
                      </h5>
                      <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                        {[
                          'Complete application forms with business plans',
                          'Fingerprint-based background checks for principals',
                          'Audited financial statements',
                          'Surety bonds as specified',
                          'Designate compliance officer',
                          'Written policies and procedures',
                          'Proof of net worth requirements',
                          'Business continuity plan'
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-amber-200' : 'bg-gold-200'}`}>
                              <span className={`text-[10px] sm:text-xs ${highContrast ? 'text-black' : 'text-gold-700'}`}>✓</span>
                            </div>
                            <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PAGE 5: Compliance Roadmap - FROM reportData.compliancePhases */}
            {activeTab === 'compliance' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                      <Clock className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Compliance Implementation Roadmap</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Phased approach to full compliance</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {(reportData.compliancePhases || []).map((phase: any, idx: number) => (
                    <div key={idx} className={`border rounded-lg sm:rounded-xl p-4 sm:p-5 ${highContrast ? 'bg-gray-100 border-black' : phase.color || 'bg-navy-50'}`}>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-2 sm:mb-3">
                        <h4 className={`text-base sm:text-lg font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{phase.phase}</h4>
                        <span className={`font-medium text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-gold-600'}`}>{phase.timeline}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-1.5 sm:gap-2">
                        {(phase.items || []).map((item: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-black' : phase.textColor || 'text-green-600'}`} />
                            <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Milestones */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                  <h5 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    Key Milestones
                  </h5>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'Legal counsel engaged by end of Week 1',
                      'License applications submitted by end of Month 1',
                      'Compliance systems operational by Month 3',
                      'Full compliance achieved by Month 6'
                    ].map((milestone, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-amber-200' : 'bg-amber-200'}`}>
                          <span className={`text-[10px] sm:text-xs ${highContrast ? 'text-amber-900' : 'text-amber-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs sm:text-sm ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 6: Technology & Tools - FROM reportData.techRecommendations */}
            {activeTab === 'technology' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-cyan-500 to-cyan-600'}`}>
                      <Cpu className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Technology & Compliance Tools</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Recommended platforms, integration strategies, and implementation roadmap</p>
                    </div>
                  </div>
                </div>

                {/* Tech Stack Overview Card */}
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${highContrast ? 'bg-cyan-100 border-cyan-900' : 'bg-gradient-to-br from-cyan-50 to-white border-cyan-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${highContrast ? 'bg-cyan-200' : 'bg-cyan-100'}`}>
                      <Cpu className={`w-5 h-5 ${highContrast ? 'text-cyan-900' : 'text-cyan-700'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm sm:text-base mb-1 ${highContrast ? 'text-cyan-900' : 'text-cyan-800'}`}>Recommended Technology Stack</h3>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-cyan-800' : 'text-cyan-700'}`}>
                        Based on your company size ({reportContent.company?.size || '1-10'}) and budget ({reportContent.company?.budget || 'under-50k'}), 
                        we recommend a {reportContent.company?.budget === 'under-50k' ? 'cost-effective entry-level' : 
                        reportContent.company?.budget === '50k-150k' ? 'mid-market scalable' : 'enterprise-grade comprehensive'} technology stack.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vendor Categories - Deduplicated by category name */}
                {(() => {
                  // Get unique categories to avoid duplication
                  const techRecs = reportData.techRecommendations || []
                  const uniqueCategories = techRecs.reduce((acc: any[], category: any) => {
                    if (!acc.find(c => c.category === category.category)) {
                      acc.push(category)
                    }
                    return acc
                  }, [])
                  
                  return uniqueCategories.map((category: any, catIndex: number) => (
                    <div key={catIndex} className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                      <div className={`px-4 sm:px-8 py-3 sm:py-4 border-b ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-r from-cyan-50 to-transparent border-navy-100'}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className={`text-sm sm:text-lg font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{category.category}</h3>
                          {(() => {
                            const uniqueVendors = (category.recommendations || []).filter((rec: any, index: number, self: any[]) => 
                              index === self.findIndex((r: any) => r.name === rec.name)
                            )
                            return (
                              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${highContrast ? 'bg-cyan-200 text-cyan-900' : 'bg-cyan-100 text-cyan-700'}`}>
                                {uniqueVendors.length} vendors
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="grid gap-3 sm:gap-4">
                          {/* Deduplicate recommendations within category by name */}
                          {(() => {
                            const uniqueRecs = (category.recommendations || []).reduce((acc: any[], rec: any) => {
                              if (!acc.find(r => r.name === rec.name)) {
                                acc.push(rec)
                              }
                              return acc
                            }, [])
                            
                            return uniqueRecs.map((rec: any, recIndex: number) => (
                              <div key={recIndex} className={`flex flex-col md:flex-row md:items-start justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl gap-3 transition-all hover:shadow-md ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`font-semibold text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>{rec.name}</p>
                                    {rec.verified !== false && (
                                      <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-green-200 text-green-900' : 'bg-green-100 text-green-700'}`}>
                                        ✓ Verified
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'} mt-1`}>{rec.description}</p>
                                  <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <span className={`text-[10px] sm:text-xs flex items-center gap-1 ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>
                                      <Clock className="w-3 h-3" />
                                      Implementation: {rec.implementationTime || '4-8 weeks'}
                                    </span>
                                    {rec.integrationDifficulty && (
                                      <span className={`text-[10px] sm:text-xs flex items-center gap-1 ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>
                                        <Settings className="w-3 h-3" />
                                        Difficulty: {rec.integrationDifficulty}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className={`px-2.5 sm:px-3 py-1 rounded-full border self-start ${highContrast ? 'bg-white border-black' : 'bg-white border-gold-200'}`}>
                                  <span className={`text-xs sm:text-sm font-semibold ${highContrast ? 'text-black' : 'text-gold-700'}`}>{rec.priceRange || 'Contact vendor'}</span>
                                </div>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>
                  ))
                })()}

                {/* Compliance Automation Matrix */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-gradient-to-r from-cyan-700 to-cyan-800'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                      Compliance Automation Capabilities Matrix
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] sm:min-w-full">
                      <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                        <tr>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Capability</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Entry Level</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Mid-Market</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                        {[
                          { capability: 'Transaction Monitoring', entry: 'Basic rules', mid: 'ML-enhanced', enterprise: 'Real-time AI' },
                          { capability: 'Identity Verification', entry: 'Document check', mid: 'Biometric + Liveness', enterprise: 'Multi-source + ML' },
                          { capability: 'Sanctions Screening', entry: 'Basic lists', mid: 'Real-time + PEP', enterprise: 'Global + AI scoring' },
                          { capability: 'Reporting/Audit', entry: 'Manual exports', mid: 'Automated reports', enterprise: 'Real-time dashboards' },
                          { capability: 'Case Management', entry: 'Spreadsheets', mid: 'Workflow tools', enterprise: 'Full orchestration' },
                          { capability: 'Risk Scoring', entry: 'Rule-based', mid: 'Hybrid models', enterprise: 'ML-driven' }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-navy-50">
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>{row.capability}</td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{row.entry}</td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{row.mid}</td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{row.enterprise}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* API Integration & Data Flow Architecture */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                      <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                      Recommended Integration Architecture
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
                      <div className={`rounded-lg p-4 ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${highContrast ? 'bg-cyan-200' : 'bg-cyan-100'}`}>
                          <span className="text-sm font-bold text-cyan-700">1</span>
                        </div>
                        <h4 className={`font-semibold text-sm mb-1 ${highContrast ? 'text-black' : 'text-navy-900'}`}>Core Systems</h4>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Your existing platform, CRM, or banking core</p>
                      </div>
                      <div className={`rounded-lg p-4 ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${highContrast ? 'bg-cyan-200' : 'bg-cyan-100'}`}>
                          <span className="text-sm font-bold text-cyan-700">2</span>
                        </div>
                        <h4 className={`font-semibold text-sm mb-1 ${highContrast ? 'text-black' : 'text-navy-900'}`}>API Gateway / Middleware</h4>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Connect compliance tools via REST APIs, webhooks</p>
                      </div>
                      <div className={`rounded-lg p-4 ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${highContrast ? 'bg-cyan-200' : 'bg-cyan-100'}`}>
                          <span className="text-sm font-bold text-cyan-700">3</span>
                        </div>
                        <h4 className={`font-semibold text-sm mb-1 ${highContrast ? 'text-black' : 'text-navy-900'}`}>Compliance Layer</h4>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>KYC/AML, monitoring, reporting tools connected</p>
                      </div>
                    </div>
                    <div className={`mt-4 pt-4 border-t ${highContrast ? 'border-gray-300' : 'border-navy-200'}`}>
                      <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'} text-center`}>
                        <span className="font-semibold">Integration Tip:</span> Start with API-first vendors and prioritize data standardization for easier future scaling.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technology Implementation Timeline - Enhanced */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                  <h5 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                    <CalendarCheck className={`w-4 h-4 sm:w-5 sm:h-5 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                    Technology Implementation Roadmap
                  </h5>
                  
                  {/* Phase 1 */}
                  <div className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${highContrast ? 'bg-green-200 text-green-900' : 'bg-green-200 text-green-700'}`}>PHASE 1</span>
                      <span className={`text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-700'}`}>Weeks 1-2: Discovery & Selection</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 ml-2">
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-green-200' : 'bg-green-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-green-900' : 'text-green-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Document compliance requirements and workflows</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-green-200' : 'bg-green-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-green-900' : 'text-green-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Request demos from 3-5 shortlisted vendors</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-green-200' : 'bg-green-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-green-900' : 'text-green-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Evaluate API documentation and integration fit</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-green-200' : 'bg-green-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-green-900' : 'text-green-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Obtain pricing proposals and negotiate contracts</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${highContrast ? 'bg-blue-200 text-blue-900' : 'bg-blue-200 text-blue-700'}`}>PHASE 2</span>
                      <span className={`text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-700'}`}>Weeks 3-6: Implementation & Integration</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 ml-2">
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-blue-200' : 'bg-blue-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Set up vendor sandbox environments</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-blue-200' : 'bg-blue-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Complete API integrations and webhook configuration</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-blue-200' : 'bg-blue-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Configure rule sets, thresholds, and workflows</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-blue-200' : 'bg-blue-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Perform initial data migration and validation</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${highContrast ? 'bg-purple-200 text-purple-900' : 'bg-purple-200 text-purple-700'}`}>PHASE 3</span>
                      <span className={`text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-700'}`}>Weeks 7-9: Testing & Training</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 ml-2">
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-purple-200' : 'bg-purple-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Run parallel testing with existing processes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-purple-200' : 'bg-purple-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Conduct user acceptance testing (UAT)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-purple-200' : 'bg-purple-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Develop SOPs and compliance documentation</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-purple-200' : 'bg-purple-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Train compliance and operations staff</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 4 */}
                  <div className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${highContrast ? 'bg-cyan-200 text-cyan-900' : 'bg-cyan-200 text-cyan-700'}`}>PHASE 4</span>
                      <span className={`text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-700'}`}>Week 10+: Go-Live & Optimization</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 ml-2">
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-cyan-200' : 'bg-cyan-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-cyan-900' : 'text-cyan-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Phased production rollout</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-cyan-200' : 'bg-cyan-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-cyan-900' : 'text-cyan-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Monitor performance metrics and alerts</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-cyan-200' : 'bg-cyan-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-cyan-900' : 'text-cyan-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Quarterly optimization reviews</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-cyan-200' : 'bg-cyan-200'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-cyan-900' : 'text-cyan-700'}`}>✓</span>
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-black' : 'text-navy-700'}`}>Schedule regular vendor updates and upgrades</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Optimization Tips */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-green-100 border-green-900' : 'bg-green-50 border-green-200'}`}>
                  <h5 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-green-900' : 'text-green-800'}`}>
                    <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
                    Technology Cost Optimization Strategies
                  </h5>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'Start with core compliance needs, add modules progressively',
                      'Negotiate annual contracts for volume discounts (10-20% savings)',
                      'Look for vendors offering free sandbox or trial periods',
                      'Consider bundled solutions from single vendors for integration savings',
                      'Use open-source tools for initial compliance monitoring where possible',
                      'Train internal staff on configuration to reduce consulting costs',
                      'Review usage metrics quarterly to resize subscriptions',
                      'Ask vendors about startup/nonprofit pricing programs'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-green-900' : 'text-green-600'}`} />
                        <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vendor Selection Checklist */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-indigo-100 border-indigo-900' : 'bg-indigo-50 border-indigo-200'}`}>
                  <h5 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-indigo-900' : 'text-indigo-800'}`}>
                    <Clipboard className="w-4 h-4 sm:w-5 sm:h-5" />
                    Vendor Evaluation Checklist
                  </h5>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'SOC 2 Type II certification (required for compliance)',
                      'GDPR / CCPA compliance for data privacy',
                      'API documentation quality and support responsiveness',
                      'Historical uptime (99.9%+ SLA required)',
                      'Customer references in your industry',
                      'Data export capabilities and data portability',
                      'Custom reporting and dashboard flexibility',
                      'Training resources and customer support availability'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'border-indigo-900' : 'border-indigo-400'}`}>
                          <span className={`text-[9px] ${highContrast ? 'text-indigo-900' : 'text-indigo-600'}`}>□</span>
                        </div>
                        <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 7: Regulatory Resources - FROM reportData.providers */}
            {activeTab === 'resources' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'}`}>
                      <Landmark className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Regulatory Resources</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Key contacts and service providers</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {/* State Regulator */}
                  <div className={`border rounded-lg sm:rounded-xl overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                    <div className={`px-4 sm:px-6 py-2.5 sm:py-3 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                      <h3 className="text-white font-semibold text-sm sm:text-base">State Regulator</h3>
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className={`font-semibold text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.providers?.regulator?.name || 'State Banking Department'}</p>
                      <p className={`text-xs sm:text-sm mt-1 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Phone: {formatPhoneNumber(reportData.providers?.regulator?.phone) || 'Check state website'}</p>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Email: {reportData.providers?.regulator?.email || 'Check state website'}</p>
                      <p className={`text-[10px] sm:text-xs mt-2 ${highContrast ? 'text-black' : 'text-gold-600'}`}>{reportData.providers?.regulator?.specialty || 'Digital asset regulation'}</p>
                    </div>
                  </div>

                  {/* Legal Counsel and Consultants */}
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                      <h4 className={`font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        <Briefcase className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                        Qualified Legal Counsel
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        {(reportData.providers?.legalCounsel || []).slice(0, 3).map((counsel: any, i: number) => (
                          <div key={i} className={`pb-2 last:pb-0 ${i < 2 ? (highContrast ? 'border-b border-gray-300' : 'border-b border-navy-200') : ''}`}>
                            <p className={`font-medium text-sm ${highContrast ? 'text-black' : 'text-navy-800'}`}>{counsel.name}</p>
                            <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-black' : 'text-gold-600'}`}>{counsel.specialty}</p>
                            <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{formatPhoneNumber(counsel.phone)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                      <h4 className={`font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        <Users className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                        Compliance Consultants
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        {(reportData.providers?.consultants || []).slice(0, 3).map((consultant: any, i: number) => (
                          <div key={i} className={`pb-2 last:pb-0 ${i < 2 ? (highContrast ? 'border-b border-gray-300' : 'border-b border-navy-200') : ''}`}>
                            <p className={`font-medium text-sm ${highContrast ? 'text-black' : 'text-navy-800'}`}>{consultant.name}</p>
                            <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-black' : 'text-gold-600'}`}>{consultant.specialty}</p>
                            <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{formatPhoneNumber(consultant.phone)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Technology Providers and Associations */}
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                      <h4 className={`font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        <Cpu className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                        Technology Providers
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {(reportData.providers?.techProviders || []).slice(0, 4).map((provider: any, i: number) => (
                          <p key={i} className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>• {provider.name} - {provider.specialty}</p>
                        ))}
                      </div>
                    </div>

                    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                      <h4 className={`font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                        <Award className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                        Industry Associations
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {(reportData.providers?.associations || []).slice(0, 4).map((assoc: any, i: number) => (
                          <p key={i} className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>• {assoc.name} - {assoc.specialty}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 8: Risk Assessment - FROM reportData.risks and reportData.overallRisk */}
            {activeTab === 'risk' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
                      <AlertTriangle className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Risk Assessment</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Comprehensive risk analysis and mitigation</p>
                    </div>
                  </div>
                </div>

                <div className={`border rounded-lg sm:rounded-xl overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                  <div className={`px-4 sm:px-6 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Risk Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] sm:min-w-full">
                      <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                        <tr>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Risk Category</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Likelihood</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Impact</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Mitigation</th>
                        </tr>
                      </thead>
                      <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                        {(reportData.risks || []).map((risk: any, i: number) => (
                          <tr key={i}>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>{risk.category}</td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                              <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                highContrast ?
                                  (risk.likelihood === 'High' ? 'bg-red-200 text-red-900 border border-red-900' :
                                   risk.likelihood === 'Medium' ? 'bg-yellow-200 text-yellow-900 border border-yellow-900' : 
                                   'bg-green-200 text-green-900 border border-green-900') :
                                  (risk.likelihood === 'High' ? 'bg-red-100 text-red-800' :
                                   risk.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-green-100 text-green-800')
                              }`}>{risk.likelihood}</span>
                            </td>
                            <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                              <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                highContrast ?
                                  (risk.impact === 'Critical' ? 'bg-red-200 text-red-900 border border-red-900' :
                                   risk.impact === 'High' ? 'bg-orange-200 text-orange-900 border border-orange-900' : 
                                   'bg-yellow-200 text-yellow-900 border border-yellow-900') :
                                  (risk.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                                   risk.impact === 'High' ? 'bg-orange-100 text-orange-800' : 
                                   'bg-yellow-100 text-yellow-800')
                              }`}>{risk.impact}</span>
                            </td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{risk.mitigation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${
                  highContrast ? 
                    (reportData.overallRisk === 'Elevated' ? 'bg-red-100 border-red-900' : 
                     reportData.overallRisk === 'Low' ? 'bg-green-100 border-green-900' : 
                     'bg-amber-100 border-amber-900') :
                    (reportData.overallRisk === 'Elevated' ? 'bg-red-50 border-red-200' : 
                     reportData.overallRisk === 'Low' ? 'bg-green-50 border-green-200' : 
                     'bg-amber-50 border-amber-200')
                }`}>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h4 className={`font-semibold text-base sm:text-lg ${
                      highContrast ? 
                        (reportData.overallRisk === 'Elevated' ? 'text-red-900' : 
                         reportData.overallRisk === 'Low' ? 'text-green-900' : 
                         'text-amber-900') :
                        (reportData.overallRisk === 'Elevated' ? 'text-red-800' : 
                         reportData.overallRisk === 'Low' ? 'text-green-800' : 
                         'text-amber-800')
                    }`}>
                      Overall Risk Rating: {reportData.overallRisk || 'Moderate'}
                    </h4>
                    <Shield className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      highContrast ? 
                        (reportData.overallRisk === 'Elevated' ? 'text-red-900' : 
                         reportData.overallRisk === 'Low' ? 'text-green-900' : 
                         'text-amber-900') :
                        (reportData.overallRisk === 'Elevated' ? 'text-red-600' : 
                         reportData.overallRisk === 'Low' ? 'text-green-600' : 
                         'text-amber-600')
                    }`} />
                  </div>
                  <p className={`text-xs sm:text-sm ${
                    highContrast ? 
                      (reportData.overallRisk === 'Elevated' ? 'text-red-900' : 
                       reportData.overallRisk === 'Low' ? 'text-green-900' : 
                       'text-amber-900') :
                      (reportData.overallRisk === 'Elevated' ? 'text-red-700' : 
                       reportData.overallRisk === 'Low' ? 'text-green-700' : 
                       'text-amber-700')
                  }`}>
                    {reportData.overallRisk === 'Elevated' ? 'Enhanced compliance measures recommended. Prioritize licensing and monitoring systems.' : 
                     reportData.overallRisk === 'Low' ? 'Favorable risk profile. Maintain standard compliance protocols.' : 
                     'Moderate risk profile. Focus on timely licensing and regular audits.'}
                  </p>
                </div>

                {/* Insurance Recommendations */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-blue-100 border-blue-900' : 'bg-blue-50 border-blue-200'}`}>
                  <h4 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-blue-900' : 'text-blue-800'}`}>
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    Insurance Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'Directors & Officers (D&O) Liability: $2-5M coverage',
                      'Errors & Omissions (E&O): $1-3M coverage',
                      'Cyber Liability: $1-5M coverage',
                      'Crime/Fidelity Bond: $500k-1M coverage'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-blue-900' : 'text-blue-600'}`} />
                        <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 9: Budget Guide - FROM reportData.budgetGuide */}
            {activeTab === 'budget' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                      <DollarSign className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Budget & Investment Guide</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Estimated costs and allocation</p>
                    </div>
                  </div>
                </div>

                <div className={`border rounded-lg sm:rounded-xl overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                  <div className={`px-4 sm:px-6 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Estimated Investment Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] sm:min-w-full">
                      <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                        <tr>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Category</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Estimated Cost</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Notes</th>
                        </tr>
                      </thead>
                      <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                        {(reportData.budgetGuide?.breakdown || []).map((item: any, i: number) => (
                          <tr key={i}>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-900'}`}>{item.category}</td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-gold-600'}`}>{item.amount}</td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{item.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-navy-900 to-navy-800'}`}>
                  <p className="text-gold-400 text-xs sm:text-sm mb-1 sm:mb-2">Total Estimated Investment</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                    {formatCurrency(reportData.budgetGuide?.totalEstimated?.min || 50000)} - {formatCurrency(reportData.budgetGuide?.totalEstimated?.max || 150000)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-navy-300">*Actual costs may vary based on specific requirements, state fees, and chosen vendors</p>
                </div>

                {/* Cost-Saving Recommendations */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                  <h4 className={`font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    Cost-Saving Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'Bundle technology platforms where possible',
                      'Consider contract-to-hire for compliance roles',
                      'Leverage free regulatory monitoring tools initially',
                      'Join industry associations for discounted services',
                      'Negotiate multi-year vendor contracts',
                      'Share compliance resources across entities'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-amber-900' : 'text-amber-600'}`} />
                        <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 10: Next Steps - FROM reportData.nextSteps */}
            {activeTab === 'next-steps' && (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-teal-500 to-teal-600'}`}>
                      <CalendarCheck className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Next Steps & Ongoing Compliance</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Your action plan and compliance calendar</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
                  <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                    <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Immediate (Next 7 Days)
                    </h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {(reportData.nextSteps?.immediate || []).map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-amber-200' : 'bg-amber-200'}`}>
                            <span className={`text-[10px] sm:text-xs font-bold ${highContrast ? 'text-amber-900' : 'text-amber-700'}`}>{idx + 1}</span>
                          </div>
                          <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-blue-100 border-blue-900' : 'bg-blue-50 border-blue-200'}`}>
                    <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${highContrast ? 'text-blue-900' : 'text-blue-800'}`}>
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      Short-Term (30-90 Days)
                    </h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {(reportData.nextSteps?.shortTerm || []).map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-blue-200' : 'bg-blue-200'}`}>
                            <span className={`text-[10px] sm:text-xs font-bold ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>{idx + 1}</span>
                          </div>
                          <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-green-100 border-green-900' : 'bg-green-50 border-green-200'}`}>
                  <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${highContrast ? 'text-green-900' : 'text-green-800'}`}>
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Ongoing Obligations
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                    {(reportData.nextSteps?.ongoing || []).map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-green-900' : 'text-green-600'}`} />
                        <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-purple-100 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                  <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    Compliance Calendar
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {(reportData.nextSteps?.complianceCalendar || []).map((item: any, idx: number) => (
                      <div key={idx}>
                        <h4 className={`font-semibold mb-1.5 sm:mb-2 text-sm ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>{item.timeframe}</h4>
                        <ul className="space-y-1.5 sm:space-y-2 ml-4">
                          {(item.tasks || []).map((task: string, taskIdx: number) => (
                            <li key={taskIdx} className="flex items-start gap-2">
                              <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-purple-200' : 'bg-purple-200'}`}>
                                <span className={`text-[10px] sm:text-xs ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>✓</span>
                              </div>
                              <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quarterly Review Checklist */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-yellow-100 border-yellow-900' : 'bg-gold-50 border-gold-200'}`}>
                  <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                    <Target className={`w-4 h-4 sm:w-5 sm:h-5 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                    Quarterly Review Checklist
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'Review regulatory changes in all operating states',
                      'Audit transaction monitoring alerts and outcomes',
                      'Update risk assessment with new findings',
                      'Verify all licenses are current and renewals scheduled',
                      'Conduct staff training on new requirements',
                      'Review and update policies and procedures'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                        <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className={`border-t px-3 sm:px-8 py-3 sm:py-4 ${highContrast ? 'border-black bg-gray-100' : 'border-slate-200 bg-navy-50/50'} print:bg-white print:border-black`}>
            <p className={`text-[10px] sm:text-xs text-center ${highContrast ? 'text-black' : 'text-navy-500'}`}>
              DISCLAIMER: This {isMultiState ? 'multi-state' : '10-page'} report provides regulatory intelligence and educational guidance based on AI analysis and human review. 
              Veridian Group is not a law firm. All compliance recommendations should be reviewed with qualified legal counsel in {isMultiState ? 'all applicable jurisdictions' : report?.state || 'your state'} 
              before implementation. Regulations are subject to change without notice.
            </p>
            <p className={`text-[10px] sm:text-xs text-center mt-2 ${highContrast ? 'text-gray-700' : 'text-navy-400'}`}>
              Report ID: {reportId} • Generated: {formatDateSafe(createdAt, 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Mobile Quarterly Upsell Banner */}
      {showMobileUpsell && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 print:hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Never miss a regulatory change</p>
                <p className="text-xs text-amber-100">Quarterly Intelligence from $5,997/year</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowMobileUpsell(false)}
                  className="p-1.5 text-amber-200 hover:text-white rounded-full hover:bg-amber-700/30 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
                <a
                  href={`/pricing?plan=quarterly${report?.id ? `&report_id=${report.id}` : ''}`}
                  className="px-4 py-2 bg-white text-amber-700 rounded-lg font-medium text-sm hover:bg-amber-50 transition-colors"
                >
                  Upgrade
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}