// src/lib/queue/reportQueue.ts
// Report generation queue with template support

import { createClient } from '@/lib/supabase/server'
import { generateReport } from '@/lib/reports/generator'
import { updateReportStatus } from '@/lib/reports/storage'
import { generatePDF, savePDFToStorage } from '@/lib/pdf'
import { getTemplateServer } from '@/lib/templates/storage.server'

interface QueueItem {
  id: string
  reportId: string
  userId: string
  params: any
  priority: number
  templateId?: string | null
  createdAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retryCount?: number
}

class ReportQueue {
  private queue: QueueItem[] = []
  private isProcessing = false
  private maxConcurrent = 1
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    console.log('📦 ReportQueue instance created')
  }

  // Start background processing
  startProcessing() {
    if (this.processingInterval) {
      console.log('⚠️ Queue processor already running')
      return
    }
    
    console.log('🚀 Starting queue processor...')
    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, 5000) // Check every 5 seconds
  }

  // Stop background processing
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
      console.log('⏹️ Queue processor stopped')
    }
  }

  // Manual process trigger (for API)
  async processQueue() {
    if (this.isProcessing) {
      console.log('⚠️ Queue already processing, skipping...')
      return
    }
    
    await this.processQueueInternal()
  }

  private async processQueueInternal() {
    if (this.isProcessing) return
    
    const pendingItems = this.queue.filter(item => item.status === 'pending')
    if (pendingItems.length === 0) return
    
    console.log(`🔄 Processing queue - ${pendingItems.length} items pending`)
    this.isProcessing = true
    
    try {
      for (const item of pendingItems) {
        if (item.status === 'pending') {
          await this.processItem(item)
        }
      }
    } catch (error) {
      console.error('Queue processing error:', error)
    } finally {
      this.isProcessing = false
    }
  }

  async addToQueue(
    reportId: string, 
    userId: string, 
    params: any, 
    priority: number = 1,
    templateId?: string | null
  ) {
    console.log(`📥 Adding report ${reportId} to queue with template: ${templateId || 'none'}`)
    
    const item: QueueItem = {
      id: crypto.randomUUID(),
      reportId,
      userId,
      params,
      priority,
      templateId: templateId || null,
      createdAt: new Date(),
      status: 'pending',
      retryCount: 0
    }
    
    // Insert at correct priority position
    const insertIndex = this.queue.findIndex(q => q.priority < priority)
    if (insertIndex === -1) {
      this.queue.push(item)
    } else {
      this.queue.splice(insertIndex, 0, item)
    }
    
    console.log(`📊 Queue size: ${this.queue.length}, pending: ${this.getQueueStatus().pending}`)
    
    // Trigger immediate processing
    this.processQueueInternal()
  }
  
  private async processItem(item: QueueItem) {
    console.log(`🔄 Processing report ${item.reportId} (Template: ${item.templateId || 'none'})`)
    
    item.status = 'processing'
    
    try {
      // Update status to generating
      await updateReportStatus(item.reportId, 'generating')
      
      // Get template if provided
      let template = null
      if (item.templateId) {
        console.log(`📋 Fetching template ${item.templateId} for report ${item.reportId}`)
        template = await getTemplateServer(item.templateId, item.userId)
        if (template) {
          console.log(`✅ Template loaded: ${template.name}`)
        } else {
          console.log(`⚠️ Template ${item.templateId} not found, using default`)
        }
      }
      
      // Generate the report content
      console.log(`🤖 Generating AI report content for ${item.reportId}`)
      const companyData = {
        name: item.params.companyName,
        industry: item.params.industry,
        size: item.params.companySize,
        budget: item.params.budget
      }
      
      const locationData = {
        city: item.params.city,
        state: item.params.state,
        tier: item.params.locationTier,
        nearestRegulatoryHub: item.params.nearestRegulatoryHub
      }
      
      const strategyData = {
        primary: item.params.primaryFocus,
        secondary: item.params.secondaryFocus,
        timeline: item.params.timeline,
        concerns: item.params.concerns,
        goals: item.params.goals
      }
      
      const generatedContent = await generateReport(
        companyData,
        locationData,
        strategyData,
        item.userId
      )
      
      // Update report with generated content
      await updateReportStatus(item.reportId, 'ready', {
        ...generatedContent,
        templateId: item.templateId,
        templateName: template?.name
      })
      
      // Get the updated report
      const supabase = await createClient()
      const { data: report } = await supabase
        .from('reports')
        .select('*')
        .eq('id', item.reportId)
        .single()
      
      if (report) {
        // Generate PDF using the factory with template
        console.log(`📄 Generating PDF for report ${item.reportId} with template: ${template?.name || 'default'}`)
        
        // Attach template to report for PDF generation
        const reportWithTemplate = {
          ...report,
          template: template
        }
        
        const pdfBlob = await generatePDF(reportWithTemplate, template)
        
        if (pdfBlob && pdfBlob.size > 0) {
          // Save PDF to storage
          await savePDFToStorage(report, pdfBlob)
          console.log(`✅ PDF saved for report ${item.reportId}`)
        } else {
          console.log(`⚠️ PDF generation produced empty blob for report ${item.reportId}`)
        }
      }
      
      item.status = 'completed'
      console.log(`✅ Report ${item.reportId} completed successfully`)
      
      // Remove completed item from queue
      this.queue = this.queue.filter(q => q.id !== item.id)
      
    } catch (error) {
      console.error(`❌ Failed to process report ${item.reportId}:`, error)
      
      // Retry logic
      const retryCount = item.retryCount || 0
      if (retryCount < 3) {
        item.retryCount = retryCount + 1
        item.status = 'pending'
        console.log(`🔄 Retrying report ${item.reportId} (attempt ${item.retryCount}/3)`)
      } else {
        item.status = 'failed'
        // Update report status to failed
        await updateReportStatus(item.reportId, 'failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }
  
  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      processing: this.queue.filter(i => i.status === 'processing').length,
      completed: this.queue.filter(i => i.status === 'completed').length,
      failed: this.queue.filter(i => i.status === 'failed').length
    }
  }

  getQueueItems() {
    return [...this.queue]
  }

  clearQueue() {
    this.queue = []
    console.log('🧹 Queue cleared')
  }
}

// Create singleton instance
export const reportQueue = new ReportQueue()

// Export for backward compatibility
export default reportQueue