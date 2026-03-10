// src/components/editor/BlogEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { cn } from '@/lib/utils/utils'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="border border-slate-200 rounded-xl p-8 h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600" />
    </div>
  )
})

interface BlogEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video',
  'color', 'background'
]

export default function BlogEditor({ 
  value, 
  onChange, 
  placeholder = 'Write your blog post content here...',
  height = '500px'
}: BlogEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="border border-slate-200 rounded-xl p-8" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto" />
      </div>
    )
  }

  return (
    <div className="blog-editor">
      <style jsx global>{`
        .blog-editor .ql-container {
          height: ${height};
          font-family: inherit;
          font-size: 1rem;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e2e8f0;
        }
        
        .blog-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: #e2e8f0;
          background-color: #f8fafc;
        }
        
        .blog-editor .ql-editor {
          min-height: 300px;
          max-height: 600px;
          overflow-y: auto;
        }
        
        .blog-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          left: 12px;
          right: 12px;
        }
        
        .blog-editor .ql-editor h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .blog-editor .ql-editor h2 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .blog-editor .ql-editor h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .blog-editor .ql-editor p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        
        .blog-editor .ql-editor ul, 
        .blog-editor .ql-editor ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .blog-editor .ql-editor li {
          margin-bottom: 0.25rem;
        }
        
        .blog-editor .ql-editor blockquote {
          border-left: 4px solid #b8860b;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #475569;
          font-style: italic;
        }
        
        .blog-editor .ql-editor a {
          color: #b8860b;
          text-decoration: underline;
        }
        
        .blog-editor .ql-editor a:hover {
          color: #9a7a0a;
        }
        
        .blog-editor .ql-editor pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        
        .blog-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  )
}