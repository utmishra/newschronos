import { newsArticles, searchQueries, type NewsArticle, type InsertNewsArticle, type SearchQuery, type InsertSearchQuery } from "@shared/schema";

export interface IStorage {
  // News Articles
  getNewsArticlesByTopic(topic: string, limit?: number, offset?: number): Promise<NewsArticle[]>;
  getNewsArticlesBySource(source: string): Promise<NewsArticle[]>;
  searchNewsArticles(query: string, sources?: string[], daysBack?: number): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  
  // Search Queries
  createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery>;
  getPopularSearches(limit?: number): Promise<SearchQuery[]>;
}

export class MemStorage implements IStorage {
  private newsArticles: Map<number, NewsArticle>;
  private searchQueries: Map<number, SearchQuery>;
  private currentNewsId: number;
  private currentQueryId: number;

  constructor() {
    this.newsArticles = new Map();
    this.searchQueries = new Map();
    this.currentNewsId = 1;
    this.currentQueryId = 1;
    
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockArticles: Omit<NewsArticle, 'id'>[] = [
      {
        title: "OpenAI Announces Major Breakthrough in Artificial General Intelligence Research",
        excerpt: "Leading AI research company OpenAI has unveiled significant advances in their quest toward artificial general intelligence, with new models showing unprecedented reasoning capabilities across multiple domains...",
        content: "Full article content would be here...",
        source: "The Guardian",
        author: "Sarah Chen",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        articleUrl: "https://theguardian.com/technology/openai-agi-breakthrough",
        tags: ["AI", "OpenAI", "AGI", "Technology"],
        views: 12400,
        shares: 847,
        topic: "Advancement in AI",
      },
      {
        title: "Tech Giants Race to Deploy Advanced AI Systems in Healthcare",
        excerpt: "Major technology companies are accelerating their AI initiatives in healthcare, with Google, Microsoft, and Amazon announcing partnerships with leading medical institutions to develop diagnostic tools...",
        content: "Full article content would be here...",
        source: "New York Times",
        author: "Michael Rodriguez",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        articleUrl: "https://nytimes.com/tech/ai-healthcare-partnerships",
        tags: ["AI", "Healthcare", "Google", "Microsoft", "Amazon"],
        views: 8700,
        shares: 423,
        topic: "Advancement in AI",
      },
      {
        title: "AI Computing Infrastructure Faces Unprecedented Demand Surge",
        excerpt: "The rapid advancement of AI technologies has created an enormous demand for specialized computing infrastructure, leading to chip shortages and massive investments in data center expansion...",
        content: "Full article content would be here...",
        source: "The Verge",
        author: "Alex Thompson",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        articleUrl: "https://theverge.com/ai-infrastructure-demand",
        tags: ["AI", "Infrastructure", "Data Centers", "Computing"],
        views: 15200,
        shares: 967,
        topic: "Advancement in AI",
      },
      {
        title: "Ethical AI Development: New Guidelines Proposed by Global Research Consortium",
        excerpt: "A coalition of leading AI researchers and ethicists has proposed comprehensive guidelines for responsible AI development, addressing concerns around bias, transparency, and societal impact...",
        content: "Full article content would be here...",
        source: "Wired",
        author: "Dr. Emily Foster",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        articleUrl: "https://wired.com/ai-ethics-guidelines",
        tags: ["AI", "Ethics", "Research", "Guidelines"],
        views: 9800,
        shares: 654,
        topic: "Advancement in AI",
      },
      {
        title: "Climate Change Impacts Accelerating Faster Than Predicted",
        excerpt: "New research reveals that climate change effects are occurring more rapidly than previous models predicted, with unprecedented ice loss and temperature rises recorded globally...",
        content: "Full article content would be here...",
        source: "The Guardian",
        author: "James Wilson",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        imageUrl: "https://images.unsplash.com/photo-1569163139394-de4e5f43e4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        articleUrl: "https://theguardian.com/environment/climate-acceleration",
        tags: ["Climate Change", "Environment", "Research"],
        views: 6500,
        shares: 389,
        topic: "Climate Change",
      },
      {
        title: "SpaceX Achieves New Milestone in Mars Mission Preparation",
        excerpt: "SpaceX has successfully completed another crucial test for their Mars colonization program, bringing humanity one step closer to becoming a multi-planetary species...",
        content: "Full article content would be here...",
        source: "The Verge",
        author: "Lisa Park",
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        articleUrl: "https://theverge.com/spacex-mars-milestone",
        tags: ["SpaceX", "Mars", "Space Exploration"],
        views: 11200,
        shares: 723,
        topic: "Space Exploration",
      }
    ];

    mockArticles.forEach(article => {
      const id = this.currentNewsId++;
      this.newsArticles.set(id, { ...article, id });
    });
  }

  async getNewsArticlesByTopic(topic: string, limit = 10, offset = 0): Promise<NewsArticle[]> {
    const articles = Array.from(this.newsArticles.values())
      .filter(article => article.topic.toLowerCase().includes(topic.toLowerCase()))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
    
    return articles;
  }

  async getNewsArticlesBySource(source: string): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => article.source === source)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async searchNewsArticles(query: string, sources?: string[], daysBack = 7): Promise<NewsArticle[]> {
    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    
    const articles = Array.from(this.newsArticles.values())
      .filter(article => {
        const matchesQuery = 
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          article.topic.toLowerCase().includes(query.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        const matchesSource = !sources || sources.length === 0 || sources.includes(article.source);
        const withinDateRange = article.publishedAt >= cutoffDate;
        
        return matchesQuery && matchesSource && withinDateRange;
      })
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    return articles;
  }

  async createNewsArticle(insertArticle: InsertNewsArticle): Promise<NewsArticle> {
    const id = this.currentNewsId++;
    const article: NewsArticle = {
      ...insertArticle,
      id,
      views: 0,
      shares: 0,
    };
    this.newsArticles.set(id, article);
    return article;
  }

  async createSearchQuery(insertQuery: InsertSearchQuery): Promise<SearchQuery> {
    const id = this.currentQueryId++;
    const query: SearchQuery = {
      ...insertQuery,
      id,
      timestamp: new Date(),
    };
    this.searchQueries.set(id, query);
    return query;
  }

  async getPopularSearches(limit = 5): Promise<SearchQuery[]> {
    return Array.from(this.searchQueries.values())
      .sort((a, b) => b.resultCount - a.resultCount)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
