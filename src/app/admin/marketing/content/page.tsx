// src/app/admin/marketing/content/page.tsx // Content Performance Dashboard
'use client'

import { useState } from 'react'
import {
  Eye,
  Download,
  Share2,
  Clock,
  TrendingUp,
  TrendingDown,
  MapPin,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  Users,
  MousePointer,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ContentPerformance() {
  const [dateRange, setDateRange] = useState('30d')
  
  const contentData = [
    { topic: 'BitLicense', views: 1245, downloads: 89, shares: 45, timeOnPage: 4.2 },
    { topic: 'Money Transmitter', views: 987, downloads: 67, shares: 34, timeOnPage: 3.8 },
    { topic: 'State Regulations', views: 2341, downloads: 156, shares: 78, timeOnPage: 5.1 },
    { topic: 'Compliance Roadmap', views: 1876, downloads: 123, shares: 56, timeOnPage: 4.7 },
    { topic: 'Wyoming DAO', views: 654, downloads: 43, shares: 23, timeOnPage: 3.2 }
  ]
  
  const stateData = [
    { state: 'NY', views: 876, downloads: 54, conversions: 12 },
    { state: 'CA', views: 743, downloads: 47, conversions: 9 },
    { state: 'TX', views: 654, downloads: 41, conversions: 15 },
    { state: 'FL', views: 543, downloads: 36, conversions: 11 },
    { state: 'WY', views: 432, downloads: 29, conversions: 8 }
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Content Performance</h1>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>
      
      {/* Overview Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-600">Total Views</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">8,947</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            12.3%
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-600">Unique Visitors</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">4,231</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            8.7%
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-600">Avg Time</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">4.2m</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            0.5m
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-600">Downloads</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">547</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            15.2%
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-600">Shares</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">267</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            5.8%
          </div>
        </div>
      </div>
      
      {/* Content by Topic */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Performance by Topic</h3>
          <div className="space-y-4">
            {contentData.map((item) => (
              <div key={item.topic} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium">{item.topic}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-navy-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" /> {item.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" /> {item.shares}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.timeOnPage}m</div>
                  <div className="text-xs text-navy-500">avg time</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Performance by State */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Performance by State</h3>
          <div className="space-y-4">
            {stateData.map((item) => (
              <div key={item.state} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-navy-400" />
                  <span className="font-medium">{item.state}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{item.views} views</span>
                  <span className="text-sm text-green-600">{item.conversions} leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-navy-900 mb-4">Content-to-Lead Funnel</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#94A3B8" name="Views" />
              <Bar dataKey="downloads" fill="#C6A13B" name="Downloads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}