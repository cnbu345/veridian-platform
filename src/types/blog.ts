// src/types/blog.ts
export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
  post_count?: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  author_id: string | null
  category_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  views: number
  read_time: number | null
  tags: string[] | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  is_featured: boolean
  allow_comments: boolean
  created_at: string
  updated_at: string
  author?: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
  category?: BlogCategory
}

export interface BlogComment {
  id: string
  post_id: string
  user_id: string | null
  author_name: string | null
  author_email: string | null
  content: string
  is_approved: boolean
  created_at: string
}

export interface CreateBlogPostInput {
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image?: string
  category_id?: string
  status: 'draft' | 'published'
  tags?: string[]
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  is_featured?: boolean
  allow_comments?: boolean
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {}