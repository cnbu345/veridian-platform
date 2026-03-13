// src/app/dashboard/feedback/nps/NPSHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronRight,
  Filter,
  Download,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { format, parseISO, subMonths } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface NPSResponse {
  id: string
  nps_score: number
  comments?: string
  created_at: string
  metadata?: {
    quarter: number
    year: number
  }
}

export default function NPSHistory() {
  const [responses, setResponses] = useState<NPSResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResponse, setSelectedResponse] = useState<NPSResponse | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [timeRange, setTimeRange] = useState<'all' | 'year' | '2years'>('all')

  useEffect(() => {
    fetchNPSHistory()
  }, [])

  const fetchNPSHistory = async () => {
    try {
      const response = await fetch('/api/client/feedback/nps')
      const data = await response.json()
      setResponses(data.responses || [])
    } catch (error) {
      console.error('Failed to fetch NPS history:', error)
      toast.error('Failed to load NPS history')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600'
    if (score >= 7) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 9) return 'bg-green-100'
    if (score >= 7) return 'bg-amber-100'
    return 'bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Promoter'
    if (score >= 7) return 'Passive'
    return 'Detractor'
  }

  const calculateStats = () => {
    if (responses.length === 0) {
      return { average: 0, promoters: 0, passives: 0, detractors: 0, nps: 0 }
    }

    const promoters = responses.filter(r => r.nps_score >= 9).length
    const passives = responses.filter(r => r.nps_score >= 7 && r.nps_score <= 8).length
    const detractors = responses.filter(r => r.nps_score <= 6).length
    
    const average = responses.reduce((sum, r) => sum + r.nps_score, 0) / responses.length
    const nps = ((promoters - detractors) / responses.length) * 100

    return {
      average: Math.round(average * 10) / 10,
      promoters,
      passives,
      detractors,
      nps: Math.round(nps)
    }
  }

  const getFilteredResponses = () => {
    if (timeRange === 'all') return responses
    
    const cutoff = timeRange === 'year' 
      ? subMonths(new Date(), 12)
      : subMonths(new Date(), 24)
    
    return responses.filter(r => new Date(r.created_at) >= cutoff)
  }

  const chartData = getFilteredResponses()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(r => ({
      date: format(parseISO(r.created_at), 'MMM yyyy'),
      score: r.nps_score,
      quarter: r.metadata ? `Q${r.metadata.quarter} ${r.metadata.year}` : null
    }))

  const stats = calculateStats()
  const filteredResponses = getFilteredResponses()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 mb-1">NPS History</h1>
        <p className="text-navy-600">Track your satisfaction scores over time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-navy-500 mb-2">Current NPS</p>
          <p className={`text-3xl font-bold ${stats.nps >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.nps}
          </p>
          <p className="text-xs text-navy-400 mt-1">Based on {responses.length} responses</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-navy-500 mb-2">Average Score</p>
          <p className="text-3xl font-bold text-navy-900">{stats.average}</p>
          <p className="text-xs text-navy-400 mt-1">Out of 10</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-navy-500 mb-2">Promoters</p>
          <p className="text-3xl font-bold text-green-600">{stats.promoters}</p>
          <p className="text-xs text-navy-400 mt-1">{Math.round((stats.promoters / responses.length) * 100)}% of responses</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-navy-500 mb-2">Detractors</p>
          <p className="text-3xl font-bold text-red-600">{stats.detractors}</p>
          <p className="text-xs text-navy-400 mt-1">{Math.round((stats.detractors / responses.length) * 100)}% of responses</p>
        </div>
      </div>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-navy-900">NPS Trend</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">All Time</option>
              <option value="year">Last 12 Months</option>
              <option value="2years">Last 24 Months</option>
            </select>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748B"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke="#64748B"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#B5944B" 
                  strokeWidth={2}
                  dot={{ fill: '#B5944B', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#B5944B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Response History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-navy-900">Response History</h3>
        </div>

        {filteredResponses.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-12 h-12 text-navy-300 mx-auto mb-4" />
            <p className="text-navy-600">No NPS responses yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredResponses.map((response) => (
              <div
                key={response.id}
                onClick={() => {
                  setSelectedResponse(response)
                  setShowDetails(true)
                }}
                className="p-6 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                      getScoreBackground(response.nps_score),
                      getScoreColor(response.nps_score)
                    )}>
                      {response.nps_score}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-navy-900">
                          {getScoreLabel(response.nps_score)}
                        </span>
                        {response.metadata && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-navy-600 rounded-full">
                            Q{response.metadata.quarter} {response.metadata.year}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-navy-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(parseISO(response.created_at), 'MMMM d, yyyy')}
                        </span>
                      </div>

                      {response.comments && (
                        <p className="text-sm text-navy-600 mt-2 line-clamp-2">
                          "{response.comments}"
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-navy-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetails && selectedResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy-900">NPS Response Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold",
                  getScoreBackground(selectedResponse.nps_score),
                  getScoreColor(selectedResponse.nps_score)
                )}>
                  {selectedResponse.nps_score}
                </div>
                <div>
                  <p className="text-lg font-semibold text-navy-900">
                    {getScoreLabel(selectedResponse.nps_score)}
                  </p>
                  <p className="text-sm text-navy-500">
                    {format(parseISO(selectedResponse.created_at), 'MMMM d, yyyy')}
                  </p>
                  {selectedResponse.metadata && (
                    <p className="text-xs text-navy-400 mt-1">
                      Quarterly Survey - Q{selectedResponse.metadata.quarter} {selectedResponse.metadata.year}
                    </p>
                  )}
                </div>
              </div>

              {selectedResponse.comments && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-navy-700 mb-2">Your Comments</p>
                  <p className="text-navy-600 whitespace-pre-wrap">
                    {selectedResponse.comments}
                  </p>
                </div>
              )}

              <div className="text-xs text-navy-400 border-t border-slate-200 pt-4">
                <p>Response ID: {selectedResponse.id}</p>
                <p>Submitted: {format(parseISO(selectedResponse.created_at), 'MMMM d, yyyy h:mm a')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}