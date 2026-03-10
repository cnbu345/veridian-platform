// src/components/upload/ImageUpload.tsx - Image Upload
'use client'

import { useState, useRef } from 'react'
import { Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  className?: string
}

export default function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    try {
      setUploading(true)

      // Create a local preview
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `blog/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      setPreview(value)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          <img
            src={preview}
            alt="Featured"
            className="w-full h-48 object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-gold-500 hover:bg-gold-50/50 transition-colors cursor-pointer"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
              <p className="text-sm text-navy-600">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5 text-navy-500" />
              </div>
              <p className="text-sm font-medium text-navy-700 mb-1">
                Click to upload featured image
              </p>
              <p className="text-xs text-navy-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}