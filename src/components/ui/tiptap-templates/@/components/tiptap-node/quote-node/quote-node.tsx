import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import './quote-node.scss';

interface QuoteNodeProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
  selected: boolean;
  editor: any;
}

export const QuoteNode: React.FC<QuoteNodeProps> = ({ 
  node, 
  updateAttributes, 
  deleteNode,
  selected,
  editor 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(node.attrs.text || '');
  const [author, setAuthor] = useState(node.attrs.author || '');
  const [width, setWidth] = useState(node.attrs.width || 'full');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    
    const pos = editor?.view.posAtDOM(e.currentTarget, 0);
    console.log('Quote drag start, pos:', pos); // Debug log
    
    if (pos !== null) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'quote',
        pos: pos,
        node: node.toJSON()
      }));
      console.log('Quote drag data set:', { type: 'quote', pos, node: node.toJSON() }); // Debug log
    }
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleSave = () => {
    updateAttributes({ text, author, width });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    deleteNode();
  };

  // Show edit mode if there's no text yet
  React.useEffect(() => {
    if (!text && !author) {
      setIsEditing(true);
    }
  }, []);

  return (
    <NodeViewWrapper 
      className={`quote-wrapper ${selected ? 'selected' : ''}`} 
      contentEditable={false}
    >
      <div 
        className="quote-container"
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {isEditing ? (
          <div className="quote-editor">
            <div className="quote-icon">"</div>
            <textarea
              className="quote-text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your quote here..."
              rows={4}
              autoFocus
            />
            <input
              className="quote-author-input"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="— Author name (optional)"
            />
            <div className="quote-width-controls">
              <label className="quote-width-label">Width:</label>
              <select
                className="quote-width-select"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              >
                <option value="full">Full Width</option>
                <option value="wide">Wide (80%)</option>
                <option value="medium">Medium (60%)</option>
                <option value="narrow">Narrow (40%)</option>
              </select>
            </div>
            <div className="quote-actions">
              <button 
                type="button"
                className="quote-button quote-button-save" 
                onClick={handleSave}
              >
                Save
              </button>
              <button 
                type="button"
                className="quote-button quote-button-cancel" 
                onClick={handleDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={`quote-display quote-width-${width}`}>
            <div className="quote-icon">"</div>
            <div className="quote-content">
              <p className="quote-text">{text}</p>
              {author && <p className="quote-author">— {author}</p>}
            </div>
            <div className="quote-controls">
              <button 
                type="button"
                className="quote-control-button" 
                onClick={handleEdit}
                title="Edit quote"
              >
                ✏️
              </button>
              <button 
                type="button"
                className="quote-control-button" 
                onClick={handleDelete}
                title="Delete quote"
              >
                🗑️
              </button>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

