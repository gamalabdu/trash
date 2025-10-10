import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { 
  GripVertical, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  FileText,
  Music,
  Quote,
  Image as ImageIcon,
  Edit
} from 'lucide-react';
import RichTextEditor from './rich-text-editor';

interface ContentBlockProps {
  block: any;
  index: number;
  onUpdate: (index: number, updates: any) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const ContentBlock: React.FC<ContentBlockProps> = ({
  block,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
  isFirst = false,
  isLast = false
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const getBlockIcon = () => {
    switch (block._type) {
      case 'block': return <FileText className="w-4 h-4" />;
      case 'spotifyEmbed': return <Music className="w-4 h-4" />;
      case 'pullQuote': return <Quote className="w-4 h-4" />;
      case 'photoBlock': return <ImageIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getBlockTitle = () => {
    switch (block._type) {
      case 'block': return 'Text Block';
      case 'spotifyEmbed': return 'Spotify Embed';
      case 'pullQuote': return 'Pull Quote';
      case 'photoBlock': return 'Photo Block';
      default: return 'Content Block';
    }
  };

  const handleTextChange = (newText: string) => {
    if (block._type === 'block') {
      onUpdate(index, {
        children: [{
          _type: 'span',
          _key: block.children?.[0]?._key || `span-${Date.now()}`,
          text: newText,
          marks: []
        }]
      });
    } else if (block._type === 'pullQuote') {
      onUpdate(index, { text: newText });
    }
  };

  const getTextValue = () => {
    if (block._type === 'block') {
      return block.children?.[0]?.text || '';
    } else if (block._type === 'pullQuote') {
      return block.text || '';
    }
    return '';
  };

  // Convert HTML to markdown-like format for display
  const htmlToMarkdown = (html: string): string => {
    if (!html) return '';
    
    return html
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>')
      .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<ul>(.*?)<\/ul>/gi, '$1\n\n')
      .replace(/<ol>(.*?)<\/ol>/gi, '$1\n\n')
      .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div>(.*?)<\/div>/gi, '$1\n\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  };

  return (
    <div className="relative">
      {/* Index badge - positioned to the left */}
      <div className="absolute -left-4 top-4 z-10">
        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
          {index + 1}
        </div>
      </div>
      
      <Card 
        className={`bg-gray-700 border-gray-600 transition-all duration-200 ml-6 ${
          isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:shadow-md'
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="drag-handle text-gray-400"
                draggable={false}
              >
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2">
                {getBlockIcon()}
                <CardTitle className="text-white text-sm font-medium">
                  {getBlockTitle()}
                </CardTitle>
              </div>
            </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              type="button" 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gray-600 hover:bg-gray-500 text-xs p-1"
              title={isEditing ? "Done editing" : "Edit content"}
            >
              <Edit className="w-3 h-3" />
            </Button>
            
            <Button 
              type="button" 
              onClick={() => onMoveUp(index)} 
              disabled={isFirst}
              className="bg-gray-600 hover:bg-gray-500 text-xs p-1 disabled:opacity-50"
              title="Move up"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            
            <Button 
              type="button" 
              onClick={() => onMoveDown(index)} 
              disabled={isLast}
              className="bg-gray-600 hover:bg-gray-500 text-xs p-1 disabled:opacity-50"
              title="Move down"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
            
            <Button 
              type="button" 
              onClick={() => onRemove(index)} 
              className="bg-red-500 hover:bg-red-600 text-xs p-1"
              title="Remove block"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {block._type === 'block' && (
          <div className="space-y-2">
            {isEditing ? (
              <RichTextEditor
                value={getTextValue()}
                onChange={handleTextChange}
                placeholder="Enter your text content..."
                className="min-h-[150px]"
              />
            ) : (
              <div 
                className="min-h-[100px] p-4 bg-gray-600 rounded-lg border border-gray-500 text-gray-300 font-mono text-sm whitespace-pre-wrap"
                style={{
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
                onClick={() => setIsEditing(true)}
              >
                {getTextValue() ? (
                  htmlToMarkdown(getTextValue())
                ) : (
                  <div className="text-gray-500 italic">Click to edit text content...</div>
                )}
              </div>
            )}
          </div>
        )}

        {block._type === 'pullQuote' && (
          <div className="space-y-2">
            {isEditing ? (
              <RichTextEditor
                value={getTextValue()}
                onChange={handleTextChange}
                placeholder="Enter your quote..."
                className="min-h-[100px]"
              />
            ) : (
              <div 
                className="min-h-[80px] p-4 bg-gray-600 rounded-lg border border-gray-500 text-gray-300 italic border-l-4 border-l-red-500 font-mono text-sm whitespace-pre-wrap"
                style={{
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
                onClick={() => setIsEditing(true)}
              >
                {getTextValue() ? (
                  htmlToMarkdown(getTextValue())
                ) : (
                  <div className="text-gray-500">Click to edit quote...</div>
                )}
              </div>
            )}
          </div>
        )}

        {block._type === 'spotifyEmbed' && (
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Spotify Embed Code</label>
            <textarea
              value={block.embedCode || ''}
              onChange={(e) => onUpdate(index, { embedCode: e.target.value })}
              className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm font-mono"
              rows={4}
              placeholder="Paste Spotify iframe code here..."
            />
            {block.embedCode && (
              <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-400">
                Preview: {block.embedCode.substring(0, 100)}...
              </div>
            )}
          </div>
        )}

        {block._type === 'photoBlock' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Photo Layout</label>
              <div className="flex space-x-2">
                {['single', 'sidebyside', '3column'].map((layout) => (
                  <Button
                    key={layout}
                    type="button"
                    variant={block.layout === layout ? 'default' : 'outline'}
                    onClick={() => onUpdate(index, { layout })}
                    className={`text-xs ${
                      block.layout === layout 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {layout === 'single' ? 'Single' : 
                     layout === 'sidebyside' ? 'Side by Side' : 
                     'Three Columns'}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              {block.photos?.length || 0} photos in {block.layout || 'single'} layout
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default ContentBlock;
