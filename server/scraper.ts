import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse } from 'node-html-parser';
import type { NewsArticle } from '@shared/schema';

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

export class NewsScraper {
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  async scrapeNews(query: string, daysBack: number = 7): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    
    try {
      // Scrape from multiple sources in parallel
      const scrapers = [
        this.scrapeGuardian(query, daysBack),
        this.scrapeVerge(query, daysBack),
        this.scrapeWired(query, daysBack),
        this.scrapeNYTimes(query, daysBack)
      ];
      
      const results = await Promise.allSettled(scrapers);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          articles.push(...result.value);
        } else {
          console.error(`Scraper ${index} failed:`, result.reason);
        }
      });
      
      // Sort by publication date (newest first)
      return articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      
    } catch (error) {
      console.error('Error in scrapeNews:', error);
      return [];
    }
  }

  private async scrapeGuardian(query: string, daysBack: number): Promise<ScrapedArticle[]> {
    try {
      const searchUrl = `https://www.theguardian.com/search?q=${encodeURIComponent(query)}&api-key=test`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const articles: ScrapedArticle[] = [];
      
      $('.fc-item').slice(0, 10).each((_, element) => {
        const $el = $(element);
        const titleEl = $el.find('.fc-item__title a');
        const excerptEl = $el.find('.fc-item__standfirst');
        const timeEl = $el.find('time');
        
        const title = titleEl.text().trim();
        const url = titleEl.attr('href');
        const excerpt = excerptEl.text().trim();
        const timeStr = timeEl.attr('datetime');
        
        if (title && url) {
          const fullUrl = url.startsWith('http') ? url : `https://www.theguardian.com${url}`;
          const publishedAt = timeStr ? new Date(timeStr) : new Date();
          
          // Check if article is within date range
          const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
          if (publishedAt >= cutoffDate) {
            articles.push({
              title,
              excerpt: excerpt || title.substring(0, 150) + '...',
              content: excerpt || title,
              source: 'The Guardian',
              publishedAt,
              articleUrl: fullUrl,
              tags: this.extractTags(title + ' ' + excerpt),
              topic: query,
              imageUrl: $el.find('img').attr('src')
            });
          }
        }
      });
      
      return articles;
    } catch (error) {
      console.error('Guardian scraping error:', error);
      return [];
    }
  }

  private async scrapeVerge(query: string, daysBack: number): Promise<ScrapedArticle[]> {
    try {
      const searchUrl = `https://www.theverge.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const articles: ScrapedArticle[] = [];
      
      $('article').slice(0, 10).each((_, element) => {
        const $el = $(element);
        const titleEl = $el.find('h2 a, h3 a').first();
        const excerptEl = $el.find('p').first();
        const timeEl = $el.find('time');
        const authorEl = $el.find('[data-testid="byline"] a').first();
        
        const title = titleEl.text().trim();
        const url = titleEl.attr('href');
        const excerpt = excerptEl.text().trim();
        const timeStr = timeEl.attr('datetime');
        const author = authorEl.text().trim();
        
        if (title && url) {
          const fullUrl = url.startsWith('http') ? url : `https://www.theverge.com${url}`;
          const publishedAt = timeStr ? new Date(timeStr) : new Date();
          
          const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
          if (publishedAt >= cutoffDate) {
            articles.push({
              title,
              excerpt: excerpt || title.substring(0, 150) + '...',
              content: excerpt || title,
              source: 'The Verge',
              author: author || undefined,
              publishedAt,
              articleUrl: fullUrl,
              tags: this.extractTags(title + ' ' + excerpt),
              topic: query,
              imageUrl: $el.find('img').attr('src')
            });
          }
        }
      });
      
      return articles;
    } catch (error) {
      console.error('Verge scraping error:', error);
      return [];
    }
  }

  private async scrapeWired(query: string, daysBack: number): Promise<ScrapedArticle[]> {
    try {
      const searchUrl = `https://www.wired.com/search/?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const articles: ScrapedArticle[] = [];
      
      $('article, .SummaryItemWrapper').slice(0, 10).each((_, element) => {
        const $el = $(element);
        const titleEl = $el.find('h2 a, h3 a, .SummaryItemHedLink').first();
        const excerptEl = $el.find('.SummaryItemDek, p').first();
        const timeEl = $el.find('time, .SummaryItemPublishDate');
        const authorEl = $el.find('.SummaryItemByline a, .Byline a').first();
        
        const title = titleEl.text().trim();
        const url = titleEl.attr('href');
        const excerpt = excerptEl.text().trim();
        const timeStr = timeEl.attr('datetime') || timeEl.text().trim();
        const author = authorEl.text().trim();
        
        if (title && url) {
          const fullUrl = url.startsWith('http') ? url : `https://www.wired.com${url}`;
          const publishedAt = this.parseDate(timeStr) || new Date();
          
          const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
          if (publishedAt >= cutoffDate) {
            articles.push({
              title,
              excerpt: excerpt || title.substring(0, 150) + '...',
              content: excerpt || title,
              source: 'Wired',
              author: author || undefined,
              publishedAt,
              articleUrl: fullUrl,
              tags: this.extractTags(title + ' ' + excerpt),
              topic: query,
              imageUrl: $el.find('img').attr('src')
            });
          }
        }
      });
      
      return articles;
    } catch (error) {
      console.error('Wired scraping error:', error);
      return [];
    }
  }

  private async scrapeNYTimes(query: string, daysBack: number): Promise<ScrapedArticle[]> {
    try {
      // NYT search requires special handling due to their paywall and structure
      const searchUrl = `https://www.nytimes.com/search?query=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const articles: ScrapedArticle[] = [];
      
      $('article, .SearchResultsModule-result').slice(0, 10).each((_, element) => {
        const $el = $(element);
        const titleEl = $el.find('h4 a, h3 a, .SearchResultsModule-heading a').first();
        const excerptEl = $el.find('p, .SearchResultsModule-summary').first();
        const timeEl = $el.find('time, .SearchResultsModule-date');
        const authorEl = $el.find('.SearchResultsModule-byline, .byline').first();
        
        const title = titleEl.text().trim();
        const url = titleEl.attr('href');
        const excerpt = excerptEl.text().trim();
        const timeStr = timeEl.attr('datetime') || timeEl.text().trim();
        const author = authorEl.text().trim().replace(/^By\s+/i, '');
        
        if (title && url) {
          const fullUrl = url.startsWith('http') ? url : `https://www.nytimes.com${url}`;
          const publishedAt = this.parseDate(timeStr) || new Date();
          
          const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
          if (publishedAt >= cutoffDate) {
            articles.push({
              title,
              excerpt: excerpt || title.substring(0, 150) + '...',
              content: excerpt || title,
              source: 'New York Times',
              author: author || undefined,
              publishedAt,
              articleUrl: fullUrl,
              tags: this.extractTags(title + ' ' + excerpt),
              topic: query,
              imageUrl: $el.find('img').attr('src')
            });
          }
        }
      });
      
      return articles;
    } catch (error) {
      console.error('NYT scraping error:', error);
      return [];
    }
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

export const newsScraper = new NewsScraper();