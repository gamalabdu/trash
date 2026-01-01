import React, { useState } from 'react'
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor'
import Button from '../../tiptap-ui-primitive/button/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../../dialog'
import { Input } from '../../../../../input'
import { Label } from '../../../../../label'

interface YouTubeButtonProps {}

export function YouTubeButton({}: YouTubeButtonProps) {
  const { editor } = useTiptapEditor()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleInsertYouTube = () => {
    if (!editor || !url.trim()) return

    // Extract video ID from URL
    let videoId = ''
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(youtubeRegex)
    if (match) {
      videoId = match[1]
    }

    // Generate embed code with 16:9 aspect ratio
    const embedCode = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`

    // Insert a new YouTube embed
    editor.commands.insertYouTube({ 
      url: url.trim(),
      title: title.trim(),
      videoId: videoId,
      embedCode: embedCode
    })

    // Reset form and close modal
    setUrl('')
    setTitle('')
    setIsOpen(false)
  }

  if (!editor) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          className="youtube-button"
          title="Insert YouTube Video"
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
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4l9.6-3.6a2 2 0 0 1 1.2 0l9.6 3.6a2 2 0 0 1 1.4 1.4 24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4l-9.6 3.6a2 2 0 0 1-1.2 0l-9.6-3.6a2 2 0 0 1-1.4-1.4z"/>
            <polyline points="7,13 12,18 17,13"/>
            <polyline points="7,6 12,11 17,6"/>
          </svg>
          YouTube
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-red-500">📺</span>
            Add YouTube Video
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL *</Label>
            <Input
              id="youtube-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
            <p className="text-sm text-gray-400">
              Paste a YouTube video URL (youtube.com or youtu.be)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube-title">Video Title (Optional)</Label>
            <Input
              id="youtube-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title or leave blank"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-sm text-gray-400">
              Optional title for the video. If left blank, the video will be embedded without a title.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              data-style="ghost"
              onClick={() => {
                setUrl('')
                setTitle('')
                setIsOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-style="primary"
              onClick={handleInsertYouTube}
              disabled={!url.trim()}
              className="bg-red-500 hover:bg-red-600"
            >
              Insert Video
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
