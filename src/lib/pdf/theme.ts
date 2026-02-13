// PDF Theme Configuration - Matches Veridian Group Branding
export const pdfTheme = {
  colors: {
    navy: {
      900: '#0A1A2F',
      800: '#1E2F45',
      700: '#2C3E5A',
      600: '#4A5B6E',
      500: '#6E86A3',
      400: '#94A3B8',
      300: '#CBD5E1',
      200: '#E2E8F0',
      100: '#F1F5F9',
      50: '#F8FAFC',
    },
    gold: {
      600: '#C6A13B',
      500: '#EAB308',
      400: '#F1C40F',
      300: '#F5D76F',
      200: '#F9E79F',
      100: '#FCF3CF',
      50: '#FDF9E7',
    },
    accent: {
      green: '#10B981',
      red: '#EF4444',
      amber: '#F59E0B',
      blue: '#3B82F6',
    }
  },
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    mono: 'Courier',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    section: 40,
  },
  fontSize: {
    xs: 8,
    sm: 10,
    base: 11,
    lg: 14,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  }
}

// Report Sections Configuration
export const REPORT_SECTIONS = [
  { id: 'executive-summary', title: 'Executive Summary', pages: 1 },
  { id: 'location-analysis', title: 'Location Intelligence Analysis', pages: 1 },
  { id: 'regulatory-landscape', title: 'State Regulatory Landscape', pages: 1 },
  { id: 'talent-ecosystem', title: 'Talent & Ecosystem Analysis', pages: 1 },
  { id: 'implementation-roadmap', title: '90-Day Implementation Roadmap', pages: 1 },
  { id: 'resource-directory', title: 'Local Resource Directory', pages: 1 },
  { id: 'risk-assessment', title: 'Risk Assessment & Mitigation', pages: 1 },
  { id: 'appendices', title: 'Appendices & Methodology', pages: 1 },
]

// Page size (Letter - standard for US business)
export const PDF_PAGE_SIZE = {
  width: 612, // 8.5in * 72 dpi
  height: 792, // 11in * 72 dpi
  margins: {
    top: 72, // 1 inch
    bottom: 72,
    left: 72,
    right: 72,
  }
}