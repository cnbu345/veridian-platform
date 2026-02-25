// src/lib/queue/reportQueue.ts // Manages report generation queue

import { createClient } from '@/lib/supabase/server'
import { generateRegulatoryReport } from '@/lib/openai/openai'
import { getStateRegulation } from '@/lib/location/regulations'
import { updateReportStatus } from '@/lib/reports/storage'
import { generateReportPDF } from '@/lib/pdf/generator'

export interface QueueJob {
  id: string
  reportId: string
  userId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  priority: number
  attempts: number
  maxAttempts: number
  error?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

export interface ReportGenerationParams {
  companyName: string
  industry: string
  companySize: string
  budget: string
  city: string
  state: string
  locationTier: string
  nearestRegulatoryHub?: string
  primaryFocus: string
  secondaryFocus: string[]
  timeline: string
  concerns: string
  goals: string
}

class ReportQueue {
  private static instance: ReportQueue
  private processing: boolean = false
  private maxConcurrent: number = 3
  private activeJobs: number = 0
  private processorInterval: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): ReportQueue {
    if (!ReportQueue.instance) {
      ReportQueue.instance = new ReportQueue()
    }
    return ReportQueue.instance
  }

  // Initialize the queue processor
  startProcessor(intervalMs: number = 5000) {
    if (this.processorInterval) {
      clearInterval(this.processorInterval)
    }
    
    console.log('🔄 Starting queue processor with interval:', intervalMs, 'ms')
    this.processorInterval = setInterval(() => {
      //console.log('⏰ Queue processor tick - checking for jobs...')
      this.processQueue().catch(error => {
        console.error('❌ Error in queue processor:', error)
      })
    }, intervalMs)
    
    // Run immediately on start
    console.log('⚡ Running initial queue check...')
    this.processQueue().catch(console.error)
  }

  // Stop the processor
  stopProcessor() {
    if (this.processorInterval) {
      clearInterval(this.processorInterval)
      this.processorInterval = null
      console.log('🛑 Queue processor stopped')
    }
  }

  // Add a report generation job to the queue
  async addToQueue(
    reportId: string,
    userId: string,
    params: ReportGenerationParams,
    priority: number = 0
  ): Promise<void> {
    console.log(`📝 Adding report ${reportId} to queue for user ${userId}...`)
    console.log('📊 Report params:', {
      companyName: params.companyName,
      state: params.state,
      primaryFocus: params.primaryFocus
    })

    const supabase = await createClient()

    const { error } = await supabase
      .from('report_generation_queue')
      .insert({
        report_id: reportId,
        user_id: userId,
        status: 'queued',
        priority,
        attempts: 0,
        max_attempts: 3,
        params: params,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ Failed to add job to queue:', error)
      throw error
    }

    console.log(`✅ Report ${reportId} added to queue successfully`)

    // Trigger processing if not already running
    if (!this.processing) {
      console.log('🚀 Triggering immediate queue processing...')
      this.processQueue()
    }
  }

  // Process the queue
  async processQueue(): Promise<void> {
   // console.log('🔍 processQueue called - Current state:', {
    //  processing: this.processing,
    //  activeJobs: this.activeJobs,
    //  maxConcurrent: this.maxConcurrent
    //})

    if (this.processing) {
     // console.log('⏳ Queue processor already running, skipping...')
      return
    }

    if (this.activeJobs >= this.maxConcurrent) {
      //console.log(`⏳ Already at max concurrent jobs (${this.activeJobs}/${this.maxConcurrent})`)
      return
    }

    this.processing = true
    //console.log('🔍 Checking for queued jobs...')

    try {
      const supabase = await createClient()

      // Get next jobs from queue
     // console.log('📡 Querying database for queued jobs...')
      const { data: jobs, error } = await supabase
        .from('report_generation_queue')
        .select('*')
        .eq('status', 'queued')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(this.maxConcurrent - this.activeJobs)

      if (error) {
        console.error('❌ Database error when fetching jobs:', error)
        throw error
      }

      //console.log('📊 Queue query result:', { 
       //jobsFound: jobs?.length || 0,
       // jobsData: jobs?.map(j => ({ 
        //  id: j.id, 
         // reportId: j.report_id, 
         // status: j.status,
         // createdAt: j.created_at 
        //}))
      //})

      if (!jobs || jobs.length === 0) {
        //console.log('📭 No queued jobs found')
        return
      }

      console.log(`📦 Found ${jobs.length} queued job(s) - starting processing`)

      // Process each job
      for (const job of jobs) {
        this.activeJobs++
        console.log(`⚙️ Starting job ${job.id} for report ${job.report_id}. Active jobs: ${this.activeJobs}/${this.maxConcurrent}`)
        
        // Process without awaiting to allow concurrent jobs
        this.processJob(job)
          .catch(error => console.error(`❌ Job ${job.id} failed:`, error))
          .finally(() => {
            this.activeJobs--
            console.log(`✅ Job ${job.id} finished. Active jobs now: ${this.activeJobs}/${this.maxConcurrent}`)
          })
      }
    } catch (error) {
      console.error('❌ Queue processing error:', error)
    } finally {
      this.processing = false
      //console.log('🔓 Queue processor unlocked')
      
      // If there are more jobs and capacity, continue processing
      if (this.activeJobs < this.maxConcurrent) {
        //console.log('⏱️ Scheduling next queue check in 1 second...')
        setTimeout(() => this.processQueue(), 1000)
      }
    }
  }

  // Process individual job
  private async processJob(job: any): Promise<void> {
    console.log(`🔄 Processing job ${job.id} (attempt ${job.attempts + 1}/${job.max_attempts})`)
    console.log(`📋 Job details:`, {
      jobId: job.id,
      reportId: job.report_id,
      userId: job.user_id,
      status: job.status,
      createdAt: job.created_at
    })

    const supabase = await createClient()
    const startTime = Date.now()

    try {
      // Update job status to processing
      console.log(`📝 Updating job ${job.id} status to 'processing'...`)
      await supabase
        .from('report_generation_queue')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          attempts: job.attempts + 1
        })
        .eq('id', job.id)

      // Update report status
      console.log(`📝 Updating report ${job.report_id} status to 'generating'...`)
      await updateReportStatus(job.report_id, 'generating')

      // Generate the report
      const params = job.params as ReportGenerationParams
      console.log(`🤖 Starting AI report generation for ${params.companyName} in ${params.state}...`)
      console.log('📊 Generation params:', {
        companyName: params.companyName,
        state: params.state,
        industry: params.industry,
        primaryFocus: params.primaryFocus
      })
      
      const reportContent = await generateRegulatoryReport(params)
      console.log(`✅ AI report generated successfully. Content length: ${reportContent.length} characters`)

      // Get state regulation data
      console.log(`📚 Fetching regulation data for ${params.state}...`)
      const regulation = getStateRegulation(params.state)
      console.log(`✅ Regulation data fetched:`, {
        cryptoFriendly: regulation.cryptoFriendly,
        moneyTransmitter: regulation.moneyTransmitter
      })

      // Prepare full report content
      const fullReport = {
        ...params,
        content: reportContent,
        regulation: regulation,
        generated_at: new Date().toISOString(),
        generation_time_ms: Date.now() - startTime
      }

      // Update report with generated content
      console.log(`📝 Saving generated report to database...`)
      const { data: report, error: updateError } = await supabase
        .from('reports')
        .update({
          report_content: fullReport,
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', job.report_id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Error updating report:', updateError)
        throw updateError
      }

      console.log(`✅ Report ${job.report_id} saved to database successfully`)
      console.log(`⏱️ AI generation took ${Date.now() - startTime}ms`)

      // Generate PDF and store it
      if (report) {
        try {
          console.log(`📄 Generating PDF for report ${report.id}...`)
          const pdfBlob = await generateReportPDF(report)
          console.log(`✅ PDF generated, size: ${pdfBlob.size} bytes`)
          
          // Upload PDF to Supabase Storage
          const fileName = `${report.id}/Veridian_Regulatory_Report_${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
          console.log(`📤 Uploading PDF to storage: ${fileName}`)
          
          const { error: uploadError } = await supabase.storage
            .from('reports')
            .upload(fileName, pdfBlob, {
              contentType: 'application/pdf',
              cacheControl: '3600',
              upsert: true
            })

          if (uploadError) {
            console.error('❌ Error uploading PDF:', uploadError)
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('reports')
              .getPublicUrl(fileName)

            // Update report with PDF URL
            console.log(`📝 Updating report with PDF URL...`)
            await supabase
              .from('reports')
              .update({ pdf_url: urlData.publicUrl })
              .eq('id', report.id)
              
            console.log('✅ PDF uploaded successfully:', urlData.publicUrl)
          }
        } catch (pdfError) {
          console.error('❌ PDF generation failed:', pdfError)
          // Continue even if PDF fails - user can still view in browser
        }
      }

      // Mark job as completed
      console.log(`📝 Marking job ${job.id} as completed...`)
      await supabase
        .from('report_generation_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      // Log success metrics
      console.log(`📊 Logging success metrics to audit_log...`)
      await supabase
        .from('audit_log')
        .insert({
          user_id: job.user_id,
          action: 'report_generation_completed',
          entity_type: 'report',
          entity_id: job.report_id,
          metadata: {
            generation_time_ms: Date.now() - startTime,
            attempts: job.attempts + 1
          }
        })

      console.log(`🎉 Report ${job.report_id} generated and processed successfully in ${Date.now() - startTime}ms`)

    } catch (error: any) {
      console.error(`❌ Job ${job.id} failed with error:`, error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })

      // Check if we should retry
      if (job.attempts < job.max_attempts - 1) {
        // Requeue with exponential backoff
        console.log(`🔄 Requeueing job ${job.id} for retry ${job.attempts + 1}/${job.max_attempts}`)
        await supabase
          .from('report_generation_queue')
          .update({
            status: 'queued',
            error: error.message,
            attempts: job.attempts + 1
          })
          .eq('id', job.id)
      } else {
        // Mark as failed
        console.log(`❌ Job ${job.id} permanently failed after ${job.max_attempts} attempts`)
        await supabase
          .from('report_generation_queue')
          .update({
            status: 'failed',
            error: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id)

        // Update report status
        console.log(`📝 Updating report ${job.report_id} status to 'failed'`)
        await updateReportStatus(job.report_id, 'failed', { error: error.message })
      }

      // Log error
      console.log(`📊 Logging failure to audit_log...`)
      await supabase
        .from('audit_log')
        .insert({
          user_id: job.user_id,
          action: 'report_generation_failed',
          entity_type: 'report',
          entity_id: job.report_id,
          metadata: {
            error: error.message,
            attempts: job.attempts + 1
          }
        })
    }
  }

  // Get queue status
  async getQueueStatus(): Promise<any> {
    const supabase = await createClient()

    const [queued, processing, completed, failed] = await Promise.all([
      supabase.from('report_generation_queue').select('*', { count: 'exact', head: true }).eq('status', 'queued'),
      supabase.from('report_generation_queue').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
      supabase.from('report_generation_queue').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('report_generation_queue').select('*', { count: 'exact', head: true }).eq('status', 'failed')
    ])

    return {
      queued: queued.count || 0,
      processing: processing.count || 0,
      completed: completed.count || 0,
      failed: failed.count || 0,
      activeJobs: this.activeJobs,
      maxConcurrent: this.maxConcurrent
    }
  }

  // Clear failed jobs
  async clearFailedJobs(): Promise<void> {
    const supabase = await createClient()
    await supabase
      .from('report_generation_queue')
      .delete()
      .eq('status', 'failed')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Older than 7 days
  }
}

// Export singleton instance
export const reportQueue = ReportQueue.getInstance()

// Initialize queue processor
export function initializeQueueProcessor() {
  console.log('🚀 Initializing report queue processor...')
  reportQueue.startProcessor(5000) // Process every 5 seconds
  console.log('✅ Report queue processor initialized and running')
}