// src/lib/marketing/server-only.ts
import { createClient } from '@/lib/supabase/server';

// This file is SERVER-ONLY - only import in API routes or server components
export class MarketingServerClient {
  private supabase = createClient();

  async getCampaignsForExport(params?: {
    from_date?: string;
    to_date?: string;
  }) {
    let query = this.supabase
      .from('marketing_campaigns')
      .select(`
        *,
        campaign_roi(*)
      `);

    if (params?.from_date) {
      query = query.gte('start_date', params.from_date);
    }
    if (params?.to_date) {
      query = query.lte('end_date', params.to_date);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async generateCSV(data: any[]) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
        return String(value).replace(/,/g, ';');
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }
}