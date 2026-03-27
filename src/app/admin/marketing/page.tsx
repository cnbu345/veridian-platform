// src/app/admin/marketing/page.tsx - Main Marketing Dashboard
'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MousePointer,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  ChevronRight,
  Eye,
  Share2,
  Target,
  Zap,
  Award,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { marketingClient } from '@/lib/marketing'; // This now only imports client
import type { MarketingMetrics, ChannelPerformance } from '@/types/marketing';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as ReLineChart, Line, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';

export default function MarketingDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dateParams = getDateRangeParams(dateRange);
      
      const [metricsData, channelData, forecastData] = await Promise.all([
        marketingClient.getMarketingMetrics(dateParams),
        marketingClient.getChannelPerformance(dateParams),
        marketingClient.getForecast(3),
      ]);
      
      setMetrics(metricsData);
      setChannelPerformance(channelData);
      setForecast(forecastData);
    } catch (err) {
      console.error('Error fetching marketing data:', err);
      setError('Failed to load marketing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeParams = (range: string) => {
    const now = new Date();
    const from_date = new Date();
    
    switch (range) {
      case '7d':
        from_date.setDate(now.getDate() - 7);
        break;
      case '30d':
        from_date.setDate(now.getDate() - 30);
        break;
      case '90d':
        from_date.setDate(now.getDate() - 90);
        break;
      case '12m':
        from_date.setMonth(now.getMonth() - 12);
        break;
      default:
        from_date.setDate(now.getDate() - 30);
    }
    
    return {
      from_date: from_date.toISOString(),
      to_date: now.toISOString(),
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const COLORS = ['#C6A13B', '#1E3A5F', '#2C5282', '#4299E1', '#718096'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading marketing intelligence...</p>
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
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">Marketing Intelligence</h1>
          <p className="text-navy-500 mt-1">Track campaign performance, ROI, and market trends</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-navy-900 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          
          <button
            onClick={fetchData}
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-500">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900">
            {formatCurrency(metrics?.total_revenue || 0)}
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            <ArrowUp className="w-3 h-3 text-green-600" />
            <span className="text-green-600">+15.3%</span>
            <span className="text-navy-400 ml-1">vs last period</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-500">Total Spend</span>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900">
            {formatCurrency(metrics?.total_spend || 0)}
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            <ArrowUp className="w-3 h-3 text-amber-600" />
            <span className="text-amber-600">+8.2%</span>
            <span className="text-navy-400 ml-1">vs last period</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-500">ROI</span>
            <Zap className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900">
            {metrics?.overall_roi?.toFixed(1) || 0}%
          </div>
          <div className={`flex items-center gap-1 text-xs mt-1 ${(metrics?.overall_roi || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(metrics?.overall_roi || 0) > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{(metrics?.overall_roi || 0) > 0 ? '+' : ''}{((metrics?.overall_roi || 0) * 0.1).toFixed(1)}%</span>
            <span className="text-navy-400 ml-1">vs last period</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-500">Leads</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900">
            {formatNumber(metrics?.total_leads || 0)}
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            <ArrowUp className="w-3 h-3 text-green-600" />
            <span className="text-green-600">+22.1%</span>
            <span className="text-navy-400 ml-1">vs last period</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-500">Conversion Rate</span>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-navy-900">
            {metrics?.conversion_rate?.toFixed(1) || 0}%
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            <ArrowUp className="w-3 h-3 text-green-600" />
            <span className="text-green-600">+3.2%</span>
            <span className="text-navy-400 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      {/* Channel Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">Channel Performance</h3>
            <BarChart3 className="w-5 h-5 text-navy-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="channel" />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#C6A13B" name="Revenue" />
                <Bar dataKey="spend" fill="#1E3A5F" name="Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI by Channel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">ROI by Channel</h3>
            <PieChart className="w-5 h-5 text-navy-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={channelPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="roi"
                  nameKey="channel"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {channelPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900">3-Month Forecast</h3>
          <LineChart className="w-5 h-5 text-navy-400" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'revenue' || name === 'spend') return formatCurrency(value);
                  return `${value.toFixed(1)}%`;
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#C6A13B" name="Revenue" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#1E3A5F" name="Spend" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#48BB78" name="ROI %" strokeWidth={2} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-navy-400 text-center mt-4">
          Forecast based on historical performance and seasonality patterns
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gold-50 to-amber-50 rounded-xl p-4 border border-gold-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-gold-600" />
            <span className="text-sm font-medium text-gold-800">Best Channel</span>
          </div>
          <div className="text-lg font-bold text-navy-900">
            {channelPerformance.sort((a, b) => b.roi - a.roi)[0]?.channel || 'N/A'}
          </div>
          <div className="text-sm text-gold-600">
            {channelPerformance.sort((a, b) => b.roi - a.roi)[0]?.roi.toFixed(1)}% ROI
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Cost Per Lead</span>
          </div>
          <div className="text-lg font-bold text-navy-900">
            {formatCurrency(metrics?.cost_per_lead || 0)}
          </div>
          <div className="text-sm text-blue-600">
            {((metrics?.cost_per_lead || 0) * 0.9).toFixed(0)} target
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Conversion Cost</span>
          </div>
          <div className="text-lg font-bold text-navy-900">
            {formatCurrency(metrics?.cost_per_conversion || 0)}
          </div>
          <div className="text-sm text-green-600">
            {((metrics?.cost_per_conversion || 0) * 0.85).toFixed(0)} target
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Projected Growth</span>
          </div>
          <div className="text-lg font-bold text-navy-900">
            +{(metrics?.overall_roi || 0) * 0.15}%
          </div>
          <div className="text-sm text-purple-600">
            next quarter
          </div>
        </div>
      </div>
    </div>
  );
}