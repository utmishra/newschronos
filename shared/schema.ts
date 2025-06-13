import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(),
  author: text("author"),
  publishedAt: timestamp("published_at").notNull(),
  imageUrl: text("image_url"),
  articleUrl: text("article_url").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  views: integer("views").default(0),
  shares: integer("shares").default(0),
  topic: text("topic").notNull(),
});

export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  resultCount: integer("result_count").default(0),
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  views: true,
  shares: true,
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({
  id: true,
  timestamp: true,
});

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
