// src/app/admin/hallucination-dashboard/page.tsx
// Admin dashboard to monitor hallucination rates

import { createClient } from '@/lib/supabase/server'

export default async function HallucinationDashboard() {
  const supabase = await createClient()

  // Get hallucination statistics
  const { data: claims } = await supabase
    .from('report_claims')
    .select('verification_status, created_at')
    .order('created_at', { ascending: false })

  const total = claims?.length || 0
  const verified = claims?.filter(c => c.verification_status === 'verified').length || 0
  const hallucinations = claims?.filter(c => c.verification_status === 'hallucination').length || 0
  const needsReview = claims?.filter(c => c.verification_status === 'needs_review').length || 0

  const hallucinationRate = total > 0 ? (hallucinations / total) * 100 : 0

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Hallucination Monitoring Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Total Claims</div>
          <div className="text-3xl font-bold">{total}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="text-green-600 text-sm">Verified</div>
          <div className="text-3xl font-bold text-green-700">{verified}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <div className="text-red-600 text-sm">Hallucinations</div>
          <div className="text-3xl font-bold text-red-700">{hallucinations}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <div className="text-yellow-600 text-sm">Needs Review</div>
          <div className="text-3xl font-bold text-yellow-700">{needsReview}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-2">Hallucination Rate</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full ${hallucinationRate < 10 ? 'bg-green-600' : hallucinationRate < 25 ? 'bg-yellow-600' : 'bg-red-600'}`}
            style={{ width: `${Math.min(hallucinationRate, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {hallucinationRate.toFixed(1)}% hallucination rate
          {hallucinationRate < 10 ? ' (Excellent - below 10% target)' : hallucinationRate < 25 ? ' (Acceptable - but can improve)' : ' (Critical - needs immediate attention)'}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Claims</h2>
        <div className="space-y-2">
          {claims?.slice(0, 20).map((claim) => (
            <div key={claim.id} className="border-b pb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  claim.verification_status === 'verified' ? 'bg-green-500' :
                  claim.verification_status === 'hallucination' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-500">
                  {new Date(claim.created_at).toLocaleDateString()}
                </span>
                <span className="text-sm font-medium">
                  {claim.verification_status}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{claim.claim.substring(0, 200)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}