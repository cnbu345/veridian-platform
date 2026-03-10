// src/components/editor/WysiwygEditor.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createEditor, Descendant, Editor, Transforms, Text, Range, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact, useSlate, useSelected, useFocused } from 'slate-react'
import { withHistory } from 'slate-history'
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
  Eye,
  EyeOff,
  Save
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

// Helper function to clean HTML before deserializing
const cleanHtml = (html: string): string => {
  if (!html) return ''
  
  let cleaned = html
  
  // Remove any remaining nested paragraphs (just in case)
  cleaned = cleaned.replace(/<p>\s*<p>/g, '<p>')
  cleaned = cleaned.replace(/<\/p>\s*<\/p>/g, '</p>')
  
  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, '')
  
  // Fix headings that might still be in paragraphs
  cleaned = cleaned.replace(/<p>\s*<(h[1-6])>/g, '<$1>')
  cleaned = cleaned.replace(/<\/\1>\s*<\/p>/g, '</$1>')
  
  return cleaned
}

// Helper function to convert HTML to Slate's internal format
const deserialize = (html: string): Descendant[] => {
  const cleanHtml_content = cleanHtml(html)
  
  if (!cleanHtml_content) return [{ type: 'paragraph', children: [{ text: '' }] }]
  
  const parser = new DOMParser()
  const doc = parser.parseFromString(cleanHtml_content, 'text/html')
  
  const deserializeNode = (node: Node): any => {
    if (node.nodeType === 3) {
      return { text: node.textContent || '' }
    }
    
    if (node.nodeType !== 1) return null
    
    const element = node as Element
    const children = Array.from(element.childNodes).map(deserializeNode).filter(Boolean)
    
    switch (element.nodeName.toLowerCase()) {
      case 'p':
        return { type: 'paragraph', children }
      case 'h1':
        return { type: 'heading', level: 1, children }
      case 'h2':
        return { type: 'heading', level: 2, children }
      case 'h3':
        return { type: 'heading', level: 3, children }
      case 'ul':
        return { type: 'bulleted-list', children }
      case 'ol':
        return { type: 'numbered-list', children }
      case 'li':
        return { type: 'list-item', children }
      case 'blockquote':
        return { type: 'blockquote', children }
      case 'pre':
        return { type: 'code-block', children }
      case 'a':
        return {
          type: 'link',
          url: element.getAttribute('href') || '',
          children,
        }
      case 'strong':
      case 'b':
        return { text: children[0]?.text || '', bold: true }
      case 'em':
      case 'i':
        return { text: children[0]?.text || '', italic: true }
      case 'u':
        return { text: children[0]?.text || '', underline: true }
      case 's':
      case 'strike':
        return { text: children[0]?.text || '', strikethrough: true }
      default:
        return children
    }
  }
  
  const result = Array.from(doc.body.childNodes).map(deserializeNode).filter(Boolean)
  return result.length > 0 ? result : [{ type: 'paragraph', children: [{ text: '' }] }]
}

// Helper function to serialize Slate's format back to HTML
const serialize = (nodes: Descendant[]): string => {
  return nodes.map(node => serializeNode(node)).join('')
}

const serializeNode = (node: any): string => {
  if (Text.isText(node)) {
    let text = node.text
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    if (node.strikethrough) text = `<s>${text}</s>`
    return text
  }
  
  const children = node.children.map((n: any) => serializeNode(n)).join('')
  
  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading':
      return `<h${node.level}>${children}</h${node.level}>`
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'numbered-list':
      return `<ol>${children}</ol>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`
    case 'code-block':
      return `<pre><code>${children}</code></pre>`
    case 'link':
      return `<a href="${node.url}">${children}</a>`
    default:
      return children
  }
}

// Custom element components
const Element = ({ attributes, children, element }: any) => {
  const style = { textAlign: element.align }
  
  switch (element.type) {
    case 'heading':
      const HeadingTag = `h${element.level}`
      return <HeadingTag {...attributes} style={style} className="font-bold">{children}</HeadingTag>
    case 'bulleted-list':
      return <ul {...attributes} style={style} className="list-disc pl-6 mb-4">{children}</ul>
    case 'numbered-list':
      return <ol {...attributes} style={style} className="list-decimal pl-6 mb-4">{children}</ol>
    case 'list-item':
      return <li {...attributes} style={style} className="mb-1">{children}</li>
    case 'blockquote':
      return <blockquote {...attributes} style={style} className="border-l-4 border-slate-200 pl-4 my-4 text-slate-600">{children}</blockquote>
    case 'code-block':
      return <pre {...attributes} style={style} className="bg-slate-100 p-4 rounded-lg overflow-x-auto"><code>{children}</code></pre>
    case 'link':
      return <a {...attributes} href={element.url} className="text-gold-600 hover:text-gold-700 underline">{children}</a>
    default:
      return <p {...attributes} style={style} className="mb-4">{children}</p>
  }
}

// Custom leaf components (for text formatting)
const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) children = <strong>{children}</strong>
  if (leaf.italic) children = <em>{children}</em>
  if (leaf.underline) children = <u>{children}</u>
  if (leaf.strikethrough) children = <s>{children}</s>
  
  return <span {...attributes}>{children}</span>
}

// Toolbar button component
const ToolbarButton = ({ 
  active, 
  onClick, 
  children,
  title 
}: { 
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  title?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-colors",
      active 
        ? "bg-gold-600 text-white" 
        : "text-navy-600 hover:bg-slate-100"
    )}
  >
    {children}
  </button>
)

// Format button for marks (bold, italic, etc.)
const MarkButton = ({ format, icon: Icon }: { format: string; icon: any }) => {
  const editor = useSlate()
  
  const isActive = () => {
    const marks = Editor.marks(editor) as any
    return marks ? marks[format] === true : false
  }
  
  const toggleMark = () => {
    const marks = Editor.marks(editor) as any
    if (marks?.[format]) {
      editor.removeMark(format)
    } else {
      editor.addMark(format, true)
    }
  }
  
  return (
    <ToolbarButton active={isActive()} onClick={toggleMark} title={format}>
      <Icon className="w-4 h-4" />
    </ToolbarButton>
  )
}

// Block button for block elements
const BlockButton = ({ format, icon: Icon }: { format: string; icon: any }) => {
  const editor = useSlate()
  
  const isActive = () => {
    const [match] = Array.from(
      Editor.nodes(editor, {
        match: n => 
          !Editor.isEditor(n) && 
          SlateElement.isElement(n) && 
          n.type === format,
      })
    )
    return !!match
  }
  
  const toggleBlock = () => {
    const isActive = Editor.nodes(editor, {
      match: n => 
        !Editor.isEditor(n) && 
        SlateElement.isElement(n) && 
        n.type === format,
    }).next().value
    
    Transforms.unwrapNodes(editor, {
      match: n => 
        !Editor.isEditor(n) && 
        SlateElement.isElement(n) && 
        ['bulleted-list', 'numbered-list'].includes(n.type as string),
      split: true,
    })
    
    if (isActive) {
      Transforms.setNodes(editor, { type: 'paragraph' })
    } else {
      Transforms.setNodes(editor, { type: format })
    }
  }
  
  return (
    <ToolbarButton active={isActive()} onClick={toggleBlock} title={format}>
      <Icon className="w-4 h-4" />
    </ToolbarButton>
  )
}

export default function WysiwygEditor({ 
  value, 
  onChange, 
  placeholder = 'Write your content here...',
  height = '400px'
}: WysiwygEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  
  const [editorValue, setEditorValue] = useState<Descendant[]>(() => 
    deserialize(value)
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderElement = useCallback((props: any) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, [])

  if (!mounted) {
    return (
      <div className="border border-slate-200 rounded-xl p-4" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto" />
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <Slate
        editor={editor}
        initialValue={editorValue}
        onChange={(value) => {
          setEditorValue(value)
          onChange(serialize(value))
        }}
      >
        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1">
          {/* Headings */}
          <div className="flex items-center gap-1 mr-2">
            <BlockButton format="heading" icon={Heading1} />
            <BlockButton format="heading" icon={Heading2} />
            <BlockButton format="heading" icon={Heading3} />
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          {/* Text formatting */}
          <div className="flex items-center gap-1 mr-2">
            <MarkButton format="bold" icon={Bold} />
            <MarkButton format="italic" icon={Italic} />
            <MarkButton format="underline" icon={Underline} />
            <MarkButton format="strikethrough" icon={Strikethrough} />
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-1 mr-2">
            <BlockButton format="bulleted-list" icon={List} />
            <BlockButton format="numbered-list" icon={ListOrdered} />
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          {/* Blocks */}
          <div className="flex items-center gap-1 mr-2">
            <BlockButton format="blockquote" icon={Quote} />
            <BlockButton format="code-block" icon={Code} />
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          {/* Preview Toggle */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Hide Preview" : "Show Preview"}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          {/* History */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.undo()}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.redo()}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor/Preview Split View */}
        <div className="flex" style={{ height }}>
          {/* Editor */}
          <div className={cn(
            "overflow-y-auto p-4",
            showPreview ? "w-1/2 border-r border-slate-200" : "w-full"
          )}>
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder={placeholder}
              spellCheck
              autoFocus
              className="focus:outline-none"
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 overflow-y-auto p-4 bg-white">
              <div className="prose prose-slate max-w-none">
                <div dangerouslySetInnerHTML={{ __html: value }} />
              </div>
            </div>
          )}
        </div>
      </Slate>

      <style jsx>{`
        :global(.slate-editor) {
          outline: none;
        }
        :global(.slate-editor:focus) {
          outline: none;
        }
        :global(.slate-editor p) {
          margin-bottom: 1rem;
        }
        :global(.slate-editor h1) {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        :global(.slate-editor h2) {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        :global(.slate-editor h3) {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        :global(.slate-editor ul),
        :global(.slate-editor ol) {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        :global(.slate-editor li) {
          margin-bottom: 0.25rem;
        }
        :global(.slate-editor blockquote) {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #64748b;
        }
        :global(.slate-editor pre) {
          background-color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        :global(.slate-editor a) {
          color: #b8860b;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}