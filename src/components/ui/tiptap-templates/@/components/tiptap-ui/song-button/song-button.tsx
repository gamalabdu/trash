import React from 'react'
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor'
import { Button } from '../../tiptap-ui-primitive/button/button'

interface SongButtonProps {
  onUploadImage?: (file: File) => Promise<string>
}

export function SongButton({ onUploadImage }: SongButtonProps) {
  const { editor } = useTiptapEditor()

  const handleInsertSong = () => {
    if (!editor) return

    // Insert a new song with default values
    editor.commands.insertSong({ 
      title: 'New Song',
      artist: 'Unknown Artist',
      id: 0,
      coverArt: '',
      musicUrl: ''
    })
  }

  if (!editor) {
    return null
  }

  return (
    <Button
      type="button"
      data-style="ghost"
      onClick={handleInsertSong}
      className="song-button"
      title="Insert Song"
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
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
      Song
    </Button>
  )
}
