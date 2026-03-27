// src/app/admin/marketing/seo/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Globe,
  Eye,
  MousePointer,
  Clock,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  Target,
  FileText,
  Link2,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Award,
} from 'lucide-react';
import { marketingClient } from '@/lib/marketing';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function SEOPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [keywords, setKeywords] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSEOData();
  }, [dateRange]);

  const fetchSEOData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock SEO data - in production, you'd fetch from your SEO tracking tables
      const mockKeywords = [
        { keyword: 'crypto compliance', position: 4, volume: 12500, difficulty: 65, trend: 'up' },
        { keyword: 'money transmitter license', position: 2, volume: 8900, difficulty: 72, trend: 'up' },
        { keyword: 'bitlicense application', position: 7, volume: 5600, difficulty: 78, trend: 'down' },
        { keyword: 'crypto regulatory consulting', position: 1, volume: 3200, difficulty: 55, trend: 'up' },
        { keyword: 'state crypto regulations', position: 3, volume: 9800, difficulty: 60, trend: 'stable' },
        { keyword: 'blockchain compliance', position: 5, volume: 7500, difficulty: 68, trend: 'up' },
        { keyword: 'crypto AML compliance', position: 8, volume: 6200, difficulty: 70, trend: 'down' },
        { keyword: 'virtual currency license', position: 6, volume: 4800, difficulty: 62, trend: 'stable' },
      ];
      
      const mockAnalytics = [
        { month: 'Jan', clicks: 1250, impressions: 45000, position: 5.2 },
        { month: 'Feb', clicks: 1420, impressions: 48200, position: 4.9 },
        { month: 'Mar', clicks: 1680, impressions: 52100, position: 4.7 },
        { month: 'Apr', clicks: 1950, impressions: 56800, position: 4.4 },
        { month: 'May', clicks: 2230, impressions: 61200, position: 4.1 },
        { month: 'Jun', clicks: 2560, impressions: 67800, position: 3.8 },
      ];
      
      setKeywords(mockKeywords);
      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error('Error fetching SEO data:', err);
      setError('Failed to load SEO data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="w-3 h-3 text-green-600" />;
    if (trend === 'down') return <ArrowDown className="w-3 h-3 text-red-600" />;
    return null;
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 font-bold';
    if (position <= 10) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading SEO intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchSEOData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);
  const totalImpressions = analytics.reduce((sum, a) => sum + a.impressions, 0);
  const avgPosition = (analytics.reduce((sum, a) => sum + a.position, 0) / analytics.length).toFixed(1);
  const ctr = ((totalClicks / totalImpressions) * 100).toFixed(1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">SEO Performance</h1>
          <p className="text-navy-500 mt-1">Track keyword rankings, organic traffic, and search visibility</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-navy-900 text-sm"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          
          <button
            onClick={fetchSEOData}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="w-5 h-5 text-navy-600" />
          </button>
          
          <button className="px-4 py-2 bg-navy-900 text-white rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-navy-500">Total Impressions</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">{formatNumber(totalImpressions)}</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            +18.3% vs last period
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="w-4 h-4 text-green-600" />
            <span className="text-sm text-navy-500">Total Clicks</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">{formatNumber(totalClicks)}</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            +22.4% vs last period
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gold-600" />
            <span className="text-sm text-navy-500">CTR</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">{ctr}%</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            +2.1% vs last period
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-navy-500">Avg Position</span>
          </div>
          <div className="text-2xl font-bold text-navy-900">{avgPosition}</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <ArrowUp className="w-3 h-3" />
            +0.8 improvement
          </div>
        </div>
      </div>

      {/* Traffic Trend Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900">Organic Traffic Trend</h3>
          <BarChart3 className="w-5 h-5 text-navy-400" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#C6A13B" name="Clicks" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="position" stroke="#1E3A5F" name="Avg Position" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Keyword Rankings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900">Top Keywords</h3>
          <Search className="w-5 h-5 text-navy-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Keyword</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-navy-600">Position</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-navy-600">Volume</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-navy-600">Difficulty</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-navy-600">Trend</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-navy-900">{kw.keyword}</td>
                  <td className={`py-3 px-4 text-right ${getPositionColor(kw.position)}`}>
                    #{kw.position}
                  </td>
                  <td className="py-3 px-4 text-right text-navy-700">{formatNumber(kw.volume)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-navy-700">{kw.difficulty}</span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${kw.difficulty > 70 ? 'bg-red-500' : kw.difficulty > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${kw.difficulty}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {getTrendIcon(kw.trend)}
                      <span className="text-sm capitalize">{kw.trend}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEO Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Top Opportunities</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <Zap className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <span>Target "crypto compliance software" - high volume, low competition</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Zap className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <span>Create content for "state-by-state crypto regulations" - featured snippet opportunity</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Zap className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <span>Optimize "bitlicense application" page - currently #7, potential for top 3</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Action Items</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <Link2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>Fix 12 broken backlinks from high-authority domains</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <FileText className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>Update meta descriptions for 8 underperforming pages</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>Reduce page load time on mobile - currently 3.2s (target: &lt;2s)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}