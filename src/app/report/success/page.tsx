// src/app/report/success/page.tsx // Post-payment success page
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Mail, Clock, Loader2 } from 'lucide-react'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>
}) {
  // Await the searchParams
  const params = await searchParams
  const sessionId = params.session_id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Get the most recent report for this user
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-32">
      <div className="container-custom max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-navy-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-lg text-navy-600">
            Thank you for your purchase. Your regulatory intelligence report is being generated.
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8 mb-6">
          <h2 className="text-xl font-semibold text-navy-900 mb-4">What happens next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-gold-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Report Generation</h3>
                <p className="text-navy-600 text-sm">
                  Our AI compliance engine is analyzing state regulations, licensing requirements, 
                  and compliance risks for your selected jurisdictions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-gold-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Email Notification</h3>
                <p className="text-navy-600 text-sm">
                  You'll receive an email at <strong>{user.email}</strong> when your report is ready 
                  (typically within 2-3 minutes).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-gold-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">View Your Report</h3>
                <p className="text-navy-600 text-sm">
                  Access your complete regulatory intelligence report from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Status */}
        {report && (
          <div className="bg-navy-50 rounded-2xl border border-navy-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Latest Report Status</h3>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {report.status === 'pending' ? 'Generating...' : report.status}
              </span>
            </div>
            <p className="text-sm text-navy-700 mb-2">
              <span className="font-medium">{report.company_name}</span> - {report.city}, {report.state}
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gold-600 h-2 rounded-full animate-pulse"
                style={{ width: report.status === 'pending' ? '60%' : '100%' }}
              />
            </div>
            <p className="text-sm text-navy-600">
              {report.status === 'pending' 
                ? 'Your report is being generated. You will be redirected automatically when ready.'
                : 'Your report is ready to view!'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          {report && report.status === 'ready' && (
            <Link
              href={`/report/${report.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-navy-900 font-semibold rounded-xl border border-slate-200 hover:border-gold-500 transition-colors"
            >
              View Report
            </Link>
          )}
        </div>

        {/* Auto-redirect message */}
        {report && report.status === 'pending' && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-navy-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to report page in 5 seconds...</span>
            </div>
          </div>
        )}

        {/* Email Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-navy-500">
            <Mail className="w-4 h-4" />
            <span>Check your email for updates: {user.email}</span>
          </div>
        </div>

        {/* Session ID (hidden, for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-4 text-xs text-slate-400 text-center">
            Session ID: {sessionId}
          </p>
        )}
      </div>

      {/* Auto-redirect script */}
      {report && report.status === 'pending' && (
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function() {
              window.location.href = '/report/${report.id}';
            }, 5000);
          `
        }} />
      )}
    </div>
  )
}