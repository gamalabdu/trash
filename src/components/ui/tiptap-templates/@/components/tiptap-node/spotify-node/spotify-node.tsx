import React, { useState } from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { Button } from '../../tiptap-ui-primitive/button/button'

export function SpotifyNode(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode } = props
  const attrs = node.attrs as { url: string; title: string; iframeCode: string }
  
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    url: attrs.url || '',
    title: attrs.title || '',
    iframeCode: attrs.iframeCode || ''
  })

  const handleSave = () => {
    updateAttributes(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      url: attrs.url || '',
      title: attrs.title || '',
      iframeCode: attrs.iframeCode || ''
    })
    setIsEditing(false)
  }


  return (
    <NodeViewWrapper className="spotify-wrapper">
      <div className="spotify-node">
        <div className="spotify-controls">
          <Button
            type="button"
            data-style="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="edit-spotify-button"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button
            type="button"
            data-style="ghost"
            onClick={deleteNode}
            className="delete-spotify-button"
          >
            Delete
          </Button>
        </div>

        {isEditing ? (
          <div className="spotify-edit-form">
            <div className="form-group">
              <label>Spotify Iframe Code:</label>
              <textarea
                value={editData.iframeCode}
                onChange={(e) => setEditData(prev => ({ ...prev, iframeCode: e.target.value }))}
                className="form-textarea"
                placeholder='<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/3H3kzlDWxN9KEFuUtv39p2?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Title (optional):</label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                placeholder="Song/Album/Playlist title"
              />
            </div>
            <div className="form-actions">
              <Button
                type="button"
                data-style="primary"
                onClick={handleSave}
                className="save-button"
              >
                Save
              </Button>
              <Button
                type="button"
                data-style="ghost"
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="spotify-display">
            {attrs.title && (
              <div className="spotify-title">{attrs.title}</div>
            )}
            {attrs.iframeCode && attrs.iframeCode.trim() ? (
              <div 
                className="spotify-embed-container"
                dangerouslySetInnerHTML={{ __html: attrs.iframeCode }}
              />
            ) : attrs.url ? (
              <div className="spotify-error">
                <p>Spotify embed code not found, but URL is available: {attrs.url}</p>
                <p>Please edit this embed to add the iframe code.</p>
              </div>
            ) : (
              <div className="spotify-error">
                <p>No Spotify embed code provided.</p>
                <p>Please edit this embed to add the iframe code.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
