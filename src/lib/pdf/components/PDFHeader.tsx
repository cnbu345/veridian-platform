import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { pdfTheme } from '../theme'

const styles = StyleSheet.create({
  header: {
    marginBottom: pdfTheme.spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: pdfTheme.colors.gold[500],
    paddingBottom: pdfTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: pdfTheme.fontSize.xl,
    fontWeight: 'bold',
    color: pdfTheme.colors.navy[900],
  },
  logoGold: {
    color: pdfTheme.colors.gold[600],
  },
  reportType: {
    fontSize: pdfTheme.fontSize.sm,
    color: pdfTheme.colors.navy[500],
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  date: {
    fontSize: pdfTheme.fontSize.xs,
    color: pdfTheme.colors.navy[400],
    textAlign: 'right' as const,
  },
  confidential: {
    fontSize: pdfTheme.fontSize.xs,
    color: pdfTheme.colors.navy[400],
    marginTop: pdfTheme.spacing.xs,
  }
})

interface PDFHeaderProps {
  reportType?: string
  date?: Date
  showConfidential?: boolean
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ 
  reportType = 'Strategy Report',
  date = new Date(),
  showConfidential = true
}) => {
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>
          Veridian<Text style={styles.logoGold}>Group</Text>
        </Text>
        <Text style={styles.reportType}>{reportType}</Text>
        {showConfidential && (
          <Text style={styles.confidential}>CONFIDENTIAL • FOR INTERNAL USE</Text>
        )}
      </View>
      <View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </View>
  )
}