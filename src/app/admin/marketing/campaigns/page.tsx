// src/app/admin/marketing/campaigns/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { marketingClient } from '@/lib/marketing';
import type { Campaign } from '@/types/marketing';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [channels, setChannels] = useState<{ code: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [statusFilter, channelFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsData, channelsData] = await Promise.all([
        marketingClient.getCampaigns({
          status: statusFilter === 'all' ? undefined : statusFilter,
          channel: channelFilter === 'all' ? undefined : channelFilter,
        }),
        marketingClient.getChannels(),
      ]);
      setCampaigns(campaignsData);
      setChannels(channelsData);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await marketingClient.deleteCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newCampaign = await marketingClient.duplicateCampaign(id);
      setCampaigns([newCampaign, ...campaigns]);
    } catch (error) {
      console.error('Error duplicating campaign:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await marketingClient.updateCampaign(id, { status: newStatus as any });
      setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-navy-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Marketing Campaigns</h1>
          <p className="text-navy-500 mt-1">Manage and track all marketing initiatives</p>
        </div>
        <Link
          href="/admin/marketing/campaigns/new"
          className="px-4 py-2 bg-navy-900 text-white rounded-lg flex items-center gap-2 hover:bg-navy-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
        
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
        >
          <option value="all">All Channels</option>
          {channels.map(channel => (
            <option key={channel.code} value={channel.code}>
              {channel.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={fetchData}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paginatedCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-navy-900 text-lg">{campaign.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-navy-500">
                    {channels.find(c => c.code === campaign.channel)?.name || campaign.channel}
                  </p>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowDeleteConfirm(showDeleteConfirm === campaign.id ? null : campaign.id)}
                    className="p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-navy-500" />
                  </button>
                  
                  {showDeleteConfirm === campaign.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                      <button
                        onClick={() => handleEdit(campaign.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(campaign.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" /> Duplicate
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-navy-600">
                  <Calendar className="w-4 h-4 text-navy-400" />
                  <span>
                    {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-navy-600">
                  <DollarSign className="w-4 h-4 text-navy-400" />
                  <span>{formatCurrency(campaign.budget)}</span>
                </div>
              </div>
              
              {campaign.roi_data && (
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-navy-600">ROI</span>
                    <span className={`font-semibold ${campaign.roi_data.roi_percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {campaign.roi_data.roi_percentage > 0 ? '+' : ''}{campaign.roi_data.roi_percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-navy-600">Leads</span>
                    <span className="font-semibold">{campaign.roi_data.leads_generated}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-navy-600">Revenue</span>
                    <span className="font-semibold">{formatCurrency(campaign.roi_data.revenue_generated)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'active')}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Activate
                    </button>
                  )}
                  {campaign.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'paused')}
                      className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center gap-1"
                    >
                      <Pause className="w-3 h-3" /> Pause
                    </button>
                  )}
                  {(campaign.status === 'paused' || campaign.status === 'completed') && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'active')}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Resume
                    </button>
                  )}
                </div>
                
                <Link
                  href={`/admin/marketing/campaigns/${campaign.id}`}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-navy-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}