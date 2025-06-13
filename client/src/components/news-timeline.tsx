import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FilterBar from "./filter-bar";
import type { SearchFilters, TimelineSummary, TimelineEntry } from "@/lib/types";

interface NewsTimelineProps {
  searchFilters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function NewsTimeline({ searchFilters, onFiltersChange }: NewsTimelineProps) {

  const { data: timeline, isLoading, error } = useQuery<TimelineSummary>({
    queryKey: ["/api/news/timeline", searchFilters.query, searchFilters.sources, searchFilters.daysBack],
    queryFn: async () => {
      const params = new URLSearchParams({
        query: searchFilters.query,
        daysBack: searchFilters.daysBack.toString(),
      });
      
      if (searchFilters.sources.length > 0) {
        params.append('sources', searchFilters.sources.join(','));
      }
      
      const response = await fetch(`/api/news/timeline?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();

      return data;
    },
    enabled: !!searchFilters.query,
  });


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
          {/* Real-time scraping notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="animate-spin text-news-blue mr-3" size={24} />
              <h3 className="text-lg font-semibold text-news-blue">Scraping Live News</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Fetching the latest articles from The Guardian, New York Times, The Verge, and Wired
            </p>
            <p className="text-sm text-gray-500">
              This may take 10-30 seconds as we search across multiple news sources
            </p>
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
      ) : timeline ? (
        <>
          <FilterBar
            searchFilters={searchFilters}
            resultCount={timeline.resultCount}
            onFiltersChange={onFiltersChange}
          />

          {timeline.entries.length === 0 ? (
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
              {timeline.entries.map((entry: TimelineEntry) => (
                <div key={entry.date + entry.mainTitle} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex">
                  {entry.coverImage && (
                    <div className="w-48 hidden sm:block mr-6">
                      <img
                        src={entry.coverImage}
                        alt={entry.mainTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">{new Date(entry.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    <h3 className="text-xl font-semibold text-news-text mb-2">{entry.mainTitle}</h3>
                    <p className="text-gray-700 mb-3">{entry.description}</p>
                    <ul className="list-disc list-inside text-news-blue text-sm">
                      {entry.sources.map((src) => (
                        <li key={src.url}>
                          <a href={src.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {src.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}
