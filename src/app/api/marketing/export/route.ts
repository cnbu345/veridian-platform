// src/app/api/marketing/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketingServerClient } from '@/lib/marketing/server-only';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const from_date = searchParams.get('from_date') || undefined;
    const to_date = searchParams.get('to_date') || undefined;

    const serverClient = new MarketingServerClient();
    const data = await serverClient.getCampaignsForExport({ from_date, to_date });
    
    if (format === 'csv') {
      const csv = await serverClient.generateCSV(data);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=marketing_campaigns_${new Date().toISOString()}.csv`,
        },
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}