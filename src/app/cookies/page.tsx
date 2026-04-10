// src/app/cookies/page.tsx
// Cookie Policy - Comprehensive, responsive, mobile-friendly

import { Cookie, Info, Settings, BarChart, Target, Shield, Mail } from 'lucide-react'

export default function CookiesPage() {
  const lastUpdated = 'April 10, 2026'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-100 rounded-full text-gold-700 text-sm mb-4">
            <Cookie className="w-4 h-4" />
            <span>Updated {lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Learn how Veridian Group uses cookies and similar tracking technologies.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10">
          <div className="prose prose-slate max-w-none">
            {/* What Are Cookies */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">1. What Are Cookies?</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files stored on your device when you visit websites. They help websites 
                remember your preferences, analyze site traffic, and provide personalized experiences. 
                We use cookies to enhance your experience on our platform.
              </p>
            </div>

            {/* Types of Cookies */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">2. Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-navy-900">Essential Cookies</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Required for core functionality like authentication, security, and form submission. Cannot be disabled.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-navy-900">Functional Cookies</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Remember your preferences, such as language and region settings, to provide a personalized experience.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-navy-900">Analytics Cookies</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Help us understand how visitors interact with our platform by collecting anonymous usage data.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-navy-900">Marketing Cookies</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Used to deliver relevant advertisements and track campaign performance. You can opt out of these.</p>
                </div>
              </div>
            </div>

            {/* Specific Cookies We Use */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">3. Specific Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Cookie Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Purpose</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-3 py-2 font-mono text-xs">session_id</td>
                      <td className="px-3 py-2 text-gray-600">Authentication and session management</td>
                      <td className="px-3 py-2 text-gray-600">Session</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-xs">user_preferences</td>
                      <td className="px-3 py-2 text-gray-600">Stores user settings and preferences</td>
                      <td className="px-3 py-2 text-gray-600">1 year</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-xs">_ga</td>
                      <td className="px-3 py-2 text-gray-600">Google Analytics - distinguishes users</td>
                      <td className="px-3 py-2 text-gray-600">2 years</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono text-xs">_gid</td>
                      <td className="px-3 py-2 text-gray-600">Google Analytics - distinguishes users</td>
                      <td className="px-3 py-2 text-gray-600">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">4. Third-Party Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use trusted third-party services that may place cookies on your device:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
                <li><strong>Google Analytics:</strong> Website analytics and usage tracking</li>
                <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                <li><strong>SendGrid:</strong> Email delivery and tracking</li>
                <li><strong>Vercel:</strong> Hosting and performance monitoring</li>
              </ul>
            </div>

            {/* Managing Cookies */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">5. Managing Cookies</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                You can control and manage cookies in several ways:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Browser Settings</h3>
                  <p className="text-xs text-gray-500">Most browsers allow you to block or delete cookies through settings.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Opt-Out Tools</h3>
                  <p className="text-xs text-gray-500">Visit <a href="https://optout.aboutads.info" className="text-gold-600">optout.aboutads.info</a> to opt out of targeted advertising.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Cookie Banner</h3>
                  <p className="text-xs text-gray-500">Use our cookie preference center on first visit.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Do Not Track</h3>
                  <p className="text-xs text-gray-500">We respect Do Not Track browser settings.</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                Note: Disabling essential cookies may affect platform functionality.
              </p>
            </div>

            {/* Consent */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">6. Cookie Consent</h2>
              <p className="text-gray-600 leading-relaxed">
                When you first visit our website, we display a cookie banner requesting your consent for non-essential 
                cookies. You can change your preferences at any time by clicking the cookie settings link in our footer.
              </p>
            </div>

            {/* Updates */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">7. Updates to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Cookie Policy periodically to reflect changes in our practices or legal requirements. 
                We will notify you of material changes by posting the new policy on this page.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-navy-900 rounded-xl p-6 pt-0 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-gold-400 mt-4" />
                <h3 className="text-lg text-navy-200 font-semibold">Contact Us</h3>
              </div>
              <p className="text-navy-200 text-sm mb-3">
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p>📧 <a href="mailto:privacy@veridiangroup.com" className="text-gold-400 hover:underline">privacy@veridiangroup.com</a></p>
                <p>📞 <a href="tel:+18885550987" className="text-gold-400 hover:underline">(888) 555-0987</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}