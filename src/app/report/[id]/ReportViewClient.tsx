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
  Minimize2, Bell, Clipboard, GitBranch
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
const CONCERNS_PREVIEW_LENGTH = 350
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
      { id: 'regulatory', label: 'Regulatory Analysis', icon: Scale, shortLabel: 'Regulatory', color: 'blue' },
      { id: 'licensing', label: 'Licensing Matrix', icon: Gavel, shortLabel: 'Licensing', color: 'amber' },
      { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle, shortLabel: 'Risk', color: 'red' },
      { id: 'budget', label: 'Budget Guide', icon: DollarSign, shortLabel: 'Budget', color: 'emerald' },
      { id: 'compliance', label: 'Compliance Roadmap', icon: Clock, shortLabel: 'Roadmap', color: 'green' },
      { id: 'technology', label: 'Tech & Tools', icon: Cpu, shortLabel: 'Tech', color: 'cyan' },
      { id: 'market-talent', label: 'Market & Talent', icon: TrendingUp, shortLabel: 'Market', color: 'purple' },
      { id: 'resources', label: 'Resources', icon: Landmark, shortLabel: 'Resources', color: 'indigo' },
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
              <div className="space-y-5 sm:space-y-7 lg:space-y-9">
                
                {/*SECTION 1: HEADER */}
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

                {/* SECTION 2: Executive Summary Paragraph*/}
                <div className={`rounded-xl p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className={`w-5 h-5 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                    <h3 className={`font-semibold text-base sm:text-lg ${highContrast ? 'text-black' : 'text-navy-900'}`}>Overview</h3>
                  </div>
                  <p className={`text-sm sm:text-base leading-relaxed ${highContrast ? 'text-black' : 'text-navy-700'}`}>
                    {report?.company_name || 'Your company'} operates in a {
                      locationData.regulatoryClimate === 'friendly' ? 'friendly' : 
                      locationData.regulatoryClimate === 'strict' ? 'strict' : 'moderate'
                    } regulatory environment. Based on your {formatTimeline(reportData.strategy.timeline).toLowerCase()} timeline and {
                      formatPrimaryFocus(reportData.strategy.primary).toLowerCase()
                    } focus, full compliance requires approximately {
                      formatCurrency(reportData.budgetGuide?.totalEstimated?.min || 50000)
                    } - {
                      formatCurrency(reportData.budgetGuide?.totalEstimated?.max || 150000)
                    } in initial investment. The critical path is license processing—delays here will push your entire timeline. {
                      reportData.overallRisk === 'Elevated' ? 'Elevated risk requires immediate board attention.' :
                      reportData.overallRisk === 'Low' ? 'Favorable risk profile, but diligence still required.' :
                      'Moderate risk profile with clear mitigation path.'
                    }
                  </p>
                </div>

                {/* ============================================
                    SECTION 3: COMPANY OVERVIEW + KEY METRICS
                ============================================ */}
                <div className={`rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 text-white shadow-xl ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-navy-900 to-navy-800'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
                        <span className="text-gold-400 font-medium text-xs sm:text-sm">COMPANY PROFILE</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{report?.company_name || 'Company'}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-navy-200 text-xs sm:text-sm">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 sm:w-4 sm:h-4" />{report?.city || ''}, {report?.state || ''}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3 sm:w-4 sm:h-4" />{report?.industry || 'Financial Services'}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3 sm:w-4 sm:h-4" />Size: {reportData.company?.size || 'N/A'}</span>
                      </div>
                    </div>
                    <div className={`rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm self-start ${highContrast ? 'bg-gray-700' : 'bg-white/10'}`}>
                      <p className="text-[10px] sm:text-xs text-navy-300">Report Date</p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gold-400">{formatDateSafe(createdAt, 'MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    {reportData.metrics.slice(0, METRICS_PREVIEW_COUNT).map((metric, index) => (
                      <div key={index} className={`rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm border ${highContrast ? 'bg-gray-800 border-gray-600' : 'bg-white/5 border-white/10'}`}>
                        <p className="text-[10px] sm:text-xs text-navy-300 mb-0.5 sm:mb-1">{metric.label}</p>
                        <p className={`text-sm sm:text-base lg:text-lg font-semibold ${metric.color}`}>{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================
                    SECTION 4: BUSINESS CASE / ROI SUMMARY
                ============================================ */}
                <div className={`rounded-xl p-5 border ${highContrast ? 'bg-green-100 border-green-900' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className={`w-5 h-5 ${highContrast ? 'text-green-900' : 'text-green-700'}`} />
                    <h4 className={`font-semibold text-sm sm:text-base ${highContrast ? 'text-green-900' : 'text-green-800'}`}>
                      Business Case Summary
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-green-600 mb-1">Estimated Annual Benefit</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-800">
                        {formatCurrency(250000)} - {formatCurrency(500000)}
                      </p>
                      <p className="text-[9px] text-green-600 mt-1">Licensing enables revenue + penalty avoidance</p>
                    </div>
                    <div className="text-center border-l border-r border-green-200">
                      <p className="text-xs text-green-600 mb-1">Projected Breakeven</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-800">
                        {reportData.strategy?.timeline === '3-months' ? '4-6 months' : 
                         reportData.strategy?.timeline === '12-months' ? '9-12 months' : '6-9 months'}
                      </p>
                      <p className="text-[9px] text-green-600 mt-1">After license approval</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-green-600 mb-1">3-Year ROI</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-800">
                        3.5x - 5x
                      </p>
                      <p className="text-[9px] text-green-600 mt-1">Based on conservative projections</p>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    SECTION 5: CLIENT'S CUSTOM COMPLIANCE REQUEST
                ============================================ */}
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

                {/* ============================================
                    SECTION 6: CRITICAL PATH WARNING
                ============================================ */}
                <div className={`rounded-xl p-5 border ${highContrast ? 'bg-red-100 border-red-900' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${highContrast ? 'bg-red-200' : 'bg-red-100'}`}>
                      <AlertTriangle className={`w-5 h-5 ${highContrast ? 'text-red-900' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h4 className={`font-bold text-sm sm:text-base ${highContrast ? 'text-red-900' : 'text-red-800'}`}>
                          Critical Path Warning
                        </h4>
                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${highContrast ? 'bg-red-200 text-red-900' : 'bg-red-200 text-red-700'}`}>
                          ⚠️ Requires Board Attention
                        </span>
                      </div>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-red-800' : 'text-red-700'} leading-relaxed`}>
                        {reportData.strategy?.timeline === '3-months' 
                          ? 'Your selected 3-month timeline is accelerated. License processing delays pose the greatest risk to your launch date. We recommend engaging expedited processing services and dedicating full-time resources to the licensing phase.'
                          : reportData.strategy?.timeline === '12-months'
                          ? 'Your 12-month timeline allows for strategic planning, but early license submission is still critical. Regulatory changes during this period could impact requirements.'
                          : 'License processing delays are the primary risk to your 6-month timeline. Starting the application process within the first 30 days is critical to maintaining your target launch date.'}
                      </p>
                      <div className={`mt-3 pt-2 text-[10px] ${highContrast ? 'text-red-800' : 'text-red-700'} border-t ${highContrast ? 'border-red-900' : 'border-red-200'}`}>
                        <span className="font-semibold">Action Required:</span> Legal counsel engagement within 7 days
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    SECTION 7: KEY DECISIONS REQUIRED
                ============================================ */}
                <div className={`rounded-xl p-5 border ${highContrast ? 'bg-purple-100 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className={`w-5 h-5 ${highContrast ? 'text-purple-900' : 'text-purple-700'}`} />
                    <h4 className={`font-semibold text-sm sm:text-base ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>
                      Key Decisions Required
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      { decision: 'Legal counsel selection', deadline: 'Week 1', owner: 'CEO / Board', impact: 'Critical - impacts all downstream work' },
                      { decision: 'Compliance technology budget approval', deadline: 'Month 1', owner: 'CFO / Board', impact: 'High - affects implementation timeline' },
                      { decision: 'Compliance Officer hiring authority', deadline: 'Month 2', owner: 'Board', impact: 'Medium - operational oversight' },
                      { decision: 'Multi-state expansion roadmap', deadline: 'Month 3', owner: 'CEO', impact: 'Strategic - future growth' }
                    ].map((item, idx) => (
                      <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg ${highContrast ? 'bg-purple-200/30' : 'bg-purple-100/50'}`}>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>{item.decision}</p>
                          <p className="text-[10px] text-purple-600 mt-0.5">Owner: {item.owner}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${highContrast ? 'bg-purple-200 text-purple-900' : 'bg-purple-200 text-purple-700'}`}>
                            Due: {item.deadline}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            item.impact === 'Critical' ? 'bg-red-100 text-red-700' :
                            item.impact === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.impact} Impact
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================
                    SECTION 8: AI-GENERATED ANALYSIS (Optional - only if content exists)
                ============================================ */}
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

                {/* ============================================
                    SECTION 9: VERIFIED FACTS
                ============================================ */}
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

                {/* ============================================
                    SECTION 10: QUARTERLY UPSELL (if applicable)
                ============================================ */}
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

                {/* ============================================
                    SECTION 11: EXECUTIVE CONSULTATION CTA
                ============================================ */}
                <div className={`rounded-xl p-5 border ${highContrast ? 'bg-gold-100 border-gold-900' : 'bg-gold-50 border-gold-200'}`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${highContrast ? 'bg-gold-200' : 'bg-gold-100'}`}>
                        <CalendarCheck className={`w-5 h-5 ${highContrast ? 'text-gold-900' : 'text-gold-700'}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold text-base sm:text-lg ${highContrast ? 'text-gold-900' : 'text-gold-800'}`}>
                          Ready to Move Forward?
                        </h4>
                        <p className={`text-sm ${highContrast ? 'text-gold-800' : 'text-gold-700'} mt-1 max-w-md`}>
                          Your next action: Schedule your free consultation to review this report,
                          get introductions to vetted partners, and finalize your implementation plan.
                        </p>
                      </div>
                    </div>
                    <a 
                      href={`/consultation?report_id=${report?.id}&utm_source=report&utm_medium=executive_summary`}
                      className={`inline-flex items-center gap-1.5 text-sm px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${highContrast ? 'bg-gold-800 text-white hover:bg-gold-900' : 'bg-gold-600 text-white hover:bg-gold-700'}`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      Schedule Executive Consultation
                    </a>
                  </div>
                </div>

              </div>
            )}

            {/* PAGE 2: Market & Talent Analysis - COMPLETE */}
            {activeTab === 'market-talent' && (
              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className={`absolute -left-3 sm:-left-4 top-0 w-1 h-12 sm:h-16 rounded-full ${highContrast ? 'bg-black' : 'bg-gradient-to-b from-gold-600 to-gold-400'}`} />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 rounded-xl shadow-lg flex items-center justify-center ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
                      <TrendingUp className="w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Market & Talent Analysis</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Local market conditions, talent availability, salary benchmarks, and competitor landscape</p>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    MARKET ANALYSIS - WITH IMPROVED READABILITY
                    ============================================ */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-4 sm:py-5 border-b ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-r from-purple-50 to-transparent border-navy-100'}`}>
                    <h3 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                      <MapPin className={`w-5 h-5 ${highContrast ? 'text-black' : 'text-purple-600'}`} />
                      Market Overview: {reportData.marketAnalysis?.tier || 'Major Market'}
                    </h3>
                  </div>
                  <div className="p-5 sm:p-8">
                    <p className={`text-sm sm:text-base mb-5 sm:mb-6 ${highContrast ? 'text-black' : 'text-navy-700'} leading-relaxed`}>
                      {reportData.marketAnalysis?.description || 'Market analysis in progress based on location data.'}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Growth Rate</p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.marketAnalysis?.growthRate || 12}%</p>
                        <p className="text-[10px] sm:text-xs text-green-600 mt-1">↑ Year over year</p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Competitor Density</p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.marketAnalysis?.competitorDensity || 'Medium'}</p>
                        <p className="text-[10px] sm:text-xs text-navy-500 mt-1">
                          {reportData.marketAnalysis?.competitorDensity === 'High' ? 'Saturated market' :
                           reportData.marketAnalysis?.competitorDensity === 'Medium' ? 'Moderate competition' : 'Untapped opportunity'}
                        </p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Opportunity Score</p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.marketAnalysis?.opportunityScore || 75}/100</p>
                        <p className="text-[10px] sm:text-xs text-navy-500 mt-1">
                          {reportData.marketAnalysis?.opportunityScore && reportData.marketAnalysis.opportunityScore >= 80 ? 'Strong entry opportunity' :
                           reportData.marketAnalysis?.opportunityScore && reportData.marketAnalysis.opportunityScore >= 60 ? 'Moderate opportunity' : 'Competitive market'}
                        </p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Key Industries</p>
                        <p className={`text-sm sm:text-base font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{(reportData.marketAnalysis?.keyIndustries || ['FinTech', 'Banking']).slice(0, 2).join(', ')}</p>
                      </div>
                    </div>

                    {/* DYNAMIC: Market Trends & Insights - Larger text */}
                    {reportData.talentAnalysis?.marketTrends && reportData.talentAnalysis.marketTrends.length > 0 && (
                      <div className={`mt-6 p-4 rounded-lg ${highContrast ? 'bg-purple-100' : 'bg-purple-50'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className={`w-4 h-4 ${highContrast ? 'text-purple-900' : 'text-purple-700'}`} />
                          <span className={`text-xs font-semibold uppercase tracking-wide ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>Market Intelligence</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                          {reportData.talentAnalysis.marketTrends.map((trend: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              {trend.type === 'positive' && <span className="text-green-600 text-sm">↑</span>}
                              {trend.type === 'neutral' && <span className="text-yellow-600 text-sm">→</span>}
                              {trend.type === 'warning' && <span className="text-red-600 text-sm">↓</span>}
                              <span className={highContrast ? 'text-black' : 'text-navy-700'}>{trend.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC: Competitor Analysis - Larger text */}
                    {reportData.talentAnalysis?.marketCompetitors && reportData.talentAnalysis.marketCompetitors.length > 0 && (
                      <div className={`mt-6 p-4 rounded-lg ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-navy-600'}`} />
                          <span className={`text-xs font-semibold uppercase tracking-wide ${highContrast ? 'text-black' : 'text-navy-600'}`}>Key Competitors in Region</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {reportData.talentAnalysis.marketCompetitors.map((comp: any, idx: number) => (
                            <div key={idx} className={`text-xs sm:text-sm px-3 py-1.5 rounded-full ${highContrast ? 'bg-white border border-black' : 'bg-white border border-navy-200'}`}>
                              <span className="font-medium">{comp.name}</span>
                              <span className="text-navy-500 ml-1">• {comp.focus}</span>
                            </div>
                          ))}
                          <div className="text-xs text-navy-400 italic self-center">
                            +2-3 emerging fintechs entering market annually
                          </div>
                        </div>
                        <p className="text-xs text-navy-500 mt-2">
                          💡 Insight: Competitors are actively hiring compliance talent, driving salary competition in the region.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ============================================
                    TALENT ANALYSIS - WITH IMPROVED READABILITY
                    ============================================ */}
                <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                  <div className={`px-4 sm:px-8 py-4 sm:py-5 border-b ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-r from-purple-50 to-transparent border-navy-100'}`}>
                    <h3 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                      <Users className={`w-5 h-5 ${highContrast ? 'text-black' : 'text-purple-600'}`} />
                      Compliance Talent Analysis
                    </h3>
                  </div>
                  <div className="p-5 sm:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Talent Score</p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{reportData.talentAnalysis?.talentScore || 65}/100</p>
                        <p className="text-[10px] sm:text-xs text-navy-500 mt-1">
                          {reportData.talentAnalysis?.talentScore && reportData.talentAnalysis.talentScore >= 75 ? 'Strong talent pool' :
                           reportData.talentAnalysis?.talentScore && reportData.talentAnalysis.talentScore >= 50 ? 'Moderate availability' : 'Talent shortage'}
                        </p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Talent Rank</p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                          {reportData.talentAnalysis?.talentRank === 'high' ? 'High' : reportData.talentAnalysis?.talentRank === 'medium' ? 'Medium' : 'Developing'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-navy-500 mt-1">
                          {reportData.talentAnalysis?.talentRank === 'high' ? 'Competitive hiring market' :
                           reportData.talentAnalysis?.talentRank === 'medium' ? 'Balanced supply/demand' : 'Employer-friendly market'}
                        </p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Professionals</p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{(reportData.talentAnalysis?.totalProfessionals || 1250).toLocaleString()}</p>
                        <p className="text-[10px] sm:text-xs text-navy-500 mt-1">Compliance professionals in region</p>
                      </div>
                      <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 text-center ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                        <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>Avg. Salary</p>
                        <p className={`text-base sm:text-xl lg:text-2xl font-bold ${highContrast ? 'text-black' : 'text-gold-600'}`}>{formatCurrency(reportData.talentAnalysis?.avgSalary || 95000)}</p>
                        <p className="text-[10px] sm:text-xs text-navy-500 mt-1">Compliance Officer base</p>
                      </div>
                    </div>

                    {/* DYNAMIC: Talent Shortage Index - Improved readability */}
                    {reportData.talentAnalysis?.talentShortage && (
                      <div className={`mb-6 p-4 rounded-lg ${reportData.talentAnalysis.talentShortage.level === 'Critical' ? (highContrast ? 'bg-red-100' : 'bg-red-50') :
                                        reportData.talentAnalysis.talentShortage.level === 'High' ? (highContrast ? 'bg-orange-100' : 'bg-orange-50') :
                                        reportData.talentAnalysis.talentShortage.level === 'Moderate' ? (highContrast ? 'bg-yellow-100' : 'bg-yellow-50') :
                                        (highContrast ? 'bg-green-100' : 'bg-green-50')}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-5 h-5 ${reportData.talentAnalysis.talentShortage.level === 'Critical' ? (highContrast ? 'text-red-900' : 'text-red-600') :
                                              reportData.talentAnalysis.talentShortage.level === 'High' ? (highContrast ? 'text-orange-900' : 'text-orange-600') :
                                              reportData.talentAnalysis.talentShortage.level === 'Moderate' ? (highContrast ? 'text-yellow-900' : 'text-yellow-600') :
                                              (highContrast ? 'text-green-900' : 'text-green-600')}`} />
                            <span className={`text-sm sm:text-base font-bold ${
                              reportData.talentAnalysis.talentShortage.level === 'Critical' ? (highContrast ? 'text-red-900' : 'text-red-800') :
                              reportData.talentAnalysis.talentShortage.level === 'High' ? (highContrast ? 'text-orange-900' : 'text-orange-800') :
                              reportData.talentAnalysis.talentShortage.level === 'Moderate' ? (highContrast ? 'text-yellow-900' : 'text-yellow-800') :
                              (highContrast ? 'text-green-900' : 'text-green-800')}`}>
                              Talent Shortage Index: {reportData.talentAnalysis.talentShortage.level}
                            </span>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full self-start sm:self-center ${
                            reportData.talentAnalysis.talentShortage.level === 'Critical' ? (highContrast ? 'bg-red-200 text-red-900' : 'bg-red-100 text-red-700') :
                            reportData.talentAnalysis.talentShortage.level === 'High' ? (highContrast ? 'bg-orange-200 text-orange-900' : 'bg-orange-100 text-orange-700') :
                            reportData.talentAnalysis.talentShortage.level === 'Moderate' ? (highContrast ? 'bg-yellow-200 text-yellow-900' : 'bg-yellow-100 text-yellow-700') :
                            (highContrast ? 'bg-green-200 text-green-900' : 'bg-green-100 text-green-700')}`}>
                            Demand exceeds supply by {reportData.talentAnalysis.talentShortage.demandSupplyRatio}:1
                          </span>
                        </div>
                        <p className={`text-xs sm:text-sm mt-2 ${
                          reportData.talentAnalysis.talentShortage.level === 'Critical' ? (highContrast ? 'text-red-800' : 'text-red-700') :
                          reportData.talentAnalysis.talentShortage.level === 'High' ? (highContrast ? 'text-orange-800' : 'text-orange-700') :
                          reportData.talentAnalysis.talentShortage.level === 'Moderate' ? (highContrast ? 'text-yellow-800' : 'text-yellow-700') :
                          (highContrast ? 'text-green-800' : 'text-green-700')}`}>
                          {reportData.talentAnalysis.talentShortage.description}
                        </p>
                      </div>
                    )}

                    {/* DYNAMIC: Remote vs Local Recommendation - Improved readability */}
                    {reportData.talentAnalysis?.remoteLocalRecommendation && (
                      <div className={`mb-6 p-4 rounded-lg ${highContrast ? 'bg-blue-100' : 'bg-blue-50'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Wifi className={`w-4 h-4 ${highContrast ? 'text-blue-900' : 'text-blue-700'}`} />
                          <span className={`text-xs font-semibold uppercase tracking-wide ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>Workforce Strategy Recommendation</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl sm:text-3xl font-bold text-blue-800">{reportData.talentAnalysis.remoteLocalRecommendation.localPercentage}%</p>
                              <p className="text-xs text-blue-700">Local Hire</p>
                            </div>
                            <div className="text-blue-600 text-xl">+</div>
                            <div className="text-center">
                              <p className="text-2xl sm:text-3xl font-bold text-blue-800">{reportData.talentAnalysis.remoteLocalRecommendation.remotePercentage}%</p>
                              <p className="text-xs text-blue-700">Remote</p>
                            </div>
                          </div>
                          <p className={`text-xs sm:text-sm ${highContrast ? 'text-blue-900' : 'text-blue-800'} max-w-md`}>
                            {reportData.talentAnalysis.remoteLocalRecommendation.recommendation}
                          </p>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${reportData.talentAnalysis.remoteLocalRecommendation.localPercentage}%` }} />
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC: Salary Bands by Role - Improved table readability */}
                    {reportData.talentAnalysis?.salaryBands && reportData.talentAnalysis.salaryBands.length > 0 && (
                      <div className={`mb-6 rounded-lg overflow-hidden border ${highContrast ? 'border-black' : 'border-navy-200'}`}>
                        <div className={`px-4 py-3 ${highContrast ? 'bg-gray-200' : 'bg-navy-100'}`}>
                          <h4 className={`text-sm font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                            <DollarSign className="w-4 h-4 text-gold-600" />
                            Salary Bands by Role (Annual)
                          </h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={highContrast ? 'bg-gray-100' : 'bg-navy-50'}>
                              <tr>
                                <th className={`text-left py-3 px-4 text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-700'}`}>Role</th>
                                <th className={`text-left py-3 px-4 text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-700'}`}>Experience</th>
                                <th className={`text-left py-3 px-4 text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-700'}`}>Salary Range</th>
                                <th className={`text-left py-3 px-4 text-xs font-semibold ${highContrast ? 'text-black' : 'text-navy-700'}`}>Remote Eligibility</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-100">
                              {reportData.talentAnalysis.salaryBands.map((salary: any, idx: number) => (
                                <tr key={idx} className="hover:bg-navy-50/30">
                                  <td className={`py-3 px-4 text-sm font-semibold ${highContrast ? 'text-black' : 'text-navy-800'}`}>
                                    {salary.role}
                                  </td>
                                  <td className={`py-3 px-4 text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                                    {salary.typicalExperience}
                                  </td>
                                  <td className={`py-3 px-4 text-sm font-semibold ${highContrast ? 'text-black' : 'text-gold-600'}`}>
                                    {formatCurrency(salary.minSalary)} - {formatCurrency(salary.maxSalary)}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                      salary.remoteEligibility === 'Remote Possible' ? 'bg-green-100 text-green-700' :
                                      salary.remoteEligibility === 'Local Required' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {salary.remoteEligibility === 'Hybrid Preferred' ? '🏠 Hybrid' : 
                                      salary.remoteEligibility === 'Remote Possible' ? '💻 Remote' : '📍 Local'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                      <div>
                        <h4 className={`font-semibold mb-3 text-base sm:text-lg ${highContrast ? 'text-black' : 'text-navy-900'}`}>Hiring Strategy</h4>
                        <p className={`text-sm sm:text-base mb-4 ${highContrast ? 'text-black' : 'text-navy-700'} leading-relaxed`}>
                          {reportData.talentAnalysis?.hiringStrategy || 'Hybrid approach recommended with emphasis on remote senior talent'}
                        </p>
                        
                        <h4 className={`font-semibold mb-3 text-base sm:text-lg ${highContrast ? 'text-black' : 'text-navy-900'}`}>Top Recruitment Channels</h4>
                        <ul className="space-y-2">
                          {(reportData.talentAnalysis?.topChannels || ['LinkedIn Recruiter', 'Industry Job Boards', 'Recruitment Firms', 'Compliance Association Postings']).slice(0, 4).map((channel: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-black' : 'text-green-600'}`} />
                              <span className={`text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-700'}`}>{channel}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className={`rounded-lg sm:rounded-xl p-5 sm:p-6 border ${highContrast ? 'bg-purple-100 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                          <h4 className={`font-semibold mb-3 text-base sm:text-lg ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>Time to Hire</h4>
                          <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${highContrast ? 'text-purple-900' : 'text-purple-900'}`}>{reportData.talentAnalysis?.timeToHire || '6-8 weeks'}</p>
                          <p className={`text-sm sm:text-base ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>Estimated from engagement to offer acceptance</p>
                          
                          <div className={`mt-5 pt-4 border-t ${highContrast ? 'border-purple-900' : 'border-purple-200'}`}>
                            <p className={`text-sm sm:text-base ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>
                              <span className="font-bold">Growth Rate:</span> {reportData.talentAnalysis?.growthRate || '8'}% YoY increase in compliance professionals
                            </p>
                          </div>
                        </div>

                        {/* DYNAMIC: Recommended Hiring Timeline - Improved readability */}
                        {reportData.talentAnalysis?.hiringTimeline && reportData.talentAnalysis.hiringTimeline.length > 0 && (
                          <div className={`mt-4 p-4 rounded-lg ${highContrast ? 'bg-green-100' : 'bg-green-50'}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className={`w-4 h-4 ${highContrast ? 'text-green-900' : 'text-green-700'}`} />
                              <span className={`text-xs font-semibold uppercase tracking-wide ${highContrast ? 'text-green-900' : 'text-green-700'}`}>Recommended Hiring Timeline</span>
                            </div>
                            <div className="space-y-3 text-sm">
                              {reportData.talentAnalysis.hiringTimeline.map((step: any, idx: number) => {
                                const totalWeeks = step.weekEnd
                                const weeksElapsed = step.weekStart
                                const percentComplete = (weeksElapsed / totalWeeks) * 100
                                return (
                                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="font-medium min-w-[130px]">{step.role}</span>
                                    <div className="flex-1">
                                      <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-600 rounded-full" style={{ width: `${Math.min(100, percentComplete)}%` }} />
                                      </div>
                                    </div>
                                    <span className="text-green-700 min-w-[90px] text-right">Weeks {step.weekStart}-{step.weekEnd}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    CONSULTATION CTA - Market & Talent Strategy
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-5 sm:p-6 ${highContrast ? 'bg-indigo-100 border-indigo-900' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${highContrast ? 'bg-indigo-200' : 'bg-indigo-100'}`}>
                        <Users className={`w-5 h-5 ${highContrast ? 'text-indigo-900' : 'text-indigo-700'}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold text-base sm:text-lg ${highContrast ? 'text-indigo-900' : 'text-indigo-800'}`}>
                          Need Help with Talent Strategy?
                        </h4>
                        <p className={`text-sm ${highContrast ? 'text-indigo-800' : 'text-indigo-700'} mt-1 max-w-md`}>
                          Use your free consultation to discuss hiring timelines, compensation packages,
                          and get introductions to specialized compliance recruiters in your region.
                        </p>
                      </div>
                    </div>
                    <a 
                      href={`/consultation?report_id=${report?.id}&utm_source=report&utm_medium=market_talent`}
                      className={`inline-flex items-center gap-1.5 text-sm px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${highContrast ? 'bg-indigo-800 text-white hover:bg-indigo-900' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      Discuss Talent Strategy
                    </a>
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
                  // ============================================
                  // MULTI-STATE VIEW - ENHANCED
                  // ============================================
                  <div className={`rounded-xl sm:rounded-2xl border shadow-soft overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-100'}`}>
                    <div className={`px-4 sm:px-8 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                      <h3 className="text-white font-semibold text-sm sm:text-base">Multi-State Comparison</h3>
                      <p className="text-navy-300 text-xs mt-1">Compare licensing requirements across your operating states</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] sm:min-w-full">
                        <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                          <tr>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>State</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>License Type</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Timeline</th>
                            <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Application Fee</th>
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
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold ${highContrast ? 'text-black' : 'text-gold-600'}`}>{license.applicationFee}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{license.bonding}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm capitalize ${highContrast ? 'text-black' : license.climate === 'friendly' ? 'text-green-600' : license.climate === 'strict' ? 'text-red-600' : 'text-yellow-600'}`}>
                                {license.climate}
                              </td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {reportData.multiStateLicenses.length > 10 && (
                      <div className={`px-4 sm:px-6 py-3 border-t ${highContrast ? 'border-black bg-gray-100' : 'border-navy-200 bg-navy-50'}`}>
                        <p className={`text-xs text-center ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>
                          +{reportData.multiStateLicenses.length - 10} additional states available in full database
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // ============================================
                  // SINGLE-STATE VIEW 
                  // ============================================
                  <>
                    {/* Summary Cards - Clean 3-card layout (no duplicate fee) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      {/* Card 1: License Required */}
                      <div className={`rounded-xl p-4 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-br from-navy-50 to-navy-100 border-navy-200'}`}>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>License Required</p>
                        <p className={`text-xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{getLicenseRequiredDisplay()}</p>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-1`}>{licensingData.license_name || 'Money Transmitter License'}</p>
                        {licensingData.renewal_frequency && (
                          <p className={`text-[11px] ${highContrast ? 'text-gray-600' : 'text-navy-400'} mt-2`}>
                            Renews: {licensingData.renewal_frequency}
                          </p>
                        )}
                      </div>

                      {/* Card 2: Processing Time */}
                      <div className={`rounded-xl p-4 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Processing Time</p>
                        <p className={`text-xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{getProcessingTime()}</p>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-1`}>Estimated from submission</p>
                        {licensingData.expedited_processing_available && (
                          <p className={`text-[11px] ${highContrast ? 'text-blue-700' : 'text-blue-600'} mt-2 flex items-center gap-1`}>
                            <Zap className="w-3 h-3" />
                            Expedited processing available
                          </p>
                        )}
                      </div>

                      {/* Card 3: Bond Requirement */}
                      <div className={`rounded-xl p-4 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Bond Requirement</p>
                        <p className={`text-lg font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{bondRangeDisplay}</p>
                        <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-1`}>Surety Bond required</p>
                        <p className={`text-[11px] ${highContrast ? 'text-gray-600' : 'text-navy-400'} mt-2`}>
                          Annual premium: 1-3% of bond amount
                        </p>
                      </div>
                    </div>

                    {/* Regulatory Climate & Verification Badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        licensingData.regulatory_climate === 'friendly' ? 'bg-green-100 text-green-800' :
                        licensingData.regulatory_climate === 'strict' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        <Shield className="w-4 h-4 mr-1.5" />
                        Climate: {licensingData.regulatory_climate === 'friendly' ? 'Friendly' : licensingData.regulatory_climate === 'strict' ? 'Strict' : 'Moderate'}
                      </span>
                    </div>

                    {/* Financial Requirements - Detailed (Application Fee lives here) */}
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
                            {licensingData.fee_waiver_available && (
                              <p className={`text-[10px] ${highContrast ? 'text-green-700' : 'text-green-600'} mt-2`}>
                                💰 Fee waiver may be available for startups
                              </p>
                            )}
                          </div>
                          <div className={`rounded-lg p-4 ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Annual Renewal Fee</p>
                            <p className={`text-lg font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{formatMoney(licensingData.annual_renewal_fee)}</p>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-400'} mt-1`}>
                              Due {licensingData.renewal_deadline || 'annually on anniversary'}
                            </p>
                          </div>
                          <div className={`rounded-lg p-4 ${highContrast ? 'bg-gray-100' : 'bg-navy-50'}`}>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'} mb-1`}>Net Worth Requirement</p>
                            <p className={`text-lg font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>{formatMoney(licensingData.net_worth_requirement)}</p>
                            <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-400'} mt-1`}>Minimum tangible net worth</p>
                            <p className={`text-[10px] ${highContrast ? 'text-gray-600' : 'text-navy-400'} mt-2`}>
                              Must be maintained at all times
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Regulator Contact Information - ENHANCED with website link */}
                    {(licensingData.regulator_name || licensingData.regulator_website || licensingData.regulator_phone) && (
                      <div className={`rounded-xl border overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                        <div className={`px-4 sm:px-6 py-2.5 sm:py-3 ${highContrast ? 'bg-black' : 'bg-navy-700'}`}>
                          <h4 className="text-white font-medium text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gold-400" />
                            Regulator Contact Information
                          </h4>
                        </div>
                        <div className="p-4 sm:p-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className={`text-sm font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                                {licensingData.regulator_name || 'State Banking Department'}
                              </p>
                              {licensingData.regulator_phone && (
                                <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'} mt-1 flex items-center gap-1`}>
                                  <Phone className="w-3 h-3" />
                                  {formatPhoneNumber(licensingData.regulator_phone)}
                                </p>
                              )}
                              {licensingData.regulator_email && (
                                <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'} mt-1 flex items-center gap-1`}>
                                  <Mail className="w-3 h-3" />
                                  {licensingData.regulator_email}
                                </p>
                              )}
                            </div>
                            <div>
                              {licensingData.regulator_website && (
                                <a 
                                  href={licensingData.regulator_website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`inline-flex items-center gap-1 text-sm ${highContrast ? 'text-black' : 'text-gold-600'} hover:underline`}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Visit Regulator Website
                                </a>
                              )}
                              {licensingData.application_portal_url && (
                                <div className="mt-2">
                                  <a 
                                    href={licensingData.application_portal_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`inline-flex items-center gap-1 text-xs ${highContrast ? 'text-blue-800' : 'text-blue-600'} hover:underline`}
                                  >
                                    <FileText className="w-3 h-3" />
                                    Online Application Portal
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                          {licensingData.key_requirements && (
                            <div className={`mt-2 pt-2 border-t ${highContrast ? 'border-gray-300' : 'border-navy-200'}`}>
                              <p className="text-xs font-semibold mb-1">Key Requirements:</p>
                              <ul className="list-disc list-inside text-xs text-navy-600 space-y-0.5">
                                {licensingData.key_requirements.split(',').map((req: string, i: number) => (
                                  <li key={i}>{req.trim()}</li>
                                ))}
                              </ul>
                            </div>
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
                          'Audited financial statements (3 years)',
                          'Surety bonds as specified above',
                          'Designate qualified compliance officer',
                          'Written AML/KYC policies and procedures',
                          'Proof of net worth requirements',
                          'Business continuity and disaster recovery plan'
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-amber-200' : 'bg-gold-200'}`}>
                              <span className={`text-[10px] sm:text-xs ${highContrast ? 'text-black' : 'text-gold-700'}`}>✓</span>
                            </div>
                            <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className={`mt-4 pt-3 border-t ${highContrast ? 'border-amber-900' : 'border-gold-200'}`}>
                        <p className="text-[10px] text-navy-500 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Requirements may vary by state. Use your free consultation to get state-specific checklists.
                        </p>
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
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>Strategic Compliance Roadmap</h2>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>
                        {reportData.strategy?.timeline === '3-months' ? '3-Month Accelerated' : reportData.strategy?.timeline === '12-months' ? '12-Month Strategic' : '6-Month Standard'} Timeline • Dependencies • Critical Path
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    DYNAMIC TIMELINE CALCULATIONS
                    ============================================ */}
                {(() => {
                  // Get client's selected timeline (default to 6 months)
                  const timelineMonths = reportData.strategy?.timeline === '3-months' ? 3 : 
                                         reportData.strategy?.timeline === '12-months' ? 12 : 6
                  
                  // Calculate phase distribution based on total timeline
                  // Foundation: 15% of timeline, Licensing: 25%, Implementation: 25%, Optimization: 35%
                  const foundationEndDay = Math.round(timelineMonths * 30 * 0.15)
                  const licensingEndDay = Math.round(timelineMonths * 30 * 0.40)
                  const implementationEndDay = Math.round(timelineMonths * 30 * 0.65)
                  const optimizationEndDay = timelineMonths * 30
                  
                  // Generate month labels for the timeline bar
                  const monthLabels = []
                  for (let i = 1; i <= timelineMonths; i++) {
                    monthLabels.push(`Month ${i}`)
                  }
                  
                  // Get phases from database or use dynamic defaults
                  const phases = (reportData.compliancePhases && reportData.compliancePhases.length > 0) 
                    ? reportData.compliancePhases 
                    : [
                        { 
                          phase: 'Foundation', 
                          timeline: `Days 1-${foundationEndDay}`, 
                          color: 'bg-red-50 border-red-200',
                          textColor: 'text-red-800',
                          items: ['Engage legal counsel', 'Initial risk assessment', 'Designate CCO', 'Begin license applications']
                        },
                        { 
                          phase: 'Licensing & Development', 
                          timeline: `Days ${foundationEndDay + 1}-${licensingEndDay}`, 
                          color: 'bg-orange-50 border-orange-200',
                          textColor: 'text-orange-800',
                          items: ['Submit applications', 'Select compliance tech', 'Draft policies', 'Begin AML program']
                        },
                        { 
                          phase: 'Implementation', 
                          timeline: `Days ${licensingEndDay + 1}-${implementationEndDay}`, 
                          color: 'bg-yellow-50 border-yellow-200',
                          textColor: 'text-yellow-800',
                          items: ['Implement monitoring', 'Staff training', 'Regulatory reporting setup', 'Internal audit']
                        },
                        { 
                          phase: 'Optimization', 
                          timeline: `Days ${implementationEndDay + 1}-${optimizationEndDay}`, 
                          color: 'bg-green-50 border-green-200',
                          textColor: 'text-green-800',
                          items: ['License approval', 'Full operations', 'Quarterly reviews', 'Continuous improvement']
                        }
                      ]
                  
                  // Update phase timelines dynamically
                  const updatedPhases = phases.map((phase, idx) => {
                    if (idx === 0) return { ...phase, timeline: `Days 1-${foundationEndDay}` }
                    if (idx === 1) return { ...phase, timeline: `Days ${foundationEndDay + 1}-${licensingEndDay}` }
                    if (idx === 2) return { ...phase, timeline: `Days ${licensingEndDay + 1}-${implementationEndDay}` }
                    return { ...phase, timeline: `Days ${implementationEndDay + 1}-${optimizationEndDay}` }
                  })
                  
                  // Calculate phase percentages for Gantt bar
                  const phasePercentages = [
                    (foundationEndDay / optimizationEndDay) * 100,
                    ((licensingEndDay - foundationEndDay) / optimizationEndDay) * 100,
                    ((implementationEndDay - licensingEndDay) / optimizationEndDay) * 100,
                    ((optimizationEndDay - implementationEndDay) / optimizationEndDay) * 100
                  ]
                  
                  // Determine critical path based on timeline
                  const isAccelerated = timelineMonths <= 3
                  const isStrategic = timelineMonths >= 12
                  
                  return (
                    <>
                      {/* Strategic Overview Card - Dynamic */}
                      <div className={`rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-green-100 border-green-900' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${highContrast ? 'bg-green-200' : 'bg-green-100'}`}>
                            <Target className={`w-4 h-4 ${highContrast ? 'text-green-900' : 'text-green-700'}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold text-sm sm:text-base mb-1 ${highContrast ? 'text-green-900' : 'text-green-800'}`}>Strategic Overview</h3>
                            <p className={`text-xs sm:text-sm ${highContrast ? 'text-green-800' : 'text-green-700'}`}>
                              Based on your selected {timelineMonths}-month timeline and {reportData.overallRisk || 'Moderate'} risk profile,
                              this roadmap outlines the critical phases, dependencies, and milestones required to achieve full compliance.
                              {isAccelerated && <span className="block mt-1 text-[10px] font-semibold">⚠️ Accelerated timeline requires dedicated resources and expedited processes.</span>}
                              {isStrategic && <span className="block mt-1 text-[10px] font-semibold">📅 Strategic timeline allows for thorough planning and parallel workstreams.</span>}
                              <span className="block mt-1 text-[10px] opacity-80">→ For detailed task assignments, owners, and durations, see Page 10: Next Steps</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ============================================
                          DYNAMIC GANTT-STYLE TIMELINE VISUALIZATION
                          ============================================ */}
                      <div className={`border rounded-lg sm:rounded-xl overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                        <div className={`px-4 sm:px-6 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                          <h3 className="text-white font-semibold text-sm sm:text-base">Strategic Timeline & Phases</h3>
                          <p className="text-navy-300 text-xs mt-1">
                            {timelineMonths}-Month {isAccelerated ? 'Accelerated' : isStrategic ? 'Strategic' : 'Standard'} Compliance Journey
                          </p>
                        </div>
                        <div className="p-4 sm:p-6">
                          {/* Timeline Bar - Dynamic based on months */}
                          <div className="relative mb-8">
                            <div className="flex justify-between text-[10px] text-navy-500 mb-1">
                              <span>Start</span>
                              {monthLabels.map((label, idx) => (
                                <span key={idx}>{label}</span>
                              ))}
                            </div>
                            <div className="h-3 bg-navy-100 rounded-full overflow-hidden">
                              <div className="w-full h-full flex">
                                <div className="h-full bg-red-500" style={{ width: `${phasePercentages[0]}%` }} />
                                <div className="h-full bg-orange-500" style={{ width: `${phasePercentages[1]}%` }} />
                                <div className="h-full bg-yellow-500" style={{ width: `${phasePercentages[2]}%` }} />
                                <div className="h-full bg-green-500" style={{ width: `${phasePercentages[3]}%` }} />
                              </div>
                            </div>
                            {/* Timeline markers */}
                            <div className="relative mt-1">
                              <div className="absolute text-[8px] text-navy-400" style={{ left: `${phasePercentages[0]}%` }}>
                                Foundation End
                              </div>
                              <div className="absolute text-[8px] text-navy-400" style={{ left: `${phasePercentages[0] + phasePercentages[1]}%` }}>
                                Licensing End
                              </div>
                              <div className="absolute text-[8px] text-navy-400" style={{ left: `${phasePercentages[0] + phasePercentages[1] + phasePercentages[2]}%` }}>
                                Implementation End
                              </div>
                            </div>
                          </div>

                          {/* Phase Cards with Dynamic Positioning */}
                          <div className="space-y-6">
                            {updatedPhases.map((phase: any, idx: number) => {
                              // Calculate timeline position for visual indicator (cumulative percentage)
                              const cumulativePercentage = idx === 0 ? 0 :
                                                          idx === 1 ? phasePercentages[0] :
                                                          idx === 2 ? phasePercentages[0] + phasePercentages[1] :
                                                          phasePercentages[0] + phasePercentages[1] + phasePercentages[2]
                              const phasePercentage = phasePercentages[idx]
                              
                              return (
                                <div key={idx} className={`border rounded-lg p-4 ${phase.color}`}>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <div>
                                      <h4 className={`text-base sm:text-lg font-semibold ${phase.textColor}`}>{phase.phase}</h4>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-navy-500">{phase.timeline}</span>
                                        {idx > 0 && (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                            Depends on: {idx === 1 ? 'Foundation' : idx === 2 ? 'Licensing' : 'Implementation'}
                                          </span>
                                        )}
                                        {idx === 0 && (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                                            Critical Path - No dependencies
                                          </span>
                                        )}
                                        {isAccelerated && idx === 0 && (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                            ⚡ Expedite required
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {/* Gantt-style mini bar - Dynamic */}
                                    <div className="w-full sm:w-48">
                                      <div className="text-[9px] text-navy-500 mb-0.5">Timeline position</div>
                                      <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${phase.textColor.replace('text-', 'bg-')}`}
                                          style={{ width: `${phasePercentage}%`, marginLeft: `${cumulativePercentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Strategic Objectives */}
                                  <p className="text-xs text-navy-600 mb-3 italic">
                                    Strategic objectives for this phase:
                                  </p>
                                  <div className="grid md:grid-cols-2 gap-2">
                                    {(phase.items || []).map((item: string, i: number) => (
                                      <div key={i} className="flex items-start gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${phase.textColor.replace('text-', 'bg-')}`} />
                                        <span className={`text-xs ${phase.textColor}`}>{item}</span>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Phase completion criteria - Dynamic based on timeline */}
                                  <div className={`mt-3 pt-2 border-t ${phase.textColor.replace('text-', 'border-')} border-opacity-30`}>
                                    <div className="flex items-center gap-2">
                                      <Flag className={`w-3 h-3 ${phase.textColor}`} />
                                      <span className="text-[10px] font-medium">Phase complete when:</span>
                                      <span className="text-[10px] text-navy-600">
                                        {idx === 0 ? 'Legal counsel engaged + applications drafted' :
                                         idx === 1 ? 'Applications submitted + technology selected' :
                                         idx === 2 ? 'Monitoring live + staff trained' :
                                         isAccelerated ? 'License approved + operations launched (expedited)' :
                                         'License approved + operations launched'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* ============================================
                          DYNAMIC CRITICAL PATH ANALYSIS
                          ============================================ */}
                      <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-red-100 border-red-900' : 'bg-red-50 border-red-200'}`}>
                        <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-red-900' : 'text-red-800'}`}>
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                          Critical Path Analysis
                        </h4>
                        <div className="space-y-3">
                          <p className={`text-xs sm:text-sm ${highContrast ? 'text-red-800' : 'text-red-700'}`}>
                            These phases have ZERO SLACK - delays will push your entire compliance timeline:
                          </p>
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div className={`p-3 rounded-lg text-center ${highContrast ? 'bg-red-200' : 'bg-red-100'}`}>
                              <p className="text-xs font-bold text-red-800">Phase 1: Foundation</p>
                              <p className="text-[10px] text-red-700">Legal counsel engagement</p>
                              <div className="mt-1 text-[9px] text-red-600">
                                {isAccelerated ? '⚠️ Must complete in 1 week' : '⚠️ Cannot be parallelized'}
                              </div>
                            </div>
                            <div className={`p-3 rounded-lg text-center ${highContrast ? 'bg-red-200' : 'bg-red-100'}`}>
                              <p className="text-xs font-bold text-red-800">Phase 2: Licensing</p>
                              <p className="text-[10px] text-red-700">Application submission</p>
                              <div className="mt-1 text-[9px] text-red-600">
                                {isAccelerated ? '⚠️ Regulator expedite fee may be required' : '⚠️ Regulator processing time'}
                              </div>
                            </div>
                            <div className={`p-3 rounded-lg text-center ${highContrast ? 'bg-red-200' : 'bg-red-100'}`}>
                              <p className="text-xs font-bold text-red-800">Phase 4: Optimization</p>
                              <p className="text-[10px] text-red-700">License approval</p>
                              <div className="mt-1 text-[9px] text-red-600">
                                {isAccelerated ? '⚠️ Critical path - cannot launch until approved' : '⚠️ Cannot launch until approved'}
                              </div>
                            </div>
                          </div>
                          <div className={`mt-2 pt-2 border-t ${highContrast ? 'border-red-900' : 'border-red-200'}`}>
                            <p className="text-[10px] text-red-700 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              {isAccelerated 
                                ? 'Recommendation: Engage expedited processing services and dedicate full-time resources to Foundation phase.'
                                : isStrategic
                                ? 'Recommendation: Use parallel workstreams to reduce timeline pressure while maintaining quality.'
                                : 'Recommendation: Start Phase 1 immediately while parallelizing vendor selection (Phase 2 can overlap partially).'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ============================================
                          PHASE DEPENDENCIES MAP
                          ============================================ */}
                      <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-blue-100 border-blue-900' : 'bg-blue-50 border-blue-200'}`}>
                        <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-blue-900' : 'text-blue-800'}`}>
                          <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
                          Phase Dependencies Map
                        </h4>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                          <div className="flex-1 text-center">
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-blue-200' : 'bg-blue-100'}`}>
                              <p className="text-xs font-semibold text-blue-800">Foundation</p>
                              <p className="text-[9px] text-blue-700">Days 1-{foundationEndDay}</p>
                            </div>
                          </div>
                          <div className="text-blue-600 text-xl">→</div>
                          <div className="flex-1 text-center">
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-blue-200' : 'bg-blue-100'}`}>
                              <p className="text-xs font-semibold text-blue-800">Licensing</p>
                              <p className="text-[9px] text-blue-700">Days {foundationEndDay + 1}-{licensingEndDay}</p>
                            </div>
                          </div>
                          <div className="text-blue-600 text-xl">→</div>
                          <div className="flex-1 text-center">
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-blue-200' : 'bg-blue-100'}`}>
                              <p className="text-xs font-semibold text-blue-800">Implementation</p>
                              <p className="text-[9px] text-blue-700">Days {licensingEndDay + 1}-{implementationEndDay}</p>
                            </div>
                          </div>
                          <div className="text-blue-600 text-xl">→</div>
                          <div className="flex-1 text-center">
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-blue-200' : 'bg-blue-100'}`}>
                              <p className="text-xs font-semibold text-blue-800">Optimization</p>
                              <p className="text-[9px] text-blue-700">Days {implementationEndDay + 1}-{optimizationEndDay}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-blue-200 text-center">
                          <p className="text-[10px] text-blue-700">
                            🔗 Parallel path: Technology evaluation can run alongside Licensing (Weeks 2-{Math.min(6, Math.floor(timelineMonths * 0.5))})
                          </p>
                        </div>
                      </div>

                      {/* ============================================
                          DYNAMIC STRATEGIC MILESTONE TRACKER
                          ============================================ */}
                      <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-purple-100 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                        <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>
                          <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                          Strategic Milestone Tracker
                        </h4>
                        <div className="space-y-3">
                          {[
                            { milestone: 'Legal counsel retained', target: `Week 1`, phase: 'Foundation', status: 'not-started' },
                            { milestone: 'License applications submitted', target: `Month ${Math.ceil(foundationEndDay / 30)}`, phase: 'Foundation', status: 'not-started' },
                            { milestone: 'Compliance technology selected', target: `Month ${Math.ceil(licensingEndDay / 30)}`, phase: 'Licensing', status: 'not-started' },
                            { milestone: 'AML program operational', target: `Month ${Math.ceil(implementationEndDay / 30)}`, phase: 'Implementation', status: 'not-started' },
                            { milestone: 'License approval received', target: `Month ${timelineMonths - 1}`, phase: 'Optimization', status: 'not-started' },
                            { milestone: 'Full operations launched', target: `Month ${timelineMonths}`, phase: 'Optimization', status: 'not-started' }
                          ].map((milestone, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <span className={`text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>{milestone.milestone}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-purple-200 text-purple-900' : 'bg-purple-100 text-purple-700'}`}>
                                      {milestone.phase}
                                    </span>
                                    <span className="text-[10px] text-navy-500">Target: {milestone.target}</span>
                                  </div>
                                </div>
                                <div className="mt-1 h-1 bg-purple-200 rounded-full overflow-hidden">
                                  <div className="w-0 h-full bg-purple-600 rounded-full transition-all duration-500" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-3 pt-2 border-t ${highContrast ? 'border-purple-900' : 'border-purple-200'}`}>
                          <p className="text-[10px] text-purple-700 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Use this tracker in board meetings to report progress against strategic milestones.
                            {isAccelerated && ' Monthly milestones are compressed - weekly tracking recommended.'}
                          </p>
                        </div>
                      </div>

                      {/* ============================================
                          RISK EXPOSURE BY PHASE - Dynamic
                          ============================================ */}
                      <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                        <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                          Risk Exposure by Phase
                        </h4>
                        <div className="space-y-2">
                          {[
                            { phase: 'Foundation', risk: 'Regulatory Change', level: isAccelerated ? 'Medium' : 'Low', color: isAccelerated ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700' },
                            { phase: 'Licensing', risk: 'License Processing Delays', level: isAccelerated ? 'Critical' : 'High', color: isAccelerated ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700' },
                            { phase: 'Implementation', risk: 'Examination Findings', level: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
                            { phase: 'Optimization', risk: 'Enforcement Action', level: isStrategic ? 'Low' : 'Medium', color: isStrategic ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${item.level === 'Critical' ? 'bg-red-500' : item.level === 'High' ? 'bg-orange-500' : item.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                <span className="text-xs font-medium">{item.phase}</span>
                              </div>
                              <span className="text-[10px] text-navy-600">{item.risk}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${item.color}`}>{item.level} Risk</span>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-3 pt-2 border-t ${highContrast ? 'border-amber-900' : 'border-amber-200'}`}>
                          <p className="text-[10px] text-amber-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {isAccelerated 
                              ? 'Highest risk period: Months 1-2 (accelerated timeline increases pressure on Licensing phase). Mitigation strategies in Page 8.'
                              : 'Highest risk period: Months 1-3 (Licensing + Implementation). Mitigation strategies in Page 8.'}
                          </p>
                        </div>
                      </div>

                      {/* ============================================
                          RESOURCE FORECAST - Dynamic based on timeline
                          ============================================ */}
                      <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-teal-100 border-teal-900' : 'bg-teal-50 border-teal-200'}`}>
                        <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-teal-900' : 'text-teal-800'}`}>
                          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                          Resource Forecast by Phase
                        </h4>
                        <div className="grid sm:grid-cols-4 gap-2 text-center">
                          {[
                            { phase: 'Foundation', resources: 'Legal Counsel', hours: isAccelerated ? '20-30 hours' : '40-60 hours' },
                            { phase: 'Licensing', resources: 'Legal + Compliance', hours: isAccelerated ? '30-40 hours' : '60-80 hours' },
                            { phase: 'Implementation', resources: 'Compliance + IT', hours: isAccelerated ? '40-60 hours' : '80-120 hours' },
                            { phase: 'Optimization', resources: 'Compliance Team', hours: 'Ongoing' }
                          ].map((item, idx) => (
                            <div key={idx} className={`p-2 rounded-lg ${highContrast ? 'bg-teal-200' : 'bg-teal-100'}`}>
                              <p className="text-xs font-bold text-teal-800">{item.phase}</p>
                              <p className="text-[9px] text-teal-700">{item.resources}</p>
                              <p className="text-[8px] text-teal-600">{item.hours}</p>
                            </div>
                          ))}
                        </div>
                        {isAccelerated && (
                          <div className="mt-2 text-center">
                            <p className="text-[9px] text-orange-600">⚠️ Accelerated timeline requires 30-40% more resource intensity in first 60 days.</p>
                          </div>
                        )}
                      </div>

                      {/* ============================================
                          NAVIGATION TO PAGE 10
                          ============================================ */}
                      <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${highContrast ? 'bg-gray-200' : 'bg-navy-100'}`}>
                              <ArrowRight className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-navy-600'}`} />
                            </div>
                            <div>
                              <h4 className={`font-semibold text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-800'}`}>
                                Ready to Execute?
                              </h4>
                              <p className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-600'} mt-1`}>
                                Turn this strategic roadmap into action. Page 10 provides detailed task assignments,
                                owner badges, duration estimates, and risk connections for every step.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('next-steps')}
                            className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${highContrast ? 'bg-navy-800 text-white hover:bg-navy-900' : 'bg-navy-700 text-white hover:bg-navy-800'}`}
                          >
                            Go to Page 10: Next Steps
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </>
                  )
                })()}
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
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Vetted partners, key contacts, and engagement guidance</p>
                    </div>
                  </div>
                </div>

                {/* Resource Introduction Card */}
                <div className={`rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-indigo-100 border-indigo-900' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${highContrast ? 'bg-indigo-200' : 'bg-indigo-100'}`}>
                      <Phone className={`w-4 h-4 ${highContrast ? 'text-indigo-900' : 'text-indigo-700'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm sm:text-base mb-1 ${highContrast ? 'text-indigo-900' : 'text-indigo-800'}`}>How to Use This Resource Guide</h3>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-indigo-800' : 'text-indigo-700'}`}>
                        Your {report?.company_name || 'Company'} purchase includes a <span className="font-bold">30-minute consultation call</span> (${report?.subscription_tier === 'premium' ? '500' : '500'} value). 
                        Use it to get introduced to any of our vetted partners below or to review your compliance strategy with our expert team.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <a 
                          href={`/consultation?report_id=${report?.id}&utm_source=report&utm_medium=resources_tab`}
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${highContrast ? 'bg-indigo-800 text-white hover:bg-indigo-900' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          Schedule Your Free Consultation
                        </a>
                        <span className={`text-[10px] ${highContrast ? 'text-indigo-800' : 'text-indigo-600'}`}>
                          One-time report purchase includes 1 call • Premium includes 2 calls
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {/* State Regulator - Enhanced with website and engagement context */}
                  <div className={`border rounded-lg sm:rounded-xl overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                    <div className={`px-4 sm:px-6 py-2.5 sm:py-3 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                      <h3 className="text-white font-semibold text-sm sm:text-base">Primary Regulator</h3>
                    </div>
                    <div className="p-3 sm:p-5">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className={`font-semibold text-base sm:text-lg ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                            {reportData.providers?.regulator?.name || licensingData.regulator_name || 'State Banking Department'}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <p className={`text-xs sm:text-sm flex items-center gap-1 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                              <Phone className="w-3 h-3" />
                              {formatPhoneNumber(reportData.providers?.regulator?.phone || licensingData.regulator_phone || 'Check state website')}
                            </p>
                            <p className={`text-xs sm:text-sm flex items-center gap-1 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                              <Mail className="w-3 h-3" />
                              {reportData.providers?.regulator?.email || licensingData.regulator_email || 'Check state website'}
                            </p>
                          </div>
                        </div>
                        {(licensingData.regulator_website || reportData.providers?.regulator?.website) && (
                          <a 
                            href={licensingData.regulator_website || reportData.providers?.regulator?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${highContrast ? 'border-black text-black hover:bg-gray-100' : 'border-navy-200 text-navy-700 hover:bg-navy-50'}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Regulator Website
                          </a>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm mt-3 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                        {reportData.providers?.regulator?.specialty || licensingData.license_description || 'Primary regulatory authority for money transmission and digital asset activities.'}
                      </p>
                      <div className={`mt-3 pt-2 text-[10px] flex items-center gap-2 ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>
                        <Info className="w-3 h-3" />
                        <span>Engagement tip: Use your free consultation call to get an introduction to the right contact at this agency.</span>
                      </div>
                    </div>
                  </div>

                  {/* Legal Counsel and Consultants - Enhanced with fee tiers and websites */}
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Qualified Legal Counsel */}
                    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h4 className={`font-semibold flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                          <Briefcase className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                          Qualified Legal Counsel
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-green-200 text-green-900' : 'bg-green-100 text-green-700'}`}>
                          Vetted Partners
                        </span>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {(reportData.providers?.legalCounsel || [
                          { name: 'Hogan Lovells', specialty: 'Fintech & Money Transmission', phone: '(202) 637-5600', website: 'https://www.hoganlovells.com', feeTier: '$$$', reason: 'Leading fintech practice with deep MTL expertise' },
                          { name: 'Ballard Spahr', specialty: 'Consumer Financial Services', phone: '(215) 665-8500', website: 'https://www.ballardspahr.com', feeTier: '$$$', reason: 'Strong state licensing and compliance team' },
                          { name: 'McGlinchey Stafford', specialty: 'Digital Asset Regulation', phone: '(504) 596-2900', website: 'https://www.mcglinchey.com', feeTier: '$$', reason: 'Cost-effective regional firm with fintech focus' }
                        ]).slice(0, 3).map((counsel: any, i: number) => (
                          <div key={i} className={`pb-3 last:pb-0 ${i < 2 ? (highContrast ? 'border-b border-gray-300' : 'border-b border-navy-200') : ''}`}>
                            <div className="flex justify-between items-start gap-2">
                              <p className={`font-medium text-sm ${highContrast ? 'text-black' : 'text-navy-800'}`}>{counsel.name}</p>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                                counsel.feeTier === '$' ? 'bg-green-100 text-green-700' :
                                counsel.feeTier === '$$' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {counsel.feeTier === '$' ? 'Value' : counsel.feeTier === '$$' ? 'Mid-Range' : 'Premium'}
                              </span>
                            </div>
                            <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-black' : 'text-gold-600'} mt-0.5`}>{counsel.specialty}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                              <p className={`text-[10px] flex items-center gap-0.5 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                                <Phone className="w-2.5 h-2.5" />
                                {formatPhoneNumber(counsel.phone)}
                              </p>
                              {counsel.website && (
                                <a 
                                  href={counsel.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`text-[10px] flex items-center gap-0.5 hover:underline ${highContrast ? 'text-black' : 'text-gold-600'}`}
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  Website
                                </a>
                              )}
                            </div>
                            <p className={`text-[9px] italic mt-1.5 ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>
                              {counsel.reason || 'Specializes in money transmitter licensing and compliance'}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className={`mt-3 pt-2 text-[9px] flex items-center gap-1 ${highContrast ? 'text-gray-600' : 'text-navy-400'}`}>
                        <Target className="w-3 h-3" />
                        <span>Your consultation call includes warm introduction to any of these firms.</span>
                      </div>
                    </div>

                    {/* Compliance Consultants */}
                    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h4 className={`font-semibold flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                          <Users className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                          Compliance Consultants
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-green-200 text-green-900' : 'bg-green-100 text-green-700'}`}>
                          Vetted Partners
                        </span>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {(reportData.providers?.consultants || [
                          { name: 'Compliance Solutions Group', specialty: 'AML Program Development', phone: '(212) 555-0120', website: 'https://www.compliancesolutions.com', feeTier: '$$', reason: 'Specializes in fintech AML/CFT framework design' },
                          { name: 'RegTech Advisory', specialty: 'License Application Support', phone: '(415) 555-0230', website: 'https://www.regtechadvisory.com', feeTier: '$$', reason: 'End-to-end MTL application management' },
                          { name: 'Risk & Compliance Partners', specialty: 'Audit & Exam Prep', phone: '(312) 555-0340', website: 'https://www.rcp.com', feeTier: '$', reason: 'Fixed-fee audit preparation packages' }
                        ]).slice(0, 3).map((consultant: any, i: number) => (
                          <div key={i} className={`pb-3 last:pb-0 ${i < 2 ? (highContrast ? 'border-b border-gray-300' : 'border-b border-navy-200') : ''}`}>
                            <div className="flex justify-between items-start gap-2">
                              <p className={`font-medium text-sm ${highContrast ? 'text-black' : 'text-navy-800'}`}>{consultant.name}</p>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                                consultant.feeTier === '$' ? 'bg-green-100 text-green-700' :
                                consultant.feeTier === '$$' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {consultant.feeTier === '$' ? 'Value' : consultant.feeTier === '$$' ? 'Mid-Range' : 'Premium'}
                              </span>
                            </div>
                            <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-black' : 'text-gold-600'} mt-0.5`}>{consultant.specialty}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                              <p className={`text-[10px] flex items-center gap-0.5 ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                                <Phone className="w-2.5 h-2.5" />
                                {formatPhoneNumber(consultant.phone)}
                              </p>
                              {consultant.website && (
                                <a 
                                  href={consultant.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`text-[10px] flex items-center gap-0.5 hover:underline ${highContrast ? 'text-black' : 'text-gold-600'}`}
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  Website
                                </a>
                              )}
                            </div>
                            <p className={`text-[9px] italic mt-1.5 ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>
                              {consultant.reason || 'Hands-on compliance program implementation'}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className={`mt-3 pt-2 text-[9px] flex items-center gap-1 ${highContrast ? 'text-gray-600' : 'text-navy-400'}`}>
                        <Target className="w-3 h-3" />
                        <span>Consultants offer fixed-fee packages for report holders - mention your Veridian report.</span>
                      </div>
                    </div>
                  </div>

                  {/* Technology Providers and Associations - Enhanced */}
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Technology Providers */}
                    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h4 className={`font-semibold flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                          <Cpu className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                          Technology Providers
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-blue-200 text-blue-900' : 'bg-blue-100 text-blue-700'}`}>
                          Integration Partners
                        </span>
                      </div>
                      <div className="space-y-2 sm:space-y-2.5">
                        {(reportData.providers?.techProviders || [
                          { name: 'Unit21', specialty: 'AML & Fraud Detection', website: 'https://www.unit21.ai', feeTier: '$$', integrationTime: '2-4 weeks' },
                          { name: 'Persona', specialty: 'Identity Verification', website: 'https://www.withpersona.com', feeTier: '$$', integrationTime: '1-2 weeks' },
                          { name: 'ComplyAdvantage', specialty: 'Sanctions Screening', website: 'https://www.complyadvantage.com', feeTier: '$$$', integrationTime: '3-5 weeks' },
                          { name: 'Sardine', specialty: 'Fraud & Compliance API', website: 'https://www.sardine.ai', feeTier: '$$', integrationTime: '2-3 weeks' }
                        ]).slice(0, 4).map((provider: any, i: number) => (
                          <div key={i} className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className={`text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>{provider.name}</p>
                                <span className={`text-[8px] px-1 py-0.5 rounded-full ${highContrast ? 'bg-cyan-200 text-cyan-900' : 'bg-cyan-100 text-cyan-700'}`}>
                                  {provider.integrationTime || '2-4 weeks'}
                                </span>
                              </div>
                              <p className={`text-[9px] ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>{provider.specialty}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {provider.website && (
                                <a 
                                  href={provider.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`p-1 rounded hover:bg-white transition-colors ${highContrast ? 'text-black' : 'text-gold-600'}`}
                                  title="Visit website"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                provider.feeTier === '$' ? 'bg-green-100 text-green-700' :
                                provider.feeTier === '$$' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {provider.feeTier}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`mt-3 pt-2 text-[9px] flex items-center gap-1 ${highContrast ? 'text-gray-600' : 'text-navy-400'}`}>
                        <Zap className="w-3 h-3" />
                        <span>API-first vendors with sandbox environments for testing.</span>
                      </div>
                    </div>

                    {/* Industry Associations */}
                    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h4 className={`font-semibold flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                          <Award className={`w-4 h-4 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                          Industry Associations
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-purple-200 text-purple-900' : 'bg-purple-100 text-purple-700'}`}>
                          Membership Benefits
                        </span>
                      </div>
                      <div className="space-y-2 sm:space-y-2.5">
                        {(reportData.providers?.associations || [
                          { name: 'Money Services Roundtable', specialty: 'Policy & Advocacy', website: 'https://www.msr.org', benefit: 'Industry voice, networking, regulatory updates' },
                          { name: 'National Money Transmitters Association', specialty: 'State Licensing Support', website: 'https://www.nmta.org', benefit: 'License reciprocity, education, compliance resources' },
                          { name: 'Fintech Innovation Alliance', specialty: 'Startup Support', website: 'https://www.fintechalliance.org', benefit: 'Discounted legal services, accelerator programs' }
                        ]).slice(0, 3).map((assoc: any, i: number) => (
                          <div key={i} className={`pb-2 last:pb-0 ${i < 2 ? (highContrast ? 'border-b border-gray-300' : 'border-b border-navy-200') : ''}`}>
                            <div className="flex justify-between items-start gap-2">
                              <p className={`text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>{assoc.name}</p>
                              {assoc.website && (
                                <a 
                                  href={assoc.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`text-[9px] flex items-center gap-0.5 hover:underline ${highContrast ? 'text-black' : 'text-gold-600'}`}
                                >
                                  Join <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            <p className={`text-[9px] ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>{assoc.specialty}</p>
                            <p className={`text-[8px] italic mt-0.5 ${highContrast ? 'text-gray-500' : 'text-navy-400'}`}>{assoc.benefit}</p>
                          </div>
                        ))}
                      </div>
                      <div className={`mt-3 pt-2 text-[9px] flex items-center gap-1 ${highContrast ? 'text-gray-600' : 'text-navy-400'}`}>
                        <Target className="w-3 h-3" />
                        <span>Many associations offer member discounts on compliance tools and legal referrals.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Engage Footer */}
                <div className={`rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                  <h4 className={`font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>
                    <Star className="w-4 h-4" />
                    How to Use Your Free Consultation
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3 text-center">
                    <div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${highContrast ? 'bg-amber-200' : 'bg-amber-200'}`}>
                        <span className="text-xs font-bold text-amber-700">1</span>
                      </div>
                      <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-amber-900' : 'text-amber-800'} font-medium`}>Schedule Call</p>
                      <p className={`text-[8px] sm:text-[10px] ${highContrast ? 'text-amber-800' : 'text-amber-700'}`}>Book your free 30-min session</p>
                    </div>
                    <div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${highContrast ? 'bg-amber-200' : 'bg-amber-200'}`}>
                        <span className="text-xs font-bold text-amber-700">2</span>
                      </div>
                      <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-amber-900' : 'text-amber-800'} font-medium`}>Review Strategy</p>
                      <p className={`text-[8px] sm:text-[10px] ${highContrast ? 'text-amber-800' : 'text-amber-700'}`}>Discuss your specific compliance needs</p>
                    </div>
                    <div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${highContrast ? 'bg-amber-200' : 'bg-amber-200'}`}>
                        <span className="text-xs font-bold text-amber-700">3</span>
                      </div>
                      <p className={`text-[10px] sm:text-xs ${highContrast ? 'text-amber-900' : 'text-amber-800'} font-medium`}>Get Introductions</p>
                      <p className={`text-[8px] sm:text-[10px] ${highContrast ? 'text-amber-800' : 'text-amber-700'}`}>We'll connect you with vetted partners</p>
                    </div>
                  </div>
                  <div className="text-center mt-3 pt-2 border-t border-amber-200">
                    <a 
                      href={`/consultation?report_id=${report?.id}&utm_source=report&utm_medium=resources_footer`}
                      className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-colors ${highContrast ? 'bg-amber-800 text-white hover:bg-amber-900' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Claim Your Free Consultation Call
                    </a>
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
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>
                        Client-specific risk analysis based on your company profile
                        {reportData.overallRiskScore && ` • Risk Score: ${reportData.overallRiskScore}/100`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    OVERALL RISK SCORE CARD - DISPLAYS CALCULATED SCORE
                    ============================================ */}
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${
                  (() => {
                    const score = reportData.overallRiskScore || 54
                    if (score <= 30) return highContrast ? 'bg-green-100 border-green-900' : 'bg-green-50 border-green-200'
                    if (score <= 60) return highContrast ? 'bg-yellow-100 border-yellow-900' : 'bg-yellow-50 border-yellow-200'
                    if (score <= 80) return highContrast ? 'bg-orange-100 border-orange-900' : 'bg-orange-50 border-orange-200'
                    return highContrast ? 'bg-red-100 border-red-900' : 'bg-red-50 border-red-200'
                  })()
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          (() => {
                            const score = reportData.overallRiskScore || 54
                            if (score <= 30) return highContrast ? 'text-green-900' : 'text-green-600'
                            if (score <= 60) return highContrast ? 'text-yellow-900' : 'text-yellow-600'
                            if (score <= 80) return highContrast ? 'text-orange-900' : 'text-orange-600'
                            return highContrast ? 'text-red-900' : 'text-red-600'
                          })()
                        }`} />
                        <h3 className={`font-semibold text-base sm:text-lg ${
                          (() => {
                            const score = reportData.overallRiskScore || 54
                            if (score <= 30) return highContrast ? 'text-green-900' : 'text-green-800'
                            if (score <= 60) return highContrast ? 'text-yellow-900' : 'text-yellow-800'
                            if (score <= 80) return highContrast ? 'text-orange-900' : 'text-orange-800'
                            return highContrast ? 'text-red-900' : 'text-red-800'
                          })()
                        }`}>
                          Overall Risk Rating: {
                            (() => {
                              const score = reportData.overallRiskScore || 54
                              if (score <= 30) return 'Low Risk'
                              if (score <= 60) return 'Moderate Risk'
                              if (score <= 80) return 'Elevated Risk'
                              return 'Critical Risk'
                            })()
                          }
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl sm:text-3xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                            {reportData.overallRiskScore || 54}
                          </span>
                          <span className={`text-xs ${highContrast ? 'text-gray-700' : 'text-navy-500'}`}>
                            / 100
                          </span>
                          <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${
                            (() => {
                              const score = reportData.overallRiskScore || 54
                              if (score <= 30) return highContrast ? 'bg-green-200 text-green-900' : 'bg-green-100 text-green-700'
                              if (score <= 60) return highContrast ? 'bg-yellow-200 text-yellow-900' : 'bg-yellow-100 text-yellow-700'
                              if (score <= 80) return highContrast ? 'bg-orange-200 text-orange-900' : 'bg-orange-100 text-orange-700'
                              return highContrast ? 'bg-red-200 text-red-900' : 'bg-red-100 text-red-700'
                            })()
                          }`}>
                            {(() => {
                              const score = reportData.overallRiskScore || 54
                              if (score <= 30) return 'Favorable'
                              if (score <= 60) return 'Acceptable'
                              if (score <= 80) return 'Concerning'
                              return 'Critical'
                            })()}
                          </span>
                        </div>
                        
                        <div className={`h-6 w-px ${highContrast ? 'bg-gray-400' : 'bg-navy-200'}`} />
                        
                        <div className="space-y-2">
                          <span className={`text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-700'}`}>
                            Calculation Based On:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${highContrast ? 'bg-gray-200 text-black' : 'bg-navy-100 text-navy-700'}`}>
                              <Building2 className="w-4 h-4" />
                              {reportData.company?.size || 'N/A'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${highContrast ? 'bg-gray-200 text-black' : 'bg-navy-100 text-navy-700'}`}>
                              <Briefcase className="w-4 h-4" />
                              {reportData.company?.industry || 'N/A'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${highContrast ? 'bg-gray-200 text-black' : 'bg-navy-100 text-navy-700'}`}>
                              <Clock className="w-4 h-4" />
                              {reportData.strategy?.timeline || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className={`text-xs sm:text-sm mt-3 ${
                        (() => {
                          const score = reportData.overallRiskScore || 54
                          if (score <= 30) return highContrast ? 'text-green-800' : 'text-green-700'
                          if (score <= 60) return highContrast ? 'text-yellow-800' : 'text-yellow-700'
                          if (score <= 80) return highContrast ? 'text-orange-800' : 'text-orange-700'
                          return highContrast ? 'text-red-800' : 'text-red-700'
                        })()
                      }`}>
                        {(() => {
                          const score = reportData.overallRiskScore || 54
                          if (score <= 30) return '✓ Favorable risk profile. Maintain current controls and monitor for regulatory changes.'
                          if (score <= 60) return 'ℹ️ Acceptable risk profile. Focus on high-priority items identified in the matrix below.'
                          if (score <= 80) return '⚠️ Above average risk profile. Enhanced compliance measures recommended. Prioritize licensing and monitoring systems.'
                          return '🔴 Critical risk profile. Immediate action required. Engage legal counsel within 7 days.'
                        })()}
                      </p>
                    </div>
                    
                    {/* Risk Gauge Visualization */}
                    <div className="flex-shrink-0">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke={highContrast ? "#e5e7eb" : "#e2e8f0"} strokeWidth="8" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="66 264" strokeDashoffset="0" opacity="0.3" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#eab308" strokeWidth="8" strokeDasharray="66 264" strokeDashoffset="66" opacity="0.3" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray="44 264" strokeDashoffset="132" opacity="0.3" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="22 264" strokeDashoffset="176" opacity="0.3" />
                          {(() => {
                            const scoreValue = reportData.overallRiskScore || 54
                            const clampedScore = Math.min(100, Math.max(0, scoreValue))
                            const circumference = 2 * Math.PI * 42
                            const strokeDash = (clampedScore / 100) * circumference
                            const strokeColor = clampedScore <= 30 ? '#22c55e' : clampedScore <= 60 ? '#eab308' : clampedScore <= 80 ? '#f97316' : '#ef4444'
                            return (
                              <circle 
                                cx="50" cy="50" r="42" fill="none" stroke={strokeColor} strokeWidth="8"
                                strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round"
                              />
                            )
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-lg sm:text-xl font-bold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                            {reportData.overallRiskScore || 54}
                          </span>
                        </div>
                      </div>
                      <div className="text-center mt-1">
                        <div className="flex justify-center gap-1 text-[8px]">
                          <span className="text-green-600">Low</span>
                          <span className="text-yellow-600">Mod</span>
                          <span className="text-orange-600">Elev</span>
                          <span className="text-red-600">Crit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    RISK MATRIX TABLE - DISPLAYS CALCULATED RISKS WITH ADJUSTMENT REASONS
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                  <div className={`px-4 sm:px-6 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Client-Specific Risk Assessment</h3>
                    <p className="text-navy-300 text-xs mt-1">Calculated based on your company size, industry, timeline, and compliance posture</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] sm:min-w-full">
                      <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                        <tr>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Risk Category</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Likelihood</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Impact</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Risk Score</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Priority</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Mitigation Strategy</th>
                        </tr>
                      </thead>
                      <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                        {(reportData.risks || []).map((risk: any, i: number) => {
                          // Calculate risk score for this individual risk
                          const likelihoodWeight = { High: 3, Medium: 2, Low: 1 }
                          const impactWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 }
                          const riskScore = Math.round(((likelihoodWeight[risk.likelihood] * impactWeight[risk.impact]) * (100 / 12)))
                          
                          // Determine priority based on score
                          let priority = ''
                          let priorityColor = ''
                          if (riskScore >= 80) { priority = 'Critical'; priorityColor = 'bg-red-100 text-red-700' }
                          else if (riskScore >= 65) { priority = 'High'; priorityColor = 'bg-orange-100 text-orange-700' }
                          else if (riskScore >= 40) { priority = 'Medium'; priorityColor = 'bg-yellow-100 text-yellow-700' }
                          else { priority = 'Low'; priorityColor = 'bg-green-100 text-green-700' }
                          
                          return (
                            <tr key={i} className="hover:bg-navy-50">
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                                {risk.category}
                                {risk.adjustmentReason && (
                                  <div className="group relative inline-block ml-2">
                                    <Info className="w-3 h-3 text-navy-400 cursor-help inline" />
                                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-navy-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10">
                                      {risk.adjustmentReason}
                                    </div>
                                  </div>
                                )}
                              </td>
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
                                     risk.impact === 'Medium' ? 'bg-yellow-200 text-yellow-900 border border-yellow-900' :
                                     'bg-green-200 text-green-900 border border-green-900') :
                                    (risk.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                                     risk.impact === 'High' ? 'bg-orange-100 text-orange-800' : 
                                     risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                     'bg-green-100 text-green-800')
                                }`}>{risk.impact}</span>
                              </td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                  riskScore >= 80 ? 'bg-red-100 text-red-700' :
                                  riskScore >= 65 ? 'bg-orange-100 text-orange-700' :
                                  riskScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {riskScore}/100
                                </span>
                              </td>
                              <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityColor}`}>
                                  {priority}
                                </span>
                              </td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>
                                {risk.mitigation}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ============================================
                    QUICK ACTION SUMMARY - BASED ON HIGHEST PRIORITY RISKS
                    ============================================ */}
                <div className={`rounded-xl p-4 sm:p-6 border ${highContrast ? 'bg-blue-100 border-blue-900' : 'bg-blue-50 border-blue-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-blue-900' : 'text-blue-800'}`}>
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    Your Prioritized Action Plan
                  </h4>
                  <div className="space-y-3">
                    {(() => {
                      // Sort risks by score (highest first)
                      const sortedRisks = [...(reportData.risks || [])].sort((a, b) => {
                        const getScore = (risk: any) => {
                          const lw = { High: 3, Medium: 2, Low: 1 }
                          const iw = { Critical: 4, High: 3, Medium: 2, Low: 1 }
                          return (lw[risk.likelihood] * iw[risk.impact]) * (100 / 12)
                        }
                        return getScore(b) - getScore(a)
                      })
                      
                      const topRisks = sortedRisks.slice(0, 4)
                      
                      if (topRisks.length === 0) {
                        return (
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm text-navy-700">No immediate action required. Continue monitoring and maintain current compliance controls.</span>
                          </div>
                        )
                      }
                      
                      return topRisks.map((risk, i) => {
                        const lw = { High: 3, Medium: 2, Low: 1 }
                        const iw = { Critical: 4, High: 3, Medium: 2, Low: 1 }
                        const score = Math.round(((lw[risk.likelihood] * iw[risk.impact]) * (100 / 12)))
                        const isCritical = score >= 65
                        
                        return (
                          <div key={i} className="flex items-start gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isCritical ? 'bg-red-500' : 'bg-orange-500'
                            } text-white text-xs font-bold`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>
                                {risk.category}: {risk.mitigation}
                              </p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <p className="text-xs text-navy-500">
                                  Priority: {score >= 80 ? 'Critical' : score >= 65 ? 'High' : score >= 40 ? 'Medium' : 'Low'}
                                </p>
                                {risk.adjustmentReason && (
                                  <p className="text-xs text-navy-400 italic">
                                    {risk.adjustmentReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <a 
                      href={`/consultation?report_id=${report?.id}&utm_source=report&utm_medium=risk_assessment`}
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${highContrast ? 'bg-blue-800 text-white hover:bg-blue-900' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Use Your Free Consultation to Create an Action Plan
                    </a>
                  </div>
                </div>

                {/* ============================================
                    INSURANCE RECOMMENDATIONS - BASED ON RISK SCORE
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-purple-100 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    Recommended Insurance Coverage
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-purple-800 mb-1">Required for Licensing:</p>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2 text-xs text-purple-700">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Cyber Liability: ${(() => {
                            const score = reportData.overallRiskScore || 54
                            if (score >= 80) return '2-3M'
                            if (score >= 60) return '1-2M'
                            return '500k-1M'
                          })()} minimum
                        </li>
                        <li className="flex items-start gap-2 text-xs text-purple-700">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Crime/Fidelity Bond: ${(() => {
                            const score = reportData.overallRiskScore || 54
                            if (score >= 80) return '1M'
                            if (score >= 60) return '750k'
                            return '500k'
                          })()} minimum
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-800 mb-1">Recommended for Your Risk Profile:</p>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2 text-xs text-purple-700">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Directors & Officers (D&O): ${(() => {
                            const score = reportData.overallRiskScore || 54
                            if (score >= 80) return '3-5M'
                            if (score >= 60) return '2-3M'
                            return '1-2M'
                          })()}
                        </li>
                        <li className="flex items-start gap-2 text-xs text-purple-700">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Errors & Omissions (E&O): ${(() => {
                            const score = reportData.overallRiskScore || 54
                            if (score >= 80) return '2-3M'
                            if (score >= 60) return '1-2M'
                            return '500k-1M'
                          })()}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className={`mt-3 pt-3 border-t ${highContrast ? 'border-purple-900' : 'border-purple-200'}`}>
                    <p className="text-[10px] text-purple-700">
                      💡 Based on your risk score of {reportData.overallRiskScore || 54}/100, these coverage levels are recommended.
                      Use your consultation call for insurance broker introductions.
                    </p>
                  </div>
                </div>

                {/* ============================================
                    RISK REVIEW SCHEDULE - BASED ON RISK SCORE
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-teal-100 border-teal-900' : 'bg-teal-50 border-teal-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-teal-900' : 'text-teal-800'}`}>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    Recommended Risk Review Schedule
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    {(() => {
                      const score = reportData.overallRiskScore || 54
                      
                      if (score >= 80) {
                        return (
                          <>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-red-200' : 'bg-red-100'}`}>
                              <p className="text-xs font-bold text-red-800">Daily</p>
                              <p className="text-[9px] text-red-700">Transaction alerts</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-red-200' : 'bg-red-100'}`}>
                              <p className="text-xs font-bold text-red-800">Weekly</p>
                              <p className="text-[9px] text-red-700">Risk review meeting</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-orange-200' : 'bg-orange-100'}`}>
                              <p className="text-xs font-bold text-orange-800">Bi-Weekly</p>
                              <p className="text-[9px] text-orange-700">Compliance audit</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-yellow-200' : 'bg-yellow-100'}`}>
                              <p className="text-xs font-bold text-yellow-800">Monthly</p>
                              <p className="text-[9px] text-yellow-700">Full assessment</p>
                            </div>
                          </>
                        )
                      } else if (score >= 60) {
                        return (
                          <>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-red-200' : 'bg-red-100'}`}>
                              <p className="text-xs font-bold text-red-800">Daily</p>
                              <p className="text-[9px] text-red-700">Alert monitoring</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-orange-200' : 'bg-orange-100'}`}>
                              <p className="text-xs font-bold text-orange-800">Weekly</p>
                              <p className="text-[9px] text-orange-700">Risk check</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-yellow-200' : 'bg-yellow-100'}`}>
                              <p className="text-xs font-bold text-yellow-800">Monthly</p>
                              <p className="text-[9px] text-yellow-700">Compliance review</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-green-200' : 'bg-green-100'}`}>
                              <p className="text-xs font-bold text-green-800">Quarterly</p>
                              <p className="text-[9px] text-green-700">Full audit</p>
                            </div>
                          </>
                        )
                      } else {
                        return (
                          <>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-green-200' : 'bg-green-100'}`}>
                              <p className="text-xs font-bold text-green-800">Weekly</p>
                              <p className="text-[9px] text-green-700">Quick review</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-green-200' : 'bg-green-100'}`}>
                              <p className="text-xs font-bold text-green-800">Monthly</p>
                              <p className="text-[9px] text-green-700">Risk check</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-green-200' : 'bg-green-100'}`}>
                              <p className="text-xs font-bold text-green-800">Quarterly</p>
                              <p className="text-[9px] text-green-700">Compliance audit</p>
                            </div>
                            <div className={`p-2 rounded-lg ${highContrast ? 'bg-teal-200' : 'bg-teal-100'}`}>
                              <p className="text-xs font-bold text-teal-800">Annually</p>
                              <p className="text-[9px] text-teal-700">Strategic review</p>
                            </div>
                          </>
                        )
                      }
                    })()}
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
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Phased budgeting, ROI analysis, and financing options</p>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    CLIENT BUDGET RANGE CARD - NEW
                    Shows their selected budget vs estimated costs
                    ============================================ */}
                <div className={`rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-indigo-100 border-indigo-900' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Target className={`w-4 h-4 ${highContrast ? 'text-indigo-900' : 'text-indigo-600'}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${highContrast ? 'text-indigo-900' : 'text-indigo-600'}`}>
                          Your Selected Budget Range
                        </span>
                      </div>
                      <p className={`text-lg sm:text-xl font-bold ${highContrast ? 'text-indigo-900' : 'text-indigo-900'}`}>
                        {(() => {
                          const budget = reportData.company?.budget || 'under-50k'
                          const budgets: Record<string, string> = {
                            'under-50k': 'Under $50,000',
                            '50k-150k': '$50,000 - $150,000',
                            '150k-500k': '$150,000 - $500,000',
                            '500k+': '$500,000+'
                          }
                          return budgets[budget] || budgets['under-50k']
                        })()}
                      </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg ${highContrast ? 'bg-indigo-200' : 'bg-indigo-100'}`}>
                      <p className={`text-xs ${highContrast ? 'text-indigo-900' : 'text-indigo-700'}`}>
                        {(() => {
                          const budget = reportData.company?.budget || 'under-50k'
                          const estimatedMin = reportData.budgetGuide?.totalEstimated?.min || 50000
                          const estimatedMax = reportData.budgetGuide?.totalEstimated?.max || 150000
                          
                          if (budget === 'under-50k' && estimatedMin > 50000) {
                            return '⚠️ Estimate exceeds your budget by ' + formatCurrency(estimatedMin - 50000)
                          } else if (budget === '50k-150k' && estimatedMin < 50000) {
                            return '✓ Estimate fits within your budget range'
                          } else if (budget === '150k-500k' && estimatedMax < 150000) {
                            return '✓ Estimate fits within your budget range'
                          } else if (budget === '500k+' && estimatedMax > 500000) {
                            return 'ℹ️ Estimate within enterprise range'
                          }
                          return '✓ Estimate aligns with your selected budget'
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    TOTAL INVESTMENT SUMMARY - ENHANCED
                    ============================================ */}
                <div className={`rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-navy-900 to-navy-800'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-gold-400 text-xs sm:text-sm mb-1">Total Estimated Investment</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                        {formatCurrency(reportData.budgetGuide?.totalEstimated?.min || 50000)} - {formatCurrency(reportData.budgetGuide?.totalEstimated?.max || 150000)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-navy-300">*Actual costs may vary based on specific requirements, state fees, and chosen vendors</p>
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-center ${highContrast ? 'bg-navy-800' : 'bg-white/10'}`}>
                      <p className="text-[10px] text-navy-300">Monthly Equivalent</p>
                      <p className="text-sm sm:text-base font-semibold text-gold-400">
                        {(() => {
                          const min = reportData.budgetGuide?.totalEstimated?.min || 50000
                          return formatCurrency(Math.round(min / 12))
                        })()} - {(() => {
                          const max = reportData.budgetGuide?.totalEstimated?.max || 150000
                          return formatCurrency(Math.round(max / 12))
                        })()}/month
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    PHASED BUDGET TIMELINE - NEW
                    Shows costs broken down by implementation phase
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                  <div className={`px-4 sm:px-6 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Phased Budget Timeline</h3>
                    <p className="text-navy-300 text-xs mt-1">When to expect costs by implementation phase</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] sm:min-w-full">
                      <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                        <tr>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Phase</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Timeline</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Estimated Cost</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Key Activities</th>
                        </tr>
                      </thead>
                      <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                        {[
                          { phase: 'Foundation', timeline: 'Month 1', cost: '$15,000 - $35,000', activities: 'Legal counsel engagement, initial filings, compliance officer hiring' },
                          { phase: 'Licensing', timeline: 'Months 2-3', cost: '$25,000 - $60,000', activities: 'License applications, technology selection, policy development' },
                          { phase: 'Implementation', timeline: 'Months 4-6', cost: '$30,000 - $75,000', activities: 'Platform implementation, staff training, monitoring setup' },
                          { phase: 'Ongoing Annual', timeline: 'Year 2+', cost: '$20,000 - $50,000/year', activities: 'License renewals, compliance audits, annual reporting' }
                        ].map((phase, i) => (
                          <tr key={i} className="hover:bg-navy-50">
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-900'}`}>{phase.phase}</td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{phase.timeline}</td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold ${highContrast ? 'text-black' : 'text-gold-600'}`}>{phase.cost}</td>
                            <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{phase.activities}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ============================================
                    DETAILED BREAKDOWN TABLE - ENHANCED with percentages
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl overflow-hidden ${highContrast ? 'bg-white border-black' : 'bg-white border-navy-200'}`}>
                  <div className={`px-4 sm:px-6 py-3 sm:py-4 ${highContrast ? 'bg-black' : 'bg-navy-800'}`}>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Detailed Investment Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] sm:min-w-full">
                      <thead className={highContrast ? 'bg-gray-200' : 'bg-navy-50'}>
                        <tr>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Category</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Estimated Cost</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>% of Total</th>
                          <th className={`text-left py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>Notes</th>
                        </tr>
                      </thead>
                      <tbody className={highContrast ? 'divide-y divide-black' : 'divide-y divide-navy-100'}>
                        {(reportData.budgetGuide?.breakdown || []).map((item: any, i: number) => {
                          const totalMax = reportData.budgetGuide?.totalEstimated?.max || 150000
                          const percentMatch = item.amount.match(/\$([\d,]+)/g)
                          let percent = 0
                          if (percentMatch && percentMatch.length > 0) {
                            const avgAmount = parseInt(percentMatch[0].replace(/[$,]/g, ''))
                            percent = Math.round((avgAmount / totalMax) * 100)
                          }
                          return (
                            <tr key={i} className="hover:bg-navy-50">
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-900'}`}>{item.category}</td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-gold-600'}`}>{item.amount}</td>
                              <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-1.5 bg-navy-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gold-500 rounded-full" style={{ width: `${Math.min(100, percent)}%` }} />
                                  </div>
                                  <span className="text-[10px] text-navy-500">{percent}%</span>
                                </div>
                              </td>
                              <td className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-600'}`}>{item.notes}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ============================================
                    ROI & BREAKEVEN ANALYSIS - NEW
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-green-100 border-green-900' : 'bg-green-50 border-green-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-green-900' : 'text-green-800'}`}>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    ROI & Breakeven Analysis
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className={`text-xs ${highContrast ? 'text-green-800' : 'text-green-600'} mb-1`}>Estimated Annual Benefit</p>
                      <p className={`text-xl sm:text-2xl font-bold ${highContrast ? 'text-green-900' : 'text-green-800'}`}>
                        {formatCurrency(250000)} - {formatCurrency(500000)}
                      </p>
                      <p className="text-[10px] text-green-600 mt-1">Licensing enables revenue + penalty avoidance</p>
                    </div>
                    <div className="text-center border-l border-r border-green-200">
                      <p className={`text-xs ${highContrast ? 'text-green-800' : 'text-green-600'} mb-1`}>Projected Breakeven</p>
                      <p className={`text-xl sm:text-2xl font-bold ${highContrast ? 'text-green-900' : 'text-green-800'}`}>
                        6-9 months
                      </p>
                      <p className="text-[10px] text-green-600 mt-1">After license approval and launch</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs ${highContrast ? 'text-green-800' : 'text-green-600'} mb-1`}>3-Year ROI</p>
                      <p className={`text-xl sm:text-2xl font-bold ${highContrast ? 'text-green-900' : 'text-green-800'}`}>
                        3.5x - 5x
                      </p>
                      <p className="text-[10px] text-green-600 mt-1">Based on conservative revenue projections</p>
                    </div>
                  </div>
                  <div className={`mt-3 pt-3 border-t ${highContrast ? 'border-green-900' : 'border-green-200'}`}>
                    <p className="text-[10px] text-green-700 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      ROI calculation assumes successful license approval within 6 months and market entry within 9-12 months.
                    </p>
                  </div>
                </div>

                {/* ============================================
                    INDUSTRY BENCHMARK COMPARISON - NEW
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-blue-100 border-blue-900' : 'bg-blue-50 border-blue-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-blue-900' : 'text-blue-800'}`}>
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Industry Benchmark Comparison
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={highContrast ? 'text-blue-900' : 'text-blue-800'}>Your Estimated Budget</span>
                        <span className={highContrast ? 'text-blue-700' : 'text-blue-600'}>Industry Average</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ 
                                width: `${Math.min(100, ((reportData.budgetGuide?.totalEstimated?.min || 50000) / 300000) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-blue-800 min-w-[60px]">
                          {formatCurrency(reportData.budgetGuide?.totalEstimated?.min || 50000)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center text-xs">
                      <div className={`p-2 rounded-lg ${highContrast ? 'bg-blue-200' : 'bg-blue-100'}`}>
                        <p className="font-semibold text-blue-800">Your Size Segment</p>
                        <p className="text-blue-700">
                          {(() => {
                            const size = reportData.company?.size || '1-10'
                            if (size === '1-10') return '$40k - $120k'
                            if (size === '11-50') return '$80k - $200k'
                            if (size === '51-200') return '$150k - $400k'
                            return '$300k - $1M+'
                          })()}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${highContrast ? 'bg-blue-200' : 'bg-blue-100'}`}>
                        <p className="font-semibold text-blue-800">Your Industry</p>
                        <p className="text-blue-700">
                          {(() => {
                            const industry = reportData.company?.industry || 'Financial Services'
                            if (industry.toLowerCase().includes('crypto')) return '$75k - $250k'
                            if (industry.toLowerCase().includes('fintech')) return '$60k - $200k'
                            return '$50k - $150k'
                          })()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-[10px] mt-2 ${highContrast ? 'text-blue-800' : 'text-blue-700'}`}>
                      {(() => {
                        const budget = reportData.company?.budget || 'under-50k'
                        const estimatedMin = reportData.budgetGuide?.totalEstimated?.min || 50000
                        if (budget === 'under-50k' && estimatedMin > 50000) {
                          return 'Your budget is below industry average for your size. Consider phased implementation or exploring financing options below.'
                        } else if (budget === '500k+') {
                          return 'Your budget is above industry average, enabling comprehensive compliance infrastructure and faster implementation.'
                        }
                        return 'Your budget aligns with industry standards for your company size and sector.'
                      })()}
                    </p>
                  </div>
                </div>

                {/* ============================================
                    FINANCING & PAYMENT OPTIONS - NEW
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-purple-100 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                    Financing & Payment Options
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg ${highContrast ? 'bg-purple-200' : 'bg-purple-100'}`}>
                      <p className="text-xs font-semibold text-purple-800 mb-1">💳 Vendor Financing</p>
                      <p className="text-[10px] text-purple-700">Many technology vendors offer payment plans (3-12 months)</p>
                    </div>
                    <div className={`p-3 rounded-lg ${highContrast ? 'bg-purple-200' : 'bg-purple-100'}`}>
                      <p className="text-xs font-semibold text-purple-800 mb-1">🏦 SBA Loans</p>
                      <p className="text-[10px] text-purple-700">SBA 7(a) loans available for compliance infrastructure (up to $5M)</p>
                    </div>
                    <div className={`p-3 rounded-lg ${highContrast ? 'bg-purple-200' : 'bg-purple-100'}`}>
                      <p className="text-xs font-semibold text-purple-800 mb-1">📝 Legal Fee Deferral</p>
                      <p className="text-[10px] text-purple-700">Some law firms offer contingent or deferred fee arrangements</p>
                    </div>
                    <div className={`p-3 rounded-lg ${highContrast ? 'bg-purple-200' : 'bg-purple-100'}`}>
                      <p className="text-xs font-semibold text-purple-800 mb-1">💵 Investor Capital</p>
                      <p className="text-[10px] text-purple-700">Allocate portion of fundraising specifically for compliance</p>
                    </div>
                  </div>
                  <div className={`mt-3 pt-3 border-t ${highContrast ? 'border-purple-900' : 'border-purple-200'}`}>
                    <p className="text-[10px] text-purple-700 flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" />
                      Use your free consultation to discuss financing strategies tailored to your situation.
                    </p>
                  </div>
                </div>

                {/* ============================================
                    HIDDEN COSTS ALERT - NEW
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Hidden Costs to Consider
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      'Surety bond premiums (annual, 1-3% of bond amount)',
                      'Outside counsel for regulatory examinations ($5k-15k per exam)',
                      'Annual compliance audit ($10k-25k)',
                      'Staff continuing education and certifications ($2k-5k/person)',
                      'Regulatory filing fees (varies by state, $500-5k annually)',
                      'Technology upgrade and maintenance (10-15% of license cost)'
                    ].map((cost, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${highContrast ? 'text-amber-900' : 'text-amber-600'}`} />
                        <span className={`text-[10px] sm:text-xs ${highContrast ? 'text-amber-900' : 'text-amber-700'}`}>{cost}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-3 pt-3 border-t ${highContrast ? 'border-amber-900' : 'border-amber-200'}`}>
                    <p className="text-[10px] text-amber-700">
                      💡 Tip: Budget an additional 15-20% for unexpected costs in your first year.
                    </p>
                  </div>
                </div>

                {/* ============================================
                    COST-SAVING RECOMMENDATIONS - ENHANCED & TAILORED
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-teal-100 border-teal-900' : 'bg-teal-50 border-teal-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-teal-900' : 'text-teal-800'}`}>
                    <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
                    Cost-Saving Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
                    {[
                      'Bundle technology platforms from single vendor for 10-15% discount',
                      'Consider fractional/interim compliance officer vs. full-time hire',
                      'Start with essential technology modules, add features post-launch',
                      'Join industry associations (NMTA, MSR) for member pricing on services',
                      'Negotiate multi-year contracts with vendors for rate lock',
                      'Use free regulatory monitoring tools (state newsletters, RSS feeds) initially',
                      'Share compliance resources across related entities if applicable',
                      'Request payment terms (net-60 or net-90) from vendors'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-teal-900' : 'text-teal-600'}`} />
                        <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================
                    BUDGET SUMMARY & NEXT STEPS
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-gray-100 border-black' : 'bg-navy-50 border-navy-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                    <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    Budget Planning Next Steps
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3 text-center">
                    <div className={`p-2 rounded-lg ${highContrast ? 'bg-white' : 'bg-white'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${highContrast ? 'bg-gold-200' : 'bg-gold-100'}`}>
                        <span className="text-xs font-bold text-gold-700">1</span>
                      </div>
                      <p className={`text-xs font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>Get Firm Quotes</p>
                      <p className={`text-[9px] ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>Request proposals from 3+ vendors</p>
                    </div>
                    <div className={`p-2 rounded-lg ${highContrast ? 'bg-white' : 'bg-white'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${highContrast ? 'bg-gold-200' : 'bg-gold-100'}`}>
                        <span className="text-xs font-bold text-gold-700">2</span>
                      </div>
                      <p className={`text-xs font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>Secure Financing</p>
                      <p className={`text-[9px] ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>Explore SBA loans or investor capital</p>
                    </div>
                    <div className={`p-2 rounded-lg ${highContrast ? 'bg-white' : 'bg-white'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${highContrast ? 'bg-gold-200' : 'bg-gold-100'}`}>
                        <span className="text-xs font-bold text-gold-700">3</span>
                      </div>
                      <p className={`text-xs font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>Create Phased Budget</p>
                      <p className={`text-[9px] ${highContrast ? 'text-gray-600' : 'text-navy-500'}`}>Align spend with implementation timeline</p>
                    </div>
                  </div>
                  <div className="text-center mt-4 pt-3 border-t border-navy-200">
                    <a 
                      href={`/consultation?report_id=${report?.id}&utm_source=report&utm_medium=budget_guide`}
                      className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-colors ${highContrast ? 'bg-gold-800 text-white hover:bg-gold-900' : 'bg-gold-600 text-white hover:bg-gold-700'}`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Discuss Budget & Financing in Your Free Consultation
                    </a>
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
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-gray-700' : 'text-navy-500'} mt-0.5 sm:mt-1`}>Your prioritized action plan with owners, timelines, and success metrics</p>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    EXECUTIVE SUMMARY CARD - NEW
                    Links risk assessment to action plan
                    ============================================ */}
                <div className={`rounded-xl p-4 sm:p-5 border ${highContrast ? 'bg-teal-100 border-teal-900' : 'bg-teal-50 border-teal-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${highContrast ? 'bg-teal-200' : 'bg-teal-100'}`}>
                      <Target className={`w-4 h-4 ${highContrast ? 'text-teal-900' : 'text-teal-700'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm sm:text-base mb-1 ${highContrast ? 'text-teal-900' : 'text-teal-800'}`}>Your Action Plan at a Glance</h3>
                      <p className={`text-xs sm:text-sm ${highContrast ? 'text-teal-800' : 'text-teal-700'}`}>
                        Based on your {reportData.overallRisk || 'Moderate'} risk profile and {reportData.strategy?.timeline || '6-month'} timeline,
                        the following {((reportData.nextSteps?.immediate || []).length + (reportData.nextSteps?.shortTerm || []).length)} action items are prioritized to help you achieve compliance efficiently.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-[10px] text-navy-600">Critical Priority</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span className="text-[10px] text-navy-600">High Priority</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span className="text-[10px] text-navy-600">Medium Priority</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-[10px] text-navy-600">Monitor Only</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================
                    IMMEDIATE STEPS (Next 7 Days) - ENHANCED
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-amber-100 border-amber-900' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                    <h3 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-amber-900' : 'text-amber-800'}`}>
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Immediate (Next 7 Days)
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-amber-200 text-amber-900' : 'bg-amber-200 text-amber-700'}`}>
                        ⏱️ Total est: 8-12 hours
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-red-200 text-red-900' : 'bg-red-100 text-red-700'}`}>
                        Critical Window
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 sm:space-y-4">
                    {(reportData.nextSteps?.immediate || [
                      'Engage qualified digital asset compliance counsel within 7 days',
                      'Begin license application preparation',
                      'Designate interim Compliance Officer',
                      'Start AML/KYC policy drafting',
                      'Set up regulatory monitoring alerts'
                    ]).map((step: string, idx: number) => {
                      // Determine priority based on step content
                      let priority = 'high'
                      let priorityColor = 'bg-orange-100 text-orange-700'
                      let owner = 'You'
                      let ownerColor = 'bg-blue-100 text-blue-700'
                      let duration = '1-2 days'
                      let riskConnection = ''
                      
                      if (step.toLowerCase().includes('counsel') || step.toLowerCase().includes('legal')) {
                        priority = 'critical'
                        priorityColor = 'bg-red-100 text-red-700'
                        owner = 'You + Legal'
                        duration = '1-2 days'
                        riskConnection = 'Connects to Regulatory Compliance risk'
                      } else if (step.toLowerCase().includes('license') || step.toLowerCase().includes('application')) {
                        priority = 'critical'
                        priorityColor = 'bg-red-100 text-red-700'
                        owner = 'You + Counsel'
                        duration = '3-5 days'
                        riskConnection = 'Connects to License Processing Delays risk'
                      } else if (step.toLowerCase().includes('compliance officer') || step.toLowerCase().includes('cco')) {
                        priority = 'high'
                        priorityColor = 'bg-orange-100 text-orange-700'
                        owner = 'CEO/Board'
                        duration = '5-7 days'
                        riskConnection = 'Connects to Enforcement Action risk'
                      } else if (step.toLowerCase().includes('aml') || step.toLowerCase().includes('kyc')) {
                        priority = 'high'
                        priorityColor = 'bg-orange-100 text-orange-700'
                        owner = 'Compliance Lead'
                        duration = '3-5 days'
                        riskConnection = 'Connects to Examination Findings risk'
                      } else {
                        priority = 'medium'
                        priorityColor = 'bg-yellow-100 text-yellow-700'
                        owner = 'Operations'
                        duration = '1-2 hours'
                      }
                      
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-amber-200' : 'bg-amber-200'}`}>
                            <span className={`text-[10px] sm:text-xs font-bold ${highContrast ? 'text-amber-900' : 'text-amber-700'}`}>{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>{step}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${priorityColor}`}>
                                {priority === 'critical' ? 'Critical Priority' : priority === 'high' ? 'High Priority' : 'Medium Priority'}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${ownerColor}`}>
                                👤 {owner}
                              </span>
                              <span className="text-[9px] text-navy-400">⏱️ {duration}</span>
                            </div>
                            {riskConnection && (
                              <p className="text-[9px] text-navy-500 mt-0.5 flex items-center gap-1">
                                <Link2 className="w-2.5 h-2.5" />
                                {riskConnection}
                              </p>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* ============================================
                    SHORT-TERM STEPS (30-90 Days) - ENHANCED
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-blue-100 border-blue-900' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                    <h3 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-blue-900' : 'text-blue-800'}`}>
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      Short-Term (30-90 Days)
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-blue-200 text-blue-900' : 'bg-blue-200 text-blue-700'}`}>
                        ⏱️ Ongoing during this period
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 sm:space-y-4">
                    {(reportData.nextSteps?.shortTerm || [
                      'Submit license applications (Month 1-2)',
                      'Select and implement compliance technology (Month 2-3)',
                      'Hire permanent Compliance Officer (Month 2-3)',
                      'Complete staff compliance training (Month 3)',
                      'Establish regulatory reporting protocols (Month 3)'
                    ]).map((step: string, idx: number) => {
                      let owner = 'Legal Counsel'
                      let ownerColor = 'bg-purple-100 text-purple-700'
                      let duration = '2-4 weeks'
                      let riskConnection = ''
                      
                      if (step.toLowerCase().includes('license') || step.toLowerCase().includes('application')) {
                        owner = 'Legal Counsel'
                        duration = '4-6 weeks'
                        riskConnection = 'Directly addresses Licensing Gaps risk'
                      } else if (step.toLowerCase().includes('technology') || step.toLowerCase().includes('platform')) {
                        owner = 'CTO + Compliance'
                        duration = '3-4 weeks'
                        riskConnection = 'Addresses AML Program risk'
                      } else if (step.toLowerCase().includes('compliance officer') || step.toLowerCase().includes('cco')) {
                        owner = 'HR + CEO'
                        duration = '4-6 weeks'
                        riskConnection = 'Addresses Enforcement Action risk'
                      } else if (step.toLowerCase().includes('training')) {
                        owner = 'Compliance Officer'
                        duration = '1-2 weeks'
                        riskConnection = 'Reduces Examination Findings risk'
                      } else {
                        owner = 'Compliance Team'
                        duration = '2-3 weeks'
                      }
                      
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-blue-200' : 'bg-blue-200'}`}>
                            <span className={`text-[10px] sm:text-xs font-bold ${highContrast ? 'text-blue-900' : 'text-blue-700'}`}>{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-xs sm:text-sm font-medium ${highContrast ? 'text-black' : 'text-navy-800'}`}>{step}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700`}>High Priority</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${ownerColor}`}>
                                👤 {owner}
                              </span>
                              <span className="text-[9px] text-navy-400">⏱️ {duration}</span>
                            </div>
                            {riskConnection && (
                              <p className="text-[9px] text-navy-500 mt-0.5 flex items-center gap-1">
                                <Link2 className="w-2.5 h-2.5" />
                                {riskConnection}
                              </p>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* ============================================
                    ONGOING OBLIGATIONS - ENHANCED
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-green-100 border-green-900' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                    <h3 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-green-900' : 'text-green-800'}`}>
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                      Ongoing Obligations
                    </h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-green-200 text-green-900' : 'bg-green-200 text-green-700'}`}>
                      🔄 Recurring
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                    {(reportData.nextSteps?.ongoing || [
                      'Quarterly compliance reviews and risk assessments',
                      'Annual independent compliance audits',
                      'Continuous regulatory change monitoring',
                      'License renewals and annual reports',
                      'Ongoing staff training and development'
                    ]).map((item: string, idx: number) => {
                      let frequency = 'Quarterly'
                      let owner = 'Compliance Officer'
                      
                      if (item.toLowerCase().includes('annual')) {
                        frequency = 'Annually'
                      } else if (item.toLowerCase().includes('quarterly')) {
                        frequency = 'Quarterly'
                      } else if (item.toLowerCase().includes('continuous') || item.toLowerCase().includes('monitoring')) {
                        frequency = 'Daily/Weekly'
                        owner = 'Compliance Team'
                      } else if (item.toLowerCase().includes('renewal')) {
                        frequency = 'Annually'
                        owner = 'Compliance + Finance'
                      } else if (item.toLowerCase().includes('training')) {
                        frequency = 'Bi-Annually'
                        owner = 'HR + Compliance'
                      }
                      
                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-green-900' : 'text-green-600'}`} />
                          <div className="flex-1">
                            <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item}</span>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-navy-400">🔄 {frequency}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-green-200 text-green-900' : 'bg-green-100 text-green-700'}`}>
                                👤 {owner}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ============================================
                    COMPLIANCE CALENDAR - ENHANCED with owner and duration
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-purple-100 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                    <h3 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-purple-900' : 'text-purple-800'}`}>
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      Compliance Calendar
                    </h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-purple-200 text-purple-900' : 'bg-purple-200 text-purple-700'}`}>
                      📅 Add to your calendar
                    </span>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {(reportData.nextSteps?.complianceCalendar || [
                      { timeframe: 'Week 1', tasks: ['Legal counsel engagement', 'Initial compliance assessment'] },
                      { timeframe: 'Month 1', tasks: ['Draft policies', 'Begin license applications', 'Designate compliance officer'] },
                      { timeframe: 'Month 2-3', tasks: ['Submit applications', 'Select technology', 'Hire compliance team'] },
                      { timeframe: 'Quarterly', tasks: ['Compliance review', 'Regulatory reporting', 'Risk assessment update'] },
                      { timeframe: 'Annually', tasks: ['Independent audit', 'License renewals', 'Board review'] }
                    ]).map((item: any, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg ${highContrast ? 'bg-purple-200/30' : 'bg-purple-100/50'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h4 className={`font-semibold text-sm ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>{item.timeframe}</h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-purple-200 text-purple-900' : 'bg-purple-200 text-purple-700'}`}>
                            ⏱️ Est. {item.timeframe.includes('Week') ? '2-4 hours' : item.timeframe.includes('Month 1') ? '1-2 days' : item.timeframe.includes('Quarterly') ? '1 week' : '2-3 weeks'}
                          </span>
                        </div>
                        <ul className="space-y-1.5 ml-2">
                          {(item.tasks || []).map((task: string, taskIdx: number) => {
                            let taskOwner = 'Compliance Team'
                            if (task.toLowerCase().includes('counsel') || task.toLowerCase().includes('legal')) taskOwner = 'Legal Counsel'
                            if (task.toLowerCase().includes('board')) taskOwner = 'CEO + Board'
                            if (task.toLowerCase().includes('hire')) taskOwner = 'HR + CEO'
                            
                            return (
                              <li key={taskIdx} className="flex items-start gap-2">
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${highContrast ? 'bg-purple-200' : 'bg-purple-200'}`}>
                                  <span className={`text-[9px] ${highContrast ? 'text-purple-900' : 'text-purple-700'}`}>✓</span>
                                </div>
                                <div className="flex-1">
                                  <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{task}</span>
                                  <span className={`text-[9px] ml-2 px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-purple-200 text-purple-900' : 'bg-purple-100 text-purple-700'}`}>
                                    👤 {taskOwner}
                                  </span>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================
                    QUARTERLY REVIEW CHECKLIST - ENHANCED
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-yellow-100 border-yellow-900' : 'bg-gold-50 border-gold-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                    <h3 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${highContrast ? 'text-black' : 'text-navy-900'}`}>
                      <Target className={`w-4 h-4 sm:w-5 sm:h-5 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                      Quarterly Review Checklist
                    </h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-yellow-200 text-yellow-900' : 'bg-gold-200 text-gold-700'}`}>
                      📋 Download as PDF
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { task: 'Review regulatory changes in all operating states', owner: 'Compliance Team', duration: '2-3 hours' },
                      { task: 'Audit transaction monitoring alerts and outcomes', owner: 'Compliance Analyst', duration: '1-2 days' },
                      { task: 'Update risk assessment with new findings', owner: 'Risk Manager', duration: '1 day' },
                      { task: 'Verify all licenses are current and renewals scheduled', owner: 'Compliance Officer', duration: '2-4 hours' },
                      { task: 'Conduct staff training on new requirements', owner: 'HR + Compliance', duration: '1-2 days' },
                      { task: 'Review and update policies and procedures', owner: 'Legal Counsel', duration: '2-3 days' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${highContrast ? 'text-black' : 'text-gold-600'}`} />
                        <div className="flex-1">
                          <span className={`text-xs sm:text-sm ${highContrast ? 'text-black' : 'text-navy-700'}`}>{item.task}</span>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-navy-400">⏱️ {item.duration}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${highContrast ? 'bg-yellow-200 text-yellow-900' : 'bg-gold-100 text-gold-700'}`}>
                              👤 {item.owner}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ============================================
                    SUCCESS METRICS & TRACKING - NEW
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-indigo-100 border-indigo-900' : 'bg-indigo-50 border-indigo-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base ${highContrast ? 'text-indigo-900' : 'text-indigo-800'}`}>
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    How to Track Your Progress
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3 text-center">
                    <div className={`p-2 rounded-lg ${highContrast ? 'bg-indigo-200' : 'bg-indigo-100'}`}>
                      <p className="text-xs font-semibold text-indigo-800">Week 1 Milestone</p>
                      <p className="text-[10px] text-indigo-700">Legal counsel engaged</p>
                      <div className="mt-1 w-full h-1 bg-indigo-200 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-indigo-600 rounded-full transition-all duration-500" id="milestone-1" />
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${highContrast ? 'bg-indigo-200' : 'bg-indigo-100'}`}>
                      <p className="text-xs font-semibold text-indigo-800">Month 1 Milestone</p>
                      <p className="text-[10px] text-indigo-700">Applications submitted</p>
                      <div className="mt-1 w-full h-1 bg-indigo-200 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-indigo-600 rounded-full transition-all duration-500" id="milestone-2" />
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${highContrast ? 'bg-indigo-200' : 'bg-indigo-100'}`}>
                      <p className="text-xs font-semibold text-indigo-800">Month 3 Milestone</p>
                      <p className="text-[10px] text-indigo-700">Compliance operational</p>
                      <div className="mt-1 w-full h-1 bg-indigo-200 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-indigo-600 rounded-full transition-all duration-500" id="milestone-3" />
                      </div>
                    </div>
                  </div>
                  <div className={`mt-3 pt-3 border-t ${highContrast ? 'border-indigo-900' : 'border-indigo-200'}`}>
                    <p className="text-[10px] text-indigo-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Tip: Create a shared tracking spreadsheet and review progress weekly with your team.
                    </p>
                  </div>
                </div>

                {/* ============================================
                    CONSULTATION CTA - NEW
                    ============================================ */}
                <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 ${highContrast ? 'bg-teal-100 border-teal-900' : 'bg-teal-50 border-teal-200'}`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${highContrast ? 'bg-teal-200' : 'bg-teal-100'}`}>
                        <CalendarCheck className={`w-5 h-5 ${highContrast ? 'text-teal-900' : 'text-teal-700'}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold text-sm sm:text-base ${highContrast ? 'text-teal-900' : 'text-teal-800'}`}>
                          Need Help Executing This Plan?
                        </h4>
                        <p className={`text-xs ${highContrast ? 'text-teal-800' : 'text-teal-700'} mt-1`}>
                          Your report purchase includes a free 30-minute consultation to review this action plan,
                          get introductions to vetted partners, and answer your specific questions.
                        </p>
                      </div>
                    </div>
                    <a 
                      href={`/consultation?report_id=${report?.id}&utm_source=report&utm_medium=next_steps`}
                      className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${highContrast ? 'bg-teal-800 text-white hover:bg-teal-900' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Schedule Your Free Consultation
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className={`border-t px-3 sm:px-8 py-3 sm:py-4 ${highContrast ? 'border-black bg-gray-100' : 'border-slate-200 bg-navy-50/50'} print:bg-white print:border-black`}>
            <p className={`text-[10px] sm:text-xs text-center ${highContrast ? 'text-black' : 'text-navy-500'}`}>
              DISCLAIMER: This {isMultiState ? 'multi-state' : '10-page'} report provides regulatory intelligence and educational guidance based on AI analysis and human review. 
              Veridian Group is not a law firm. All compliance recommendations should be reviewed with qualified legal counsel in {isMultiState ? 'all applicable jurisdictions' : report?.state || 'your state' } before implementation. Regulations are subject to change without notice.
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