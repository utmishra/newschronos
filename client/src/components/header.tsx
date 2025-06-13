import { useState } from "react";
import { Newspaper, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <Newspaper className="text-news-blue text-2xl mr-3" />
                <h1 className="text-xl font-bold text-news-text">NewsTracker</h1>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-news-blue bg-blue-50 px-3 py-2 rounded-md text-sm font-medium">
                Timeline
              </a>
              <a href="#" className="text-gray-600 hover:text-news-text px-3 py-2 rounded-md text-sm font-medium">
                Sources
              </a>
              <a href="#" className="text-gray-600 hover:text-news-text px-3 py-2 rounded-md text-sm font-medium">
                Settings
              </a>
            </div>
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu />
          </Button>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <a href="#" className="text-news-blue bg-blue-50 block px-3 py-2 rounded-md text-base font-medium">
                Timeline
              </a>
              <a href="#" className="text-gray-600 hover:text-news-text block px-3 py-2 rounded-md text-base font-medium">
                Sources
              </a>
              <a href="#" className="text-gray-600 hover:text-news-text block px-3 py-2 rounded-md text-base font-medium">
                Settings
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
