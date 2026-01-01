import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { Textarea } from '../../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar as CalendarComponent } from '../../ui/calendar';
import { Plus, Edit, Trash2, RefreshCw, FileText, Upload, Save, Image as ImageIcon, Calendar, User, Tag, ArrowLeft, Crop } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';
import { SimpleEditorWrapper } from '../../ui/tiptap-templates/simple/simple-editor-wrapper';
import { HeroImagePositionModal } from '../../ui/hero-image-position-modal';
import '../../ui/tiptap-templates/simple/simple-editor.scss';
import '../../ui/tiptap-templates/@/components/tiptap-node/quote-node/quote-node.scss';
import '../../ui/tiptap-templates/@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '../../ui/tiptap-templates/@/components/tiptap-node/image-node/image-node.scss';
import '../../ui/tiptap-templates/@/components/tiptap-node/paragraph-node/paragraph-node.scss';

interface Article {
  _id?: string;
  title: string;
  subtitle: string;
  heroImage?: File | string | null;
  heroImageAlt?: string;
  heroImageFocusPoint?: { x: number; y: number }; // Focus point for positioning (0-1 range)
  categoryTags: string[];
  authorName: string;
  authorRole: string;
  authorImage?: File | string | null;
  authorSocialLinks: string[];
  publishedDate: string;
  content: ArticleContentBlock[];
  externalLinks: string[];
  tags: string[];
  shareCount: number;
  metaDescription: string;
  keywords: string[];
}

interface ArticleContentBlock {
  _type: 'block' | 'spotifyEmbed' | 'pullQuote' | 'photoBlock';
  _key?: string;
  // For block content
  children?: any[];
  style?: string;
  // For Spotify embed
  embedCode?: string;
  // For pull quote
  text?: string;
  // For photo block
  photos?: PhotoItem[];
  layout?: 'single' | 'sidebyside' | '3column';
}

interface PhotoItem {
  _key: string;
  file?: File;
  url?: string;
  assetRef?: string; // Asset reference ID for existing photos
  alt?: string;
  caption?: string;
}

const ArticleManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  
  // Section navigation state
  const [currentSection, setCurrentSection] = useState<'list' | 'editor'>('list');

  useEffect(() => {
    fetchArticles();
  }, []);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (message && message.type === 'success') {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const articlesData = await sanityClient.fetch(`
        *[_type == "articles"]{
          _id,
          title,
          subtitle,
          heroImage{
            asset->{
              url
            },
            alt,
            hotspot{
              x,
              y
            }
          },
          categoryTags,
          authorName,
          authorRole,
          authorImage{
            asset->{
              url
            }
          },
          authorSocialLinks,
          publishedDate,
          content[]{
            _type,
            _key,
            children,
            style,
            embedCode,
            text,
            photos[]{
              asset->{
                _ref,
                url
              },
              alt,
              caption
            },
            layout
          },
          externalLinks,
          tags,
          shareCount,
          metaDescription,
          keywords
        }
      `, {
        timestamp: Date.now()
      }, {
        cache: 'no-store',
        useCdn: false
      });

      setArticles(articlesData.map((article: any) => ({
        _id: article._id,
        title: article.title || '',
        subtitle: article.subtitle || '',
        heroImage: article.heroImage?.asset?.url || null,
        heroImageAlt: article.heroImage?.alt || '',
        heroImageFocusPoint: article.heroImage?.hotspot ? {
          x: article.heroImage.hotspot.x,
          y: article.heroImage.hotspot.y
        } : undefined,
        categoryTags: article.categoryTags || [],
        authorName: article.authorName || '',
        authorRole: article.authorRole || '',
        authorImage: article.authorImage?.asset?.url || null,
        authorSocialLinks: article.authorSocialLinks || [],
        publishedDate: article.publishedDate || '',
        content: (article.content || []).map((block: any) => {
          if (block._type === 'photoBlock' && block.photos) {
            return {
              ...block,
              photos: block.photos.map((photo: any, index: number) => ({
                _key: `photo-${index}`,
                url: photo.asset?.url,
                assetRef: photo.asset?._ref,
                alt: photo.alt || '',
                caption: photo.caption || ''
              }))
            };
          }
          return block;
        }),
        externalLinks: article.externalLinks || [],
        tags: article.tags || [],
        shareCount: article.shareCount || 0,
        metaDescription: article.metaDescription || '',
        keywords: article.keywords || []
      })));
    } catch (error) {
      console.error('Error fetching articles:', error);
      setMessage({ type: 'error', text: 'Failed to load articles' });
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingArticle({
      title: '',
      subtitle: '',
      heroImage: null,
      heroImageAlt: '',
      heroImageFocusPoint: undefined,
      categoryTags: [],
      authorName: '',
      authorRole: '',
      authorImage: null,
      authorSocialLinks: [],
      publishedDate: new Date().toISOString(),
      content: [],
      externalLinks: [],
      tags: [],
      shareCount: 0,
      metaDescription: '',
      keywords: []
    });
    setCurrentSection('editor');
  };

  const handleEdit = (article: Article) => {
    setEditingArticle({ ...article });
    setCurrentSection('editor');
  };

  const handleDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete?._id) return;

    try {
      await sanityClient.delete(articleToDelete._id);
      setMessage({ type: 'success', text: 'Article deleted successfully!' });
      setDeleteConfirmOpen(false);
      setArticleToDelete(null);
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      setMessage({ type: 'error', text: 'Failed to delete article' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setArticleToDelete(null);
  };

  const handleBackToList = () => {
    setCurrentSection('list');
    setEditingArticle(null);
    setMessage(null);
  };

  const uploadAsset = async (file: File, type: 'image' | 'file' = 'image'): Promise<string> => {
    const asset = await sanityClient.assets.upload(type, file, {
      filename: file.name
    });
    return asset._id;
  };

  const handleSave = async (articleData: Article) => {
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const updateData: any = {
        title: articleData.title,
        subtitle: articleData.subtitle,
        categoryTags: articleData.categoryTags,
        authorName: articleData.authorName,
        authorRole: articleData.authorRole,
        authorSocialLinks: articleData.authorSocialLinks,
        publishedDate: articleData.publishedDate,
        content: articleData.content, // already synchronized from editor
        externalLinks: articleData.externalLinks,
        tags: articleData.tags,
        shareCount: articleData.shareCount,
        metaDescription: articleData.metaDescription,
        keywords: articleData.keywords
      };

      // Handle hero image upload
      if (articleData.heroImage instanceof File) {
        console.log('Uploading hero image file:', articleData.heroImage);
        setUploadProgress(30);
        const heroImageAssetId = await uploadAsset(articleData.heroImage, 'image');
        console.log('Hero image uploaded, asset ID:', heroImageAssetId);
        updateData.heroImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: heroImageAssetId },
          alt: articleData.heroImageAlt,
          hotspot: articleData.heroImageFocusPoint ? {
            x: articleData.heroImageFocusPoint.x,
            y: articleData.heroImageFocusPoint.y
          } : undefined
        };
      } else if (typeof articleData.heroImage === 'string' && articleData.heroImage) {
        console.log('Using existing hero image URL:', articleData.heroImage);
        if (articleData._id) {
          const currentArticle = await sanityClient.fetch(`*[_id == "${articleData._id}"][0]`);
          if (currentArticle?.heroImage?.asset?._ref) {
            updateData.heroImage = {
              _type: 'image',
              asset: { _type: 'reference', _ref: currentArticle.heroImage.asset._ref },
              alt: articleData.heroImageAlt,
              hotspot: articleData.heroImageFocusPoint ? {
                x: articleData.heroImageFocusPoint.x,
                y: articleData.heroImageFocusPoint.y
              } : undefined
            };
          }
        }
      }

      // Handle author image upload
      if (articleData.authorImage instanceof File) {
        setUploadProgress(60);
        const authorImageAssetId = await uploadAsset(articleData.authorImage, 'image');
        updateData.authorImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: authorImageAssetId }
        };
      }

      // (Optional) if you keep photoBlock in the future, you can process it here.
      // For the single-editor approach, `content` is just one HTML block already.

      setUploadProgress(90);

      if (articleData._id) {
        await sanityClient.patch(articleData._id).set(updateData).commit();
      } else {
        await sanityClient.create({ _type: 'articles', ...updateData });
      }

      setUploadProgress(100);
      setMessage({ type: 'success', text: articleData._id ? 'Article updated successfully!' : 'Article created successfully!' });

      setTimeout(async () => {
        await fetchArticles();
        setCurrentSection('list');
        setEditingArticle(null);
      }, 500);

    } catch (error) {
      console.error('Error saving article:', error);
      setMessage({ type: 'error', text: 'Failed to save article' });
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading articles...</span>
      </div>
    );
  }

  // Render editor section
  if (currentSection === 'editor' && editingArticle) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleBackToList} 
              variant="outline" 
              className="border-gray-500 text-gray-300 hover:bg-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {editingArticle._id ? 'Edit Article' : 'Create New Article'}
              </h2>
              <p className="text-sm text-gray-400">
                {editingArticle._id ? 'Update article information' : 'Add a new article to your blog'}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Full-width article form */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <ArticleForm 
            article={editingArticle}
            onSave={handleSave}
            onCancel={handleBackToList}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
        </div>
      </div>
    );
  }

  // Render list section
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex space-x-2">
          <Button onClick={fetchArticles} variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAdd} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Article
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article._id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg mb-2">{article.title}</CardTitle>
                  <CardDescription className="text-gray-400 mb-2">{article.subtitle}</CardDescription>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{article.authorName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(article)} className="border-gray-500 text-gray-300 hover:bg-gray-600">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(article)} className="border-red-500 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeof article.heroImage === 'string' && article.heroImage && (
                <div className="bg-gray-600 rounded-lg overflow-hidden mb-3">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={article.heroImage} alt={article.heroImageAlt} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {article.categoryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.categoryTags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-400 text-sm line-clamp-2">{article.metaDescription}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No articles found</h3>
          <p className="text-gray-500 mb-4">Start by creating your first article</p>
          <Button onClick={handleAdd} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Article
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Article
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {articleToDelete && (
            <div className="space-y-4">
              {/* Article Preview */}
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="pt-6">
                  {typeof articleToDelete.heroImage === 'string' && articleToDelete.heroImage && (
                    <div className="bg-gray-600 rounded-lg overflow-hidden mb-4">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img 
                          src={articleToDelete.heroImage} 
                          alt={articleToDelete.heroImageAlt} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">{articleToDelete.title}</h3>
                      <p className="text-gray-400 text-sm">{articleToDelete.subtitle}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{articleToDelete.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(articleToDelete.publishedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {articleToDelete.categoryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {articleToDelete.categoryTags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {articleToDelete.metaDescription && (
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {articleToDelete.metaDescription}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={cancelDelete}
                  className="border-gray-500 text-gray-300 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Article
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ArticleFormProps {
  article: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSave, onCancel, uploading, uploadProgress }) => {
  // Hero image cropping state
  const [isHeroCropModalOpen, setIsHeroCropModalOpen] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  // Helper function to process Spotify and YouTube embeds in HTML
  const processMediaEmbeds = (html: string): string => {
    console.log('Processing media embeds, input HTML length:', html.length);
    console.log('Input HTML preview:', html.substring(0, 1000));
    
    let processed = html;
    
    // Process Spotify embeds
    const spotifyRegex = /<div[^>]*data-type="spotify"[^>]*data-iframe-code="([^"]*)"[^>]*(?:\/>|>.*?<\/div>)/g;
    processed = processed.replace(spotifyRegex, (match, iframeCode) => {
        console.log('Found Spotify div match:', match);
        console.log('Iframe code from data attribute:', iframeCode);
        
        // Decode HTML entities in the iframe code
        const decodedIframeCode = iframeCode
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&amp;/g, '&');
        
        console.log('Decoded iframe code:', decodedIframeCode);
        
        // Check for both escaped and unescaped iframe tags
        if (decodedIframeCode && (decodedIframeCode.includes('<iframe') || decodedIframeCode.includes('&lt;iframe'))) {
          console.log('Converting to HTML embed');
          // Return the iframe code as actual HTML
          return `<div class="spotify-embed-container">${decodedIframeCode}</div>`;
        }
        console.log('No valid iframe code found, returning original');
        return match; // Return original if no valid iframe code
      }
    );
    
    // Process YouTube embeds
    const youtubeRegex = /<div[^>]*data-type="youtube"[^>]*data-embed-code="([^"]*)"[^>]*(?:\/>|>.*?<\/div>)/g;
    processed = processed.replace(youtubeRegex, (match, embedCode) => {
        console.log('Found YouTube div match:', match);
        console.log('Embed code from data attribute:', embedCode);
        
        // Decode HTML entities in the embed code
        const decodedEmbedCode = embedCode
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&amp;/g, '&');
        
        console.log('Decoded embed code:', decodedEmbedCode);
        
        // Check for both escaped and unescaped iframe tags
        if (decodedEmbedCode && (decodedEmbedCode.includes('<iframe') || decodedEmbedCode.includes('&lt;iframe'))) {
          console.log('Converting to HTML embed');
          // Return the embed code as actual HTML
          return `<div class="youtube-embed-container">${decodedEmbedCode}</div>`;
        }
        console.log('No valid embed code found, returning original');
        return match; // Return original if no valid embed code
      }
    );
    
    console.log('Processed HTML length:', processed.length);
    console.log('Processed HTML preview:', processed.substring(0, 1000));
    return processed;
  };
  const [formData, setFormData] = useState<Article>(article);
  const [newTag, setNewTag] = useState('');
  const [newCategoryTag, setNewCategoryTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newSocialLink, setNewSocialLink] = useState('');
  const [newExternalLink, setNewExternalLink] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // ===== Single-editor helpers =====
  const makeHtmlBlock = (html: string) => ({
    _type: 'block' as const,
    _key: `block-${Date.now()}`,
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: `span-${Date.now()}`,
        text: html,      // store HTML string here (preview already supports it)
        marks: [],
      },
    ],
  });

  const extractInitialHTML = (content: ArticleContentBlock[] | undefined) => {
    if (!content || content.length === 0) return '';
    const first = content.find(b => b._type === 'block');
    const txt = first?.children?.[0]?.text;
    if (txt && typeof txt === 'string' && txt.includes('<') && txt.includes('>')) {
      return txt; // HTML stored previously
    }
    const plain = content
      .filter(b => b._type === 'block')
      .map(b => b.children?.map((c: any) => c?.text ?? '').join('') ?? '')
      .join('\n\n');
    return plain || '';
  };

  const [editorHTML, setEditorHTML] = useState<string>(() => extractInitialHTML(article.content));

  // Keep formData.content in sync with the editor HTML (so Preview & Save work)
  useEffect(() => {
    setFormData(prev => ({ ...prev, content: [makeHtmlBlock(editorHTML)] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorHTML]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Helper function to get object position based on focus point
  const getObjectPosition = (focusPoint?: { x: number; y: number }) => {
    if (!focusPoint) return 'center center';
    return `${focusPoint.x * 100}% ${focusPoint.y * 100}%`;
  };

  const handleFileChange = (file: File | null, field: 'heroImage' | 'authorImage') => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  // Hero image cropping functions
  const handleHeroCropClick = async () => {
    if (!formData.heroImage) return;
    
    try {
      let file: File;
      
      if (formData.heroImage instanceof File) {
        file = formData.heroImage;
      } else if (typeof formData.heroImage === 'string') {
        // Convert URL to File
        const response = await fetch(formData.heroImage);
        const blob = await response.blob();
        file = new File([blob], 'hero-image.png', { type: blob.type });
      } else {
        return;
      }
      
      setHeroImageFile(file);
      setIsHeroCropModalOpen(true);
    } catch (error) {
      console.error('Error preparing hero image for crop:', error);
    }
  };

  const handleHeroCropComplete = (croppedImageUrl: string, cropData?: { x: number; y: number; width: number; height: number }) => {
    console.log('Hero positioning complete, cropData:', cropData);
    
    // Store the focus point for positioning (do NOT crop the image)
    let focusPoint = { x: 0.5, y: 0.5 }; // Default center
    if (cropData) {
      // Use the position directly as focus point
      focusPoint = {
        x: cropData.x,
        y: cropData.y
      };
    }
    
    console.log('Setting focus point:', focusPoint);
    setFormData(prev => ({ 
      ...prev, 
      heroImageFocusPoint: focusPoint // Only update the focus point, keep original image
    }));
    
    setIsHeroCropModalOpen(false);
    setHeroImageFile(null);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, publishedDate: date.toISOString() }));
      setCalendarOpen(false);
    }
  };

  const addTag = () => {
    const v = newTag.trim();
    if (v && !formData.tags.includes(v)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, v] }));
      setNewTag('');
    }
  };
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addCategoryTag = () => {
    const v = newCategoryTag.trim();
    if (v && !formData.categoryTags.includes(v)) {
      setFormData(prev => ({ ...prev, categoryTags: [...prev.categoryTags, v] }));
      setNewCategoryTag('');
    }
  };
  const removeCategoryTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, categoryTags: prev.categoryTags.filter(tag => tag !== tagToRemove) }));
  };

  const addKeyword = () => {
    const v = newKeyword.trim();
    if (v && !formData.keywords.includes(v)) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, v] }));
      setNewKeyword('');
    }
  };
  const removeKeyword = (k: string) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(x => x !== k) }));
  };

  const addSocialLink = () => {
    const v = newSocialLink.trim();
    if (v && !formData.authorSocialLinks.includes(v)) {
      setFormData(prev => ({ ...prev, authorSocialLinks: [...prev.authorSocialLinks, v] }));
      setNewSocialLink('');
    }
  };
  const removeSocialLink = (v: string) => {
    setFormData(prev => ({ ...prev, authorSocialLinks: prev.authorSocialLinks.filter(x => x !== v) }));
  };

  const addExternalLink = () => {
    const v = newExternalLink.trim();
    if (v && !formData.externalLinks.includes(v)) {
      setFormData(prev => ({ ...prev, externalLinks: [...prev.externalLinks, v] }));
      setNewExternalLink('');
    }
  };
  const removeExternalLink = (v: string) => {
    setFormData(prev => ({ ...prev, externalLinks: prev.externalLinks.filter(x => x !== v) }));
  };

  // For the editor only: upload an image and return the CDN URL
  const uploadImageForEditor = async (file: File): Promise<string> => {
    const asset: any = await sanityClient.assets.upload('image', file, { filename: file.name });
    // Sanity returns a document with `url`, which is what we want to insert in the editor.
    return asset?.url;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="bg-gray-700 border-gray-600">
          <TabsTrigger value="basic" className="data-[state=active]:bg-red-500">Basic Info</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-red-500">Content</TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-red-500">Preview</TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-red-500">SEO & Meta</TabsTrigger>
        </TabsList>

        {/* BASIC */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title *</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} 
                className="bg-gray-700 border-gray-600" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input 
                id="subtitle" 
                value={formData.subtitle} 
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} 
                className="bg-gray-700 border-gray-600" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedDate">Published Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.publishedDate ? new Date(formData.publishedDate).toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.publishedDate ? new Date(formData.publishedDate) : undefined}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="bg-gray-800 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-sm">Hero Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.heroImage && (
                <div className="space-y-3">
                  <div className="bg-gray-600 rounded-lg overflow-hidden">
                    <div className="aspect-[16/9] overflow-hidden">
                      {typeof formData.heroImage === 'string' ? (
                        <img 
                          src={formData.heroImage} 
                          alt="Current hero" 
                          className="w-full h-full object-cover" 
                          style={{ objectPosition: getObjectPosition(formData.heroImageFocusPoint) }}
                        />
                      ) : formData.heroImage instanceof File ? (
                        <img 
                          src={URL.createObjectURL(formData.heroImage)} 
                          alt="Current hero" 
                          className="w-full h-full object-cover" 
                          style={{ objectPosition: getObjectPosition(formData.heroImageFocusPoint) }}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleHeroCropClick}
                      className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-600"
                    >
                      <Crop className="w-4 h-4 mr-2" />
                      Position Image
                    </Button>
                  </div>
                </div>
              )}
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'heroImage')} 
                className="bg-gray-600 border-gray-500" 
              />
              <div className="space-y-2">
                <Label htmlFor="heroImageAlt">Alt Text</Label>
                <Input 
                  id="heroImageAlt" 
                  value={formData.heroImageAlt} 
                  onChange={(e) => setFormData(prev => ({ ...prev, heroImageAlt: e.target.value }))} 
                  className="bg-gray-700 border-gray-600" 
                  placeholder="Describe the image for accessibility"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name</Label>
              <Input 
                id="authorName" 
                value={formData.authorName} 
                onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))} 
                className="bg-gray-700 border-gray-600" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorRole">Author Role</Label>
              <Input 
                id="authorRole" 
                value={formData.authorRole} 
                onChange={(e) => setFormData(prev => ({ ...prev, authorRole: e.target.value }))} 
                className="bg-gray-700 border-gray-600" 
              />
            </div>
          </div>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-sm">Author Profile Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeof formData.authorImage === 'string' && formData.authorImage && (
                <div className="w-20 h-20 bg-gray-600 rounded-lg overflow-hidden">
                  <img src={formData.authorImage} alt="Author" className="w-full h-full object-cover" />
                </div>
              )}
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'authorImage')} 
                className="bg-gray-600 border-gray-500" 
              />
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Category Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.categoryTags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 text-sm rounded flex items-center space-x-1">
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeCategoryTag(tag)} className="text-red-400 hover:text-red-200">×</button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input 
                value={newCategoryTag} 
                onChange={(e) => setNewCategoryTag(e.target.value)} 
                className="bg-gray-700 border-gray-600" 
                placeholder="Add category tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategoryTag())}
              />
              <Button type="button" onClick={addCategoryTag} className="bg-red-500 hover:bg-red-600">Add</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Author Social Links</Label>
            <div className="space-y-2 mb-2">
              {formData.authorSocialLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input value={link} readOnly className="bg-gray-600 border-gray-500" />
                  <Button type="button" onClick={() => removeSocialLink(link)} className="bg-red-500 hover:bg-red-600">Remove</Button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input 
                value={newSocialLink} 
                onChange={(e) => setNewSocialLink(e.target.value)} 
                className="bg-gray-700 border-gray-600" 
                placeholder="Add social link"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSocialLink())}
              />
              <Button type="button" onClick={addSocialLink} className="bg-red-500 hover:bg-red-600">Add</Button>
            </div>
          </div>
        </TabsContent>

        {/* CONTENT (single Tiptap editor) */}
        <TabsContent value="content" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold text-white">Article Content</Label>
              <p className="text-sm text-gray-400 mt-1">
                Write your article below. You can insert images, headings, quotes, and lists.
              </p>
            </div>

            <SimpleEditorWrapper
              key={`editor-${article._id || 'new'}`}
              value={editorHTML}
              onChange={(newHTML) => {
                console.log('Editor onChange called, new HTML length:', newHTML.length);
                console.log('New HTML preview:', newHTML.substring(0, 200));
                setEditorHTML(newHTML);
              }}
              onUploadImage={uploadImageForEditor}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded flex items-center space-x-1">
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-200">×</button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input 
                value={newTag} 
                onChange={(e) => setNewTag(e.target.value)} 
                className="bg-gray-700 border-gray-600" 
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} className="bg-red-500 hover:bg-red-600">Add</Button>
            </div>
          </div>

          {/* External Links */}
          <div className="space-y-2">
            <Label>External Links</Label>
            <div className="space-y-2 mb-2">
              {formData.externalLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input value={link} readOnly className="bg-gray-600 border-gray-500" />
                  <Button type="button" onClick={() => removeExternalLink(link)} className="bg-red-500 hover:bg-red-600">Remove</Button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input 
                value={newExternalLink} 
                onChange={(e) => setNewExternalLink(e.target.value)} 
                className="bg-gray-700 border-gray-600" 
                placeholder="Add external link"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExternalLink())}
              />
              <Button type="button" onClick={addExternalLink} className="bg-red-500 hover:bg-red-600">Add</Button>
            </div>
          </div>

          {/* Share Count */}
          <div className="space-y-2">
            <Label htmlFor="shareCount">Share Count</Label>
            <Input 
              id="shareCount" 
              type="number" 
              value={formData.shareCount} 
              onChange={(e) => setFormData(prev => ({ ...prev, shareCount: parseInt(e.target.value) || 0 }))} 
              className="bg-gray-700 border-gray-600" 
            />
          </div>
        </TabsContent>

        {/* PREVIEW (unchanged; now renders the single HTML block) */}
        <TabsContent value="preview" className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Article Preview</h3>
              <p className="text-sm text-gray-400">This is how your article will appear on the reviews page</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              {formData.categoryTags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {formData.categoryTags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 text-xs font-semibold rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                {formData.title || 'Article Title'}
              </h1>

              {formData.subtitle && (
                <p className="text-xl text-gray-300 mb-6">
                  {formData.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
                {formData.authorName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>BY {formData.authorName.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formData.publishedDate ? new Date(formData.publishedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }).toUpperCase() : 'PUBLISH DATE'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{formData.shareCount} SHARES</span>
                </div>
              </div>

              {formData.heroImage && (
                <div className="mb-8">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                    {typeof formData.heroImage === 'string' ? (
                      <img 
                        src={formData.heroImage} 
                        alt={formData.heroImageAlt || formData.title}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: getObjectPosition(formData.heroImageFocusPoint) }}
                      />
                    ) : formData.heroImage instanceof File ? (
                      <img 
                        src={URL.createObjectURL(formData.heroImage)} 
                        alt={formData.heroImageAlt || formData.title}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: getObjectPosition(formData.heroImageFocusPoint) }}
                      />
                    ) : null}
                  </div>
                </div>
              )}

              {(formData.authorName || formData.authorRole || formData.authorImage) && (
                <div className="mb-8 bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                  <div className="flex gap-4">
                    {formData.authorImage && (
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        {typeof formData.authorImage === 'string' ? (
                          <img 
                            src={formData.authorImage} 
                            alt={formData.authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : formData.authorImage instanceof File ? (
                          <img 
                            src={URL.createObjectURL(formData.authorImage)} 
                            alt={formData.authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                    )}
                    <div className="flex-1">
                      {formData.authorName && (
                        <h3 className="text-white font-bold text-lg mb-2">
                          {formData.authorName}
                        </h3>
                      )}
                      {formData.authorRole && (
                        <p className="text-gray-400 text-sm mb-3">
                          {formData.authorRole}
                        </p>
                      )}
                      {formData.authorSocialLinks.length > 0 && (
                        <div className="flex gap-2">
                          {formData.authorSocialLinks.map((link, index) => (
                            <span key={index} className="text-red-500 text-sm">
                              {link}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Article Content - Match Editor Styling */}
              <div className="simple-editor-wrapper" style={{ backgroundColor: '#0e0e11' }}>
                <div className="simple-editor-content" style={{ backgroundColor: '#0e0e11' }}>
                  <div className="tiptap ProseMirror simple-editor" style={{ backgroundColor: '#0e0e11', color: '#f0eef0' }}>
                    {(() => {
                      console.log('Preview rendering, editorHTML length:', editorHTML?.length || 0);
                      console.log('Preview HTML preview:', editorHTML?.substring(0, 200) || 'empty');
                      console.log('Number of images in HTML:', (editorHTML?.match(/<img/g) || []).length);
                      return null;
                    })()}
                    {editorHTML ? (
                      <div dangerouslySetInnerHTML={{ 
                        __html: processMediaEmbeds(editorHTML) 
                      }} />
                    ) : formData.content.length > 0 ? (
                      formData.content.map((block, index) => {
                        switch (block._type) {
                          case 'block': {
                            const text = block.children?.[0]?.text || '';
                            const hasHTML = text && (text.includes('<') && text.includes('>'));
                            if (hasHTML) {
                              return (
                                <div 
                                  key={index} 
                                  dangerouslySetInnerHTML={{ __html: text }}
                                />
                              );
                            }
                            return (
                              <p key={index}>
                                {text}
                              </p>
                            );
                          }
                          case 'spotifyEmbed':
                            return (
                              <div key={index}>
                                <div 
                                  dangerouslySetInnerHTML={{ __html: block.embedCode || '' }}
                                />
                              </div>
                            );
                          case 'pullQuote': {
                            const quoteText = block.text || '';
                            const hasQuoteHTML = quoteText && (quoteText.includes('<') && quoteText.includes('>'));
                            return (
                              <blockquote key={index}>
                                {hasQuoteHTML ? (
                                  <div 
                                    dangerouslySetInnerHTML={{ __html: quoteText }}
                                  />
                                ) : (
                                  <p>"{quoteText}"</p>
                                )}
                              </blockquote>
                            );
                          }
                          case 'photoBlock':
                            if (!block.photos || block.photos.length === 0) return null;
                            const getGridClass = () => {
                              switch (block.layout) {
                                case 'sidebyside': return 'grid-cols-1 md:grid-cols-2';
                                case '3column': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
                                default: return 'grid-cols-1';
                              }
                            };
                            return (
                              <div key={index} className={`grid gap-6 ${getGridClass()}`}>
                                {block.photos.map((photo) => (
                                  <div key={photo._key}>
                                    <div className="aspect-video overflow-hidden rounded-lg bg-gray-600 flex items-center justify-center">
                                      {photo.file ? (
                                        <img 
                                          src={URL.createObjectURL(photo.file)} 
                                          alt={photo.alt || 'Article photo'} 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (photo.url || photo.assetRef) ? (
                                        <img 
                                          src={photo.url} 
                                          alt={photo.alt || 'Article photo'} 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-gray-400 text-sm">Photo placeholder</span>
                                      )}
                                    </div>
                                    {photo.caption && (
                                      <p className="text-sm text-gray-400 italic text-center">
                                        {photo.caption}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          default:
                            return null;
                        }
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <p>No content yet. Write in the Content tab to see the preview.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea 
              id="metaDescription" 
              value={formData.metaDescription} 
              onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))} 
              className="bg-gray-700 border-gray-600" 
              rows={3}
              placeholder="Brief description for search engines"
            />
          </div>

          <div className="space-y-2">
            <Label>Keywords</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.keywords.map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 text-sm rounded flex items-center space-x-1">
                  <span>{keyword}</span>
                  <button type="button" onClick={() => removeKeyword(keyword)} className="text-green-400 hover:text-green-200">×</button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input 
                value={newKeyword} 
                onChange={(e) => setNewKeyword(e.target.value)} 
                className="bg-gray-700 border-gray-600" 
                placeholder="Add keyword"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <Button type="button" onClick={addKeyword} className="bg-red-500 hover:bg-red-600">Add</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="bg-gray-700" />
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>Cancel</Button>
        <Button type="submit" className="bg-red-500 hover:bg-red-600" disabled={uploading}>
          {uploading ? <><Upload className="w-4 h-4 mr-2 animate-pulse" />Uploading...</> : <><Save className="w-4 h-4 mr-2" />Save Article</>}
        </Button>
      </div>

      {/* Hero Image Position Modal */}
      <HeroImagePositionModal
        isOpen={isHeroCropModalOpen}
        onClose={() => {
          setIsHeroCropModalOpen(false);
          setHeroImageFile(null);
        }}
        imageFile={heroImageFile}
        onCropComplete={handleHeroCropComplete}
      />
    </form>
  );
};

export default ArticleManager;
