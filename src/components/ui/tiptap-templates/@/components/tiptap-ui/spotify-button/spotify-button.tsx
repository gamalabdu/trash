import React, { useState } from 'react'
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor'
import { Button } from '../../tiptap-ui-primitive/button/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../dialog'
import { Input } from '../../../../../input'
import { Label } from '../../../../../label'

interface SpotifyButtonProps {}

export function SpotifyButton({}: SpotifyButtonProps) {
  const { editor } = useTiptapEditor()
  const [iframeCode, setIframeCode] = useState('')
  const [title, setTitle] = useState('')

  const handleInsertSpotify = () => {
    if (!editor || !iframeCode.trim()) return

    // Extract URL from iframe code for storage
    const urlMatch = iframeCode.match(/src="([^"]+)"/)
    const url = urlMatch ? urlMatch[1] : ''

    // Insert a new Spotify embed with the iframe code
    editor.commands.insertSpotify({ 
      url: url,
      title: title.trim(),
      iframeCode: iframeCode.trim()
    })

    // Reset form
    setIframeCode('')
    setTitle('')
  }

  if (!editor) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          className="spotify-button"
          title="Insert Spotify Embed"
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
          Spotify
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-green-500">🎵</span>
            Add Spotify Embed
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spotify-iframe">Spotify Iframe Code</Label>
            <textarea
              id="spotify-iframe"
              value={iframeCode}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIframeCode(e.target.value)}
              className="w-full min-h-[120px] p-3 border border-border rounded-md bg-background text-foreground font-mono text-sm resize-vertical"
              placeholder='<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/3H3kzlDWxN9KEFuUtv39p2?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spotify-title">Title (optional)</Label>
            <Input
              id="spotify-title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Song/Album/Playlist title"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <DialogTrigger asChild>
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  setIframeCode('')
                  setTitle('')
                }}
              >
                Cancel
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                type="button"
                data-style="primary"
                onClick={handleInsertSpotify}
                disabled={!iframeCode.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Insert Embed
              </Button>
            </DialogTrigger>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
