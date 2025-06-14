import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import type { NewsArticle } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});

const TimelineEntrySchema = z.object({
  date: z.string(),
  mainTitle: z.string(),
  description: z.string(),
  coverImage: z.string().nullable().optional(),
  sources: z.array(SourceSchema),
});

const TimelineSchema = z.object({
  entries: z.array(TimelineEntrySchema),
});

export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type TimelineSummary = z.infer<typeof TimelineSchema>;

export async function summarizeTimeline(articles: NewsArticle[]): Promise<TimelineSummary> {
  const systemPrompt =
    "You summarize news articles into a concise timeline, breaking down the timeline as granularly as possible, with a minimum breakdown by individual days. Always group articles by their `publishedAt` date, ensuring that news reported on different days is represented in separate timeline entries. Only group by week if there are no articles for several consecutive days. For each period, identify the dominant topic or most frequently mentioned event and use it as `mainTitle`. Provide a short description summarizing key points and briefly mention minor topics. Quote key statements verbatim with attribution using the article source. Choose a representative `coverImage` from one of the articles if available. Include a list of sources with their URLs. Respond strictly using the provided JSON schema.";

  const userPrompt = JSON.stringify(
    articles.map((a) => ({
      title: a.title,
      excerpt: a.excerpt,
      source: a.source,
      publishedAt: a.publishedAt,
      imageUrl: a.imageUrl,
      articleUrl: a.articleUrl,
    }))
  );


  const response = await openai.responses.parse({
    model: "gpt-4o-2024-08-06",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: zodTextFormat(TimelineSchema, "timeline"),
    },
  });

  return response.output_parsed as TimelineSummary;
}
