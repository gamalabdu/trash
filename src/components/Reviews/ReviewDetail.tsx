import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeft, Clock, User, Calendar, Share2, ExternalLink } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    }
    
    setLoading(false);
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
            <div className="aspect-[16/9] overflow-hidden rounded-lg">
              <img 
                src={article.heroImage} 
                alt={article.heroImageAlt || article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Author Bio */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
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
                      <a 
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-red hover:text-brand-red/80 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none">
          {article.content.map((block, index) => renderContentBlock(block, index))}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="text-white font-primary font-bold text-lg mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:border-brand-red hover:text-brand-red transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        {article.externalLinks.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h3 className="text-white font-primary font-bold text-lg mb-4">Related Links</h3>
            <div className="space-y-2">
              {article.externalLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-red hover:text-brand-red/80 transition-colors font-secondary"
                >
                  <ExternalLink className="w-4 h-4" />
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDetail;
