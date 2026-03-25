// src/app/admin/reports/components/ForceCompleteModal.tsx
'use client'

import { X, Zap, AlertTriangle, Loader2 } from 'lucide-react'

interface ForceCompleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  companyName: string
  isLoading: boolean
}

export function ForceCompleteModal({
  isOpen,
  onClose,
  onConfirm,
  companyName,
  isLoading
}: ForceCompleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900">
                Force Complete Report
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-navy-400" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-navy-700">
              Are you sure you want to force complete <strong className="text-navy-900">{companyName}</strong>?
            </p>
          </div>
          <p className="text-sm text-navy-500 mb-6 pl-8">
            This will mark the report as READY and generate a PDF. Use this for reports that are stuck in pending/generating status.
          </p>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Force Complete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}