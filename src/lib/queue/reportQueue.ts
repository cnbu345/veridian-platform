// src/lib/queue/reportQueue.ts
// Background job queue for report generation to prevent timeouts

import { createClient } from '@/lib/supabase/server'
import { generateRegulatoryReport } from '@/lib/openai/openai'
import { getStateRegulation } from '@/lib/location/regulations'
import { updateReportStatus } from '@/lib/reports/storage'

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

  private constructor() {}

  static getInstance(): ReportQueue {
    if (!ReportQueue.instance) {
      ReportQueue.instance = new ReportQueue()
    }
    return ReportQueue.instance
  }

  // Add a report generation job to the queue
  async addToQueue(
    reportId: string,
    userId: string,
    params: ReportGenerationParams,
    priority: number = 0
  ): Promise<void> {
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
      console.error('Failed to add job to queue:', error)
      throw error
    }

    // Trigger processing if not already running
    if (!this.processing) {
      this.processQueue()
    }
  }

  // Process the queue (call this from a cron job or after adding jobs)
  async processQueue(): Promise<void> {
    if (this.processing || this.activeJobs >= this.maxConcurrent) {
      return
    }

    this.processing = true
    const supabase = await createClient()

    try {
      // Get next jobs from queue
      const { data: jobs, error } = await supabase
        .from('report_generation_queue')
        .select('*')
        .eq('status', 'queued')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(this.maxConcurrent - this.activeJobs)

      if (error) throw error

      // Process each job
      for (const job of jobs || []) {
        this.activeJobs++
        this.processJob(job).finally(() => {
          this.activeJobs--
        })
      }
    } catch (error) {
      console.error('Queue processing error:', error)
    } finally {
      this.processing = false
      
      // If there are more jobs and capacity, continue processing
      if (this.activeJobs < this.maxConcurrent) {
        setTimeout(() => this.processQueue(), 1000)
      }
    }
  }

  // Process individual job
  private async processJob(job: any): Promise<void> {
    const supabase = await createClient()
    const startTime = Date.now()

    try {
      // Update job status to processing
      await supabase
        .from('report_generation_queue')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          attempts: job.attempts + 1
        })
        .eq('id', job.id)

      // Update report status
      await updateReportStatus(job.report_id, 'generating')

      // Generate the report
      const params = job.params as ReportGenerationParams
      const reportContent = await generateRegulatoryReport(params)

      // Get state regulation data
      const regulation = getStateRegulation(params.state)

      // Prepare full report content
      const fullReport = {
        ...params,
        content: reportContent,
        regulation: regulation,
        generated_at: new Date().toISOString(),
        generation_time_ms: Date.now() - startTime
      }

      // Update report with generated content
      await supabase
        .from('reports')
        .update({
          report_content: fullReport,
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', job.report_id)

      // Mark job as completed
      await supabase
        .from('report_generation_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      // Log success metrics
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

    } catch (error: any) {
      console.error(`Job ${job.id} failed:`, error)

      // Check if we should retry
      if (job.attempts < job.max_attempts - 1) {
        // Requeue with exponential backoff
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
        await supabase
          .from('report_generation_queue')
          .update({
            status: 'failed',
            error: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id)

        // Update report status
        await updateReportStatus(job.report_id, 'failed', { error: error.message })
      }

      // Log error
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

// Initialize queue processor (call this on server start)
export function initializeQueueProcessor() {
  // Process queue every 5 seconds
  setInterval(() => {
    reportQueue.processQueue()
  }, 5000)
}