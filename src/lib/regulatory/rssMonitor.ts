// src/lib/regulatory/rssMonitor.ts
// Phase 4: Monitor state regulator RSS feeds for updates

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: ReturnType<typeof createClient<Database>> | null = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
}

export interface RegulatorFeed {
  state_code: string
  state_name: string
  feed_url: string
  regulator_name: string
  last_checked: string
}

export interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: string
  category?: string
}

// State regulator RSS feeds
export const REGULATOR_FEEDS: RegulatorFeed[] = [
  {
    state_code: 'NY',
    state_name: 'New York',
    feed_url: 'https://www.dfs.ny.gov/press/press-releases.xml',
    regulator_name: 'NYDFS',
    last_checked: ''
  },
  {
    state_code: 'CA',
    state_name: 'California',
    feed_url: 'https://dfpi.ca.gov/category/press-releases/feed/',
    regulator_name: 'DFPI',
    last_checked: ''
  },
  {
    state_code: 'TX',
    state_name: 'Texas',
    feed_url: 'https://www.dob.texas.gov/news-events/rss.xml',
    regulator_name: 'Texas DOB',
    last_checked: ''
  },
  {
    state_code: 'FL',
    state_name: 'Florida',
    feed_url: 'https://www.flofr.gov/press-releases/rss',
    regulator_name: 'Florida OFR',
    last_checked: ''
  },
  {
    state_code: 'WY',
    state_name: 'Wyoming',
    feed_url: 'https://wyomingbankingdivision.wyo.gov/news/rss',
    regulator_name: 'Wyoming Banking',
    last_checked: ''
  }
]

/**
 * Fetch and parse an RSS feed
 */
export async function fetchRSSFeed(feedUrl: string): Promise<FeedItem[]> {
  try {
    const response = await fetch(feedUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()
    
    // Simple XML parsing (in production, use a proper XML parser like fast-xml-parser)
    const items: FeedItem[] = []
    
    // Extract item elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match
    
    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1]
      
      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemXml)
      const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(itemXml)
      const descMatch = /<description>([\s\S]*?)<\/description>/i.exec(itemXml)
      const dateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemXml)
      
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
          link: linkMatch[1].trim(),
          description: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').substring(0, 500) : '',
          pubDate: dateMatch ? dateMatch[1] : new Date().toISOString()
        })
      }
    }
    
    return items
  } catch (error) {
    console.error(`[RSSMonitor] Error fetching ${feedUrl}:`, error)
    return []
  }
}

/**
 * Check for updates from all regulators
 */
export async function checkAllRegulatorUpdates(): Promise<{
  state: string
  newItems: FeedItem[]
  changesDetected: boolean
}[]> {
  const results = []
  
  for (const feed of REGULATOR_FEEDS) {
    console.log(`[RSSMonitor] Checking ${feed.regulator_name} (${feed.state_code})...`)
    
    const items = await fetchRSSFeed(feed.feed_url)
    
    // Get last checked timestamp
    const { data: lastCheck } = await supabase
      ?.from('regulatory_audit_log')
      .select('changed_at')
      .eq('table_name', 'rss_check')
      .eq('record_id', feed.state_code)
      .order('changed_at', { ascending: false })
      .limit(1)
    
    const lastChecked = lastCheck?.[0]?.changed_at || new Date(0).toISOString()
    
    // Filter new items
    const newItems = items.filter(item => {
      const itemDate = new Date(item.pubDate)
      return itemDate > new Date(lastChecked)
    })
    
    // Log the check
    await supabase?.from('regulatory_audit_log').insert({
      table_name: 'rss_check',
      record_id: feed.state_code,
      action: 'SELECT',
      new_data: { items_found: items.length, new_items: newItems.length },
      changed_at: new Date().toISOString()
    })
    
    results.push({
      state: feed.state_code,
      newItems,
      changesDetected: newItems.length > 0
    })
    
    if (newItems.length > 0) {
      console.log(`[RSSMonitor] Found ${newItems.length} new items for ${feed.state_code}`)
    }
  }
  
  return results
}

/**
 * Flag facts for review based on RSS updates
 */
export async function flagFactsFromRSSUpdates(
  updates: { state: string; newItems: FeedItem[] }[]
): Promise<number> {
  let flagged = 0
  
  for (const update of updates) {
    if (update.newItems.length === 0) continue
    
    // Find facts for this state that might be affected
    const { data: facts, error } = await supabase
      ?.from('regulatory_facts')
      .select('id, claim, category')
      .eq('state_code', update.state)
      .eq('verification_status', 'verified')
    
    if (error || !facts) continue
    
    // Check if any RSS items mention relevant topics
    const relevantKeywords = ['license', 'regulation', 'digital asset', 'crypto', 'money transmitter', 'bitlicense']
    
    for (const item of update.newItems) {
      const itemText = (item.title + ' ' + item.description).toLowerCase()
      const isRelevant = relevantKeywords.some(keyword => itemText.includes(keyword))
      
      if (!isRelevant) continue
      
      // Flag all facts for this state for review
      for (const fact of facts) {
        const { error: updateError } = await supabase
          ?.from('regulatory_facts')
          .update({
            review_required: true,
            review_reason: `RSS update detected: ${item.title}`,
            verification_status: 'needs_update'
          })
          .eq('id', fact.id)
        
        if (!updateError) {
          flagged++
        }
      }
    }
  }
  
  return flagged
}