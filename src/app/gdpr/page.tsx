// src/app/gdpr/page.tsx
// GDPR Compliance - Comprehensive, responsive, mobile-friendly

import { Shield, Eye, Trash2, Download, Mail, Users, Lock, Globe, CheckCircle, AlertCircle } from 'lucide-react'

export default function GDPRPage() {
  const lastUpdated = 'April 10, 2026'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm mb-4">
            <Shield className="w-4 h-4" />
            <span>GDPR Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            GDPR Compliance
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            How Veridian Group protects the data privacy rights of EU residents.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10">
          <div className="prose prose-slate max-w-none">
            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">1. Overview</h2>
              <p className="text-gray-600 leading-relaxed">
                Veridian Group is committed to protecting the privacy and data rights of all our users, including 
                those in the European Economic Area (EEA). This page outlines how we comply with the General Data 
                Protection Regulation (GDPR) (EU) 2016/679.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Our Commitment</h3>
                </div>
                <p className="text-green-700 text-sm">
                  We have implemented comprehensive measures to ensure GDPR compliance, including data protection 
                  by design, lawful processing, and robust security controls.
                </p>
              </div>
            </div>

            {/* Legal Basis for Processing */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">2. Legal Basis for Processing</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Contract Performance</h3>
                  <p className="text-xs text-gray-500">Processing necessary for service delivery</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Legal Obligation</h3>
                  <p className="text-xs text-gray-500">Compliance with regulatory requirements</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Legitimate Interests</h3>
                  <p className="text-xs text-gray-500">Platform improvement and security</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Consent</h3>
                  <p className="text-xs text-gray-500">Marketing communications and cookies</p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">3. Your GDPR Rights</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Eye className="w-5 h-5 text-gold-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">Right to Access (Article 15)</h3>
                    <p className="text-sm text-gray-600">Request a copy of your personal data we hold.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Download className="w-5 h-5 text-gold-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">Right to Data Portability (Article 20)</h3>
                    <p className="text-sm text-gray-600">Receive your data in a machine-readable format.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Trash2 className="w-5 h-5 text-gold-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">Right to Erasure (Article 17)</h3>
                    <p className="text-sm text-gray-600">Request deletion of your data (subject to legal retention).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Lock className="w-5 h-5 text-gold-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">Right to Rectification (Article 16)</h3>
                    <p className="text-sm text-gray-600">Correct inaccurate or incomplete data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gold-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">Right to Restrict Processing (Article 18)</h3>
                    <p className="text-sm text-gray-600">Limit how we use your data in certain circumstances.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-gold-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">Right to Object (Article 21)</h3>
                    <p className="text-sm text-gray-600">Object to processing based on legitimate interests.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Exercise Your Rights */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">4. How to Exercise Your Rights</h2>
              <div className="bg-navy-900 rounded-xl p-5 text-white">
                <p className="text-navy-200 text-sm mb-3">
                  To exercise any of your GDPR rights, please contact our Data Protection Officer:
                </p>
                <div className="space-y-2 text-sm">
                  <p>📧 <a href="mailto:dpo@veridiangroup.com" className="text-gold-400 hover:underline">dpo@veridiangroup.com</a></p>
                  <p>📞 <a href="tel:+18885550987" className="text-gold-400 hover:underline">(888) 555-0987</a></p>
                  <p>📍 548 Market St, Suite 400, San Francisco, CA 94104</p>
                </div>
                <p className="text-navy-300 text-xs mt-3">
                  We will respond to your request within 30 days. Identity verification may be required.
                </p>
              </div>
            </div>

            {/* Data Transfers */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">5. International Data Transfers</h2>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Globe className="w-5 h-5 text-gold-600 mt-0.5" />
                <div>
                  <p className="text-gray-600 text-sm">
                    Your data may be transferred to and processed in the United States. We ensure adequate protection 
                    through:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm mt-2">
                    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                    <li>Data Processing Agreements (DPAs) with all subprocessors</li>
                    <li>AWS data centers with EU data protection guarantees</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Protection Officer */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">6. Data Protection Officer</h2>
              <p className="text-gray-600 leading-relaxed">
                Veridian Group has appointed a Data Protection Officer (DPO) to oversee GDPR compliance. Our DPO can 
                be reached at <a href="mailto:dpo@veridiangroup.com" className="text-gold-600 hover:underline">dpo@veridiangroup.com</a>.
              </p>
            </div>

            {/* Supervisory Authority */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">7. Right to Lodge a Complaint</h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to lodge a complaint with your local Data Protection Authority (DPA) if you 
                believe our processing of your personal data violates GDPR. Contact information for EU DPAs can be 
                found at <a href="https://edpb.europa.eu" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">edpb.europa.eu</a>.
              </p>
            </div>

            {/* Data Retention */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">8. Data Retention Periods</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Data Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-3 py-2">Account Information</td>
                      <td className="px-3 py-2">Duration of active account + 30 days</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Report Data</td>
                      <td className="px-3 py-2">7 years (regulatory retention requirement)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Audit Logs</td>
                      <td className="px-3 py-2">7 years</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Marketing Data</td>
                      <td className="px-3 py-2">Until consent withdrawn</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Processing Agreement */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">9. Data Processing Agreement</h2>
              <p className="text-gray-600 leading-relaxed">
                For enterprise customers, we offer a Data Processing Agreement (DPA) that meets GDPR requirements 
                for data controllers and processors. Contact our DPO to request a DPA.
              </p>
            </div>

            {/* Subprocessors */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">10. Subprocessors</h2>
              <p className="text-gray-600 leading-relaxed">
                We use the following subprocessors to provide our services, all of which are GDPR-compliant:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
                <li><strong>AWS (Amazon Web Services)</strong> - Cloud infrastructure</li>
                <li><strong>Stripe</strong> - Payment processing</li>
                <li><strong>Supabase</strong> - Database and authentication</li>
                <li><strong>SendGrid</strong> - Email delivery</li>
                <li><strong>Vercel</strong> - Application hosting</li>
              </ul>
            </div>

            {/* Updates */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">11. Updates to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this GDPR compliance page periodically. Material changes will be notified via email 
                or platform notification. The "Last Updated" date indicates when this page was last revised.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}