import { formatDistanceToNow } from "date-fns";
import { Eye, Share2, ExternalLink, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import type { NewsArticle } from "@/lib/types";

interface NewsArticleCardProps {
  article: NewsArticle;
}

export default function NewsArticleCard({ article }: NewsArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getSourceColor = (source: string) => {
    switch (source) {
      case "The Guardian":
        return "bg-trust-green";
      case "New York Times":
        return "bg-gray-800";
      case "The Verge":
        return "bg-purple-600";
      case "Wired":
        return "bg-red-600";
      default:
        return "bg-news-blue";
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${getSourceColor(article.source)} rounded-full flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">
                  {article.source.charAt(0)}
                </span>
              </div>
              <div>
                <span className="font-medium text-sm text-news-text">{article.source}</span>
                <span className="text-gray-400 text-sm ml-2">
                  {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`${isBookmarked ? 'text-news-blue' : 'text-gray-400'} hover:text-gray-600`}
              onClick={handleBookmarkToggle}
            >
              <Bookmark className={isBookmarked ? 'fill-current' : ''} size={16} />
            </Button>
          </div>
          
          <h3 className="text-xl font-semibold text-news-text mb-3 leading-tight">
            {article.title}
          </h3>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            {article.excerpt}
          </p>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 flex items-center">
                <Eye className="mr-1" size={14} />
                {formatViews(article.views)} views
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Share2 className="mr-1" size={14} />
                {article.shares} shares
              </span>
            </div>
            <a
              href={article.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-news-blue hover:text-blue-600 text-sm font-medium flex items-center"
            >
              Read full article
              <ExternalLink className="ml-1" size={12} />
            </a>
          </div>
        </div>
        
        {article.imageUrl && (
          <div className="w-48 hidden sm:block">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
