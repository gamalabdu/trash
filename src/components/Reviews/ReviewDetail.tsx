import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeft, Clock, User, Calendar, Share2, ExternalLink } from 'lucide-react';
import { FaInstagram, FaTwitter, FaSpotify, FaYoutube, FaSoundcloud, FaApple, FaTiktok, FaFacebook, FaLinkedin, FaGlobe, FaExternalLinkAlt } from 'react-icons/fa';
import { sanityClient } from '../../utils/sanityClient';

interface Article {
  _id: string;
  title: string;
  subtitle: string;
  heroImage?: string | null;
  heroImageAlt?: string;
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
  _type: 'block' | 'spotifyEmbed' | 'pullQuote';
  _key?: string;
  children?: any[];
  style?: string;
  embedCode?: string;
  text?: string;
}

const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      `, { id: articleId });

      if (!articleData) {
        setError('Article not found');
        return;
      }

      const processedArticle: Article = {
        _id: articleData._id,
        title: articleData.title || '',
        subtitle: articleData.subtitle || '',
        heroImage: articleData.heroImage?.asset?.url || null,
        heroImageAlt: articleData.heroImage?.alt || '',
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
            alt
          },
          categoryTags,
          authorName,
          publishedDate,
          tags
        }
      `, { 
        currentId: currentArticle._id,
        tags: currentArticle.tags || [],
        categoryTags: currentArticle.categoryTags || []
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
        `, { currentId: currentArticle._id });
        
        finalRelatedData = fallbackData;
      }

      const processedRelatedArticles: Article[] = finalRelatedData.map((article: any) => ({
        _id: article._id,
        title: article.title || '',
        subtitle: article.subtitle || '',
        heroImage: article.heroImage?.asset?.url || null,
        heroImageAlt: article.heroImage?.alt || '',
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

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block._type) {
      case 'block':
        const text = block.children?.[0]?.text || '';
        const style = block.style || 'normal';
        
        if (style === 'h1') {
          return (
            <h1 key={index} className="text-3xl font-primary font-bold text-white mb-6 mt-8">
              {text}
            </h1>
          );
        } else if (style === 'h2') {
          return (
            <h2 key={index} className="text-2xl font-primary font-bold text-white mb-4 mt-6">
              {text}
            </h2>
          );
        } else if (style === 'h3') {
          return (
            <h3 key={index} className="text-xl font-primary font-bold text-white mb-3 mt-4">
              {text}
            </h3>
          );
        } else {
          return (
            <p key={index} className="text-gray-300 font-secondary leading-relaxed mb-4">
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
        return (
          <blockquote key={index} className="border-l-4 border-brand-red pl-6 py-4 my-6 bg-gray-800/50 rounded-r-lg">
            <p className="text-xl font-secondary italic text-gray-200">
              "{block.text}"
            </p>
          </blockquote>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/reviews">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reviews
            </Button>
          </Link>
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
        {article.heroImage && (
          <div className="mb-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg group">
              <img 
                src={article.heroImage} 
                alt={article.heroImageAlt || article.title}
                className="w-full h-full object-cover"
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
        )}

        {/* Author Bio */}
        <div className="mb-8 bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
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
        <div className="prose prose-invert max-w-none">
          {article.content.map((block, index) => renderContentBlock(block, index))}
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
                            src={relatedArticle.heroImage} 
                            alt={relatedArticle.heroImageAlt || relatedArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
