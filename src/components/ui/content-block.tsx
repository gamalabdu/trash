import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { 
  GripVertical, 
  Trash2,
  FileText,
  Music,
  Quote,
  Image as ImageIcon,
  Plus,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import RichTextEditor from './rich-text-editor';

export interface ContentBlockProps {
  block: any;
  index: number;
  onUpdate: (index: number, updates: any) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void; // Required by parent but not used
  onMoveDown: (index: number) => void; // Required by parent but not used
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  forceCollapsed?: boolean;
}

const ContentBlock: React.FC<ContentBlockProps> = ({
  block,
  index,
  onUpdate,
  onRemove,
  isDragging = false,
  forceCollapsed = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // When forceCollapsed changes to true, collapse this block
  // When it changes to false (Expand All), expand this block
  React.useEffect(() => {
    if (forceCollapsed) {
      setIsCollapsed(true);
      setIsEditing(false);
    } else {
      setIsCollapsed(false);
    }
  }, [forceCollapsed]);
  
  // Use local collapsed state only
  const shouldBeCollapsed = isCollapsed;

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

  const getContentPreview = () => {
    switch (block._type) {
      case 'block':
        const text = block.children?.[0]?.text || '';
        // Strip HTML tags and get first 80 characters
        const strippedText = text.replace(/<[^>]*>/g, '').trim();
        return strippedText.substring(0, 80) + (strippedText.length > 80 ? '...' : '');
      
      case 'pullQuote':
        const quoteText = (block.text || '').replace(/<[^>]*>/g, '').trim();
        return `"${quoteText.substring(0, 60)}${quoteText.length > 60 ? '...' : ''}"`;
      
      case 'spotifyEmbed':
        return 'Spotify embed content';
      
      case 'photoBlock':
        const photoCount = block.photos?.length || 0;
        const layoutText = block.layout === 'single' ? 'Single' : 
                          block.layout === 'sidebyside' ? 'Side by Side' : 
                          'Three Columns';
        return `${photoCount} photo${photoCount !== 1 ? 's' : ''} • ${layoutText} layout`;
      
      default:
        return 'Content block';
    }
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
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-red-500/30 ring-offset-2 ring-offset-gray-800">
          {index + 1}
        </div>
      </div>
      
      <Card 
        className={`bg-gray-700/90 border-gray-600/70 transition-all duration-200 ml-6 backdrop-blur-sm ${
          isDragging ? 'opacity-50 scale-95 shadow-2xl ring-2 ring-red-500/50' : 'hover:shadow-lg hover:border-gray-500/80'
        } ${shouldBeCollapsed ? 'shadow-sm' : 'shadow-md'}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="drag-handle text-gray-400 hover:text-gray-300 cursor-grab active:cursor-grabbing transition-colors duration-200"
                draggable={false}
              >
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2.5">
                <div className={`transition-colors duration-200 ${
                  block._type === 'block' ? 'text-blue-400' :
                  block._type === 'pullQuote' ? 'text-purple-400' :
                  block._type === 'spotifyEmbed' ? 'text-green-400' :
                  block._type === 'photoBlock' ? 'text-orange-400' :
                  'text-gray-400'
                }`}>
                  {getBlockIcon()}
                </div>
                <CardTitle className="text-white text-sm font-semibold tracking-wide">
                  {getBlockTitle()}
                </CardTitle>
              </div>
            </div>
          
          <div className="flex items-center space-x-2">
            {/* Collapse/Expand Toggle */}
            <Button 
              type="button" 
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                if (!isCollapsed) {
                  setIsEditing(false); // Close editing when collapsing
                }
              }}
              className={`transition-all duration-200 text-xs p-2 border ${
                shouldBeCollapsed 
                  ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400 hover:border-blue-500/50' 
                  : 'bg-gray-600/50 hover:bg-gray-600/70 border-gray-500/30 text-gray-300 hover:border-gray-500/50'
              }`}
              title={shouldBeCollapsed ? "Expand block" : "Collapse block"}
            >
              {shouldBeCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </Button>
            
            {/* Delete Button */}
            <Button 
              type="button" 
              onClick={() => onRemove(index)} 
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 text-xs p-2 transition-all duration-200"
              title="Remove block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Content Preview when collapsed */}
      {shouldBeCollapsed && (
        <div className="px-6 pb-4 pt-2">
          <div className="relative group">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-lg" />
            
            {/* Content container */}
            <div className="relative p-4 bg-gray-800/80 rounded-lg border border-gray-600/50 backdrop-blur-sm transition-all duration-200 hover:border-gray-500/70">
              <div className="flex items-start gap-3">
                {/* Block type icon with accent color */}
                <div className={`flex-shrink-0 mt-0.5 ${
                  block._type === 'block' ? 'text-blue-400' :
                  block._type === 'pullQuote' ? 'text-purple-400' :
                  block._type === 'spotifyEmbed' ? 'text-green-400' :
                  block._type === 'photoBlock' ? 'text-orange-400' :
                  'text-gray-400'
                }`}>
                  {getBlockIcon()}
                </div>
                
                {/* Preview text or photo thumbnails */}
                <div className="flex-1 min-w-0">
                  {block._type === 'photoBlock' && block.photos && block.photos.length > 0 ? (
                    <div className="space-y-2">
                      {/* Photo count and layout info */}
                      <p className="text-xs text-gray-400 font-medium">
                        {getContentPreview()}
                      </p>
                      
                      {/* Photo thumbnails */}
                      <div className="flex flex-wrap gap-2">
                        {block.photos.slice(0, 6).map((photo: any, photoIdx: number) => (
                          <div 
                            key={photo._key || photoIdx}
                            className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-700 border border-gray-600/50 flex-shrink-0"
                          >
                            {(photo.file || photo.url) ? (
                              <>
                                <img
                                  src={photo.file ? URL.createObjectURL(photo.file) : photo.url}
                                  alt={photo.alt || `Photo ${photoIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {/* Overlay with photo number */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-start p-1">
                                  <span className="text-white text-xs font-bold">
                                    {photoIdx + 1}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Show +N indicator if more than 6 photos */}
                        {block.photos.length > 6 && (
                          <div className="w-16 h-16 rounded-md bg-gray-700 border border-gray-600/50 flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-semibold">
                              +{block.photos.length - 6}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 font-normal">
                      {getContentPreview() || (
                        <span className="text-gray-500 italic">Empty block - click to add content</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Subtle bottom accent line based on block type */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg ${
                block._type === 'block' ? 'bg-gradient-to-r from-blue-500/30 to-transparent' :
                block._type === 'pullQuote' ? 'bg-gradient-to-r from-purple-500/30 to-transparent' :
                block._type === 'spotifyEmbed' ? 'bg-gradient-to-r from-green-500/30 to-transparent' :
                block._type === 'photoBlock' ? 'bg-gradient-to-r from-orange-500/30 to-transparent' :
                'bg-gradient-to-r from-gray-500/30 to-transparent'
              }`} />
            </div>
          </div>
        </div>
      )}
      
      {!shouldBeCollapsed && (
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
            
            {/* Add Photo Button */}
            <Button
              type="button"
              onClick={() => {
                const newPhoto = {
                  _key: `photo-${Date.now()}`,
                  alt: '',
                  caption: ''
                };
                onUpdate(index, { 
                  photos: [...(block.photos || []), newPhoto] 
                });
              }}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>

            {/* Photo List */}
            {block.photos && block.photos.length > 0 ? (
              <div className="space-y-4">
                {block.photos.map((photo: any, photoIndex: number) => (
                  <div key={photo._key} className="p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-white">
                        Photo {photoIndex + 1}
                      </Label>
                      <Button
                        type="button"
                        onClick={() => {
                          const updatedPhotos = block.photos.filter((_: any, i: number) => i !== photoIndex);
                          onUpdate(index, { photos: updatedPhotos });
                        }}
                        className="bg-red-500 hover:bg-red-600 p-1 h-auto"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Image Preview */}
                    {(photo.file || photo.url) && (
                      <div className="aspect-video bg-gray-700 rounded overflow-hidden">
                        <img
                          src={photo.file ? URL.createObjectURL(photo.file) : photo.url}
                          alt={photo.alt || `Photo ${photoIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label htmlFor={`photo-${photo._key}`} className="text-sm text-gray-300">
                        Upload Image
                      </Label>
                      <Input
                        id={`photo-${photo._key}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const updatedPhotos = [...block.photos];
                            updatedPhotos[photoIndex] = { 
                              ...updatedPhotos[photoIndex], 
                              file 
                            };
                            onUpdate(index, { photos: updatedPhotos });
                          }
                        }}
                        className="bg-gray-700 border-gray-600 text-sm"
                      />
                    </div>

                    {/* Alt Text */}
                    <div className="space-y-2">
                      <Label htmlFor={`alt-${photo._key}`} className="text-sm text-gray-300">
                        Alt Text
                      </Label>
                      <Input
                        id={`alt-${photo._key}`}
                        value={photo.alt || ''}
                        onChange={(e) => {
                          const updatedPhotos = [...block.photos];
                          updatedPhotos[photoIndex] = { 
                            ...updatedPhotos[photoIndex], 
                            alt: e.target.value 
                          };
                          onUpdate(index, { photos: updatedPhotos });
                        }}
                        placeholder="Describe the image for accessibility"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>

                    {/* Caption */}
                    <div className="space-y-2">
                      <Label htmlFor={`caption-${photo._key}`} className="text-sm text-gray-300">
                        Caption
                      </Label>
                      <Input
                        id={`caption-${photo._key}`}
                        value={photo.caption || ''}
                        onChange={(e) => {
                          const updatedPhotos = [...block.photos];
                          updatedPhotos[photoIndex] = { 
                            ...updatedPhotos[photoIndex], 
                            caption: e.target.value 
                          };
                          onUpdate(index, { photos: updatedPhotos });
                        }}
                        placeholder="Optional caption for the photo"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No photos added yet</p>
                <p className="text-xs mt-1">Click "Add Photo" above to get started</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      )}
    </Card>
    </div>
  );
};

export default ContentBlock;
