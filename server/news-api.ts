import axios from 'axios';

interface ScrapedArticle {
  title: string;
  excerpt: string;
  content: string;
  source: string;
  author?: string;
  publishedAt: Date;
  imageUrl?: string;
  articleUrl: string;
  tags: string[];
  topic: string;
}

interface BraveNewsResult {
  title: string;
  url: string;
  description: string;
  page_age: string;
  page_fetched: string;
  thumbnail?: {
    src: string;
  };
  meta_url?: {
    hostname: string;
  };
}

interface BraveSearchResponse {
  web?: {
    results: BraveNewsResult[];
  };
}

export class NewsAPI {
  private readonly apiKey = import.meta.env.VITE_BRAVE_SEARCH_API_KEY;
  private readonly baseUrl = 'https://api.search.brave.com/res/v1/web/search';  
  
  async searchNews(query: string, daysBack: number = 7): Promise<ScrapedArticle[]> {
    console.log(`Brave Search API Key: ${this.apiKey}`);
    if (!this.apiKey) {
      console.error('Brave Search API key not found');
      return [];
    }

    try {
      console.log(`[${new Date().toISOString()}] Searching Brave News API for: "${query}"`);
      console.log(`API Key present: ${!!this.apiKey}`);
      
      const requestConfig = {
        headers: {
          'X-Subscription-Token': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          q: query,
          count: 20,
          freshness: this.getFreshnessParam(daysBack),
          text_decorations: false,
          search_lang: 'en',
          country: 'US'
        },
        timeout: 15000
      };
      
      console.log(`Request URL: ${this.baseUrl}`);
      console.log(`Request params:`, requestConfig.params);
      
      const response = await axios.get<BraveSearchResponse>(this.baseUrl, requestConfig);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response data keys:`, Object.keys(response.data));
      
      if (!response.data.web?.results) {
        console.log('No web results found in Brave API response');
        console.log('Full response:', JSON.stringify(response.data, null, 2));
        return [];
      }

      const articles = response.data.web.results.map((result) => {
        const source = this.extractSource(result.meta_url?.hostname || result.url);
        const publishedAt = this.parseDate(result.page_age) || new Date();
        
        return {
          title: result.title,
          excerpt: result.description || result.title.substring(0, 150) + '...',
          content: result.description || result.title,
          source,
          publishedAt,
          articleUrl: result.url,
          tags: this.extractTags(result.title + ' ' + (result.description || '')),
          topic: query,
          imageUrl: result.thumbnail?.src
        };
      });

      // Filter by date range and trusted sources
      const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      const filteredArticles = articles.filter(article => 
        article.publishedAt >= cutoffDate &&
        this.isTrustedSource(article.source)
      );

      console.log(`[${new Date().toISOString()}] Found ${filteredArticles.length} articles from trusted sources`);
      
      // Sort by publication date (newest first)
      return filteredArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      
    } catch (error) {
      console.error('Error in Brave News API:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return [];
    }
  }

  private getFreshnessParam(daysBack: number): string {
    if (daysBack <= 1) return 'pd';
    if (daysBack <= 7) return 'pw';
    if (daysBack <= 30) return 'pm';
    return 'py';
  }

  private extractSource(hostname: string): string {
    const lowerHostname = hostname.toLowerCase();
    
    if (lowerHostname.includes('theguardian')) return 'The Guardian';
    if (lowerHostname.includes('nytimes')) return 'New York Times';
    if (lowerHostname.includes('theverge')) return 'The Verge';
    if (lowerHostname.includes('wired')) return 'Wired';
    if (lowerHostname.includes('techcrunch')) return 'TechCrunch';
    if (lowerHostname.includes('reuters')) return 'Reuters';
    if (lowerHostname.includes('bbc')) return 'BBC';
    if (lowerHostname.includes('cnn')) return 'CNN';
    if (lowerHostname.includes('washingtonpost')) return 'Washington Post';
    if (lowerHostname.includes('bloomberg')) return 'Bloomberg';
    if (lowerHostname.includes('wsj') || lowerHostname.includes('wallstreetjournal')) return 'Wall Street Journal';
    if (lowerHostname.includes('engadget')) return 'Engadget';
    if (lowerHostname.includes('arstechnica')) return 'Ars Technica';
    
    // Capitalize hostname for unknown sources
    return hostname.charAt(0).toUpperCase() + hostname.slice(1).replace(/\./g, '');
  }

  private isTrustedSource(source: string): boolean {
    const trustedSources = [
      'The Guardian', 'New York Times', 'The Verge', 'Wired',
      'TechCrunch', 'Reuters', 'BBC', 'CNN', 'Washington Post',
      'Bloomberg', 'Wall Street Journal', 'Engadget', 'Ars Technica'
    ];
    
    return trustedSources.includes(source);
  }

  private extractTags(text: string): string[] {
    const commonTags = [
      'AI', 'Technology', 'Politics', 'Climate', 'Business', 'Science', 'Health',
      'Sports', 'Entertainment', 'World', 'Space', 'Innovation', 'Security',
      'Economy', 'Energy', 'Environment', 'Social Media', 'Cryptocurrency',
      'Artificial Intelligence', 'Machine Learning', 'Blockchain', 'Startup'
    ];
    
    const textLower = text.toLowerCase();
    return commonTags.filter(tag => 
      textLower.includes(tag.toLowerCase())
    ).slice(0, 4);
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    // Try parsing ISO format first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // Try parsing relative dates like "2 hours ago"
    const relativeMatch = dateStr.match(/(\d+)\s+(hour|day|minute)s?\s+ago/i);
    if (relativeMatch) {
      const [, amount, unit] = relativeMatch;
      const now = new Date();
      const amountNum = parseInt(amount);
      
      switch (unit.toLowerCase()) {
        case 'minute':
          return new Date(now.getTime() - amountNum * 60 * 1000);
        case 'hour':
          return new Date(now.getTime() - amountNum * 60 * 60 * 1000);
        case 'day':
          return new Date(now.getTime() - amountNum * 24 * 60 * 60 * 1000);
        default:
          return null;
      }
    }
    
    return null;
  }
}

export const newsAPI = new NewsAPI();