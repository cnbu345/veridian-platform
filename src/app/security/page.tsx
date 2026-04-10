// src/app/security/page.tsx
// Security page - Comprehensive, responsive, mobile-friendly

import { Shield, Lock, Server, Eye, Key, Database, CheckCircle, Award, FileText, Users, Bell, AlertTriangle, Mail } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm mb-4">
            <Shield className="w-4 h-4" />
            <span>Enterprise-Grade Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Security & Compliance
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Your data's security is our highest priority. We employ industry-leading measures to protect your information.
          </p>
        </div>

        {/* Certifications */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-navy-900">SOC 2 Type II</h3>
            <p className="text-xs text-gray-500">Certified annually</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-navy-900">GDPR Compliant</h3>
            <p className="text-xs text-gray-500">EU data protection</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-navy-900">ISO 27001</h3>
            <p className="text-xs text-gray-500">Information security</p>
          </div>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-6 h-6 text-gold-600" />
              <h3 className="text-lg font-semibold text-navy-900">Data Encryption</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> AES-256 encryption for data at rest</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> TLS 1.3 encryption for data in transit</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> End-to-end encryption for sensitive data</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Key className="w-6 h-6 text-gold-600" />
              <h3 className="text-lg font-semibold text-navy-900">Access Control</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Multi-factor authentication (MFA)</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Role-based access control (RBAC)</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Single sign-on (SSO) available</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Server className="w-6 h-6 text-gold-600" />
              <h3 className="text-lg font-semibold text-navy-900">Infrastructure</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> AWS cloud infrastructure (us-east-1)</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> 99.95% uptime SLA</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Daily automated backups</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-6 h-6 text-gold-600" />
              <h3 className="text-lg font-semibold text-navy-900">Monitoring & Auditing</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> 24/7 security monitoring</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Comprehensive audit logging</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Regular penetration testing</li>
            </ul>
          </div>
        </div>

        {/* Compliance Section */}
        <div className="bg-navy-900 rounded-2xl p-6 sm:p-8 text-white mb-12">
          <h2 className="text-xl font-bold mb-4">Compliance Framework</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gold-400 mb-2">Data Residency</h3>
              <p className="text-navy-200 text-sm">All data stored in US-East-1 (N. Virginia) with no cross-border transfer</p>
            </div>
            <div>
              <h3 className="font-semibold text-gold-400 mb-2">Data Retention</h3>
              <p className="text-navy-200 text-sm">Customer data retained per subscription terms; audit logs retained for 7 years</p>
            </div>
            <div>
              <h3 className="font-semibold text-gold-400 mb-2">Incident Response</h3>
              <p className="text-navy-200 text-sm">24/7 security team; 1-hour response SLA for critical incidents</p>
            </div>
            <div>
              <h3 className="font-semibold text-gold-400 mb-2">Third-Party Audits</h3>
              <p className="text-navy-200 text-sm">Annual SOC 2 audits by independent third-party</p>
            </div>
          </div>
        </div>

        {/* Report a Vulnerability */}
        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-navy-900">Report a Security Vulnerability</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            We take security seriously. If you've discovered a security vulnerability, please report it to us responsibly.
          </p>
          <a
            href="mailto:security@veridiangroup.com"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
          >
            <Mail className="w-4 h-4" />
            security@veridiangroup.com
          </a>
        </div>
      </div>
    </div>
  )
}