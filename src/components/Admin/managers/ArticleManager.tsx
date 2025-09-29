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
  content: ContentBlock[];
  externalLinks: string[];
  tags: string[];
  shareCount: number;
  metaDescription: string;
  keywords: string[];
}

interface ContentBlock {
  _type: 'block' | 'spotifyEmbed' | 'pullQuote';
  _key?: string;
  // For block content
  children?: any[];
  style?: string;
  // For Spotify embed
  embedCode?: string;
  // For pull quote
  text?: string;
}

const ArticleManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

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
          content,
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
        content: article.content || [],
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

  const handleDelete = async (articleId: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      await sanityClient.delete(articleId);
      setMessage({ type: 'success', text: 'Article deleted successfully!' });
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      setMessage({ type: 'error', text: 'Failed to delete article' });
    }
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

      setUploadProgress(90);

      if (articleData._id) {
        await sanityClient.patch(articleData._id).set(updateData).commit();
        setMessage({ type: 'success', text: 'Article updated successfully!' });
      } else {
        await sanityClient.create({
          _type: 'articles',
          ...updateData
        });
        setMessage({ type: 'success', text: 'Article created successfully!' });
      }

      setUploadProgress(100);
      setIsDialogOpen(false);
      setEditingArticle(null);
      
      // Small delay to ensure Sanity has processed the update, then refresh
      setTimeout(async () => {
        await fetchArticles();
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
                  <Button size="sm" variant="outline" onClick={() => article._id && handleDelete(article._id)} className="border-red-500 text-red-400 hover:bg-red-500/10">
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
  const [newSpotifyEmbed, setNewSpotifyEmbed] = useState('');
  const [newPullQuote, setNewPullQuote] = useState('');

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

  const addSpotifyEmbed = () => {
    if (newSpotifyEmbed.trim()) {
      const newBlock: ContentBlock = {
        _type: 'spotifyEmbed',
        _key: `spotify-${Date.now()}`,
        embedCode: newSpotifyEmbed.trim()
      };
      setFormData(prev => ({ ...prev, content: [...prev.content, newBlock] }));
      setNewSpotifyEmbed('');
    }
  };

  const addPullQuote = () => {
    if (newPullQuote.trim()) {
      const newBlock: ContentBlock = {
        _type: 'pullQuote',
        _key: `quote-${Date.now()}`,
        text: newPullQuote.trim()
      };
      setFormData(prev => ({ ...prev, content: [...prev.content, newBlock] }));
      setNewPullQuote('');
    }
  };

  const removeContentBlock = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      content: prev.content.filter((_, i) => i !== index) 
    }));
  };

  const addTextBlock = () => {
    const newBlock: ContentBlock = {
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
    setFormData(prev => ({ ...prev, content: [...prev.content, newBlock] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="bg-gray-700 border-gray-600">
          <TabsTrigger value="basic" className="data-[state=active]:bg-red-500">Basic Info</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-red-500">Content</TabsTrigger>
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

        <TabsContent value="content" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Article Content</Label>
              <div className="flex space-x-2">
                <Button type="button" onClick={addTextBlock} className="bg-blue-500 hover:bg-blue-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Text Block
                </Button>
              </div>
            </div>

            {/* Add Content Block Inputs */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">Add New Content Block</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Spotify Embed Section */}
                <div className="space-y-2">
                  <Label>Spotify Embed</Label>
                  <div className="flex space-x-2">
                    <Textarea 
                      value={newSpotifyEmbed} 
                      onChange={(e) => setNewSpotifyEmbed(e.target.value)} 
                      className="bg-gray-600 border-gray-500 flex-1" 
                      rows={3}
                      placeholder="Paste Spotify iframe embed code here..."
                    />
                    <Button 
                      type="button" 
                      onClick={addSpotifyEmbed} 
                      className="bg-green-500 hover:bg-green-600"
                      disabled={!newSpotifyEmbed.trim()}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Spotify
                    </Button>
                  </div>
                </div>

                {/* Pull Quote Section */}
                <div className="space-y-2">
                  <Label>Pull Quote</Label>
                  <div className="flex space-x-2">
                    <Textarea 
                      value={newPullQuote} 
                      onChange={(e) => setNewPullQuote(e.target.value)} 
                      className="bg-gray-600 border-gray-500 flex-1" 
                      rows={2}
                      placeholder="Enter quote text..."
                    />
                    <Button 
                      type="button" 
                      onClick={addPullQuote} 
                      className="bg-purple-500 hover:bg-purple-600"
                      disabled={!newPullQuote.trim()}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Add Quote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {formData.content.map((block, index) => (
                <Card key={block._key || index} className="bg-gray-700 border-gray-600">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm capitalize">
                        {block._type === 'block' ? 'Text Block' : 
                         block._type === 'spotifyEmbed' ? 'Spotify Embed' : 
                         'Pull Quote'}
                      </CardTitle>
                      <Button 
                        type="button" 
                        onClick={() => removeContentBlock(index)} 
                        className="bg-red-500 hover:bg-red-600 text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {block._type === 'block' && (
                      <Textarea 
                        value={block.children?.[0]?.text || ''} 
                        onChange={(e) => {
                          const updatedContent = [...formData.content];
                          if (updatedContent[index].children?.[0]) {
                            updatedContent[index].children![0].text = e.target.value;
                          }
                          setFormData(prev => ({ ...prev, content: updatedContent }));
                        }}
                        className="bg-gray-600 border-gray-500" 
                        rows={4}
                        placeholder="Enter text content..."
                      />
                    )}
                    {block._type === 'spotifyEmbed' && (
                      <div className="space-y-2">
                        <Label>Spotify Embed Code</Label>
                        <Textarea 
                          value={block.embedCode || ''} 
                          onChange={(e) => {
                            const updatedContent = [...formData.content];
                            updatedContent[index].embedCode = e.target.value;
                            setFormData(prev => ({ ...prev, content: updatedContent }));
                          }}
                          className="bg-gray-600 border-gray-500" 
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
                    {block._type === 'pullQuote' && (
                      <div className="space-y-2">
                        <Label>Quote Text</Label>
                        <Textarea 
                          value={block.text || ''} 
                          onChange={(e) => {
                            const updatedContent = [...formData.content];
                            updatedContent[index].text = e.target.value;
                            setFormData(prev => ({ ...prev, content: updatedContent }));
                          }}
                          className="bg-gray-600 border-gray-500" 
                          rows={3}
                          placeholder="Enter quote text..."
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {formData.content.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No content blocks yet. Add some content to get started!</p>
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
