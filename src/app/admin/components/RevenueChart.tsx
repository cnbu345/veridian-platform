// src/app/admin/components/RevenueChart.tsx // REVENUE CHART
'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { formatCurrency } from '@/lib/utils/utils'
import { Calendar, TrendingUp } from 'lucide-react'

interface RevenueData {
  date: string
  mrr: number
  oneTime: number
  total: number
}

export default function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateMockData()
  }, [timeframe])

  const generateMockData = () => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const mockData: RevenueData[] = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      
      mockData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mrr: 15000 + Math.random() * 5000,
        oneTime: 2000 + Math.random() * 3000,
        total: 17000 + Math.random() * 8000
      })
    }
    
    setData(mockData)
    setLoading(false)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm text-navy-500 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-navy-900">Revenue Trends</h2>
        
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeframe === '7d'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeframe === '30d'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeframe('90d')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeframe === '90d'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            90D
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-80 bg-slate-100 rounded-lg animate-pulse" />
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="mrr"
                name="MRR"
                stroke="#1E3A5F"
                strokeWidth={2}
                fill="url(#colorMrr)"
              />
              <Area
                type="monotone"
                dataKey="oneTime"
                name="One-time"
                stroke="#D4AF37"
                strokeWidth={2}
                fill="url(#colorOneTime)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}