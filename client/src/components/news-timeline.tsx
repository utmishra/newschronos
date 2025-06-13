import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FilterBar from "./filter-bar";
import NewsArticleCard from "./news-article-card";
import type { SearchFilters, SearchResponse } from "@/lib/types";

interface NewsTimelineProps {
  searchFilters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function NewsTimeline({ searchFilters, onFiltersChange }: NewsTimelineProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: searchResults, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ["/api/news/search", searchFilters.query, searchFilters.sources, searchFilters.daysBack],
    queryFn: async () => {
      const params = new URLSearchParams({
        query: searchFilters.query,
        daysBack: searchFilters.daysBack.toString(),
      });
      
      if (searchFilters.sources.length > 0) {
        params.append('sources', searchFilters.sources.join(','));
      }
      
      const response = await fetch(`/api/news/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      
      // Convert date strings back to Date objects
      data.articles = data.articles.map((article: any) => ({
        ...article,
        publishedAt: new Date(article.publishedAt),
      }));
      
      return data;
    },
    enabled: !!searchFilters.query,
  });

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // Simulate loading more articles
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 1500);
  };

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <div className="text-highlight-red mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-news-text mb-2">Failed to Load News</h3>
          <p className="text-gray-600 mb-4">
            There was an error loading the news articles. Please try again.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-news-blue text-white hover:bg-blue-600"
          >
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <div className="space-y-6">
          {/* Filter bar skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <Skeleton className="h-4 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Article skeletons */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="w-48 h-32 hidden sm:block ml-6" />
              </div>
            </div>
          ))}
        </div>
      ) : searchResults ? (
        <>
          <FilterBar
            searchFilters={searchFilters}
            resultCount={searchResults.resultCount}
            onFiltersChange={onFiltersChange}
          />

          {searchResults.articles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">📰</span>
              </div>
              <h3 className="text-lg font-semibold text-news-text mb-2">No Articles Found</h3>
              <p className="text-gray-600 mb-4">
                No news articles found for "{searchFilters.query}". Try adjusting your search terms or date range.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-gray-500">Try searching for:</span>
                {["AI Development", "Climate Change", "Tech IPOs", "Space Exploration"].map((topic) => (
                  <button
                    key={topic}
                    className="text-sm text-news-blue hover:underline"
                    onClick={() => onFiltersChange({ ...searchFilters, query: topic })}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {searchResults.articles.map((article) => (
                <NewsArticleCard key={article.id} article={article} />
              ))}

              <div className="text-center py-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 hover:bg-gray-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={16} />
                      Load More Articles
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Showing {searchResults.articles.length} of {searchResults.resultCount} articles
                </p>
              </div>
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}
