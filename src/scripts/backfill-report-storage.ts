// src/scripts/backfill-report-storage.ts
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { generateReportPDF } from '@/lib/pdf/generator'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  console.error('\nMake sure your .env.local file has these variables set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function backfillReportStorage() {
  console.log('🚀 Starting backfill of report storage...\n')

  // Get all reports that don't have storage_path
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .is('storage_path', null)

  if (error) {
    console.error('Error fetching reports:', error)
    return
  }

  if (!reports || reports.length === 0) {
    console.log('✅ All reports already have storage paths!')
    return
  }

  console.log(`📊 Found ${reports.length} reports without storage paths\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i]
    
    try {
      console.log(`[${i + 1}/${reports.length}] Processing: ${report.company_name}`)
      
      // Check if report has pdf_url already
      if (report.pdf_url) {
        console.log(`   📎 Using existing PDF at: ${report.pdf_url.substring(0, 80)}...`)
        
        // Fetch the existing PDF
        const response = await fetch(report.pdf_url)
        
        if (response.ok) {
          const pdfBlob = await response.blob()
          
          // Create storage path
          const sanitizedName = report.company_name
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50)
          const fileName = `${sanitizedName}_Regulatory_Report_${new Date(report.created_at).toISOString().split('T')[0]}.pdf`
          const storagePath = `${report.user_id}/${report.id}/${fileName}`
          
          // Upload to storage
          const { error: uploadError } = await supabase
            .storage
            .from('reports')
            .upload(storagePath, pdfBlob, {
              contentType: 'application/pdf',
              cacheControl: '3600',
              upsert: true
            })
          
          if (uploadError) {
            throw uploadError
          }
          
          // Generate fresh signed URL
          const { data: { signedUrl } } = await supabase
            .storage
            .from('reports')
            .createSignedUrl(storagePath, 31536000) // 1 year
          
          // Update report with storage info
          await supabase
            .from('reports')
            .update({
              storage_path: storagePath,
              pdf_url: signedUrl,
              file_size: pdfBlob.size
            })
            .eq('id', report.id)
          
          console.log(`   ✅ Uploaded to storage: ${storagePath}`)
          successCount++
        } else {
          throw new Error(`Failed to fetch existing PDF: ${response.status}`)
        }
      } else {
        // Generate new PDF
        console.log(`   🔄 Generating new PDF...`)
        const pdfBlob = await generateReportPDF(report)
        
        // Create storage path
        const sanitizedName = report.company_name
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 50)
        const fileName = `${sanitizedName}_Regulatory_Report_${new Date(report.created_at).toISOString().split('T')[0]}.pdf`
        const storagePath = `${report.user_id}/${report.id}/${fileName}`
        
        // Upload to storage
        const { error: uploadError } = await supabase
          .storage
          .from('reports')
          .upload(storagePath, pdfBlob, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: true
          })
        
        if (uploadError) {
          throw uploadError
        }
        
        // Generate fresh signed URL
        const { data: { signedUrl } } = await supabase
          .storage
          .from('reports')
          .createSignedUrl(storagePath, 31536000)
        
        // Update report with storage info
        await supabase
          .from('reports')
          .update({
            storage_path: storagePath,
            pdf_url: signedUrl,
            file_size: pdfBlob.size
          })
          .eq('id', report.id)
        
        console.log(`   ✅ Generated and uploaded to storage: ${storagePath}`)
        successCount++
      }
      
    } catch (error) {
      console.error(`   ❌ Failed:`, error instanceof Error ? error.message : 'Unknown error')
      failCount++
    }
  }

  console.log('\n📊 Backfill complete!')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📊 Total: ${reports.length}`)
}

backfillReportStorage()