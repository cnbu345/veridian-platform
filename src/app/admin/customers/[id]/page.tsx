// src/app/admin/customers/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  FileText,
  MessageSquare,
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  DollarSign,
  Edit2,
  Save,
  X,
  Download,
  Share2,
  MoreVertical,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Video,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  LifeBuoy,
  MessageCircle,
  User,
  Layout
} from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { id } from 'zod/v4/locales'

interface CustomerDetail {
  id: string
  company_name: string
  contact_name: string
  email: string
  health_score: number
  risk_level: 'healthy' | 'moderate' | 'at_risk'
  last_login: string
  report_count: number
  support_tickets: number
  nps_score?: number
  csat_score?: number
  churn_probability: number
  expansion_opportunity: string[]
  subscription_tier: string
  mrr: number
  last_feedback_date?: string
  feedback_trend?: 'improving' | 'declining' | 'stable'
  feature_requests?: string[]
  notes?: string
  created_at: string
  phone?: string
}

interface Consultation {
  id: string
  consultation_date: string
  consultation_type: string
  status: string
  meeting_link?: string
}

interface Report {
  id: string
  created_at: string
  status: string
  company_name: string
}

interface SupportTicket {
  id: string
  ticket_number: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  created_at: string
  updated_at: string
  assigned_to?: string
  messages?: SupportMessage[]
}

interface SupportMessage {
  id: string
  message: string
  created_at: string
  user_id: string
  is_internal: boolean
  users?: {
    full_name: string
    email: string
    is_admin: boolean
  }
}

interface ClientTemplate {
  id: string
  name: string
  description: string
  logo_url: string | null
  styles: {
    primary_color: string
    secondary_color: string
    font_family: string
    show_logo: boolean
    show_page_numbers: boolean
  }
  sections: {
    id: string
    name: string
    type: string
    is_visible: boolean
  }[]
  is_default: boolean
  created_at: string
  updated_at: string
  usage_count: number
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editedNotes, setEditedNotes] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Action states
  const [sendingEmail, setSendingEmail] = useState(false)
  const [schedulingConsultation, setSchedulingConsultation] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([])
  
  // Support ticket states
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [ticketStats, setTicketStats] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0
  })
  
  // Client templates states
  const [clientTemplates, setClientTemplates] = useState<ClientTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  
  // Form states
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [consultationDate, setConsultationDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"))
  const [consultationType, setConsultationType] = useState('discovery')
  const [consultationNotes, setConsultationNotes] = useState('')
  const [reportReason, setReportReason] = useState('')

  const customerId = params?.id as string

  useEffect(() => {
    if (customerId && customerId !== 'undefined') {
      fetchCustomerDetail()
      fetchRecentActivity()
      fetchSupportTickets()
      fetchClientTemplates()
    } else {
      setError('Invalid customer ID')
      setLoading(false)
    }
  }, [customerId])

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/customers/${customerId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customer')
      }
      
      setCustomer({
        id: data.user.id,
        company_name: data.user.company_name || 'Unknown Company',
        contact_name: data.user.full_name || 'Unknown Contact',
        email: data.user.email,
        phone: data.user.phone,
        health_score: data.health?.health_score || 50,
        risk_level: data.health?.risk_level || 'moderate',
        last_login: data.user.last_login || data.user.created_at,
        report_count: data.health?.report_count || 0,
        support_tickets: data.health?.support_tickets || 0,
        nps_score: data.health?.nps_score,
        csat_score: data.health?.csat_score,
        churn_probability: data.health?.churn_probability || 0.5,
        expansion_opportunity: data.health?.expansion_opportunity || [],
        subscription_tier: data.user.subscription_tier || 'free',
        mrr: 0,
        last_feedback_date: data.health?.last_feedback_date,
        feedback_trend: data.health?.feedback_trend,
        feature_requests: data.health?.feature_requests,
        notes: data.health?.notes,
        created_at: data.user.created_at
      })
      setEditedNotes(data.health?.notes || '')
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      setError(error instanceof Error ? error.message : 'Failed to load customer')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent reports
      const reportsResponse = await fetch(`/api/admin/customers/${customerId}/reports?limit=3`)
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setRecentReports(reportsData)
      }

      // Fetch recent consultations
      const consultationsResponse = await fetch(`/api/admin/customers/${customerId}/consultations?limit=3`)
      if (consultationsResponse.ok) {
        const consultationsData = await consultationsResponse.json()
        setRecentConsultations(consultationsData)
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  }

  const fetchSupportTickets = async () => {
    try {
      setLoadingTickets(true)
      const response = await fetch(`/api/admin/customers/${customerId}/support-tickets`)
      const data = await response.json()
      
      if (response.ok) {
        setSupportTickets(data.tickets || [])
        setTicketStats(data.stats || {
          open: 0,
          inProgress: 0,
          resolved: 0,
          urgent: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch support tickets:', error)
    } finally {
      setLoadingTickets(false)
    }
  }

  const fetchClientTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const response = await fetch(`/api/admin/customers/${customerId}/templates`)
      const data = await response.json()
      
      if (response.ok) {
        setClientTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch client templates:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`)
      const data = await response.json()
      
      if (response.ok) {
        setSelectedTicket(data.ticket)
      }
    } catch (error) {
      console.error('Failed to fetch ticket details:', error)
      toast.error('Failed to load ticket details')
    }
  }

  const saveNotes = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          health: { notes: editedNotes }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save notes')
      }
      
      setEditing(false)
      fetchCustomerDetail()
      toast.success('Notes saved successfully')
    } catch (error) {
      console.error('Failed to save notes:', error)
      toast.error('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  // EMAIL ACTION
  const handleSendEmail = async () => {
    try {
      setSendingEmail(true)
      
      const response = await fetch('/api/admin/communications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer?.email,
          subject: emailSubject || `Message from Veridian Group`,
          body: emailBody || generateDefaultEmail(),
          customerId: customer?.id,
          type: 'general'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send email')
      }

      toast.success(`Email sent to ${customer?.email}`)
      setShowEmailModal(false)
      setEmailSubject('')
      setEmailBody('')
    } catch (error) {
      console.error('Failed to send email:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  const generateDefaultEmail = () => {
    return `Dear ${customer?.contact_name},

I hope this email finds you well. I'm reaching out from Veridian Group to check in on your experience with our platform.

${customer?.health_score && customer.health_score < 50 
  ? "I noticed you've been experiencing some challenges. I'd love to schedule a quick call to see how we can help."
  : "I wanted to touch base and see if there's anything we can assist you with regarding your compliance needs."
}

Please don't hesitate to reach out if you have any questions or need support.

Best regards,
The Veridian Group Team`
  }

  // SCHEDULE CONSULTATION ACTION
  const handleScheduleConsultation = async () => {
    try {
      setSchedulingConsultation(true)
      
      const response = await fetch('/api/admin/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: customerId,
          customer_name: customer?.contact_name,
          company_name: customer?.company_name,
          customer_email: customer?.email,
          customer_phone: customer?.phone || '',
          consultation_date: consultationDate,
          duration_minutes: 30,
          consultation_type: consultationType,
          notes: consultationNotes,
          status: 'scheduled'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to schedule consultation')
      }

      const newConsultation = await response.json()
      
      toast.success(`Consultation scheduled for ${format(new Date(consultationDate), 'MMM d, yyyy h:mm a')}`)
      setShowScheduleModal(false)
      resetConsultationForm()
      
      // Send confirmation email automatically
      await sendConfirmationEmail(newConsultation)
      
      // Refresh recent consultations
      fetchRecentActivity()
    } catch (error) {
      console.error('Failed to schedule consultation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to schedule consultation')
    } finally {
      setSchedulingConsultation(false)
    }
  }

  const sendConfirmationEmail = async (consultation: any) => {
    try {
      await fetch('/api/admin/communications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer?.email,
          subject: 'Your Consultation with Veridian Group is Confirmed',
          type: 'consultation_confirmation',
          consultationId: consultation.id
        })
      })
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
    }
  }

  const resetConsultationForm = () => {
    setConsultationDate(format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"))
    setConsultationType('discovery')
    setConsultationNotes('')
  }

  // GENERATE REPORT ACTION
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true)
      
      // Check if customer has available report credits
      const creditsResponse = await fetch(`/api/admin/customers/${customerId}/credits`)
      const creditsData = await creditsResponse.json()
      
      if (creditsData.remainingCredits <= 0 && customer?.subscription_tier !== 'enterprise') {
        toast.error('Customer has no report credits remaining')
        return
      }
      
      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: customerId,
          company_name: customer?.company_name,
          reason: reportReason || 'Admin requested report',
          force_generate: true,
          bypass_credit_check: customer?.subscription_tier === 'enterprise'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate report')
      }

      const report = await response.json()
      
      toast.success('Report generation started')
      setShowReportModal(false)
      setReportReason('')
      
      // Refresh recent reports
      fetchRecentActivity()
      
      if (report.id) {
        window.open(`/admin/reports/${report.id}`, '_blank')
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  // SUPPORT TICKET ACTIONS
  const handleViewTicket = async (ticket: SupportTicket) => {
    await fetchTicketDetails(ticket.id)
    setShowTicketModal(true)
  }

  const handleSendMessage = async (ticketId: string) => {
    if (!newMessage.trim()) return
    
    try {
      setSendingMessage(true)
      
      const response = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          is_internal: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Refresh ticket details
      await fetchTicketDetails(ticketId)
      setNewMessage('')
      toast.success('Message sent')
      
      // Refresh ticket list
      fetchSupportTickets()
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update ticket')
      }

      toast.success(`Ticket status updated to ${status.replace('_', ' ')}`)
      
      // Refresh data
      fetchSupportTickets()
      if (selectedTicket?.id === ticketId) {
        await fetchTicketDetails(ticketId)
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
      toast.error('Failed to update ticket status')
    }
  }

  // Helper functions for styling
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'healthy':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Healthy</span>
      case 'moderate':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">Moderate</span>
      case 'at_risk':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">At Risk</span>
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-slate-100 text-slate-800 border-slate-200'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'normal': return <MessageCircle className="w-4 h-4 text-blue-600" />
      case 'low': return <MessageCircle className="w-4 h-4 text-green-600" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getSectionName = (type: string): string => {
    const sectionNames: Record<string, string> = {
      cover: 'Cover',
      header: 'Header',
      executive_summary: 'Executive Summary',
      client_input: 'Client Input',
      location_analysis: 'Location Analysis',
      regulatory_analysis: 'Regulatory Analysis',
      talent_analysis: 'Talent Analysis',
      licensing_matrix: 'Licensing',
      compliance_roadmap: 'Roadmap',
      technology_tools: 'Technology',
      risk_assessment: 'Risk',
      budget_guide: 'Budget',
      next_steps: 'Next Steps',
      footer: 'Footer',
      disclaimer: 'Disclaimer'
    }
    return sectionNames[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-navy-900 mb-2">Error Loading Customer</h2>
        <p className="text-navy-600 mb-4">{error || 'Customer not found'}</p>
        <Link 
          href="/admin/customers" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-navy-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">{customer.company_name}</h1>
            <p className="text-navy-600 mt-1">Customer Profile • {customer.contact_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-navy-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-navy-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 text-navy-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column - Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-navy-900 mb-4">Company Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-navy-400" />
                    <span className="text-navy-600">Company:</span>
                    <span className="font-medium text-navy-900">{customer.company_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-navy-400" />
                    <span className="text-navy-600">Email:</span>
                    <span className="font-medium text-navy-900">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-navy-600">Phone:</span>
                      <span className="font-medium text-navy-900">{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-navy-400" />
                    <span className="text-navy-600">Customer Since:</span>
                    <span className="font-medium text-navy-900">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-navy-400" />
                    <span className="text-navy-600">Last Login:</span>
                    <span className="font-medium text-navy-900">
                      {new Date(customer.last_login).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {getRiskBadge(customer.risk_level)}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(customer.health_score)}`}>
                  Health Score: {customer.health_score}
                </div>
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Health Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-navy-500 mb-1">Health Score</div>
                <div className={`text-2xl font-bold ${
                  customer.health_score >= 80 ? 'text-green-600' :
                  customer.health_score >= 50 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {customer.health_score}
                </div>
              </div>
              <div>
                <div className="text-sm text-navy-500 mb-1">Churn Probability</div>
                <div className="text-2xl font-bold text-navy-900">
                  {(customer.churn_probability * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-navy-500 mb-1">Reports</div>
                <div className="text-2xl font-bold text-navy-900">{customer.report_count}</div>
              </div>
              <div>
                <div className="text-sm text-navy-500 mb-1">Support Tickets</div>
                <div className="text-2xl font-bold text-navy-900">{customer.support_tickets}</div>
              </div>
            </div>
            
            {/* NPS/CSAT Scores */}
            {(customer.nps_score || customer.csat_score) && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  {customer.nps_score && (
                    <div>
                      <div className="text-sm text-navy-500 mb-1">NPS Score</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-navy-900">{customer.nps_score}</span>
                        {customer.nps_score >= 9 ? (
                          <ThumbsUp className="w-4 h-4 text-green-600" />
                        ) : customer.nps_score <= 6 ? (
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                        ) : null}
                      </div>
                    </div>
                  )}
                  {customer.csat_score && (
                    <div>
                      <div className="text-sm text-navy-500 mb-1">CSAT Score</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-navy-900">{customer.csat_score}</span>
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feedback Insights */}
            {(customer.last_feedback_date || customer.feedback_trend) && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-md font-semibold text-navy-900 mb-3">Feedback Insights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {customer.last_feedback_date && (
                    <div>
                      <div className="text-sm text-navy-500">Last Feedback</div>
                      <div className="font-medium text-navy-900">
                        {new Date(customer.last_feedback_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {customer.feedback_trend && (
                    <div>
                      <div className="text-sm text-navy-500">Trend</div>
                      <div className={`font-medium flex items-center gap-1 ${
                        customer.feedback_trend === 'improving' ? 'text-green-600' :
                        customer.feedback_trend === 'declining' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {customer.feedback_trend === 'improving' && <TrendingUp className="w-4 h-4" />}
                        {customer.feedback_trend === 'declining' && <TrendingDown className="w-4 h-4" />}
                        {customer.feedback_trend === 'stable' && '→'}
                        <span className="capitalize">{customer.feedback_trend}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feature Requests */}
            {customer.feature_requests && customer.feature_requests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-md font-semibold text-navy-900 mb-3">Feature Requests</h3>
                <div className="flex flex-wrap gap-2">
                  {customer.feature_requests.map((request, index) => (
                    <span key={index} className="px-3 py-1 bg-gold-50 text-gold-700 rounded-full text-sm">
                      {request}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Notes</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveNotes}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditedNotes(customer.notes || '')
                    }}
                    className="p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-navy-400" />
                  </button>
                </div>
              )}
            </div>
            
            {editing ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                placeholder="Add notes about this customer..."
              />
            ) : (
              <p className="text-navy-700">
                {customer.notes || 'No notes added yet.'}
              </p>
            )}
          </div>

          {/* Expansion Opportunities */}
          {customer.expansion_opportunity && customer.expansion_opportunity.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Expansion Opportunities</h2>
              <div className="space-y-2">
                {customer.expansion_opportunity.map((opp, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-navy-700">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Recent Activity</h2>
            
            {/* Recent Reports */}
            {recentReports.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-navy-500 mb-2">Recent Reports</h3>
                <div className="space-y-2">
                  {recentReports.map(report => (
                    <div key={report.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-navy-400" />
                        <span className="text-navy-700">Report generated {format(parseISO(report.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        report.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Consultations */}
            {recentConsultations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-navy-500 mb-2">Recent Consultations</h3>
                <div className="space-y-2">
                  {recentConsultations.map(consultation => (
                    <div key={consultation.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-navy-400" />
                        <span className="text-navy-700">
                          {format(parseISO(consultation.consultation_date), 'MMM d, yyyy')} - {consultation.consultation_type}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        consultation.status === 'completed' ? 'bg-green-100 text-green-700' :
                        consultation.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {consultation.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentReports.length === 0 && recentConsultations.length === 0 && (
              <p className="text-sm text-navy-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Sidebar - Right 1/3 */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Subscription</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-navy-500">Plan</div>
                <div className="font-medium text-navy-900 capitalize">
                  {customer.subscription_tier}
                </div>
              </div>
              <div>
                <div className="text-sm text-navy-500">Monthly Recurring Revenue</div>
                <div className="font-medium text-navy-900">
                  ${customer.mrr.toLocaleString()}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-sm text-navy-500 mb-1">Report Credits</div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-navy-900">
                    {customer.subscription_tier === 'enterprise' ? 'Unlimited' : '5 remaining'}
                  </span>
                  {customer.subscription_tier !== 'enterprise' && (
                    <span className="text-xs text-amber-600">Resets in 12 days</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {/* Send Email Button */}
              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-navy-600 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-navy-900 block">Send Email</span>
                  <span className="text-xs text-navy-400">Contact customer directly</span>
                </div>
              </button>

              {/* Schedule Consultation Button */}
              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-navy-600 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Video className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-navy-900 block">Schedule Consultation</span>
                  <span className="text-xs text-navy-400">Set up a meeting</span>
                </div>
              </button>

              {/* Generate Report Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-navy-600 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-navy-900 block">Generate Report</span>
                  <span className="flex items-center gap-1 text-xs">
                    {customer.subscription_tier === 'enterprise' ? (
                      <span className="text-green-600">Unlimited • Free</span>
                    ) : (
                      <>
                        <span className="text-navy-400">Uses 1 credit • </span>
                        <span className="text-amber-600">5 remaining</span>
                      </>
                    )}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* SUPPORT TICKETS SECTION */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Support Tickets</h2>
              <Link 
                href={`/admin/support?user=${customerId}`}
                className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1"
              >
                View All
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            
            {/* Ticket Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Open</p>
                <p className="text-xl font-bold text-blue-700">{ticketStats.open}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-amber-600 mb-1">In Progress</p>
                <p className="text-xl font-bold text-amber-700">{ticketStats.inProgress}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-green-600 mb-1">Resolved</p>
                <p className="text-xl font-bold text-green-700">{ticketStats.resolved}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-red-600 mb-1">Urgent</p>
                <p className="text-xl font-bold text-red-700">{ticketStats.urgent}</p>
              </div>
            </div>
            
            {/* Recent Tickets List */}
            {loadingTickets ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-600"></div>
              </div>
            ) : supportTickets.length > 0 ? (
              <div className="space-y-3">
                {supportTickets.slice(0, 3).map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => handleViewTicket(ticket)}
                    className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-navy-500 mt-0.5">
                          {ticket.ticket_number}
                        </p>
                      </div>
                      {getPriorityIcon(ticket.priority)}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-navy-400">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {supportTickets.length > 3 && (
                  <button
                    onClick={() => window.open(`/admin/support?user=${customerId}`, '_blank')}
                    className="w-full text-center text-sm text-gold-600 hover:text-gold-700 py-2"
                  >
                    View all {supportTickets.length} tickets
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <LifeBuoy className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                <p className="text-sm text-navy-500">No support tickets</p>
                <Link
                  href={`/admin/support/new?user=${customerId}`}
                  className="inline-block mt-2 text-xs text-gold-600 hover:text-gold-700"
                >
                  Create Ticket
                </Link>
              </div>
            )}
          </div>

          {/* CLIENT TEMPLATES SECTION */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Report Templates</h2>
              {(customer.subscription_tier === 'monthly' || customer.subscription_tier === 'custom') ? (
                <span className="px-2 py-1 bg-gold-50 text-gold-700 rounded-full text-xs font-medium">
                  Enterprise Feature
                </span>
              ) : (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                  Upgrade to Enterprise
                </span>
              )}
            </div>
            
            {loadingTemplates ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-600"></div>
              </div>
            ) : clientTemplates.length > 0 ? (
              <div className="space-y-4">
                {/* Default Template Badge */}
                {clientTemplates.some(t => t.is_default) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Active Template</span>
                      <span className="text-xs text-green-600 ml-auto">
                        {clientTemplates.find(t => t.is_default)?.name || 'Default Template'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Template List */}
                <div className="space-y-3">
                  {clientTemplates.slice(0, 3).map(template => (
                    <div 
                      key={template.id}
                      className={`p-4 rounded-xl border transition-all ${
                        template.is_default 
                          ? 'border-gold-200 bg-gold-50/30' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-navy-900">{template.name}</h3>
                            {template.is_default && (
                              <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-xs text-navy-500 mt-1">{template.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => window.open(`/admin/customers/${customerId}/templates/${template.id}`, '_blank')}
                          className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Template Preview */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-1 text-xs text-navy-500">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: template.styles?.primary_color || '#0A1A2F' }}
                            />
                            <span>Primary</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-navy-500">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: template.styles?.secondary_color || '#D4AF37' }}
                            />
                            <span>Accent</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-navy-500">
                            <span className="text-navy-400">•</span>
                            <span>{template.styles?.font_family || 'Inter'}</span>
                          </div>
                        </div>
                        
                        {/* Logo Preview */}
                        {template.logo_url && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-xs text-navy-500">Logo:</div>
                            <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden">
                              <img src={template.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                            </div>
                          </div>
                        )}
                        
                        {/* Sections Summary */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-navy-500">
                            <span>Sections</span>
                            <span>{template.sections?.filter(s => s.is_visible).length || 0} visible</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.sections?.filter(s => s.is_visible).slice(0, 4).map(section => (
                              <span key={section.id} className="text-xs bg-slate-100 text-navy-600 px-2 py-0.5 rounded">
                                {getSectionName(section.type)}
                              </span>
                            ))}
                            {(template.sections?.filter(s => s.is_visible).length || 0) > 4 && (
                              <span className="text-xs text-navy-400">
                                +{(template.sections?.filter(s => s.is_visible).length || 0) - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Template Metadata */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-navy-400">
                          <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Updated {new Date(template.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {clientTemplates.length > 3 && (
                  <button
                    onClick={() => window.open(`/admin/customers/${customerId}/templates`, '_blank')}
                    className="w-full text-center text-sm text-gold-600 hover:text-gold-700 py-2 border-t border-slate-200 pt-3"
                  >
                    View all {clientTemplates.length} templates
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Layout className="w-6 h-6 text-navy-400" />
                </div>
                <p className="text-sm text-navy-500">No custom templates created</p>
                {(customer.subscription_tier === 'monthly' || customer.subscription_tier === 'custom') ? (
                  <p className="text-xs text-navy-400 mt-1">Enterprise clients can create branded templates</p>
                ) : (
                  <Link
                    href={`/admin/customers/${customerId}/upgrade`}
                    className="inline-block mt-2 text-xs text-gold-600 hover:text-gold-700"
                  >
                    Upgrade to Enterprise
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Activity Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-600">Total Reports</span>
                <span className="font-medium text-navy-900">{customer.report_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-600">Support Tickets</span>
                <span className="font-medium text-navy-900">{supportTickets.length}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100">
                <span className="text-blue-600">Open: {ticketStats.open}</span>
                <span className="text-amber-600">In Progress: {ticketStats.inProgress}</span>
                <div className="relative group">
                  <span className="text-red-600 flex items-center gap-1 cursor-help">
                    <AlertCircle className="w-3 h-3" />
                    Urgent: {ticketStats.urgent}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 min-w-[300px] p-3 bg-navy-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                    <p className="font-medium mb-1">⚠️ Urgent Tickets</p>
                    <p className="text-navy-200 leading-relaxed">
                      Tickets that are reopened or marked as high priority require immediate attention.
                    </p>
                    <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-navy-900 transform rotate-45"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-600">Consultations</span>
                <span className="font-medium text-navy-900">{recentConsultations.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-600">Templates</span>
                <span className="font-medium text-navy-900">{clientTemplates.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-navy-900">Send Email to {customer.contact_name}</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">To</label>
                <input
                  type="email"
                  value={customer.email}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-navy-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Email Templates */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-navy-700 mb-2">Quick Templates</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEmailSubject(`Checking in with ${customer.company_name}`)
                      setEmailBody(generateDefaultEmail())
                    }}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-navy-600 hover:bg-slate-100"
                  >
                    Standard Check-in
                  </button>
                  <button
                    onClick={() => {
                      setEmailSubject(`Following up on your recent report`)
                      setEmailBody(`Dear ${customer.contact_name},\n\nI wanted to follow up on the report you generated recently. Do you have any questions about the findings?\n\nBest regards,\nThe Veridian Team`)
                    }}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-navy-600 hover:bg-slate-100"
                  >
                    Report Follow-up
                  </button>
                  <button
                    onClick={() => {
                      setEmailSubject(`Special offer for ${customer.company_name}`)
                      setEmailBody(`Dear ${customer.contact_name},\n\nWe have a special upgrade offer for you. Would you be interested in learning more about our enterprise features?\n\nBest regards,\nThe Veridian Team`)
                    }}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-navy-600 hover:bg-slate-100"
                  >
                    Upgrade Offer
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 disabled:opacity-50 flex items-center gap-2"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Consultation Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy-900">Schedule Consultation</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Customer</label>
                <input
                  type="text"
                  value={`${customer.contact_name} (${customer.company_name})`}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-navy-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={consultationDate}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Consultation Type</label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="discovery">Discovery Call (30 min)</option>
                  <option value="strategy">Strategy Session (60 min)</option>
                  <option value="compliance">Compliance Check (45 min)</option>
                  <option value="technical">Technical Review (60 min)</option>
                  <option value="enterprise">Enterprise Strategy (90 min)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Notes (optional)</label>
                <textarea
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes or agenda items..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Confirmation email will be sent automatically</p>
                    <p>The customer will receive a calendar invitation with meeting details.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleConsultation}
                disabled={schedulingConsultation}
                className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 disabled:opacity-50 flex items-center gap-2"
              >
                {schedulingConsultation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy-900">Generate Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Company</label>
                <input
                  type="text"
                  value={customer.company_name}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-navy-600"
                />
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Credit Usage</p>
                    {customer.subscription_tier === 'enterprise' ? (
                      <p>Enterprise plan - unlimited reports at no cost</p>
                    ) : (
                      <p>This will use 1 report credit. Customer has 5 credits remaining.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Reason for generating (optional)
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={3}
                  placeholder="e.g., Customer requested update, following up on consultation, etc."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              {/* Recent Reports Warning */}
              {recentReports.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-navy-500">
                    Last report generated: {format(parseISO(recentReports[0].created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 disabled:opacity-50 flex items-center gap-2"
              >
                {generatingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-navy-900">Ticket #{selectedTicket.ticket_number}</h2>
                <p className="text-sm text-navy-500 mt-1">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Ticket Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Status</p>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                    className={`text-sm font-medium rounded-lg px-2 py-1 border ${getStatusColor(selectedTicket.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Priority</p>
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(selectedTicket.priority)}
                    <span className="text-sm font-medium capitalize">{selectedTicket.priority}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Category</p>
                  <p className="text-sm font-medium capitalize">{selectedTicket.category || 'General'}</p>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Created</p>
                  <p className="text-sm font-medium">{new Date(selectedTicket.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Messages */}
              <div>
                <h3 className="text-sm font-medium text-navy-700 mb-3">Conversation</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-slate-50 rounded-lg">
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.is_internal ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] ${message.is_internal ? 'mr-auto' : 'ml-auto'}`}>
                          <div className={`rounded-lg p-3 ${
                            message.is_internal 
                              ? 'bg-white border border-slate-200' 
                              : 'bg-gold-600 text-white'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-navy-400">
                            <span>{message.users?.full_name || (message.is_internal ? 'Support Agent' : 'Customer')}</span>
                            <span>•</span>
                            <span>{new Date(message.created_at).toLocaleString()}</span>
                            {message.is_internal && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Internal
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-navy-400 py-4">No messages yet</p>
                  )}
                </div>
              </div>
              
              {/* Reply Box */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Add Reply (Internal)
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    placeholder="Type your internal note or reply..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => setNewMessage('')}
                    className="px-3 py-1 text-sm text-navy-600 hover:text-navy-900"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handleSendMessage(selectedTicket.id)}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {sendingMessage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Internal Note
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}