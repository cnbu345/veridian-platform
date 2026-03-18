// src/lib/reports/contentCleaner.ts
// Ultimate content cleaner

export class ContentCleaner {
  /**
   * Cleans raw AI content by removing all markdown artifacts
   */
  static clean(content: string): string {
    if (!content) return ''
    
    let cleaned = content
    
    // Remove ALL markdown headers patterns (##, ###, *2., *3., etc.)
    cleaned = cleaned.replace(/^#{1,6}\s+\d+\.?\s*/gm, '') // ## 2. or ### 3.
    cleaned = cleaned.replace(/^\*\d+\.\s*/gm, '') // *2. or *3.
    cleaned = cleaned.replace(/^##\s*/gm, '') // ## headers
    cleaned = cleaned.replace(/^\*\*/gm, '') // ** at start of line
    
    // Remove markdown bold/italic markers throughout
    cleaned = cleaned.replace(/\*\*/g, '')
    cleaned = cleaned.replace(/\*/g, '')
    cleaned = cleaned.replace(/__/g, '')
    cleaned = cleaned.replace(/_/g, '')
    
    // Remove markdown links [text](url)
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    
    // Remove markdown images ![alt](url)
    cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    
    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '')
    
    // Remove markdown table formatting (| and --- lines)
    cleaned = cleaned.replace(/^\|.*\|$/gm, '') // Remove table rows
    cleaned = cleaned.replace(/^[\|\-\:\s]+$/gm, '') // Remove table separator lines
    
    // Remove remaining pipe characters
    cleaned = cleaned.replace(/\|/g, '')
    
    // Remove plus signs used as bullets
    cleaned = cleaned.replace(/^\s*\+\s+/gm, '')
    
    // Convert asterisk bullets to proper format
    cleaned = cleaned.replace(/^\s*\*\s+(.+)$/gm, '• $1')
    cleaned = cleaned.replace(/^\s*-\s+(.+)$/gm, '• $1')
    
    // Remove numbered list markers (1., 2., etc.) but keep the text
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '')
    
    // Fix multiple consecutive newlines
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')
    
    // Remove leading/trailing whitespace from each line
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n')
    
    // Remove email markdown artifacts
    cleaned = cleaned.replace(/\[Email:\s*([^\]]+)\]/g, 'Email: $1')
    cleaned = cleaned.replace(/\[Phone:\s*([^\]]+)\]/g, 'Phone: $1')
    
    // Fix any remaining malformed email/phone formatting
    cleaned = cleaned.replace(/mailto:[^\)]+\)/g, '')
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, (url) => {
      // Keep URLs but remove any surrounding brackets
      return url.replace(/[\[\]\(\)]/g, '')
    })
    
    // Remove any remaining square brackets
    cleaned = cleaned.replace(/[\[\]\(\)]/g, '')
    
    // Fix multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ')
    
    return cleaned.trim()
  }

  /**
   * Clean a section title by removing all markdown artifacts
   */
  static cleanSectionTitle(title: string): string {
    if (!title) return ''
    
    return title
      .replace(/^\*+\d*\.?\s*/, '') // Remove *2. or **3. at start
      .replace(/^#{1,6}\s*\d*\.?\s*/, '') // Remove ## 2. or ### 3.
      .replace(/\*\*/g, '') // Remove remaining **
      .replace(/\*/g, '') // Remove remaining *
      .trim()
  }

  /**
   * Extract a clean section without any markdown artifacts
   */
  static extractCleanSection(content: string, sectionTitle: string): string {
    if (!content) return ''
    
    // Try multiple patterns to find the section
    const patterns = [
      new RegExp(`(?:##\\s*\\d+\\.?\\s*)?${sectionTitle}[\\s\\S]*?(?=(?:##\\s*\\d+\\.?\\s*)?[A-Z][A-Z\s]+|$)`, 'i'),
      new RegExp(`(?:\\*\\*\\d+\\.?\\s*)?${sectionTitle}[\\s\\S]*?(?=\\*\\*\\d+\\.?\\s*[A-Z]|$)`, 'i'),
      new RegExp(`${sectionTitle}[\\s\\S]*?(?=\\n\\n\\n|$)`, 'i'),
    ]
    
    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) {
        return this.clean(match[0])
      }
    }
    
    return ''
  }

  /**
   * Converts raw text with bullet points to a clean array
   */
  static extractBulletPoints(text: string): string[] {
    if (!text) return []
    
    const lines = text.split('\n')
    const bullets: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      // Match lines that start with bullet indicators
      if (trimmed.match(/^[•\*\+\-]\s+/)) {
        bullets.push(trimmed.replace(/^[•\*\+\-]\s+/, '').trim())
      } else if (trimmed.length > 30 && !trimmed.endsWith(':') && !trimmed.match(/^[A-Z\s]+$/)) {
        // Treat longer lines as potential bullet points if they're not headers
        bullets.push(trimmed)
      }
    }
    
    return bullets
  }
}