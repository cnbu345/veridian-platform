// src/app/enterprise/page.tsx
// Enterprise solutions page - Professional, responsive, mobile-friendly

'use client'

import { useState } from 'react'
import { Shield, Building2, Users, Globe, Database, Zap, CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export default function EnterprisePage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Enterprise Solutions
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Custom regulatory intelligence solutions for large financial institutions and law firms.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Institution-Grade Security</h3>
            <p className="text-gray-600 text-sm">SOC 2 compliant, encrypted data, and role-based access controls.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Real-Time Data Sync</h3>
            <p className="text-gray-600 text-sm">Automatic updates from NMLS, CSBS, and state regulators.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Team Access</h3>
            <p className="text-gray-600 text-sm">Multi-user accounts with granular permission settings.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Multi-State Analysis</h3>
            <p className="text-gray-600 text-sm">Compare up to 10 states side-by-side with our enterprise plan.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">API Access</h3>
            <p className="text-gray-600 text-sm">Integrate our regulatory data directly into your systems.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">White-Label Reports</h3>
            <p className="text-gray-600 text-sm">Custom-branded reports for your clients.</p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-navy-900 rounded-2xl p-6 sm:p-8 text-white mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Custom Enterprise Pricing</h2>
            <p className="text-navy-200">Tailored solutions for your specific needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-navy-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-2">Starter Enterprise</h3>
              <p className="text-2xl font-bold mb-2">$14,997<span className="text-sm font-normal text-navy-300">/year</span></p>
              <ul className="space-y-2 text-sm text-navy-200">
                <li>✓ 12 reports per year</li>
                <li>✓ Multi-state analysis</li>
                <li>✓ Team access (5 users)</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            
            <div className="bg-gold-600 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-white/20 px-2 py-0.5 rounded text-xs">Most Popular</div>
              <h3 className="text-lg font-semibold mb-2">Professional Enterprise</h3>
              <p className="text-2xl font-bold mb-2">$24,997<span className="text-sm font-normal text-gold-100">/year</span></p>
              <ul className="space-y-2 text-sm text-white/90">
                <li>✓ 24 reports per year</li>
                <li>✓ Multi-state + API access</li>
                <li>✓ Team access (15 users)</li>
                <li>✓ Dedicated account manager</li>
                <li>✓ White-label reports</li>
              </ul>
            </div>
            
            <div className="bg-navy-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-2">Custom Enterprise</h3>
              <p className="text-2xl font-bold mb-2">Custom</p>
              <ul className="space-y-2 text-sm text-navy-200">
                <li>✓ Unlimited reports</li>
                <li>✓ Full API access</li>
                <li>✓ Unlimited team members</li>
                <li>✓ Custom integrations</li>
                <li>✓ SLA guarantee</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gold-600 text-white rounded-lg font-semibold hover:bg-gold-500 transition-colors inline-flex items-center gap-2"
            >
              Contact Enterprise Sales
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-navy-900 mb-4">Contact Enterprise Sales</h3>
              <form className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" />
                <input type="email" placeholder="Work Email" className="w-full px-4 py-2 border rounded-lg" />
                <input type="text" placeholder="Company Name" className="w-full px-4 py-2 border rounded-lg" />
                <textarea placeholder="Tell us about your needs" rows={3} className="w-full px-4 py-2 border rounded-lg" />
                <button className="w-full py-2 bg-gold-600 text-white rounded-lg">Submit Request</button>
                <button onClick={() => setShowForm(false)} className="w-full py-2 text-gray-500">Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}