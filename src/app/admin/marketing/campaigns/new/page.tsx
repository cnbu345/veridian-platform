// src/app/admin/marketing/campaigns/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  Users,
  Target,
  FileText,
  Image,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { marketingClient } from '@/lib/marketing'; // This now only imports client
import type { Channel, CampaignFormData } from '@/types/marketing';

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    channel: '',
    budget: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    target_audience: [],
    content: {
      headline: '',
      description: '',
      cta: '',
      image_url: '',
      landing_page_url: '',
    },
    status: 'draft',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadChannels = async () => {
      const data = await marketingClient.getChannels();
      setChannels(data.filter(c => c.is_active));
      if (data.length > 0 && !formData.channel) {
        setFormData(prev => ({ ...prev, channel: data[0].code }));
      }
    };
    loadChannels();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    if (!formData.channel) newErrors.channel = 'Please select a channel';
    if (formData.budget <= 0) newErrors.budget = 'Budget must be greater than 0';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const campaign = await marketingClient.createCampaign(formData);
      router.push(`/admin/marketing/campaigns/${campaign.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrors({ submit: 'Failed to create campaign. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContentChange = (field: keyof NonNullable<CampaignFormData['content']>, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/marketing/campaigns"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Create New Campaign</h1>
          <p className="text-navy-500 mt-1">Set up a new marketing campaign</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Q1 2026 Enterprise Outreach"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Channel *
              </label>
              <select
                value={formData.channel}
                onChange={(e) => handleChange('channel', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  errors.channel ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                {channels.map(channel => (
                  <option key={channel.code} value={channel.code}>
                    {channel.name}
                  </option>
                ))}
              </select>
              {errors.channel && (
                <p className="text-sm text-red-600 mt-1">{errors.channel}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Budget *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', parseInt(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                    errors.budget ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.budget && (
                <p className="text-sm text-red-600 mt-1">{errors.budget}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-600" />
            Timeline
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  errors.start_date ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.start_date && (
                <p className="text-sm text-red-600 mt-1">{errors.start_date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  errors.end_date ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.end_date && (
                <p className="text-sm text-red-600 mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-600" />
            Campaign Content
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Headline
              </label>
              <input
                type="text"
                value={formData.content?.headline || ''}
                onChange={(e) => handleContentChange('headline', e.target.value)}
                placeholder="e.g., Simplify Your Crypto Compliance Journey"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.content?.description || ''}
                onChange={(e) => handleContentChange('description', e.target.value)}
                rows={3}
                placeholder="Describe the campaign value proposition..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Call to Action
              </label>
              <input
                type="text"
                value={formData.content?.cta || ''}
                onChange={(e) => handleContentChange('cta', e.target.value)}
                placeholder="e.g., Get Your Free Consultation"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Landing Page URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="url"
                  value={formData.content?.landing_page_url || ''}
                  onChange={(e) => handleContentChange('landing_page_url', e.target.value)}
                  placeholder="https://veridiangroup.com/campaign"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Image URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="url"
                  value={formData.content?.image_url || ''}
                  onChange={(e) => handleContentChange('image_url', e.target.value)}
                  placeholder="https://veridiangroup.com/images/campaign-hero.jpg"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}
        
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/marketing/campaigns"
            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Campaign
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}