import React, { useState } from 'react'
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Button } from '../../../../../button'
import { Input } from '../../../../../input'
import { Label } from '../../../../../label'

export function YouTubeNode(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode } = props
  const [isEditing, setIsEditing] = useState(false)
  const [editUrl, setEditUrl] = useState(node.attrs.url || '')
  const [editTitle, setEditTitle] = useState(node.attrs.title || '')
  const [editEmbedCode, setEditEmbedCode] = useState(node.attrs.embedCode || '')

  const attrs = node.attrs as { url: string; title: string; videoId: string; embedCode: string }

  const handleSave = () => {
    // Extract video ID from URL if it's a YouTube URL
    let videoId = attrs.videoId
    if (editUrl && editUrl.includes('youtube.com') || editUrl.includes('youtu.be')) {
      const match = editUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
      if (match) {
        videoId = match[1]
      }
    }

    // Generate embed code if not provided
    let embedCode = editEmbedCode
    if (!embedCode && videoId) {
      embedCode = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
    }

    updateAttributes({
      url: editUrl,
      title: editTitle,
      videoId: videoId,
      embedCode: embedCode
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditUrl(attrs.url || '')
    setEditTitle(attrs.title || '')
    setEditEmbedCode(attrs.embedCode || '')
    setIsEditing(false)
  }

  return (
    <NodeViewWrapper className="youtube-wrapper">
      <div className="youtube-node">
        <div className="youtube-controls">
          <Button
            type="button"
            className="edit-youtube-button"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button
            type="button"
            className="delete-youtube-button"
            onClick={deleteNode}
          >
            Delete
          </Button>
        </div>

        {isEditing ? (
          <div className="youtube-edit-form">
            <div className="form-group">
              <Label>YouTube URL</Label>
              <Input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <Label>Video Title (Optional)</Label>
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter video title or leave blank to auto-detect"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <Label>Custom Embed Code (Optional)</Label>
              <textarea
                value={editEmbedCode}
                onChange={(e) => setEditEmbedCode(e.target.value)}
                placeholder="Paste custom iframe embed code here, or leave blank to auto-generate from URL"
                className="form-textarea"
                rows={4}
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                className="save-button"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="youtube-display">
            {attrs.title && (
              <div className="youtube-title">{attrs.title}</div>
            )}
            {attrs.embedCode && attrs.embedCode.trim() ? (
              <div 
                className="youtube-embed-container"
                dangerouslySetInnerHTML={{ __html: attrs.embedCode }}
              />
            ) : attrs.url ? (
              <div className="youtube-error">
                <p>YouTube embed code not found, but URL is available: {attrs.url}</p>
                <p>Please edit this embed to add the embed code.</p>
              </div>
            ) : (
              <div className="youtube-error">
                <p>No YouTube URL or embed code provided.</p>
                <p>Please edit this embed to add a YouTube URL.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
