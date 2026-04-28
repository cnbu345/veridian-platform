// src/components/reports/QuarterlyUpsell.tsx
'use client'

import { Calendar, Bell, Phone, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface QuarterlyUpsellProps {
  variant?: 'banner' | 'card' | 'sidebar' | 'pdf'
  reportId?: string
  companyName?: string
  className?: string
}

export function QuarterlyUpsell({ 
  variant = 'banner', 
  reportId, 
  companyName,
  className = '' 
}: QuarterlyUpsellProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    // Track dismissal
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'dismiss_quarterly_upsell', {
        report_id: reportId,
        variant
      })
    }
  }

  const handleCTAClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click_quarterly_upsell', {
        report_id: reportId,
        variant
      })
    }
  }

  // PDF-friendly banner (minimal styling, works in @react-pdf/renderer)
  if (variant === 'pdf') {
    return (
      <div style={{
        backgroundColor: '#FDF9E7',
        borderRadius: 8,
        padding: 16,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: '#EAB308',
      }}>
        <div style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#854D0E' }}>
            🔔 Stay Compliant Year-Round
          </span>
        </div>
        <p style={{ fontSize: 11, color: '#78350F', marginBottom: 12 }}>
          Regulations change quarterly. Our Quarterly Intelligence service keeps you updated with automatic compliance alerts, 
          renewal reminders, and quarterly strategy calls. Never miss a regulatory change again.
        </p>
        <div style={{ flexDirection: 'row', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 'bold', color: '#92400E' }}>✓ Quarterly Updates</span>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 'bold', color: '#92400E' }}>✓ Email Alerts</span>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 'bold', color: '#92400E' }}>✓ Strategy Calls</span>
          </div>
        </div>
        <div style={{ 
          backgroundColor: '#D4AF37', 
          borderRadius: 6, 
          padding: 8, 
          marginTop: 12,
          textAlign: 'center' 
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>
            Upgrade to Quarterly Intelligence →
          </span>
        </div>
      </div>
    )
  }

  // Web Banner variant
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 relative ${className}`}>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-amber-600 hover:text-amber-800"
          aria-label="Dismiss"
        >
          ×
        </button>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">
              Regulations change. Don't get caught off guard.
            </h4>
            <p className="text-sm text-amber-800 mb-3">
              Upgrade to Quarterly Intelligence for automatic updates, renewal alerts, and expert strategy calls.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/upgrade?plan=quarterly${reportId ? `&report_id=${reportId}` : ''}`}
                onClick={handleCTAClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade Now - $5,997/year
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-amber-600">
                Includes 2 strategy calls ($1,000 value)
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Sidebar card variant (compact)
  if (variant === 'sidebar') {
    return (
      <div className={`bg-white border border-amber-200 rounded-xl p-5 shadow-sm ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-amber-700" />
          </div>
          <h4 className="font-semibold text-navy-900">Quarterly Intelligence</h4>
        </div>
        <p className="text-sm text-navy-600 mb-4">
          Stay compliant with automatic updates and expert guidance.
        </p>
        <ul className="space-y-2 mb-4">
          <li className="flex items-center gap-2 text-xs text-navy-600">
            <span className="w-1 h-1 bg-amber-500 rounded-full" />
            Quarterly compliance updates
          </li>
          <li className="flex items-center gap-2 text-xs text-navy-600">
            <span className="w-1 h-1 bg-amber-500 rounded-full" />
            Email alerts for law changes
          </li>
          <li className="flex items-center gap-2 text-xs text-navy-600">
            <span className="w-1 h-1 bg-amber-500 rounded-full" />
            Priority support & strategy calls
          </li>
        </ul>
        <Link
          href={`/upgrade?plan=quarterly${reportId ? `&report_id=${reportId}` : ''}`}
          onClick={handleCTAClick}
          className="block w-full py-2.5 text-center bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          Upgrade for $5,997/year
        </Link>
        <p className="text-xs text-center text-navy-500 mt-2">
          Save $1,000 with Founder's Pricing
        </p>
      </div>
    )
  }

  // Default card variant
  return (
    <div className={`bg-gradient-to-br from-navy-50 to-amber-50 border border-navy-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-navy-700" />
        </div>
        <div>
          <h3 className="font-bold text-navy-900 text-lg">Stay Compliant Year-Round</h3>
          <p className="text-sm text-navy-600">Quarterly updates keep you ahead of regulatory changes</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-700 text-xs">✓</span>
          </div>
          <span className="text-sm text-navy-700">Quarterly Reports</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-700 text-xs">✓</span>
          </div>
          <span className="text-sm text-navy-700">Email Alerts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-700 text-xs">✓</span>
          </div>
          <span className="text-sm text-navy-700">Strategy Calls</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-700 text-xs">✓</span>
          </div>
          <span className="text-sm text-navy-700">Priority Support</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-navy-900">$5,997</span>
          <span className="text-sm text-navy-500 ml-1">/year</span>
        </div>
        <Link
          href={`/upgrade?plan=quarterly${reportId ? `&report_id=${reportId}` : ''}`}
          onClick={handleCTAClick}
          className="px-5 py-2.5 bg-navy-900 text-white font-medium rounded-lg hover:bg-navy-800 transition-colors inline-flex items-center gap-2"
        >
          Upgrade Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <p className="text-xs text-navy-500 mt-3">
        Includes 2 complimentary strategy sessions ($1,000 value)
      </p>
    </div>
  )
}