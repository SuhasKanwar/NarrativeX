import type { Request, Response } from "express";
import axios from "axios";
import { FALLBACK_NEWS_SOURCES, NEWS_CACHE_TTL } from "../lib/config";
import CacheService, { cacheService } from "../services/cacheService";
import { parseSimpleRss } from "../utils/news";
import { newsapi } from "../lib/news";

export async function searchNewsHandler(req: Request, res: Response) {
  try {
    const { q, page = 1, pageSize = 20, language = "en", sortBy = "publishedAt" } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required.",
      });
    }

    const queryParams = {
      q: String(q),
      language: String(language),
      sortBy: String(sortBy),
      page: Number(page),
      pageSize: Number(pageSize)
    };
    const cacheKey = CacheService.generateCacheKey("news_search", queryParams);

    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: "Fetched news successfully.",
        data: cachedData,
      });
    }

    try {
      const response = await newsapi.v2.everything(queryParams);
      if (!response || !response.articles || response.articles.length === 0) {
        throw new Error("NewsAPI returned 0 articles");
      }
      const mappedData = {
        totalResults: response.totalResults,
        articles: response.articles.map((article: any) => ({
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name || article.source || "NewsAPI",
          author: article.author || null,
          content: article.content || null,
          description: article.description || null,
          image: article.urlToImage || null,
        }))
      };

      cacheService.set(cacheKey, mappedData, NEWS_CACHE_TTL / 1000);

      return res.status(200).json({
        success: true,
        message: "Fetched news successfully.",
        data: mappedData,
      });
    } catch (apiError) {
      console.warn("NewsAPI failed, falling back to Google News Search RSS...", apiError);

      const fallbackUrl = `${FALLBACK_NEWS_SOURCES.GOOGLE_NEWS.SEARCH_BASE}${encodeURIComponent(String(q))}`;
      const fallbackResponse = await axios.get(fallbackUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      const fallbackData = parseSimpleRss(fallbackResponse.data, "Google News");
      cacheService.set(cacheKey, fallbackData, NEWS_CACHE_TTL / 1000);

      return res.status(200).json({
        success: true,
        message: "Fetched news from fallback source.",
        data: fallbackData,
      });
    }
  } catch (error) {
    console.error("Error searching news:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while searching news.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}