// src/app/admin/customers/enterprise/builder/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Send,
  Download,
  Copy,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Shield,
  Clock,
  FileText,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Archive,
  CheckCircle,
  XCircle,
  Briefcase,
  ArrowLeft,
  Save,
  Crown,
  Printer,
  Share2,
  Pencil,
  Trash,
  ExternalLink,
  Loader
} from 'lucide-react'
import Link from 'next/link'
import { format, addDays } from 'date-fns'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

interface EnterpriseLead {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  company_size: string | null
  message: string | null
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'closed_won' | 'closed_lost'
  created_at: string
  assigned_to: string | null
}

interface EnterpriseTier {
  id: string
  name: string
  price: number
  period: string
  features: {
    reports: string
    team_seats: string
    api_calls: string
    states: string
    strategy_calls: string
    white_label: boolean
    dedicated_am: boolean
    sla: string
    integrations: string
  }
}

interface AddOn {
  id: string
  name: string
  description: string | null
  price: number
  price_type: 'one-time' | 'monthly' | 'yearly'
  category: string | null
  features: string[] | null
}

interface SelectedAddOn extends AddOn {
  quantity: number
}

interface EnterpriseQuote {
  id: string
  quoteNumber: string
  createdAt: string
  expiresAt: string
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'converted'
  customer: {
    companyName: string
    contactName: string
    email: string
  }
  package: {
    tierName: string
    tierId: string
    basePrice: number
    addOns: SelectedAddOn[]
    addOnsTotal: number
    discountPercent: number
    discountAmount: number
    subtotal: number
    total: number
  }
  notes?: string
}

interface QuoteSummary {
  baseTier: EnterpriseTier | null
  basePrice: number
  addOns: SelectedAddOn[]
  addOnsTotal: number
  subtotal: number
  discountPercent: number
  discountAmount: number
  total: number
  customerEmail: string
  customerName: string
  companyName: string
  notes: string
}

export default function EnterpriseBuilderPage() {
  const [activeTab, setActiveTab] = useState<'leads' | 'builder' | 'quotes'>('leads')
  const [leads, setLeads] = useState<EnterpriseLead[]>([])
  const [quotes, setQuotes] = useState<EnterpriseQuote[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<EnterpriseLead | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<EnterpriseQuote | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null)
  const [editingQuote, setEditingQuote] = useState<EnterpriseQuote | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all')
  const [quoteSummary, setQuoteSummary] = useState<QuoteSummary>({
    baseTier: null,
    basePrice: 0,
    addOns: [],
    addOnsTotal: 0,
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    total: 0,
    customerEmail: '',
    customerName: '',
    companyName: '',
    notes: ''
  })

  const searchParams = useSearchParams()
  const leadId = searchParams.get('lead')

  // Set active tab based on URL parameter and highlight lead
  useEffect(() => {
    if (leadId) {
        setActiveTab('leads')
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
        const leadElement = document.getElementById(`lead-${leadId}`)
        if (leadElement) {
            leadElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            leadElement.classList.add('ring-4', 'ring-gold-500', 'ring-opacity-50', 'bg-gold-50')
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
            leadElement.classList.remove('ring-4', 'ring-gold-500', 'ring-opacity-50', 'bg-gold-50')
            }, 3000)
        }
        }, 500)
    }
  }, [leadId])

  // Predefined enterprise tiers
  const enterpriseTiers: EnterpriseTier[] = [
    {
      id: 'enterprise-lite',
      name: 'Enterprise Lite',
      price: 24997,
      period: 'yearly',
      features: {
        reports: '25 reports/year',
        team_seats: '20 team members',
        api_calls: '10K API calls',
        states: 'Up to 5 states',
        strategy_calls: 'Quarterly strategy calls',
        white_label: false,
        dedicated_am: false,
        sla: '99.5%',
        integrations: 'No custom integrations'
      }
    },
    {
      id: 'enterprise-pro',
      name: 'Enterprise Pro',
      price: 49997,
      period: 'yearly',
      features: {
        reports: '75 reports/year',
        team_seats: '50 team members',
        api_calls: '50K API calls',
        states: 'Up to 15 states',
        strategy_calls: 'Monthly strategy calls',
        white_label: true,
        dedicated_am: false,
        sla: '99.9%',
        integrations: '2 custom integrations'
      }
    },
    {
      id: 'enterprise-unlimited',
      name: 'Enterprise Unlimited',
      price: 99997,
      period: 'yearly',
      features: {
        reports: 'Unlimited reports',
        team_seats: 'Unlimited team members',
        api_calls: 'Unlimited API calls',
        states: 'All 50 states',
        strategy_calls: 'Weekly strategy calls',
        white_label: true,
        dedicated_am: true,
        sla: '99.99%',
        integrations: 'Unlimited custom integrations'
      }
    }
  ]

  // Predefined add-ons
  const defaultAddOns: AddOn[] = [
    {
      id: 'addon-reports-25',
      name: 'Additional 25 Reports',
      description: 'Add 25 more reports per year',
      price: 9997,
      price_type: 'yearly',
      category: 'reports',
      features: ['25 additional reports', 'Same 24-hour delivery']
    },
    {
      id: 'addon-seats-10',
      name: 'Additional 10 Team Seats',
      description: 'Add 10 more team members',
      price: 2497,
      price_type: 'yearly',
      category: 'team',
      features: ['10 additional users', 'Team management dashboard']
    },
    {
      id: 'addon-integration',
      name: 'Custom Integration',
      description: 'Build custom integration with your systems',
      price: 7997,
      price_type: 'one-time',
      category: 'integrations',
      features: ['Custom API endpoints', 'Webhook configuration', 'Integration documentation']
    },
    {
      id: 'addon-international',
      name: 'Multi-National Coverage',
      description: 'Add international regulatory analysis',
      price: 4997,
      price_type: 'yearly',
      category: 'coverage',
      features: ['1 additional country', 'Local regulatory experts', 'Translated reports']
    },
    {
      id: 'addon-historical',
      name: 'Historical Data Access',
      description: 'Full archive access',
      price: 3997,
      price_type: 'one-time',
      category: 'data',
      features: ['All historical reports', 'Data export', 'Custom date ranges']
    },
    {
      id: 'addon-dashboard',
      name: 'Custom Dashboard',
      description: 'Build custom analytics dashboard',
      price: 14997,
      price_type: 'one-time',
      category: 'development',
      features: ['Custom metrics', 'Real-time updates', 'White-labeled']
    },
    {
      id: 'addon-training',
      name: 'On-site Training',
      description: 'Full-day on-site team training',
      price: 5997,
      price_type: 'one-time',
      category: 'training',
      features: ['Up to 20 attendees', 'Custom curriculum', 'Follow-up materials']
    }
  ]

  useEffect(() => {
    fetchData()
    setAddOns(defaultAddOns)
    loadSampleQuotes()
  }, [])

  const fetchData = async () => {
    try {
        setLoading(true)
        
        // Fetch real leads from the database
        const leadsResponse = await fetch('/api/admin/enterprise/leads')
        
        if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json()
        console.log('Fetched leads:', leadsData) // Add this for debugging
        setLeads(leadsData.leads || [])
        } else {
        console.error('Failed to fetch leads:', leadsResponse.status)
        // Fallback to mock data if API fails
        setLeads([
            {
            id: '1',
            company_name: 'First Regional Bank',
            contact_name: 'Sarah Mitchell',
            contact_email: 'sarah@firstregional.com',
            contact_phone: '(555) 123-4567',
            company_size: '201-500',
            message: 'Interested in enterprise-wide compliance monitoring for our multi-state operations.',
            status: 'new',
            created_at: new Date().toISOString(),
            assigned_to: null
            }
        ])
        }

        // Load sample quotes
        loadSampleQuotes()
        setAddOns(defaultAddOns)
        
    } catch (error) {
        console.error('Failed to fetch enterprise data:', error)
    } finally {
        setLoading(false)
    }
    }

  const loadSampleQuotes = () => {
    const sampleQuotes: EnterpriseQuote[] = [
      {
        id: 'quote-1',
        quoteNumber: 'ENT-240301',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: addDays(new Date(), 30).toISOString(),
        status: 'sent',
        customer: {
          companyName: 'First Regional Bank',
          contactName: 'Sarah Mitchell',
          email: 'sarah@firstregional.com'
        },
        package: {
          tierName: 'Enterprise Pro',
          tierId: 'enterprise-pro',
          basePrice: 49997,
          addOns: [
            {
              ...defaultAddOns[0],
              quantity: 1
            },
            {
              ...defaultAddOns[3],
              quantity: 2
            }
          ],
          addOnsTotal: 19991,
          discountPercent: 10,
          discountAmount: 0,
          subtotal: 69988,
          total: 62989
        },
        notes: 'Interested in multi-state coverage'
      },
      {
        id: 'quote-2',
        quoteNumber: 'ENT-240302',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        expiresAt: addDays(new Date(), 30).toISOString(),
        status: 'draft',
        customer: {
          companyName: 'Chen & Associates Law',
          contactName: 'James Chen',
          email: 'james@chenlaw.com'
        },
        package: {
          tierName: 'Enterprise Lite',
          tierId: 'enterprise-lite',
          basePrice: 24997,
          addOns: [
            {
              ...defaultAddOns[1],
              quantity: 1
            },
            {
              ...defaultAddOns[4],
              quantity: 1
            }
          ],
          addOnsTotal: 6494,
          discountPercent: 0,
          discountAmount: 0,
          subtotal: 31491,
          total: 31491
        },
        notes: 'Interested in white-label options'
      }
    ]
    setQuotes(sampleQuotes)
  }

  const handleSelectTier = (tier: EnterpriseTier) => {
    setQuoteSummary(prev => {
      const subtotal = tier.price + prev.addOnsTotal
      const total = subtotal * (1 - prev.discountPercent / 100) - prev.discountAmount
      return {
        ...prev,
        baseTier: tier,
        basePrice: tier.price,
        subtotal,
        total
      }
    })
    toast.success(`Selected ${tier.name}`)
  }

  const handleAddAddOn = (addOn: AddOn) => {
    setQuoteSummary(prev => {
      const existingAddOn = prev.addOns.find(a => a.id === addOn.id)
      let newAddOns: SelectedAddOn[]

      if (existingAddOn) {
        newAddOns = prev.addOns.map(a => 
          a.id === addOn.id ? { ...a, quantity: a.quantity + 1 } : a
        )
      } else {
        newAddOns = [...prev.addOns, { ...addOn, quantity: 1 }]
      }

      const addOnsTotal = newAddOns.reduce((sum, a) => sum + (a.price * a.quantity), 0)
      const subtotal = (prev.baseTier?.price || 0) + addOnsTotal
      const total = subtotal * (1 - prev.discountPercent / 100) - prev.discountAmount

      return {
        ...prev,
        addOns: newAddOns,
        addOnsTotal,
        subtotal,
        total
      }
    })
    toast.success(`Added ${addOn.name}`)
  }

  const handleRemoveAddOn = (addOnId: string) => {
    setQuoteSummary(prev => {
      const newAddOns = prev.addOns.filter(a => a.id !== addOnId)
      const addOnsTotal = newAddOns.reduce((sum, a) => sum + (a.price * a.quantity), 0)
      const subtotal = (prev.baseTier?.price || 0) + addOnsTotal
      const total = subtotal * (1 - prev.discountPercent / 100) - prev.discountAmount

      return {
        ...prev,
        addOns: newAddOns,
        addOnsTotal,
        subtotal,
        total
      }
    })
  }

  const handleUpdateQuantity = (addOnId: string, quantity: number) => {
    if (quantity < 1) return
    
    setQuoteSummary(prev => {
      const newAddOns = prev.addOns.map(a => 
        a.id === addOnId ? { ...a, quantity } : a
      )
      const addOnsTotal = newAddOns.reduce((sum, a) => sum + (a.price * a.quantity), 0)
      const subtotal = (prev.baseTier?.price || 0) + addOnsTotal
      const total = subtotal * (1 - prev.discountPercent / 100) - prev.discountAmount

      return {
        ...prev,
        addOns: newAddOns,
        addOnsTotal,
        subtotal,
        total
      }
    })
  }

  const handleDiscountChange = (type: 'percent' | 'amount', value: number) => {
    setQuoteSummary(prev => {
      const discountPercent = type === 'percent' ? value : prev.discountPercent
      const discountAmount = type === 'amount' ? value : prev.discountAmount
      const total = prev.subtotal * (1 - discountPercent / 100) - discountAmount

      return {
        ...prev,
        discountPercent,
        discountAmount,
        total: Math.max(0, Math.round(total))
      }
    })
  }

  const handleGenerateQuote = () => {
    if (!quoteSummary.baseTier) {
        toast.error('Please select a base package')
        return
    }

    if (!quoteSummary.customerEmail || !quoteSummary.customerName || !quoteSummary.companyName) {
        toast.error('Please fill in customer information')
        return
    }

    if (editingQuote) {
        // Update existing quote
        const updatedQuote: EnterpriseQuote = {
        ...editingQuote,
        customer: {
            companyName: quoteSummary.companyName,
            contactName: quoteSummary.customerName,
            email: quoteSummary.customerEmail
        },
        package: {
            tierName: quoteSummary.baseTier.name,
            tierId: quoteSummary.baseTier.id,
            basePrice: quoteSummary.basePrice,
            addOns: quoteSummary.addOns.map(addOn => ({ ...addOn })), // Create a copy to avoid reference issues
            addOnsTotal: quoteSummary.addOnsTotal,
            discountPercent: quoteSummary.discountPercent,
            discountAmount: quoteSummary.discountAmount,
            subtotal: quoteSummary.subtotal,
            total: quoteSummary.total
        },
        notes: quoteSummary.notes,
        updatedAt: new Date().toISOString() // Add update timestamp
        }

        // Update the quotes state
        setQuotes(prev => prev.map(q => 
        q.id === editingQuote.id ? updatedQuote : q
        ))
        
        toast.success(`Quote ${editingQuote.quoteNumber} updated successfully!`)
        setEditingQuote(null)
    } else {
        // Create new quote
        const quoteNumber = `ENT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(quotes.length + 1).padStart(2, '0')}`

        const newQuote: EnterpriseQuote = {
        id: `quote-${Date.now()}`,
        quoteNumber,
        createdAt: new Date().toISOString(),
        expiresAt: addDays(new Date(), 30).toISOString(),
        status: 'draft',
        customer: {
            companyName: quoteSummary.companyName,
            contactName: quoteSummary.customerName,
            email: quoteSummary.customerEmail
        },
        package: {
            tierName: quoteSummary.baseTier.name,
            tierId: quoteSummary.baseTier.id,
            basePrice: quoteSummary.basePrice,
            addOns: quoteSummary.addOns.map(addOn => ({ ...addOn })), // Create a copy
            addOnsTotal: quoteSummary.addOnsTotal,
            discountPercent: quoteSummary.discountPercent,
            discountAmount: quoteSummary.discountAmount,
            subtotal: quoteSummary.subtotal,
            total: quoteSummary.total
        },
        notes: quoteSummary.notes
        }

        setQuotes(prev => [newQuote, ...prev])
        toast.success(`Quote ${quoteNumber} generated successfully!`)
    }

    // Reset form and switch to quotes tab
    resetQuoteForm()
    setActiveTab('quotes')
    }

  const resetQuoteForm = () => {
    setQuoteSummary({
      baseTier: null,
      basePrice: 0,
      addOns: [],
      addOnsTotal: 0,
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      total: 0,
      customerEmail: '',
      customerName: '',
      companyName: '',
      notes: ''
    })
    setEditingQuote(null)
  }

  const handleEditQuote = (quote: EnterpriseQuote) => {
    // Find the tier
    const tier = enterpriseTiers.find(t => t.id === quote.package.tierId)
    
    // Make sure addOns are properly loaded with all properties
    const loadedAddOns = quote.package.addOns.map(addOn => {
        // Find the original add-on to get full details (description, features, etc.)
        const originalAddOn = addOns.find(a => a.id === addOn.id)
        return {
        ...originalAddOn,
        ...addOn, // Keep the quantity and any other properties from the quote
        quantity: addOn.quantity
        }
    })
    
    setQuoteSummary({
        baseTier: tier || null,
        basePrice: quote.package.basePrice,
        addOns: loadedAddOns,
        addOnsTotal: quote.package.addOnsTotal,
        subtotal: quote.package.subtotal,
        discountPercent: quote.package.discountPercent,
        discountAmount: quote.package.discountAmount,
        total: quote.package.total,
        customerEmail: quote.customer.email,
        customerName: quote.customer.contactName,
        companyName: quote.customer.companyName,
        notes: quote.notes || ''
    })
    
    setEditingQuote(quote)
    setActiveTab('builder')
    toast.success('Loading quote for editing')
    }

  const handleDeleteQuote = (quoteId: string) => {
    setQuoteToDelete(quoteId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteQuote = () => {
    if (quoteToDelete) {
      setQuotes(prev => prev.filter(q => q.id !== quoteToDelete))
      toast.success('Quote deleted successfully')
      setShowDeleteConfirm(false)
      setQuoteToDelete(null)
      if (selectedQuote?.id === quoteToDelete) {
        setShowQuoteModal(false)
      }
    }
  }

  const handleSendQuote = async (quote: EnterpriseQuote) => {
    setSendingEmail(true)
    
    try {
        // Call your email API endpoint
        const response = await fetch('/api/admin/enterprise/quotes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quoteId: quote.id,
            quoteNumber: quote.quoteNumber,
            customerEmail: quote.customer.email,
            customerName: quote.customer.contactName,
            companyName: quote.customer.companyName,
            package: quote.package,
            expiresAt: quote.expiresAt,
            notes: quote.notes
        })
        })

        if (!response.ok) {
        throw new Error('Failed to send email')
        }

        // Update quote status
        setQuotes(prev => prev.map(q => 
        q.id === quote.id ? { ...q, status: 'sent' } : q
        ))
        
        toast.success(`Quote sent to ${quote.customer.email}`)
    } catch (error) {
        console.error('Failed to send email:', error)
        toast.error('Failed to send email. Please try again.')
    } finally {
        setSendingEmail(false)
    }
  }

  const handlePrintQuote = (quote: EnterpriseQuote) => {
    // Create a printable version
    const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
            <html>
                <head>
                <title>Quote ${quote.quoteNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .header { 
                    border-bottom: 2px solid #B5944B; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    }
                    .logo { width: 80px; height: auto; }
                    .section { margin-bottom: 30px; }
                    .section h2 { color: #0A2540; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { text-align: left; background: #F8FAFC; padding: 10px; }
                    td { padding: 10px; border-bottom: 1px solid #E2E8F0; }
                    .total { font-size: 18px; font-weight: bold; color: #B5944B; }
                    .footer { margin-top: 50px; text-align: center; color: #666; }
                </style>
                </head>
                <body>
                <div class="header">
                    <div>
                    <h1>Enterprise Quote</h1>
                    <p>Quote #: ${quote.quoteNumber}</p>
                    <p>Date: ${new Date(quote.createdAt).toLocaleDateString()}</p>
                    <p>Valid Until: ${new Date(quote.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <img src="/veridian-logo-gold-192X192.png" alt="Veridian Group" class="logo" />
                </div>
                
                <div class="section">
                    <h2>Customer Information</h2>
                    <p><strong>Company:</strong> ${quote.customer.companyName}</p>
                    <p><strong>Contact:</strong> ${quote.customer.contactName}</p>
                    <p><strong>Email:</strong> ${quote.customer.email}</p>
                </div>
                
                <div class="section">
                    <h2>Package Details</h2>
                    <p><strong>Base Package:</strong> ${quote.package.tierName}</p>
                    <p><strong>Base Price:</strong> $${quote.package.basePrice.toLocaleString()}</p>
                    
                    ${quote.package.addOns.length > 0 ? `
                    <h3>Add-ons</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${quote.package.addOns.map(addOn => `
                            <tr>
                            <td>${addOn.name}</td>
                            <td>${addOn.quantity}</td>
                            <td>$${addOn.price.toLocaleString()}</td>
                            <td>$${(addOn.price * addOn.quantity).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                        </tbody>
                    </table>
                    ` : ''}
                    
                    <div style="margin-top: 20px;">
                    <p><strong>Subtotal:</strong> $${quote.package.subtotal.toLocaleString()}</p>
                    ${quote.package.discountPercent > 0 ? `<p><strong>Discount (${quote.package.discountPercent}%):</strong> -$${Math.round(quote.package.subtotal * quote.package.discountPercent / 100).toLocaleString()}</p>` : ''}
                    ${quote.package.discountAmount > 0 ? `<p><strong>Discount:</strong> -$${quote.package.discountAmount.toLocaleString()}</p>` : ''}
                    <p class="total"><strong>Total:</strong> $${quote.package.total.toLocaleString()}</p>
                    </div>
                </div>
                
                ${quote.notes ? `
                    <div class="section">
                    <h2>Notes</h2>
                    <p>${quote.notes}</p>
                    </div>
                ` : ''}
                
                <div class="footer">
                    <p>Thank you for your interest in Veridian Group</p>
                    <p>This quote was prepared by your enterprise sales team</p>
                </div>
                </body>
            </html>
            `)
            printWindow.document.close()
            printWindow.print()
        }
    }

  const handleDownloadQuote = (quote: EnterpriseQuote) => {
    // Create a text version for download
    const content = `
VERIDIAN GROUP - ENTERPRISE QUOTE
================================
Quote #: ${quote.quoteNumber}
Date: ${new Date(quote.createdAt).toLocaleDateString()}
Valid Until: ${new Date(quote.expiresAt).toLocaleDateString()}

CUSTOMER INFORMATION
-------------------
Company: ${quote.customer.companyName}
Contact: ${quote.customer.contactName}
Email: ${quote.customer.email}

PACKAGE DETAILS
--------------
Base Package: ${quote.package.tierName}
Base Price: $${quote.package.basePrice.toLocaleString()}

${quote.package.addOns.length > 0 ? 'ADD-ONS\n' + quote.package.addOns.map(a => 
  `- ${a.name} x${a.quantity}: $${(a.price * a.quantity).toLocaleString()}`
).join('\n') : ''}

Subtotal: $${quote.package.subtotal.toLocaleString()}
${quote.package.discountPercent > 0 ? `Discount (${quote.package.discountPercent}%): -$${Math.round(quote.package.subtotal * quote.package.discountPercent / 100).toLocaleString()}` : ''}
${quote.package.discountAmount > 0 ? `Discount: -$${quote.package.discountAmount.toLocaleString()}` : ''}
TOTAL: $${quote.package.total.toLocaleString()}

${quote.notes ? `NOTES\n-----\n${quote.notes}` : ''}

This quote was prepared by Veridian Group Enterprise Sales.
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quote-${quote.quoteNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Quote downloaded')
  }

  const handleDuplicateQuote = (quote: EnterpriseQuote) => {
    const tier = enterpriseTiers.find(t => t.id === quote.package.tierId)
    
    setQuoteSummary({
      baseTier: tier || null,
      basePrice: quote.package.basePrice,
      addOns: quote.package.addOns,
      addOnsTotal: quote.package.addOnsTotal,
      subtotal: quote.package.subtotal,
      discountPercent: quote.package.discountPercent,
      discountAmount: quote.package.discountAmount,
      total: quote.package.total,
      customerEmail: quote.customer.email,
      customerName: quote.customer.contactName,
      companyName: quote.customer.companyName,
      notes: quote.notes || ''
    })
    
    setActiveTab('builder')
    toast.success('Quote loaded into builder')
  }

  const handleUpdateQuoteStatus = (quoteId: string, newStatus: EnterpriseQuote['status']) => {
    setQuotes(prev => prev.map(q => 
      q.id === quoteId ? { ...q, status: newStatus } : q
    ))
    toast.success(`Quote status updated to ${newStatus}`)
  }

  const filteredLeads = leads.filter(lead => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        lead.company_name.toLowerCase().includes(searchLower) ||
        lead.contact_name.toLowerCase().includes(searchLower) ||
        lead.contact_email.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const filteredQuotes = quotes.filter(quote => {
    if (quoteStatusFilter !== 'all' && quote.status !== quoteStatusFilter) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        quote.customer.companyName.toLowerCase().includes(searchLower) ||
        quote.customer.contactName.toLowerCase().includes(searchLower) ||
        quote.quoteNumber.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      contacted: 'bg-purple-100 text-purple-800 border-purple-200',
      qualified: 'bg-amber-100 text-amber-800 border-amber-200',
      negotiating: 'bg-orange-100 text-orange-800 border-orange-200',
      closed_won: 'bg-green-100 text-green-800 border-green-200',
      closed_lost: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-slate-100 text-slate-800 border-slate-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      viewed: 'bg-purple-100 text-purple-800 border-purple-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      converted: 'bg-gold-100 text-gold-800 border-gold-200'
    }
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers/enterprise"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Enterprise Deal Builder</h1>
          <p className="text-navy-600 mt-1">Create, manage, and track enterprise quotes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-gold-600 text-gold-600'
                : 'border-transparent text-navy-500 hover:text-navy-700'
            }`}
          >
            Enterprise Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'builder'
                ? 'border-gold-600 text-gold-600'
                : 'border-transparent text-navy-500 hover:text-navy-700'
            }`}
          >
            Package Builder {editingQuote && '(Editing)'}
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'quotes'
                ? 'border-gold-600 text-gold-600'
                : 'border-transparent text-navy-500 hover:text-navy-700'
            }`}
          >
            Active Quotes ({quotes.length})
          </button>
        </nav>
      </div>

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="negotiating">Negotiating</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>

          {/* Leads Grid */}
          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Building2 className="w-12 h-12 text-navy-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy-900 mb-2">No Enterprise Leads</h3>
              <p className="text-navy-600">Leads from the "Contact Sales" form will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  id={`lead-${lead.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-navy-900">{lead.company_name}</h3>
                          <p className="text-sm text-navy-500 mt-1">{lead.contact_name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(lead.status)}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-navy-400" />
                          <a href={`mailto:${lead.contact_email}`} className="text-navy-600 hover:text-gold-600">
                            {lead.contact_email}
                          </a>
                        </div>
                        {lead.contact_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-navy-400" />
                            <a href={`tel:${lead.contact_phone}`} className="text-navy-600 hover:text-gold-600">
                              {lead.contact_phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-navy-400" />
                          <span className="text-navy-600">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {lead.message && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-navy-700">{lead.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col items-center gap-2 lg:min-w-[140px]">
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowLeadModal(true)
                        }}
                        className="w-full px-4 py-2 border border-slate-300 text-navy-600 rounded-lg text-sm hover:bg-slate-50"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setQuoteSummary({
                            ...quoteSummary,
                            customerEmail: lead.contact_email,
                            customerName: lead.contact_name,
                            companyName: lead.company_name
                          })
                          setActiveTab('builder')
                        }}
                        className="w-full px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700"
                      >
                        Build Package
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Builder Tab */}
      {activeTab === 'builder' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Package Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy-900">Customer Information</h2>
                {editingQuote && (
                  <span className="text-sm text-gold-600">Editing: {editingQuote.quoteNumber}</span>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-navy-600 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={quoteSummary.companyName}
                    onChange={(e) => setQuoteSummary({...quoteSummary, companyName: e.target.value})}
                    placeholder="e.g., First Regional Bank"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-600 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    value={quoteSummary.customerName}
                    onChange={(e) => setQuoteSummary({...quoteSummary, customerName: e.target.value})}
                    placeholder="e.g., Sarah Mitchell"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-600 mb-1">Email *</label>
                  <input
                    type="email"
                    value={quoteSummary.customerEmail}
                    onChange={(e) => setQuoteSummary({...quoteSummary, customerEmail: e.target.value})}
                    placeholder="sarah@company.com"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-navy-600 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={quoteSummary.notes}
                    onChange={(e) => setQuoteSummary({...quoteSummary, notes: e.target.value})}
                    placeholder="Any special considerations"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Enterprise Tiers */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">1. Select Base Package</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {enterpriseTiers.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => handleSelectTier(tier)}
                    className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${
                      quoteSummary.baseTier?.id === tier.id
                        ? tier.id === 'enterprise-unlimited'
                          ? 'border-gold-600 ring-2 ring-gold-600/20 bg-navy-900'
                          : 'border-gold-600 ring-2 ring-gold-600/20'
                        : tier.id === 'enterprise-unlimited'
                          ? 'border-navy-700 bg-navy-900 hover:border-gold-400'
                          : 'border-slate-200 hover:border-gold-400'
                    }`}
                  >
                    <h3 className={`text-lg font-bold mb-2 ${
                      tier.id === 'enterprise-unlimited' ? 'text-white' : 'text-navy-900'
                    }`}>
                      {tier.name}
                    </h3>
                    <div className="mb-4">
                      <span className={`text-2xl font-bold ${
                        tier.id === 'enterprise-unlimited' ? 'text-white' : 'text-navy-900'
                      }`}>
                        {formatCurrency(tier.price)}
                      </span>
                      <span className={`text-sm ml-2 ${
                        tier.id === 'enterprise-unlimited' ? 'text-navy-300' : 'text-navy-500'
                      }`}>
                        /year
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className={`flex items-center gap-2 ${
                        tier.id === 'enterprise-unlimited' ? 'text-navy-200' : 'text-navy-600'
                      }`}>
                        <Check className={`w-4 h-4 ${
                          tier.id === 'enterprise-unlimited' ? 'text-gold-500' : 'text-green-600'
                        }`} />
                        <span>{tier.features.reports}</span>
                      </li>
                      <li className={`flex items-center gap-2 ${
                        tier.id === 'enterprise-unlimited' ? 'text-navy-200' : 'text-navy-600'
                      }`}>
                        <Check className={`w-4 h-4 ${
                          tier.id === 'enterprise-unlimited' ? 'text-gold-500' : 'text-green-600'
                        }`} />
                        <span>{tier.features.team_seats}</span>
                      </li>
                      <li className={`flex items-center gap-2 ${
                        tier.id === 'enterprise-unlimited' ? 'text-navy-200' : 'text-navy-600'
                      }`}>
                        <Check className={`w-4 h-4 ${
                          tier.id === 'enterprise-unlimited' ? 'text-gold-500' : 'text-green-600'
                        }`} />
                        <span>{tier.features.api_calls}</span>
                      </li>
                      <li className={`flex items-center gap-2 ${
                        tier.id === 'enterprise-unlimited' ? 'text-navy-200' : 'text-navy-600'
                      }`}>
                        <Check className={`w-4 h-4 ${
                          tier.id === 'enterprise-unlimited' ? 'text-gold-500' : 'text-green-600'
                        }`} />
                        <span>{tier.features.states}</span>
                      </li>
                      {tier.features.white_label && (
                        <li className={`flex items-center gap-2 ${
                          tier.id === 'enterprise-unlimited' ? 'text-navy-200' : 'text-navy-600'
                        }`}>
                          <Check className={`w-4 h-4 ${
                            tier.id === 'enterprise-unlimited' ? 'text-gold-500' : 'text-green-600'
                          }`} />
                          <span>White-label included</span>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">2. Add-on Services</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {addOns.map((addOn) => (
                  <div
                    key={addOn.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-navy-900">{addOn.name}</h4>
                        <p className="text-xs text-navy-500 mt-0.5">{addOn.description}</p>
                      </div>
                      <button
                        onClick={() => handleAddAddOn(addOn)}
                        className="p-2 bg-gold-50 text-gold-600 rounded-lg hover:bg-gold-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-navy-900">{formatCurrency(addOn.price)}</span>
                      <span className="text-xs text-navy-500 capitalize">{addOn.price_type}</span>
                    </div>
                    {addOn.features && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {addOn.features.slice(0, 2).map((feature, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-navy-600 rounded-full text-xs">
                            {feature}
                          </span>
                        ))}
                        {addOn.features.length > 2 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-navy-600 rounded-full text-xs">
                            +{addOn.features.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quote Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Quote Summary</h2>
              
              {!quoteSummary.baseTier ? (
                <div className="text-center py-8 text-navy-400">
                  Select a base package to begin
                </div>
              ) : (
                <>
                  {/* Selected Tier */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-navy-900">{quoteSummary.baseTier.name}</span>
                      <span className="font-bold text-navy-900">{formatCurrency(quoteSummary.basePrice)}</span>
                    </div>
                    <p className="text-xs text-navy-500">Base package (yearly)</p>
                  </div>

                  {/* Selected Add-ons */}
                  {quoteSummary.addOns.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-sm font-medium text-navy-700">Add-ons</p>
                      {quoteSummary.addOns.map((addOn) => (
                        <div key={addOn.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-navy-900">{addOn.name}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateQuantity(addOn.id, addOn.quantity - 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 text-navy-600 hover:bg-slate-50"
                                >
                                  -
                                </button>
                                <span className="text-xs w-5 text-center">{addOn.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(addOn.id, addOn.quantity + 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 text-navy-600 hover:bg-slate-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-navy-500">
                              {formatCurrency(addOn.price)} × {addOn.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy-900">
                              {formatCurrency(addOn.price * addOn.quantity)}
                            </span>
                            <button
                              onClick={() => handleRemoveAddOn(addOn.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discounts */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-navy-700">Discounts</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="%"
                        value={quoteSummary.discountPercent || ''}
                        onChange={(e) => handleDiscountChange('percent', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-navy-500">% off</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-navy-500">$</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={quoteSummary.discountAmount || ''}
                        onChange={(e) => handleDiscountChange('amount', parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-sm"
                        min="0"
                      />
                      <span className="text-sm text-navy-500">off</span>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-navy-600">Subtotal:</span>
                      <span className="font-medium text-navy-900">{formatCurrency(quoteSummary.subtotal)}</span>
                    </div>
                    {quoteSummary.discountPercent > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-navy-600">Discount ({quoteSummary.discountPercent}%):</span>
                        <span className="font-medium text-green-600">
                          -{formatCurrency(Math.round(quoteSummary.subtotal * quoteSummary.discountPercent / 100))}
                        </span>
                      </div>
                    )}
                    {quoteSummary.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-navy-600">Discount:</span>
                        <span className="font-medium text-green-600">
                          -{formatCurrency(quoteSummary.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-base font-bold pt-2 border-t border-slate-200">
                      <span className="text-navy-900">Total (yearly):</span>
                      <span className="text-gold-600">{formatCurrency(quoteSummary.total)}</span>
                    </div>
                    <p className="text-xs text-navy-400 text-right">+ applicable taxes</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={handleGenerateQuote}
                      className="w-full px-4 py-3 bg-gold-600 text-white rounded-lg font-medium hover:bg-gold-700 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {editingQuote ? 'Update Quote' : 'Generate Quote'}
                    </button>
                    <button
                      onClick={resetQuoteForm}
                      className="w-full px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {/* Quote Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>
            <select
              value={quoteStatusFilter}
              onChange={(e) => setQuoteStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="all">All Quotes</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          {/* Quotes Grid */}
          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-navy-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy-900 mb-2">No Quotes Found</h3>
              <p className="text-navy-600 mb-6">Generate your first enterprise quote</p>
              <button
                onClick={() => setActiveTab('builder')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
              >
                <Briefcase className="w-4 h-4" />
                Create New Quote
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-navy-900">{quote.quoteNumber}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(quote.status)}`}>
                              {quote.status}
                            </span>
                          </div>
                          <p className="text-sm text-navy-500 mt-1">
                            {quote.customer.companyName} • {quote.customer.contactName}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-gold-600">
                          {formatCurrency(quote.package.total)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-navy-500">Package</p>
                          <p className="text-sm font-medium text-navy-900">{quote.package.tierName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-navy-500">Created</p>
                          <p className="text-sm text-navy-600">{new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-navy-500">Expires</p>
                          <p className="text-sm text-navy-600">{new Date(quote.expiresAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-navy-500">Add-ons</p>
                          <p className="text-sm text-navy-600">{quote.package.addOns.length}</p>
                        </div>
                      </div>

                      {quote.notes && (
                        <div className="mt-3 text-sm text-navy-600">
                          <span className="font-medium">Notes:</span> {quote.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap lg:flex-col items-center gap-2 lg:min-w-[140px]">
                      <button
                        onClick={() => {
                          setSelectedQuote(quote)
                          setShowQuoteModal(true)
                        }}
                        className="w-full px-4 py-2 border border-slate-300 text-navy-600 rounded-lg text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditQuote(quote)}
                        className="w-full px-4 py-2 border border-slate-300 text-navy-600 rounded-lg text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="w-full px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                        <Trash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lead Detail Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-navy-900">Lead Details</h2>
              <button
                onClick={() => setShowLeadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Company</p>
                  <p className="font-medium text-navy-900">{selectedLead.company_name}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Contact</p>
                  <p className="font-medium text-navy-900">{selectedLead.contact_name}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Email</p>
                  <a href={`mailto:${selectedLead.contact_email}`} className="font-medium text-gold-600 hover:underline">
                    {selectedLead.contact_email}
                  </a>
                </div>
                {selectedLead.contact_phone && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-navy-500 mb-1">Phone</p>
                    <a href={`tel:${selectedLead.contact_phone}`} className="font-medium text-gold-600 hover:underline">
                      {selectedLead.contact_phone}
                    </a>
                  </div>
                )}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Status</p>
                  <select
                    value={selectedLead.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as any
                      setSelectedLead({ ...selectedLead, status: newStatus })
                      setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, status: newStatus } : l))
                      toast.success('Status updated')
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedLead.status)}`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-navy-500 mb-1">Received</p>
                  <p className="font-medium text-navy-900">
                    {new Date(selectedLead.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <p className="text-sm font-medium text-navy-700 mb-2">Message</p>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-navy-700 whitespace-pre-wrap">{selectedLead.message}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowLeadModal(false)
                    setQuoteSummary({
                      ...quoteSummary,
                      customerEmail: selectedLead.contact_email,
                      customerName: selectedLead.contact_name,
                      companyName: selectedLead.company_name
                    })
                    setActiveTab('builder')
                  }}
                  className="flex-1 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
                >
                  Build Package
                </button>
                <button
                  onClick={() => window.location.href = `mailto:${selectedLead.contact_email}`}
                  className="flex-1 px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Detail Modal */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-navy-900">Quote {selectedQuote.quoteNumber}</h2>
                <p className="text-sm text-navy-500 mt-1">
                  {selectedQuote.customer.companyName} • {selectedQuote.customer.contactName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintQuote(selectedQuote)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  title="Print Quote"
                >
                  <Printer className="w-5 h-5 text-navy-600" />
                </button>
                <button
                  onClick={() => handleDownloadQuote(selectedQuote)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  title="Download Quote"
                >
                  <Download className="w-5 h-5 text-navy-600" />
                </button>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Quote Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedQuote.status)}`}>
                    {selectedQuote.status}
                  </span>
                  <span className="text-sm text-navy-500">
                    Created: {new Date(selectedQuote.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-navy-500">
                    Expires: {new Date(selectedQuote.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendQuote(selectedQuote)}
                    disabled={sendingEmail}
                    className="px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {sendingEmail ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Quote
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quote Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Package Details */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-medium text-navy-900 mb-3">Package Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Base Package:</span>
                      <span className="text-sm font-medium text-navy-900">{selectedQuote.package.tierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Base Price:</span>
                      <span className="text-sm font-medium text-navy-900">{formatCurrency(selectedQuote.package.basePrice)}</span>
                    </div>
                    
                    {selectedQuote.package.addOns.length > 0 && (
                      <>
                        <div className="border-t border-slate-200 my-2 pt-2">
                          <p className="text-sm font-medium text-navy-700 mb-2">Add-ons</p>
                        </div>
                        {selectedQuote.package.addOns.map((addOn, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-navy-600">{addOn.name} x{addOn.quantity}:</span>
                            <span className="font-medium text-navy-900">{formatCurrency(addOn.price * addOn.quantity)}</span>
                          </div>
                        ))}
                      </>
                    )}
                    
                    <div className="border-t border-slate-200 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-navy-900">Subtotal:</span>
                        <span className="text-navy-900">{formatCurrency(selectedQuote.package.subtotal)}</span>
                      </div>
                      {selectedQuote.package.discountPercent > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({selectedQuote.package.discountPercent}%):</span>
                          <span>-{formatCurrency(Math.round(selectedQuote.package.subtotal * selectedQuote.package.discountPercent / 100))}</span>
                        </div>
                      )}
                      {selectedQuote.package.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(selectedQuote.package.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 mt-2">
                        <span className="text-navy-900">Total:</span>
                        <span className="text-gold-600">{formatCurrency(selectedQuote.package.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-medium text-navy-900 mb-3">Customer Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Company:</span>
                      <span className="text-sm font-medium text-navy-900">{selectedQuote.customer.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Contact:</span>
                      <span className="text-sm font-medium text-navy-900">{selectedQuote.customer.contactName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Email:</span>
                      <a href={`mailto:${selectedQuote.customer.email}`} className="text-sm text-gold-600 hover:underline">
                        {selectedQuote.customer.email}
                      </a>
                    </div>
                  </div>
                  
                  {selectedQuote.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-navy-600 mb-2">Notes:</p>
                      <p className="text-sm text-navy-900">{selectedQuote.notes}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-navy-700 mb-2">Quick Actions</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowQuoteModal(false)
                          handleEditQuote(selectedQuote)
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 text-navy-600 rounded-lg text-sm hover:bg-slate-50 flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateQuote(selectedQuote)}
                        className="flex-1 px-3 py-2 border border-slate-300 text-navy-600 rounded-lg text-sm hover:bg-slate-50 flex items-center justify-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          setShowQuoteModal(false)
                          handleDeleteQuote(selectedQuote.id)
                        }}
                        className="flex-1 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center gap-1"
                      >
                        <Trash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-navy-600">Update Status:</span>
                  <select
                    value={selectedQuote.status}
                    onChange={(e) => {
                      handleUpdateQuoteStatus(selectedQuote.id, e.target.value as any)
                      setSelectedQuote({ ...selectedQuote, status: e.target.value as any })
                    }}
                    className="px-3 py-1 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="viewed">Viewed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="converted">Converted</option>
                  </select>
                </div>
                <div className="text-sm text-navy-400">
                  Last updated: {new Date(selectedQuote.updatedAt || selectedQuote.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-navy-900">Delete Quote</h3>
            </div>
            <div className="p-6">
              <p className="text-navy-600 mb-4">
                Are you sure you want to delete this quote? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteQuote}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setQuoteToDelete(null)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}