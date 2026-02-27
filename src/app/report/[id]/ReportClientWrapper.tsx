// src/app/report/[id]/ReportClientWrapper.tsx
'use client'

import { usePathname } from 'next/navigation'
import ReportViewClient from './ReportViewClient'

interface ReportClientWrapperProps {
  report: any
}

export default function ReportClientWrapper({ report }: ReportClientWrapperProps) {
  return <ReportViewClient report={report} />
}