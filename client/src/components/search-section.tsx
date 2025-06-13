import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { SearchFilters, PopularSearch } from "@/lib/types";

interface SearchSectionProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState("");
  const [daysBack, setDaysBack] = useState(7);
  const [isSearching, setIsSearching] = useState(false);

  const { data: popularSearches } = useQuery<PopularSearch[]>({
    queryKey: ["/api/searches/popular"],
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Real-time scraping takes longer, so we'll let the timeline component handle the loading
    onSearch({
      query: query.trim(),
      sources: [],
      daysBack,
    });
    setIsSearching(false);
  };

  const handlePopularSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch({
      query: searchQuery,
      sources: [],
      daysBack,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="bg-white py-12 border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-news-text mb-4">Track Any News Topic</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time news scraping from The Guardian, New York Times, The Verge, and Wired
          </p>
          <p className="text-sm text-trust-green mt-2 font-medium">
            Live data - freshly scraped from news sources
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <Input
              type="text"
              placeholder="Search for any topic or event (e.g., 'Advancement in AI', 'World Cup 2024')"
              className="w-full pl-12 pr-4 py-4 text-lg h-auto"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="flex-1 bg-news-blue text-white px-6 py-3 h-auto text-base font-medium hover:bg-blue-600"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2" size={20} />
                  Search News
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Select value={daysBack.toString()} onValueChange={(value) => setDaysBack(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                className="bg-trust-green text-white border-trust-green hover:bg-green-600 px-4 py-3 h-auto"
                onClick={handleSearch}
                disabled={isSearching}
              >
                <RefreshCw className={isSearching ? "animate-spin" : ""} size={20} />
              </Button>
            </div>
          </div>

          {popularSearches && popularSearches.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="text-sm text-gray-500">Popular searches:</span>
              {popularSearches.map((search) => (
                <button
                  key={search.id}
                  className="text-sm text-news-blue hover:underline"
                  onClick={() => handlePopularSearch(search.query)}
                >
                  {search.query}
                </button>
              ))}
            </div>
          )}
          
          {/* Fallback popular searches */}
          {(!popularSearches || popularSearches.length === 0) && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="text-sm text-gray-500">Popular searches:</span>
              {["AI Development", "Climate Change", "Tech IPOs", "Space Exploration"].map((topic) => (
                <button
                  key={topic}
                  className="text-sm text-news-blue hover:underline"
                  onClick={() => handlePopularSearch(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
