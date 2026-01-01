import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeft, Clock, User, Calendar, Share2, ExternalLink, RefreshCw } from 'lucide-react';
import { FaInstagram, FaTwitter, FaSpotify, FaYoutube, FaSoundcloud, FaApple, FaTiktok, FaFacebook, FaLinkedin, FaGlobe, FaExternalLinkAlt } from 'react-icons/fa';
import { sanityClient } from '../../utils/sanityClient';
import '../ui/tiptap-templates/@/styles/_variables.scss';
import '../ui/tiptap-templates/simple/simple-editor.scss';
import '../ui/tiptap-templates/@/components/tiptap-node/quote-node/quote-node.scss';
import '../ui/tiptap-templates/@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '../ui/tiptap-templates/@/components/tiptap-node/image-node/image-node.scss';
import '../ui/tiptap-templates/@/components/tiptap-node/paragraph-node/paragraph-node.scss';
import '../ui/tiptap-templates/@/components/tiptap-node/spotify-node/spotify-node.scss';
import '../ui/tiptap-templates/@/components/tiptap-node/youtube-node/youtube-node.scss';

interface Article {
  _id: string;
  title: string;
  subtitle: string;
  heroImage?: string | null;
  heroImageAlt?: string;
  heroImageFocusPoint?: { x: number; y: number };
  categoryTags: string[];
  authorName: string;
  authorRole: string;
  authorImage?: string | null;
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
  _type: 'block' | 'spotifyEmbed' | 'pullQuote' | 'photoBlock';
  _key?: string;
  children?: any[];
  style?: string;
  embedCode?: string;
  text?: string;
  photos?: PhotoItem[];
  layout?: 'single' | 'sidebyside' | '3column';
}

interface PhotoItem {
  _key: string;
  asset?: {
    url: string;
  };
  url?: string;
  alt?: string;
  caption?: string;
}

const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getObjectPosition = (focusPoint?: { x: number; y: number }) => {
    if (!focusPoint) return 'center center';
    return `${focusPoint.x * 100}% ${focusPoint.y * 100}%`;
  };

  const getSocialIcon = (url: string) => {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('instagram.com')) {
      return <FaInstagram className="w-5 h-5" />;
    } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return <FaTwitter className="w-5 h-5" />;
    } else if (urlLower.includes('spotify.com')) {
      return <FaSpotify className="w-5 h-5" />;
    } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return <FaYoutube className="w-5 h-5" />;
    } else if (urlLower.includes('soundcloud.com')) {
      return <FaSoundcloud className="w-5 h-5" />;
    } else if (urlLower.includes('music.apple.com') || urlLower.includes('itunes.apple.com')) {
      return <FaApple className="w-5 h-5" />;
    } else if (urlLower.includes('tiktok.com')) {
      return <FaTiktok className="w-5 h-5" />;
    } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
      return <FaFacebook className="w-5 h-5" />;
    } else if (urlLower.includes('linkedin.com')) {
      return <FaLinkedin className="w-5 h-5" />;
    } else {
      return <FaGlobe className="w-5 h-5" />;
    }
  };

  const handleSocialClick = (link: string) => {
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://${link}`, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  // Force refresh when component mounts to ensure fresh data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        fetchArticle(id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const articleData = await sanityClient.fetch(`
        *[_type == "articles" && _id == $id][0] {
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
        id: articleId,
        timestamp: Date.now()
      }, {
        cache: 'no-store',
        useCdn: false
      });

      if (!articleData) {
        setError('Article not found');
        return;
      }

      console.log('Fetched article data:', articleData);
      console.log('Hero image data:', articleData.heroImage);
      console.log('Hero image URL:', articleData.heroImage?.asset?.url);

      const processedArticle: Article = {
        _id: articleData._id,
        title: articleData.title || '',
        subtitle: articleData.subtitle || '',
        heroImage: articleData.heroImage?.asset?.url || null,
        heroImageAlt: articleData.heroImage?.alt || '',
        heroImageFocusPoint: articleData.heroImage?.hotspot ? {
          x: articleData.heroImage.hotspot.x,
          y: articleData.heroImage.hotspot.y
        } : undefined,
        categoryTags: articleData.categoryTags || [],
        authorName: articleData.authorName || '',
        authorRole: articleData.authorRole || '',
        authorImage: articleData.authorImage?.asset?.url || null,
        authorSocialLinks: articleData.authorSocialLinks || [],
        publishedDate: articleData.publishedDate || '',
        content: articleData.content || [],
        externalLinks: articleData.externalLinks || [],
        tags: articleData.tags || [],
        shareCount: articleData.shareCount || 0,
        metaDescription: articleData.metaDescription || '',
        keywords: articleData.keywords || []
      };

      setArticle(processedArticle);
      
      // Fetch related articles after setting the main article
      await fetchRelatedArticles(processedArticle);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    }
    
    setLoading(false);
  };

  const fetchRelatedArticles = async (currentArticle: Article) => {
    try {
      // Get all tags and category tags from the current article
      const allTags = [...(currentArticle.tags || []), ...(currentArticle.categoryTags || [])];
      
      if (allTags.length === 0) {
        return;
      }

      // Create a query to find articles with similar tags or categories
      const relatedData = await sanityClient.fetch(`
        *[_type == "articles" && _id != $currentId && (
          count(tags[@ in $tags]) > 0 || 
          count(categoryTags[@ in $categoryTags]) > 0
        )] | order(publishedDate desc) [0...6] {
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
          publishedDate,
          tags
        }
      `, { 
        currentId: currentArticle._id,
        tags: currentArticle.tags || [],
        categoryTags: currentArticle.categoryTags || [],
        timestamp: Date.now()
      }, {
        cache: 'no-store',
        useCdn: false
      });

      // If no related articles found, try a more permissive query
      let finalRelatedData = relatedData;
      if (relatedData.length === 0) {
        // Try to find any recent articles (fallback)
        const fallbackData = await sanityClient.fetch(`
          *[_type == "articles" && _id != $currentId] | order(publishedDate desc) [0...3] {
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
            publishedDate,
            tags
          }
        `, { 
          currentId: currentArticle._id,
          timestamp: Date.now()
        }, {
          cache: 'no-store',
          useCdn: false
        });
        
        finalRelatedData = fallbackData;
      }

      const processedRelatedArticles: Article[] = finalRelatedData.map((article: any) => ({
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
        authorRole: '',
        authorImage: null,
        authorSocialLinks: [],
        publishedDate: article.publishedDate || '',
        content: [],
        externalLinks: [],
        tags: article.tags || [],
        shareCount: 0,
        metaDescription: '',
        keywords: []
      }));

      setRelatedArticles(processedRelatedArticles);
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).toUpperCase();
  };

  const getReadTime = (content: ContentBlock[]) => {
    const wordCount = content.reduce((count, block) => {
      if (block._type === 'block' && block.children) {
        return count + block.children.reduce((blockCount: number, child: any) => {
          return blockCount + (child.text ? child.text.split(' ').length : 0);
        }, 0);
      }
      return count;
    }, 0);
    
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} MINUTE READ`;
  };

  // Process Spotify and YouTube embeds similar to ArticleManager
  const processMediaEmbeds = (html: string): string => {
    if (!html) return '';
    
    console.log('Processing media embeds, input HTML length:', html.length);
    console.log('Input HTML preview:', html.substring(0, 1000));
    
    let processed = html;
    
    // Process Spotify embeds
    const spotifyRegex = /<div[^>]*data-type="spotify"[^>]*data-iframe-code="([^"]*)"[^>]*(?:\/>|>.*?<\/div>)/g;
    processed = processed.replace(spotifyRegex, (match, iframeCode) => {
        console.log('Found Spotify match:', match);
        console.log('Iframe code:', iframeCode);
        
        // Decode HTML entities
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
        console.log('Found YouTube match:', match);
        console.log('Embed code:', embedCode);
        
        // Decode HTML entities
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

  const renderContentBlock = (block: ContentBlock, index: number) => {
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
                  {photo.asset?.url || photo.url ? (
                    <img 
                      src={photo.asset?.url || photo.url} 
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-brand-text font-secondary">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-primary font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 font-secondary mb-6">{error}</p>
          <Link to="/reviews">
            <Button className="bg-brand-red hover:bg-brand-red/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reviews
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/reviews" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <div className="mb-8 flex justify-between items-center">
          <Link to="/reviews">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reviews
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => id && fetchArticle(id)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          {/* Category Tags */}
          <div className="flex gap-2 mb-4">
            {article.categoryTags.map((tag, index) => (
              <Badge 
                key={index} 
                className="bg-brand-red/20 text-brand-red border-brand-red/30 px-3 py-1 text-xs font-secondary font-semibold"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-primary font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl text-gray-300 font-secondary mb-6">
              {article.subtitle}
            </p>
          )}

          {/* Author and Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 font-secondary mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>BY {article.authorName.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishedDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{getReadTime(article.content)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>{article.shareCount} SHARES</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        {article.heroImage && (() => {
          console.log('Rendering hero image with URL:', article.heroImage);
          // Add cache-busting parameter to ensure fresh image
          const imageUrl = `${article.heroImage}?t=${Date.now()}`;
          return (
            <div className="mb-8">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg group">
                <img 
                  src={imageUrl} 
                  alt={article.heroImageAlt || article.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: getObjectPosition(article.heroImageFocusPoint) }}
                />
              
              {/* Related Links Overlay */}
              {article.externalLinks && article.externalLinks.length > 0 && (
                <div className="absolute top-4 right-4 flex gap-2">
                  {article.externalLinks.slice(0, 4).map((link, index) => (
                    <button
                      key={index}
                      onClick={() => handleSocialClick(link)}
                      className="w-10 h-10 bg-black/70 hover:bg-brand-red text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-brand-red"
                      title={`External Link - ${link}`}
                    >
                      {getSocialIcon(link)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          );
        })()}

        {/* Author Bio */}
        <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#0e0e11' }}>
          <div className="flex gap-4">
            {article.authorImage && (
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={article.authorImage} 
                  alt={article.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-white font-primary font-bold text-lg mb-2">
                {article.authorName}
              </h3>
              <p className="text-gray-400 font-secondary text-sm mb-3">
                {article.authorRole}
              </p>
              {article.authorSocialLinks.length > 0 && (
                <div className="flex gap-2">
                  {article.authorSocialLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => handleSocialClick(link)}
                      className="w-6 h-6 text-brand-red hover:text-brand-red/80 transition-colors flex items-center justify-center"
                      title={`Author Social Link - ${link}`}
                    >
                      {getSocialIcon(link)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="simple-editor-wrapper" style={{ backgroundColor: '#0e0e11' }}>
          <div className="simple-editor-content" style={{ backgroundColor: '#0e0e11' }}>
            <div className="tiptap ProseMirror simple-editor" style={{ backgroundColor: '#0e0e11', color: '#f0eef0' }}>
              {(() => {
                // Check if the first content block contains HTML (like editorHTML)
                const firstBlock = article.content.find(b => b._type === 'block');
                const htmlContent = firstBlock?.children?.[0]?.text;
                const hasHTML = htmlContent && (htmlContent.includes('<') && htmlContent.includes('>'));
                
                if (hasHTML) {
                  // Render HTML content directly (like ArticleManager preview)
                  return (
                    <div dangerouslySetInnerHTML={{ 
                      __html: processMediaEmbeds(htmlContent) 
                    }} />
                  );
                } else {
                  // Fall back to rendering individual content blocks
                  return article.content.map((block, index) => renderContentBlock(block, index));
                }
              })()}
            </div>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="mt-16 mb-8 flex items-center justify-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          <div className="mx-4 text-gray-500 text-sm font-secondary">MORE ARTICLES</div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="text-white font-primary font-bold text-2xl mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link 
                  key={relatedArticle._id} 
                  to={`/reviews/${relatedArticle._id}`}
                  className="group block"
                >
                  <Card className="bg-gray-800/50 border-gray-700 hover:border-brand-red/50 transition-all duration-300 hover:bg-gray-800/70">
                    <CardContent className="p-0">
                      {/* Article Image */}
                      {relatedArticle.heroImage && (
                        <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                          <img 
                            src={`${relatedArticle.heroImage}?t=${Date.now()}`} 
                            alt={relatedArticle.heroImageAlt || relatedArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ objectPosition: getObjectPosition(relatedArticle.heroImageFocusPoint) }}
                          />
                        </div>
                      )}
                      
                      <div className="p-4">
                        {/* Category Tags */}
                        {relatedArticle.categoryTags.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {relatedArticle.categoryTags.slice(0, 2).map((tag, index) => (
                              <Badge 
                                key={index} 
                                className="bg-brand-red/20 text-brand-red border-brand-red/30 px-2 py-1 text-xs font-secondary font-semibold"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Title */}
                        <h4 className="text-white font-primary font-bold text-lg mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
                          {relatedArticle.title}
                        </h4>
                        
                        {/* Subtitle */}
                        {relatedArticle.subtitle && (
                          <p className="text-gray-400 font-secondary text-sm mb-3 line-clamp-2">
                            {relatedArticle.subtitle}
                          </p>
                        )}
                        
                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 font-secondary">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span>{relatedArticle.authorName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(relatedArticle.publishedDate)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReviewDetail;
