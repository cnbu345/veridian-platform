// src/lib/pdf/components/PDFFooter.tsx
import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { pdfTheme } from '../theme'

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: pdfTheme.spacing.lg,
    left: pdfTheme.spacing.xl,
    right: pdfTheme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.navy[200],
    paddingTop: pdfTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: pdfTheme.fontSize.xs,
    color: pdfTheme.colors.navy[400],
  },
  pageNumber: {
    color: pdfTheme.colors.navy[500],
    fontSize: pdfTheme.fontSize.xs,
  },
  disclaimer: {
    color: pdfTheme.colors.navy[400],
    fontSize: pdfTheme.fontSize.xs,
    maxWidth: '70%',
    lineHeight: 1.4,
  }
})

interface PDFFooterProps {
  pageNumber?: number
  totalPages?: number
  showDisclaimer?: boolean
  showConfidential?: boolean
}

export const PDFFooter: React.FC<PDFFooterProps> = ({ 
  pageNumber, 
  totalPages,
  showDisclaimer = true,
  showConfidential = false
}) => {
  return (
    <View style={styles.footer} fixed>
      {showDisclaimer && (
        <Text style={styles.disclaimer}>
          {showConfidential && 'CONFIDENTIAL • '}
          For informational and reference purposes only. Not legal advice. Veridian Group is not a law firm. 
          Consult qualified legal counsel before acting on any recommendations.
        </Text>
      )}
      {pageNumber && totalPages && (
        <Text style={styles.pageNumber}>
          Page {pageNumber} of {totalPages}
        </Text>
      )}
    </View>
  )
}