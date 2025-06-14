import { useState, useRef } from "react";
import Header from "@/components/header";
import SearchSection from "@/components/search-section";
import NewsTimeline from "@/components/news-timeline";
import type { SearchFilters } from "@/lib/types";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    sources: [],
    daysBack: 7,
  });

  const [isSearchActive, setIsSearchActive] = useState(false);

  // Add a ref to NewsTimeline
  const timelineRef = useRef<{ refetchTimeline: () => void }>(null);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setIsSearchActive(true);
    // Call refetchTimeline after filters are set
    setTimeout(() => {
      timelineRef.current?.refetchTimeline();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-news-bg">
      <Header />
      <SearchSection onSearch={handleSearch} />
      {isSearchActive && (
        <NewsTimeline 
          ref={timelineRef}
          searchFilters={searchFilters}
          onFiltersChange={setSearchFilters}
        />
      )}
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-news-blue rounded flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">N</span>
                </div>
                <span className="font-bold text-lg text-news-text">NewsTracker</span>
              </div>
              <p className="text-gray-600 text-sm">Real-time news monitoring from trusted sources worldwide.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-news-text mb-3">Sources</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-news-text">The Guardian</a></li>
                <li><a href="#" className="hover:text-news-text">New York Times</a></li>
                <li><a href="#" className="hover:text-news-text">The Verge</a></li>
                <li><a href="#" className="hover:text-news-text">Wired</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-news-text mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-news-text">Timeline View</a></li>
                <li><a href="#" className="hover:text-news-text">Topic Tracking</a></li>
                <li><a href="#" className="hover:text-news-text">Source Filtering</a></li>
                <li><a href="#" className="hover:text-news-text">Export Options</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-news-text mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-news-text">Help Center</a></li>
                <li><a href="#" className="hover:text-news-text">API Documentation</a></li>
                <li><a href="#" className="hover:text-news-text">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-news-text">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">&copy; 2024 NewsTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
