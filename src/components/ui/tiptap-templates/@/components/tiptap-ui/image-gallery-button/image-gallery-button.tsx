import React from 'react'
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor'
import { Button } from '../../tiptap-ui-primitive/button/button'

interface ImageGalleryButtonProps {
  onUploadImage?: (file: File) => Promise<string>
}

export function ImageGalleryButton({ onUploadImage }: ImageGalleryButtonProps) {
  const { editor } = useTiptapEditor()

  const handleInsertGallery = () => {
    if (!editor) return

    // Insert an empty image gallery
    editor.commands.insertImageGallery({ images: [] })
  }

  if (!editor) {
    return null
  }

  return (
    <Button
      type="button"
      data-style="ghost"
      onClick={handleInsertGallery}
      className="image-gallery-button"
      title="Insert Image Gallery"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="tiptap-button-icon"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
      Gallery
    </Button>
  )
}
