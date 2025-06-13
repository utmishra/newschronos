import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search news articles
  app.get("/api/news/search", async (req, res) => {
    try {
      const { query, sources, daysBack } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      const sourcesArray = sources ? 
        (typeof sources === 'string' ? sources.split(',') : sources as string[]) : 
        undefined;
      
      const daysBackNum = daysBack ? parseInt(daysBack as string) : 7;
      
      const articles = await storage.searchNewsArticles(query, sourcesArray, daysBackNum);
      
      // Log the search query
      await storage.createSearchQuery({
        query,
        resultCount: articles.length,
      });
      
      res.json({
        articles,
        query,
        resultCount: articles.length,
        sources: sourcesArray,
        daysBack: daysBackNum,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get news by topic
  app.get("/api/news/topic/:topic", async (req, res) => {
    try {
      const { topic } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const articles = await storage.getNewsArticlesByTopic(topic, limit, offset);
      
      res.json({
        articles,
        topic,
        count: articles.length,
      });
    } catch (error) {
      console.error("Topic fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get news by source
  app.get("/api/news/source/:source", async (req, res) => {
    try {
      const { source } = req.params;
      const articles = await storage.getNewsArticlesBySource(source);
      
      res.json({
        articles,
        source,
        count: articles.length,
      });
    } catch (error) {
      console.error("Source fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get popular searches
  app.get("/api/searches/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const searches = await storage.getPopularSearches(limit);
      
      res.json(searches);
    } catch (error) {
      console.error("Popular searches error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
