// src/types/knowledge-base.ts
export interface KBCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  article_count?: number
}

export interface KBArticle {
  id: string
  category_id: string | null
  title: string
  slug: string
  content: string
  excerpt: string | null
  author_id: string | null
  views: number
  helpful_count: number
  not_helpful_count: number
  tags: string[] | null
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  published_at: string | null
  category?: KBCategory
  author?: {
    full_name: string | null
    email: string
  }
}

export interface FAQItem {
  id: string
  category: string | null
  question: string
  answer: string
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ArticleFeedback {
  id: string
  article_id: string
  user_id: string | null
  is_helpful: boolean
  comment: string | null
  created_at: string
}