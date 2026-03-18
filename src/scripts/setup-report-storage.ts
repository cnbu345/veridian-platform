// src/scripts/setup-report-storage.ts
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupReportStorage() {
  console.log('🚀 Setting up report storage system...\n')

  // 1. Create the storage bucket
  console.log('📦 Creating storage bucket...')
  
  const { data: bucket, error: createError } = await supabase
    .storage
    .createBucket('reports', {
      public: false,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: ['application/pdf']
    })

  if (createError) {
    if (createError.message.includes('already exists')) {
      console.log('   ✅ Bucket already exists')
    } else {
      console.error('   ❌ Error creating bucket:', createError.message)
      return
    }
  } else {
    console.log('   ✅ Bucket created successfully')
  }

  // 2. Update bucket configuration
  console.log('\n🔧 Configuring bucket...')
  
  const { error: updateError } = await supabase
    .storage
    .updateBucket('reports', {
      public: false,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 20971520
    })

  if (updateError) {
    console.error('   ❌ Error updating bucket:', updateError.message)
  } else {
    console.log('   ✅ Bucket configured successfully')
  }

  // 3. Create storage policies using SQL
  console.log('\n📋 Storage policies to create:')
  console.log('='.repeat(60))
  
  const policies = `
-- 1. Allow users to read their own PDFs
CREATE POLICY "Users can read own PDFs" ON storage.objects
  FOR SELECT USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. Allow users to upload PDFs for their reports
CREATE POLICY "Users can upload own PDFs" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Allow admins to read all PDFs
CREATE POLICY "Admins can read all PDFs" ON storage.objects
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM users WHERE is_admin = true)
  );

-- 4. Allow service role full access
CREATE POLICY "Service role full access" ON storage.objects
  FOR ALL USING (
    auth.role() = 'service_role'
  );
`

  console.log(policies)
  console.log('='.repeat(60))
  console.log('\nPlease run these policies in your Supabase SQL editor.\n')

  // 4. Create folder structure for existing reports
  console.log('📁 Creating folder structure for existing reports...')
  
  const { data: existingReports } = await supabase
    .from('reports')
    .select('id, user_id, company_name')
    .is('storage_path', null)
    .limit(10) // Limit to avoid overwhelming

  if (existingReports && existingReports.length > 0) {
    console.log(`   Found ${existingReports.length} reports without storage`)
    
    for (const report of existingReports) {
      console.log(`   - Creating placeholder for report ${report.id}`)
      
      // Create a placeholder file to establish folder structure
      const placeholder = new Blob([''], { type: 'application/pdf' })
      const path = `${report.user_id}/${report.id}/.keep`
      
      await supabase.storage.from('reports').upload(path, placeholder, {
        contentType: 'application/pdf',
        upsert: true
      })
    }
  }

  console.log('\n✅ Storage setup complete!')
  console.log('\nNext steps:')
  console.log('1. Run the SQL policies in your Supabase dashboard')
  console.log('2. Update your PDF generator to save to storage')
  console.log('3. Update your download function to use stored PDFs')
}

setupReportStorage()