import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  className = ""
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rawText, setRawText] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Convert HTML to markdown-like format for editing
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

  // Convert markdown-like format to HTML
  const markdownToHtml = (text: string): string => {
    if (!text) return '';
    
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1')
      .replace(/<p>(<ul>.*?<\/ul>)<\/p>/g, '$1');
  };

  // Initialize with existing HTML value
  useEffect(() => {
    if (value && value !== previewHtml) {
      const markdown = htmlToMarkdown(value);
      setRawText(markdown);
      setPreviewHtml(value);
    }
  }, [value]);

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRawText(newText);
    
    // Convert to HTML and update parent
    const html = markdownToHtml(newText);
    setPreviewHtml(html);
    onChange(html);
  };

  // Insert formatting at cursor position
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = rawText.substring(start, end);
    
    const newText = rawText.substring(0, start) + before + selectedText + after + rawText.substring(end);
    setRawText(newText);
    
    // Update HTML
    const html = markdownToHtml(newText);
    setPreviewHtml(html);
    onChange(html);
    
    // Restore cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Apply formatting functions
  const applyBold = () => insertFormatting('**', '**');
  const applyItalic = () => insertFormatting('*', '*');
  const applyUnderline = () => insertFormatting('<u>', '</u>');
  const applyHeading = (level: 'h1' | 'h2' | 'h3') => {
    const prefix = level === 'h1' ? '# ' : level === 'h2' ? '## ' : '### ';
    insertFormatting(prefix);
  };
  const applyQuote = () => insertFormatting('> ');
  const applyList = () => insertFormatting('- ');

  return (
    <div className={`border border-gray-600 rounded-lg bg-gray-700 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-600 p-2 flex items-center gap-1 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyHeading('h1')}
          className="bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <Heading1 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyHeading('h2')}
          className="bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyHeading('h3')}
          className="bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-2" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={applyBold}
          className="bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={applyItalic}
          className="bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={applyUnderline}
          className="bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-2" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={applyList}
          className="bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={applyQuote}
          className="bg-gray-600 hover:bg-gray-500 text-gray-300"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-600 mx-2" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className={`bg-gray-600 hover:bg-gray-500 text-gray-300 ${showPreview ? 'bg-red-500 text-white' : ''}`}
        >
          <Type className="w-4 h-4" />
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Editor */}
      {showPreview ? (
        <div 
          className="min-h-[200px] p-4 text-white prose prose-invert max-w-none font-mono text-sm"
          style={{
            lineHeight: '1.6',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={rawText}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="min-h-[200px] w-full p-4 text-white bg-transparent border-none resize-none focus:outline-none font-mono text-sm"
          style={{
            lineHeight: '1.6',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          }}
        />
      )}

      {/* Help text */}
      {!showPreview && (
        <div className="px-4 pb-2 text-xs text-gray-500">
          Use **bold**, *italic*, # heading, &gt; quote, - list
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
