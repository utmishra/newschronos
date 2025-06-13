export interface SearchFilters {
  query: string;
  sources: string[];
  daysBack: number;
}

export interface SearchResponse {
  articles: NewsArticle[];
  query: string;
  resultCount: number;
  sources?: string[];
  daysBack: number;
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  source: string;
  author?: string;
  publishedAt: Date;
  imageUrl?: string;
  articleUrl: string;
  tags: string[];
  views: number;
  shares: number;
  topic: string;
}

export interface PopularSearch {
  id: number;
  query: string;
  timestamp: Date;
  resultCount: number;
}

export const NEWS_SOURCES = [
  "The Guardian",
  "New York Times", 
  "The Verge",
  "Wired"
] as const;

export type NewsSource = typeof NEWS_SOURCES[number];
