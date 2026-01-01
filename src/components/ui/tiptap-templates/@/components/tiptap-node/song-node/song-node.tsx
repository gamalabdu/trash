import React, { useState } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { Button } from '../../tiptap-ui-primitive/button/button'
import { SongNodeProps } from './song-node-types'

export function SongNode(props: SongNodeProps) {
  const { node, updateAttributes, deleteNode } = props
  const attrs = node.attrs as { title: string; artist: string; id: number; coverArt: string; musicUrl: string }
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: attrs.title || '',
    artist: attrs.artist || '',
    id: attrs.id || 0,
    coverArt: attrs.coverArt || '',
    musicUrl: attrs.musicUrl || ''
  })

  const handleSave = () => {
    updateAttributes(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      title: attrs.title || '',
      artist: attrs.artist || '',
      id: attrs.id || 0,
      coverArt: attrs.coverArt || '',
      musicUrl: attrs.musicUrl || ''
    })
    setIsEditing(false)
  }

  const handleFileUpload = (type: 'coverArt' | 'musicUrl') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = type === 'coverArt' ? 'image/*' : 'audio/*'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setEditData(prev => ({ ...prev, [type]: result }))
        }
        reader.readAsDataURL(file)
      }
    }
    
    input.click()
  }

  return (
    <NodeViewWrapper className="song-wrapper">
      <div className="song-node">
        <div className="song-controls">
          <Button
            type="button"
            data-style="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="edit-song-button"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button
            type="button"
            data-style="ghost"
            onClick={deleteNode}
            className="delete-song-button"
          >
            Delete
          </Button>
        </div>

        {isEditing ? (
          <div className="song-edit-form">
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Artist:</label>
              <input
                type="text"
                value={editData.artist}
                onChange={(e) => setEditData(prev => ({ ...prev, artist: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>ID:</label>
              <input
                type="number"
                value={editData.id}
                onChange={(e) => setEditData(prev => ({ ...prev, id: parseInt(e.target.value) || 0 }))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Cover Art:</label>
              <div className="file-upload-group">
                <input
                  type="text"
                  value={editData.coverArt}
                  onChange={(e) => setEditData(prev => ({ ...prev, coverArt: e.target.value }))}
                  className="form-input"
                  placeholder="Cover art URL"
                />
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleFileUpload('coverArt')}
                  className="upload-button"
                >
                  Upload
                </Button>
              </div>
            </div>
            <div className="form-group">
              <label>Music URL:</label>
              <div className="file-upload-group">
                <input
                  type="text"
                  value={editData.musicUrl}
                  onChange={(e) => setEditData(prev => ({ ...prev, musicUrl: e.target.value }))}
                  className="form-input"
                  placeholder="Music file URL"
                />
                <Button
                  type="button"
                  data-style="ghost"
                  onClick={() => handleFileUpload('musicUrl')}
                  className="upload-button"
                >
                  Upload
                </Button>
              </div>
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
          <div className="song-display">
            <div className="song-info">
              <div className="song-title">{attrs.title || 'Untitled Song'}</div>
              <div className="song-artist">{attrs.artist || 'Unknown Artist'}</div>
              {attrs.id && <div className="song-id">ID: {attrs.id}</div>}
            </div>
            
            {attrs.coverArt && (
              <div className="song-cover">
                <img
                  src={attrs.coverArt}
                  alt={`${attrs.title} cover`}
                  className="cover-image"
                />
              </div>
            )}
            
            {attrs.musicUrl && (
              <div className="song-player">
                <audio controls className="audio-player">
                  <source src={attrs.musicUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
