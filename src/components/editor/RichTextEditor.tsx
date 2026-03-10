'use client'

import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { useState, useEffect, useRef } from 'react'

// Dynamically import ReactQuill with no SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="border border-slate-200 rounded-xl p-8 h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600" />
    </div>
  )
})

interface RichTextEditorProps {
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
    ['link', 'image'],
    ['clean']
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'align',
  'blockquote', 'code-block',
  'link', 'image'
]

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Write your content here...',
  height = '500px'
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
    
    // Clean up on unmount
    return () => {
      if (editorRef.current) {
        // Remove any lingering editor instances
        editorRef.current = null
      }
    }
  }, [])

  if (!mounted) {
    return (
      <div className="border border-slate-200 rounded-xl p-8" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto" />
      </div>
    )
  }

  return (
    <div className="rich-text-editor">
      <style jsx global>{`
        .rich-text-editor .ql-container {
          height: ${height};
          font-family: inherit;
          font-size: 1rem;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e2e8f0;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: #e2e8f0;
          background-color: #f8fafc;
        }
        
        .rich-text-editor .ql-editor {
          min-height: 200px;
          max-height: 600px;
          overflow-y: auto;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          left: 12px;
          right: 12px;
        }
        
        .rich-text-editor .ql-editor h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .rich-text-editor .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .rich-text-editor .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .rich-text-editor .ql-editor p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        
        .rich-text-editor .ql-editor ul, 
        .rich-text-editor .ql-editor ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .rich-text-editor .ql-editor li {
          margin-bottom: 0.25rem;
        }
        
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #b8860b;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #475569;
          font-style: italic;
        }
        
        .rich-text-editor .ql-editor a {
          color: #b8860b;
          text-decoration: underline;
        }
        
        .rich-text-editor .ql-editor a:hover {
          color: #9a7a0a;
        }
        
        .rich-text-editor .ql-editor pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
      <ReactQuill
        ref={editorRef}
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