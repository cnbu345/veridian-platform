// src/lib/pdf/components/PDFExecutiveSummary.tsx
import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { pdfTheme } from '../theme'

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: pdfTheme.colors.navy[900],
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: pdfTheme.colors.gold[500],
    paddingBottom: 8,
  },
  overviewCard: {
    backgroundColor: pdfTheme.colors.navy[50],
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: pdfTheme.colors.navy[200],
  },
  overviewText: {
    fontSize: 11,
    color: pdfTheme.colors.navy[800],
    lineHeight: 1.6,
  },
  findingsContainer: {
    marginBottom: 15,
  },
  findingsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: pdfTheme.colors.navy[900],
    marginBottom: 8,
  },
  findingItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: pdfTheme.colors.gold[600],
    borderRadius: 2,
    marginRight: 8,
    marginTop: 5,
  },
  findingText: {
    flex: 1,
    fontSize: 10,
    color: pdfTheme.colors.navy[700],
    lineHeight: 1.5,
  },
  riskCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: pdfTheme.colors.gold[600],
  },
  riskLabel: {
    fontSize: 9,
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  riskText: {
    fontSize: 10,
    color: '#78350F',
    lineHeight: 1.5,
  },
  focusCard: {
    backgroundColor: pdfTheme.colors.gold[50],
    borderRadius: 6,
    padding: 12,
    marginTop: 10,
  },
  focusLabel: {
    fontSize: 9,
    color: pdfTheme.colors.gold[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  focusText: {
    fontSize: 10,
    color: pdfTheme.colors.navy[900],
    fontWeight: 'bold',
  },
})

interface PDFExecutiveSummaryProps {
  companyName: string
  overview: string
  keyFindings: string[]
  riskSummary: string
  strategicFocus: string
}

export const PDFExecutiveSummary: React.FC<PDFExecutiveSummaryProps> = ({
  companyName,
  overview,
  keyFindings,
  riskSummary,
  strategicFocus,
}) => (
  <View style={styles.container}>
    <Text style={styles.header}>Executive Summary</Text>
    
    <View style={styles.overviewCard}>
      <Text style={styles.overviewText}>{overview}</Text>
    </View>
    
    <View style={styles.findingsContainer}>
      <Text style={styles.findingsTitle}>Key Findings</Text>
      {keyFindings.map((finding, index) => (
        <View key={index} style={styles.findingItem}>
          <View style={styles.bullet} />
          <Text style={styles.findingText}>{finding}</Text>
        </View>
      ))}
    </View>
    
    <View style={styles.riskCard}>
      <Text style={styles.riskLabel}>Risk Assessment</Text>
      <Text style={styles.riskText}>{riskSummary}</Text>
    </View>
    
    <View style={styles.focusCard}>
      <Text style={styles.focusLabel}>Strategic Focus</Text>
      <Text style={styles.focusText}>{strategicFocus}</Text>
    </View>
  </View>
)