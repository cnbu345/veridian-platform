import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { pdfTheme } from '../theme'

const styles = StyleSheet.create({
  cover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: pdfTheme.spacing.xxl,
    backgroundColor: pdfTheme.colors.navy[900],
  },
  title: {
    fontSize: pdfTheme.fontSize.xxxl,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center' as const,
    marginBottom: pdfTheme.spacing.lg,
  },
  subtitle: {
    fontSize: pdfTheme.fontSize.xl,
    color: pdfTheme.colors.gold[500],
    textAlign: 'center' as const,
    marginBottom: pdfTheme.spacing.xxl,
  },
  companyName: {
    fontSize: pdfTheme.fontSize.lg,
    color: 'white',
    textAlign: 'center' as const,
    marginBottom: pdfTheme.spacing.md,
    opacity: 0.9,
  },
  location: {
    fontSize: pdfTheme.fontSize.base,
    color: pdfTheme.colors.navy[300],
    textAlign: 'center' as const,
    marginBottom: pdfTheme.spacing.xl,
  },
  date: {
    fontSize: pdfTheme.fontSize.sm,
    color: pdfTheme.colors.navy[400],
    textAlign: 'center' as const,
    marginTop: pdfTheme.spacing.xxl,
  },
  logo: {
    fontSize: pdfTheme.fontSize.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: pdfTheme.spacing.xxl,
  },
  logoGold: {
    color: pdfTheme.colors.gold[500],
  },
  badge: {
    backgroundColor: pdfTheme.colors.gold[500],
    paddingVertical: pdfTheme.spacing.sm,
    paddingHorizontal: pdfTheme.spacing.lg,
    borderRadius: pdfTheme.borderRadius.xl,
    marginTop: pdfTheme.spacing.xl,
  },
  badgeText: {
    color: pdfTheme.colors.navy[900],
    fontSize: pdfTheme.fontSize.sm,
    fontWeight: 'bold',
  }
})

interface PDFCoverProps {
  companyName: string
  city: string
  state: string
  date?: Date
  reportId?: string
}

export const PDFCover: React.FC<PDFCoverProps> = ({ 
  companyName, 
  city, 
  state, 
  date = new Date(),
  reportId
}) => {
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <View style={styles.cover}>
      <Text style={styles.logo}>
        Veridian<Text style={styles.logoGold}>Group</Text>
      </Text>
      
      <Text style={styles.title}>
        Web3 Strategy Report
      </Text>
      
      <Text style={styles.subtitle}>
        Location-Intelligent Analysis
      </Text>
      
      <View style={styles.badge}>
        <Text style={styles.badgeText}>CONFIDENTIAL</Text>
      </View>
      
      <Text style={styles.companyName}>{companyName}</Text>
      
      <Text style={styles.location}>
        {city}, {state}
      </Text>
      
      <Text style={styles.date}>{formattedDate}</Text>
      
      {reportId && (
        <Text style={[styles.date, { marginTop: pdfTheme.spacing.md, fontSize: 8 }]}>
          Report ID: {reportId}
        </Text>
      )}
    </View>
  )
}