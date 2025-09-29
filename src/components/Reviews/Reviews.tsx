import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, User, Calendar, ArrowRight } from 'lucide-react';
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
  content: any[];
  externalLinks: string[];
  tags: string[];
  shareCount: number;
  metaDescription: string;
  keywords: string[];
}

const Reviews: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [sidebarArticles, setSidebarArticles] = useState<Article[]>([]);
  const [topPicks, setTopPicks] = useState<Article[]>([]);
  const [hotPicks, setHotPicks] = useState<Article[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const articlesData = await sanityClient.fetch(`
        *[_type == "articles"] | order(publishedDate desc) {
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

      const processedArticles = articlesData.map((article: any) => ({
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
      }));

      
      // Set featured article (first one with FEATURED tag)
      const featured = processedArticles.find((article: Article) => 
        article.categoryTags.includes('FEATURED')
      ) || processedArticles[0];
      setFeaturedArticle(featured);

      // Filter out the featured article from the remaining articles
      const remainingArticles = processedArticles.filter((article: Article) => article._id !== featured._id);

      // Debug logging
      console.log('Total articles:', processedArticles.length);
      console.log('Featured article:', featured.title);
      console.log('Remaining articles:', remainingArticles.length);

      // Set sidebar articles (first 3 articles from remaining)
      setSidebarArticles(remainingArticles.slice(0, 3));

      // TESTING: Both sections show first 3 articles for easy testing
      // TODO: Revert to original logic when testing is complete
      // Original: setTopPicks(remainingArticles.slice(3, 6));
      // Original: setHotPicks(remainingArticles.length >= 7 ? remainingArticles.slice(6, 10) : []);
      setTopPicks(remainingArticles.slice(0, 3));
      setHotPicks(remainingArticles.slice(0, 3));

    } catch (error) {
      console.error('Error fetching articles:', error);
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

  const getReadTime = (content: any[]) => {
    // Simple calculation: roughly 200 words per minute
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

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-brand-text font-secondary">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-primary font-bold text-white mb-4 tracking-tight">
            MUSIC
            <span className="text-brand-red block">REVIEWS</span>
          </h1>
          <div className="w-24 h-1 bg-brand-red mx-auto mb-6"></div>
          <p className="text-lg text-gray-400 font-secondary max-w-2xl mx-auto leading-relaxed">
            Discover the latest in music culture, artist spotlights, and industry insights from our curated collection of reviews and features curated by <span className="text-brand-red font-bold">TRASH</span>.
          </p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Featured Article - Left Side */}
          <div className="lg:col-span-2">
            {featuredArticle && (
              <Card className="bg-card border-border overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  {featuredArticle.heroImage && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img 
                        src={featuredArticle.heroImage} 
                        alt={featuredArticle.heroImageAlt || featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  
                  {/* Category Tags Overlay */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {featuredArticle.categoryTags.slice(0, 2).map((tag, index) => (
                      <Badge 
                        key={index} 
                        className="bg-black/80 text-white border-0 px-3 py-1 text-xs font-secondary font-semibold"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="bg-black p-6 -m-6 mt-0">
                    <Link 
                      to={`/reviews/${featuredArticle._id}`}
                      className="block group"
                    >
                      <h1 className="text-2xl lg:text-3xl font-primary font-bold text-white mb-4 group-hover:text-brand-red transition-colors duration-300 leading-tight">
                        {featuredArticle.title}
                      </h1>
                    </Link>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-400 font-secondary">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>BY {featuredArticle.authorName.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Articles - Right Side */}
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-brand-red font-primary text-lg font-bold mb-2">FEATURED</h2>
              <p className="text-sm text-gray-400 font-secondary">
                {formatDate(sidebarArticles[0]?.publishedDate || '')}
              </p>
            </div>

            {sidebarArticles.map((article, index) => (
              <Card key={article._id} className="bg-card border-border group hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {article.categoryTags.slice(0, 2).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex} 
                            className="text-xs text-gray-500 font-secondary"
                          >
                            {tag}
                            {tagIndex < article.categoryTags.slice(0, 2).length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      
                      <Link 
                        to={`/reviews/${article._id}`}
                        className="block group"
                      >
                        <h3 className="text-white font-primary font-bold text-lg mb-3 group-hover:text-brand-red transition-colors duration-300 leading-tight">
                          {article.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-400 text-sm font-secondary mb-3 line-clamp-2">
                        {article.metaDescription}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-secondary">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.publishedDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{getReadTime(article.content)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {article.authorImage && (
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={article.authorImage} 
                          alt={article.authorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  {index < sidebarArticles.length - 1 && (
                    <div className="border-t border-gray-700 mt-4"></div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Picks Section */}
        {topPicks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-brand-red font-primary text-xl font-bold">TOP PICKS</h2>
              <ArrowRight className="w-5 h-5 text-brand-red" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPicks.map((article) => (
                <Card key={article._id} className="bg-card border-border group hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
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
                        <Link 
                          to={`/reviews/${article._id}`}
                          className="block group"
                        >
                          <h3 className="text-white font-primary font-bold text-base group-hover:text-brand-red transition-colors duration-300 leading-tight">
                            {article.title}
                          </h3>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Hot Picks Section */}
        {hotPicks.length > 0 && (
          <div>
            <h2 className="text-white font-primary text-xl font-bold mb-6">HOT PICKS!!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotPicks.map((article, index) => (
                <Card key={article._id} className="bg-card border-border group hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="relative">
                      {article.heroImage && (
                        <div className="aspect-square overflow-hidden rounded-lg mb-4">
                          <img 
                            src={article.heroImage} 
                            alt={article.heroImageAlt || article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      
                      {/* Number Badge */}
                      <div className="absolute top-2 right-2 w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center font-primary font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    
                    <Link 
                      to={`/reviews/${article._id}`}
                      className="block group"
                    >
                      <h3 className="text-white font-primary font-bold text-base group-hover:text-brand-red transition-colors duration-300 leading-tight">
                        {article.title}
                      </h3>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
