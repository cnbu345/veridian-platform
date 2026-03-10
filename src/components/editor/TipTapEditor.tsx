// src/components/editor/TipTapEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

const MenuButton = ({ 
  onClick, 
  active, 
  disabled, 
  children,
  title 
}: { 
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-colors",
      active 
        ? "bg-gold-600 text-white" 
        : "text-navy-600 hover:bg-slate-100",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {children}
  </button>
)

export default function TipTapEditor({ 
  value, 
  onChange, 
  placeholder = 'Write your content here...',
  height = '500px'
}: TipTapEditorProps) {
  const [mounted, setMounted] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gold-600 hover:text-gold-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none p-4',
        style: `min-height: ${height}; overflow-y: auto;`,
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!mounted || !editor) {
    return (
      <div className="border border-slate-200 rounded-xl p-8" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto" />
      </div>
    )
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1">
        {/* Headings */}
        <div className="flex items-center gap-1 mr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Text formatting */}
        <div className="flex items-center gap-1 mr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-1 mr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Blocks */}
        <div className="flex items-center gap-1 mr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Insert */}
        <div className="flex items-center gap-1 mr-2">
          <MenuButton onClick={addLink} active={editor.isActive('link')} title="Add Link">
            <LinkIcon className="w-4 h-4" />
          </MenuButton>
          <MenuButton onClick={addImage} title="Add Image">
            <ImageIcon className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* History */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>
      </div>

      {/* Editor Content */}
      <div style={{ height, overflowY: 'auto' }} className="bg-white">
        <EditorContent editor={editor} />
      </div>

      <style jsx>{`
        :global(.ProseMirror) {
          padding: 1rem;
          outline: none;
        }
        
        :global(.ProseMirror h1) {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        :global(.ProseMirror h2) {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        :global(.ProseMirror h3) {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        :global(.ProseMirror p) {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        
        :global(.ProseMirror ul),
        :global(.ProseMirror ol) {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        :global(.ProseMirror li) {
          margin-bottom: 0.25rem;
        }
        
        :global(.ProseMirror blockquote) {
          border-left: 4px solid #b8860b;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #475569;
          font-style: italic;
        }
        
        :global(.ProseMirror a) {
          color: #b8860b;
          text-decoration: underline;
        }
        
        :global(.ProseMirror a:hover) {
          color: #9a7a0a;
        }
        
        :global(.ProseMirror pre) {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        
        :global(.ProseMirror img) {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  )
}