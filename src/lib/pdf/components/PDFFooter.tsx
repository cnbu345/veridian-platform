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
    fontSize: pdfTheme.fontSize.xs,
    color: pdfTheme.colors.navy[400],
  },
  pageNumber: {
    color: pdfTheme.colors.navy[500],
  },
  disclaimer: {
    color: pdfTheme.colors.navy[400],
    fontStyle: 'italic',
  }
})

interface PDFFooterProps {
  pageNumber?: number
  totalPages?: number
  showDisclaimer?: boolean
}

export const PDFFooter: React.FC<PDFFooterProps> = ({ 
  pageNumber, 
  totalPages,
  showDisclaimer = true 
}) => {
  return (
    <View style={styles.footer} fixed>
      {showDisclaimer && (
        <Text style={styles.disclaimer}>
          Not legal or financial advice. See full disclaimer.
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