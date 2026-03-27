// src/app/admin/marketing/campaigns/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { marketingClient } from '@/lib/marketing'; // This now only imports client
import type { Campaign, Channel } from '@/types/marketing';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignData, channelsData] = await Promise.all([
        marketingClient.getCampaignById(params.id as string),
        marketingClient.getChannels(),
      ]);
      setCampaign(campaignData);
      setChannels(channelsData);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!campaign) return;
    try {
      await marketingClient.updateCampaign(campaign.id, { status: newStatus as any });
      setCampaign({ ...campaign, status: newStatus });
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const handleDuplicate = async () => {
    if (!campaign) return;
    try {
      const newCampaign = await marketingClient.duplicateCampaign(campaign.id);
      router.push(`/admin/marketing/campaigns/${newCampaign.id}`);
    } catch (error) {
      console.error('Error duplicating campaign:', error);
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    try {
      await marketingClient.deleteCampaign(campaign.id);
      router.push('/admin/marketing/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-navy-900 mb-2">Campaign Not Found</h2>
        <p className="text-navy-500 mb-4">The campaign you're looking for doesn't exist or has been removed.</p>
        <Link
          href="/admin/marketing/campaigns"
          className="px-4 py-2 bg-navy-900 text-white rounded-lg"
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const channelInfo = channels.find(c => c.code === campaign.channel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marketing/campaigns"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-navy-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-navy-900">{campaign.name}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                {getStatusIcon(campaign.status)}
                {campaign.status}
              </span>
            </div>
            <p className="text-navy-500">{channelInfo?.name || campaign.channel}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleDuplicate}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <Link
            href={`/admin/marketing/campaigns/${campaign.id}/edit`}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Actions */}
      <div className="flex gap-3">
        {campaign.status === 'draft' && (
          <button
            onClick={() => handleStatusChange('active')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Activate Campaign
          </button>
        )}
        {campaign.status === 'active' && (
          <button
            onClick={() => handleStatusChange('paused')}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause Campaign
          </button>
        )}
        {(campaign.status === 'paused' || campaign.status === 'completed') && (
          <button
            onClick={() => handleStatusChange('active')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Resume Campaign
          </button>
        )}
        {campaign.status === 'active' && (
          <button
            onClick={() => handleStatusChange('completed')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Complete
          </button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-500">Budget</span>
          </div>
          <div className="text-xl font-bold text-navy-900">{formatCurrency(campaign.budget)}</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-500">ROI</span>
          </div>
          <div className={`text-xl font-bold ${campaign.roi_data?.roi_percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {campaign.roi_data?.roi_percentage > 0 ? '+' : ''}{campaign.roi_data?.roi_percentage || 0}%
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-500">Leads</span>
          </div>
          <div className="text-xl font-bold text-navy-900">{campaign.roi_data?.leads_generated || 0}</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-navy-400" />
            <span className="text-sm text-navy-500">Revenue</span>
          </div>
          <div className="text-xl font-bold text-navy-900">{formatCurrency(campaign.roi_data?.revenue_generated || 0)}</div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-600" />
            Timeline
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-500">Start Date</span>
              <span className="font-medium">{new Date(campaign.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">End Date</span>
              <span className="font-medium">{new Date(campaign.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Duration</span>
              <span className="font-medium">
                {Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-gold-600" />
            Target Audience
          </h3>
          <div className="flex flex-wrap gap-2">
            {campaign.target_audience?.length ? (
              campaign.target_audience.map((audience, i) => (
                <span key={i} className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm">
                  {audience}
                </span>
              ))
            ) : (
              <p className="text-navy-500 text-sm">No target audience specified</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold-600" />
            Content
          </h3>
          <div className="space-y-3 text-sm">
            {campaign.content?.headline && (
              <div>
                <span className="text-navy-500 block mb-1">Headline</span>
                <p className="font-medium">{campaign.content.headline}</p>
              </div>
            )}
            {campaign.content?.cta && (
              <div>
                <span className="text-navy-500 block mb-1">CTA</span>
                <p className="font-medium">{campaign.content.cta}</p>
              </div>
            )}
            {campaign.content?.landing_page_url && (
              <div>
                <span className="text-navy-500 block mb-1">Landing Page</span>
                <a
                  href={campaign.content.landing_page_url}
                  target="_blank"
                  className="text-gold-600 hover:underline flex items-center gap-1"
                >
                  Visit Page <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-navy-900">Delete Campaign</h3>
            </div>
            <p className="text-navy-600 mb-6">
              Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}