import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { pdfTheme } from '../theme'

const styles = StyleSheet.create({
  section: {
    marginBottom: pdfTheme.spacing.xl,
  },
  title: {
    fontSize: pdfTheme.fontSize.xl,
    fontWeight: 'bold',
    color: pdfTheme.colors.navy[900],
    marginBottom: pdfTheme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: pdfTheme.colors.gold[500],
    paddingBottom: pdfTheme.spacing.xs,
  },
  content: {
    fontSize: pdfTheme.fontSize.base,
    lineHeight: 1.6,
    color: pdfTheme.colors.navy[800],
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: pdfTheme.spacing.xs,
    paddingLeft: pdfTheme.spacing.lg,
  },
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: pdfTheme.colors.gold[600],
    borderRadius: 2,
    marginRight: pdfTheme.spacing.sm,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: pdfTheme.fontSize.base,
    color: pdfTheme.colors.navy[800],
    lineHeight: 1.6,
  },
  highlight: {
    backgroundColor: pdfTheme.colors.gold[50],
    padding: pdfTheme.spacing.md,
    borderRadius: pdfTheme.borderRadius.md,
    marginVertical: pdfTheme.spacing.sm,
  },
  highlightText: {
    fontSize: pdfTheme.fontSize.base,
    color: pdfTheme.colors.navy[900],
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -pdfTheme.spacing.xs,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: pdfTheme.spacing.xs,
    marginBottom: pdfTheme.spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: pdfTheme.colors.navy[200],
    borderRadius: pdfTheme.borderRadius.md,
    padding: pdfTheme.spacing.md,
  },
  cardTitle: {
    fontSize: pdfTheme.fontSize.sm,
    fontWeight: 'bold',
    color: pdfTheme.colors.navy[900],
    marginBottom: pdfTheme.spacing.xs,
  },
  cardValue: {
    fontSize: pdfTheme.fontSize.xl,
    fontWeight: 'bold',
    color: pdfTheme.colors.gold[600],
    marginBottom: pdfTheme.spacing.xs,
  },
  cardDesc: {
    fontSize: pdfTheme.fontSize.xs,
    color: pdfTheme.colors.navy[500],
  }
})

interface PDFSectionProps {
  title: string
  children?: React.ReactNode
  content?: string
  bulletPoints?: string[]
  highlight?: string
}

export const PDFSection: React.FC<PDFSectionProps> = ({ 
  title, 
  children, 
  content,
  bulletPoints,
  highlight
}) => {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.title}>{title}</Text>
      
      {content && (
        <Text style={styles.content}>{content}</Text>
      )}
      
      {bulletPoints && bulletPoints.length > 0 && (
        <View style={{ marginTop: pdfTheme.spacing.sm }}>
          {bulletPoints.map((point, index) => (
            <View key={index} style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}
        </View>
      )}
      
      {highlight && (
        <View style={[styles.highlight, { marginTop: pdfTheme.spacing.sm }]}>
          <Text style={styles.highlightText}>{highlight}</Text>
        </View>
      )}
      
      {children}
    </View>
  )
}

export const PDFMetricCard: React.FC<{
  title: string
  value: string
  description?: string
}> = ({ title, value, description }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    {description && <Text style={styles.cardDesc}>{description}</Text>}
  </View>
)

export const PDFGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.grid}>{children}</View>
)

export const PDFGridItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.gridItem}>{children}</View>
)