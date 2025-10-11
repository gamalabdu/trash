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
import { Plus, Edit, Trash2, RefreshCw, FileText, Upload, Save, Image as ImageIcon, Calendar, User, Tag } from 'lucide-react';
import { sanityClient } from '../../../utils/sanityClient';
import ContentBlockComponent, { ContentBlockProps } from '../../ui/content-block';

interface Article {
  _id?: string;
  title: string;
  subtitle: string;
  heroImage?: File | string | null;
  heroImageAlt?: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

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
            alt
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
        cache: 'no-store'
      });

      setArticles(articlesData.map((article: any) => ({
        _id: article._id,
        title: article.title || '',
        subtitle: article.subtitle || '',
        heroImage: article.heroImage?.asset?.url || null,
        heroImageAlt: article.heroImage?.alt || '',
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
                assetRef: photo.asset?._ref, // Store the asset reference ID
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
    setIsDialogOpen(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle({ ...article });
    setIsDialogOpen(true);
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
        content: articleData.content,
        externalLinks: articleData.externalLinks,
        tags: articleData.tags,
        shareCount: articleData.shareCount,
        metaDescription: articleData.metaDescription,
        keywords: articleData.keywords
      };

      // Handle hero image upload
      if (articleData.heroImage instanceof File) {
        setUploadProgress(30);
        const heroImageAssetId = await uploadAsset(articleData.heroImage, 'image');
        updateData.heroImage = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: heroImageAssetId
          },
          alt: articleData.heroImageAlt
        };
      } else if (typeof articleData.heroImage === 'string' && articleData.heroImage) {
        // For existing images, we need to fetch the current article to get the asset reference
        if (articleData._id) {
          const currentArticle = await sanityClient.fetch(`*[_id == "${articleData._id}"][0]`);
          if (currentArticle?.heroImage?.asset?._ref) {
            updateData.heroImage = {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: currentArticle.heroImage.asset._ref
              },
              alt: articleData.heroImageAlt
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
          asset: {
            _type: 'reference',
            _ref: authorImageAssetId
          }
        };
      }

      // Process content blocks and upload photos
      setUploadProgress(70);
      const processedContent = await Promise.all(
        articleData.content.map(async (block) => {
          if (block._type === 'photoBlock' && block.photos) {
            console.log('Processing photo block:', block);
            const processedPhotos = (await Promise.all(
              block.photos.map(async (photo) => {
                console.log('Processing photo:', photo);
                if (photo.file) {
                  const assetId = await uploadAsset(photo.file, 'image');
                  return {
                    _type: 'image',
                    asset: {
                      _type: 'reference',
                      _ref: assetId
                    },
                    alt: photo.alt || '',
                    caption: photo.caption || ''
                  };
                } else {
                  // For existing photos, we need to extract the asset ID from the URL
                  // URL format: https://cdn.sanity.io/images/projectId/dataset/assetId-format
                  let assetId = photo.assetRef; // Use assetRef if available
                  
                  if (!assetId && photo.url && typeof photo.url === 'string' && photo.url.includes('cdn.sanity.io')) {
                    // Extract asset ID from CDN URL as fallback
                    // URL format: https://cdn.sanity.io/images/projectId/dataset/assetId-dimensions.ext
                    const urlParts = photo.url.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    // Remove file extension and dimensions, keep the asset ID
                    // Example: "e71295894b693dfd9530f8c159d7b8855edffe22-704x698.png" -> "e71295894b693dfd9530f8c159d7b8855edffe22"
                    const withoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
                    const parts = withoutExt.split('-');
                    // The asset ID is everything except the last part (dimensions)
                    if (parts.length >= 2) {
                      assetId = parts.slice(0, -1).join('-');
                      console.log('Extracted asset ID from URL:', assetId, 'from filename:', filename);
                    }
                  }
                  
                  if (!assetId) {
                    console.error('No valid asset ID found for photo:', photo);
                    // Skip this photo if we can't get a valid asset ID
                    return null;
                  }
                  
                  return {
                    _type: 'image',
                    asset: {
                      _type: 'reference',
                      _ref: assetId
                    },
                    alt: photo.alt || '',
                    caption: photo.caption || ''
                  };
                }
              })
            )).filter(photo => photo !== null);
            
            return {
              _type: 'photoBlock',
              photos: processedPhotos,
              layout: block.layout
            };
          }
          return block;
        })
      );
      
      updateData.content = processedContent;

      setUploadProgress(90);

      if (articleData._id) {
        await sanityClient.patch(articleData._id).set(updateData).commit();
      } else {
        await sanityClient.create({
          _type: 'articles',
          ...updateData
        });
      }

      setUploadProgress(100);
      setMessage({ type: 'success', text: articleData._id ? 'Article updated successfully!' : 'Article created successfully!' });
      
      // Small delay to ensure Sanity has processed the update, then refresh and close modal
      setTimeout(async () => {
        await fetchArticles();
        setIsDialogOpen(false);
        setEditingArticle(null);
      }, 500);

    } catch (error) {
      console.error('Error saving article:', error);
      setMessage({ type: 'error', text: 'Failed to save article' });
      // Don't close modal on error so user can try again
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
                <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden mb-3">
                  <img src={article.heroImage} alt={article.heroImageAlt} className="w-full h-full object-cover" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle?._id ? 'Edit Article' : 'Create New Article'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingArticle?._id ? 'Update article information' : 'Add a new article to your blog'}
            </DialogDescription>
          </DialogHeader>
          
          {editingArticle && (
            <ArticleForm 
              article={editingArticle}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          )}
        </DialogContent>
      </Dialog>

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
                    <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden mb-4">
                      <img 
                        src={articleToDelete.heroImage} 
                        alt={articleToDelete.heroImageAlt} 
                        className="w-full h-full object-cover"
                      />
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
  const [formData, setFormData] = useState<Article>(article);
  const [newTag, setNewTag] = useState('');
  const [newCategoryTag, setNewCategoryTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newSocialLink, setNewSocialLink] = useState('');
  const [newExternalLink, setNewExternalLink] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [allCollapsed, setAllCollapsed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileChange = (file: File | null, field: 'heroImage' | 'authorImage') => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, publishedDate: date.toISOString() }));
      setCalendarOpen(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addCategoryTag = () => {
    if (newCategoryTag.trim() && !formData.categoryTags.includes(newCategoryTag.trim())) {
      setFormData(prev => ({ ...prev, categoryTags: [...prev.categoryTags, newCategoryTag.trim()] }));
      setNewCategoryTag('');
    }
  };

  const removeCategoryTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, categoryTags: prev.categoryTags.filter(tag => tag !== tagToRemove) }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword.trim()] }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove) }));
  };

  const addSocialLink = () => {
    if (newSocialLink.trim() && !formData.authorSocialLinks.includes(newSocialLink.trim())) {
      setFormData(prev => ({ ...prev, authorSocialLinks: [...prev.authorSocialLinks, newSocialLink.trim()] }));
      setNewSocialLink('');
    }
  };

  const removeSocialLink = (linkToRemove: string) => {
    setFormData(prev => ({ ...prev, authorSocialLinks: prev.authorSocialLinks.filter(link => link !== linkToRemove) }));
  };

  const addExternalLink = () => {
    if (newExternalLink.trim() && !formData.externalLinks.includes(newExternalLink.trim())) {
      setFormData(prev => ({ ...prev, externalLinks: [...prev.externalLinks, newExternalLink.trim()] }));
      setNewExternalLink('');
    }
  };

  const removeExternalLink = (linkToRemove: string) => {
    setFormData(prev => ({ ...prev, externalLinks: prev.externalLinks.filter(link => link !== linkToRemove) }));
  };


  const removeContentBlock = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      content: prev.content.filter((_, i) => i !== index) 
    }));
  };

  const addTextBlock = () => {
    const newBlock: ArticleContentBlock = {
      _type: 'block',
      _key: `block-${Date.now()}`,
      style: 'normal',
      children: [{
        _type: 'span',
        _key: `span-${Date.now()}`,
        text: '',
        marks: []
      }]
    };
    setFormData(prev => ({ ...prev, content: [newBlock, ...prev.content] }));
  };



  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're actually leaving the drop zone
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (isNaN(draggedIndex) || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Create new array with reordered items
    const newContent = [...formData.content];
    const draggedItem = newContent[draggedIndex];
    
    // Remove from old position
    newContent.splice(draggedIndex, 1);
    
    // Adjust drop index if dragging from top to bottom
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    
    // Insert at new position
    newContent.splice(adjustedDropIndex, 0, draggedItem);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    setDraggedIndex(null);
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
              {typeof formData.heroImage === 'string' && formData.heroImage && (
                <div className="aspect-video bg-gray-600 rounded-lg overflow-hidden">
                  <img src={formData.heroImage} alt="Current hero" className="w-full h-full object-cover" />
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

        <TabsContent value="content" className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold text-white">Article Content</Label>
                <p className="text-sm text-gray-400 mt-1">Create and organize your article content with rich text editing</p>
              </div>
              
              {/* Add Content Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={addTextBlock} className="bg-blue-500 hover:bg-blue-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Text Block
                </Button>
                
                <Button 
                  type="button" 
                  onClick={() => {
                    const newBlock: ArticleContentBlock = {
                      _type: 'spotifyEmbed',
                      _key: `spotify-${Date.now()}`,
                      embedCode: ''
                    };
                    setFormData(prev => ({ ...prev, content: [newBlock, ...prev.content] }));
                  }}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Spotify
                </Button>
                
                <Button 
                  type="button" 
                  onClick={() => {
                    const newBlock: ArticleContentBlock = {
                      _type: 'pullQuote',
                      _key: `quote-${Date.now()}`,
                      text: ''
                    };
                    setFormData(prev => ({ ...prev, content: [newBlock, ...prev.content] }));
                  }}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Add Quote
                </Button>
                
                <Button 
                  type="button" 
                  onClick={() => {
                    const newBlock: ArticleContentBlock = {
                      _type: 'photoBlock',
                      _key: `photoBlock-${Date.now()}`,
                      photos: [],
                      layout: 'single'
                    };
                    setFormData(prev => ({ ...prev, content: [newBlock, ...prev.content] }));
                  }}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Photo Block
                </Button>
              </div>


            </div>


            {/* Content Blocks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-white">Content Blocks ({formData.content.length})</Label>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">
                    Drag blocks to reorder • Click edit to modify content
                  </div>
                  {formData.content.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => setAllCollapsed(!allCollapsed)}
                      className={`text-xs font-medium px-4 py-2 transition-all duration-200 border ${
                        allCollapsed
                          ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400 hover:border-blue-500/50'
                          : 'bg-gray-600/50 hover:bg-gray-600/70 border-gray-500/30 text-gray-300 hover:border-gray-500/50'
                      }`}
                    >
                      {allCollapsed ? '⊞ Expand All' : '⊟ Collapse All'}
                    </Button>
                  )}
                </div>
              </div>
              
              {formData.content.map((block, index) => (
                <div
                  key={block._key || index}
                  className={`relative transition-all duration-200 ${
                    draggedIndex === index ? 'opacity-50 scale-95 z-10' : ''
                  } ${
                    dragOverIndex === index && draggedIndex !== index 
                      ? 'transform translate-y-1' 
                      : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Drop indicator */}
                  {dragOverIndex === index && draggedIndex !== index && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-brand-red rounded-full z-20 animate-pulse" />
                  )}
                  
                  <ContentBlockComponent
                    block={block}
                    index={index}
                    onUpdate={(index, updates) => {
                      const updatedContent = [...formData.content];
                      updatedContent[index] = { ...updatedContent[index], ...updates };
                      setFormData(prev => ({ ...prev, content: updatedContent }));
                    }}
                    onRemove={removeContentBlock}
                    onMoveUp={() => {}}
                    onMoveDown={() => {}}
                    onDragStart={() => {}}
                    onDragOver={() => {}}
                    onDrop={() => {}}
                    isDragging={draggedIndex === index}
                    forceCollapsed={allCollapsed}
                  />
                </div>
              ))}
            </div>

            {formData.content.length === 0 && (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No content blocks yet</h3>
                <p className="mb-4">Start building your article by adding content blocks above</p>
                <Button onClick={addTextBlock} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Text Block
                </Button>
              </div>
            )}
          </div>

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

        <TabsContent value="preview" className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Article Preview</h3>
              <p className="text-sm text-gray-400">This is how your article will appear on the reviews page</p>
            </div>
            
            {/* Preview Content - matches ReviewDetail layout */}
            <div className="bg-gray-800 rounded-lg p-6">
              {/* Category Tags */}
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

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                {formData.title || 'Article Title'}
              </h1>

              {/* Subtitle */}
              {formData.subtitle && (
                <p className="text-xl text-gray-300 mb-6">
                  {formData.subtitle}
                </p>
              )}

              {/* Author and Meta Info */}
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

              {/* Hero Image */}
              {formData.heroImage && (
                <div className="mb-8">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                    {typeof formData.heroImage === 'string' ? (
                      <img 
                        src={formData.heroImage} 
                        alt={formData.heroImageAlt || formData.title}
                        className="w-full h-full object-cover"
                      />
                    ) : formData.heroImage instanceof File ? (
                      <img 
                        src={URL.createObjectURL(formData.heroImage)} 
                        alt={formData.heroImageAlt || formData.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              )}

              {/* Author Bio */}
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

              {/* Article Content */}
              <div className="prose prose-invert max-w-none">
                {formData.content.length > 0 ? (
                  formData.content.map((block, index) => {
                    switch (block._type) {
                      case 'block':
                        const text = block.children?.[0]?.text || '';
                        const style = block.style || 'normal';
                        
                        // Check if the text contains HTML (from rich text editor)
                        const hasHTML = text && (text.includes('<') && text.includes('>'));
                        
                        if (hasHTML) {
                          return (
                            <div 
                              key={index} 
                              className="text-gray-300 leading-relaxed mb-4 font-secondary"
                              dangerouslySetInnerHTML={{ __html: text }}
                              style={{
                                // Use consistent sans-serif font for all article content
                                fontFamily: 'var(--font-secondary)',
                                fontSize: '1.125rem',
                                lineHeight: '1.7'
                              }}
                            />
                          );
                        } else if (style === 'h1') {
                          return (
                            <h1 key={index} className="text-3xl font-bold text-white mb-6 mt-8">
                              {text}
                            </h1>
                          );
                        } else if (style === 'h2') {
                          return (
                            <h2 key={index} className="text-2xl font-bold text-white mb-4 mt-6">
                              {text}
                            </h2>
                          );
                        } else if (style === 'h3') {
                          return (
                            <h3 key={index} className="text-xl font-bold text-white mb-3 mt-4">
                              {text}
                            </h3>
                          );
                        } else {
                          return (
                            <p key={index} className="text-gray-300 leading-relaxed mb-4 font-secondary" style={{ fontSize: '1.125rem', lineHeight: '1.7' }}>
                              {text}
                            </p>
                          );
                        }

                      case 'spotifyEmbed':
                        return (
                          <div key={index} className="my-6">
                            <div 
                              dangerouslySetInnerHTML={{ __html: block.embedCode || '' }}
                              className="rounded-lg overflow-hidden"
                            />
                          </div>
                        );

                      case 'pullQuote':
                        const quoteText = block.text || '';
                        const hasQuoteHTML = quoteText && (quoteText.includes('<') && quoteText.includes('>'));
                        
                        return (
                          <blockquote key={index} className="border-l-4 border-red-500 pl-6 py-4 my-6 bg-gray-700/50 rounded-r-lg">
                            {hasQuoteHTML ? (
                              <div 
                                className="text-xl italic text-gray-200 font-secondary"
                                dangerouslySetInnerHTML={{ __html: quoteText }}
                                style={{
                                  // Use consistent sans-serif font for quotes
                                  fontFamily: 'var(--font-secondary)',
                                  fontSize: '1.25rem',
                                  lineHeight: '1.6',
                                }}
                              />
                            ) : (
                              <p className="text-xl italic text-gray-200 font-secondary" style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
                                "{quoteText}"
                              </p>
                            )}
                          </blockquote>
                        );

                      case 'photoBlock':
                        if (!block.photos || block.photos.length === 0) return null;
                        
                        const getGridClass = () => {
                          switch (block.layout) {
                            case 'sidebyside':
                              return 'grid-cols-1 md:grid-cols-2';
                            case '3column':
                              return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
                            default:
                              return 'grid-cols-1';
                          }
                        };

                        return (
                          <div key={index} className={`my-8 grid gap-6 ${getGridClass()}`}>
                            {block.photos.map((photo) => (
                              <div key={photo._key} className="space-y-3">
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
                    <p>No content blocks yet. Add some content in the Content tab to see the preview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

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
    </form>
  );
};

export default ArticleManager;
