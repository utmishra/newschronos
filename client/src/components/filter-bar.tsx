import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchFilters } from "@/lib/types";
import { NEWS_SOURCES } from "@/lib/types";

interface FilterBarProps {
  searchFilters: SearchFilters;
  resultCount: number;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function FilterBar({ searchFilters, resultCount, onFiltersChange }: FilterBarProps) {
  const handleSourceToggle = (source: string) => {
    const newSources = searchFilters.sources.includes(source)
      ? searchFilters.sources.filter(s => s !== source)
      : [...searchFilters.sources, source];
    
    onFiltersChange({
      ...searchFilters,
      sources: newSources,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Showing results for:</span>
          <Badge variant="secondary" className="bg-blue-50 text-news-blue hover:bg-blue-100">
            "{searchFilters.query}"
          </Badge>
          <span className="text-sm text-gray-500">
            {resultCount} articles found
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sources:</span>
            <div className="flex gap-1">
              {NEWS_SOURCES.map((source) => {
                const isSelected = searchFilters.sources.length === 0 || searchFilters.sources.includes(source);
                return (
                  <Button
                    key={source}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={`px-2 py-1 text-xs ${
                      isSelected 
                        ? "bg-news-blue text-white hover:bg-blue-600" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => handleSourceToggle(source)}
                  >
                    {source === "The Guardian" ? "Guardian" : 
                     source === "New York Times" ? "NYT" : 
                     source === "The Verge" ? "Verge" : 
                     "Wired"}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
