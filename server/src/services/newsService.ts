import axios from "axios";
import { FALLBACK_NEWS_SOURCES, NEWS_API_BASE_URL, NEWS_API_KEY, NEWS_CACHE_TTL } from "../lib/config";
import CacheService, { cacheService } from "./cacheService";
import { parseSimpleRss } from "../utils/news";

export type NewsArticle = {
  title: string; url: string; publishedAt: string; source: string;
  description?: string | null; content?: string | null; image?: string | null;
};
export type NewsQuery = { q: string; page: number; pageSize: number; language: string; sortBy: string };
type ProviderArticle = Omit<NewsArticle, "source"> & { source: { name?: string }; urlToImage?: string };

export async function searchNews(params: NewsQuery) {
  const key = CacheService.generateCacheKey("news_search_v2", params);
  const cached = cacheService.get<{ totalResults: number; articles: NewsArticle[]; provider: string }>(key);
  if (cached) return cached;
  let result;
  try {
    if (!NEWS_API_KEY) throw new Error("NewsAPI unavailable");
    const { data } = await axios.get<{ articles: ProviderArticle[]; totalResults: number }>(`${NEWS_API_BASE_URL}/everything`, {
      params, headers: { "X-Api-Key": NEWS_API_KEY }, timeout: 10000,
    });
    if (!data.articles?.length) throw new Error("No articles");
    result = { totalResults: data.totalResults, provider: "NewsAPI", articles: data.articles.filter(a => a.title && a.url).map(a => ({
      title: a.title, url: a.url, publishedAt: a.publishedAt, source: a.source?.name || "NewsAPI",
      description: a.description, content: a.content, image: a.urlToImage,
    })) };
  } catch {
    const { data } = await axios.get<string>(FALLBACK_NEWS_SOURCES.GOOGLE_NEWS.BASE_URL + "/search", {
      params: { q: params.q, hl: params.language }, timeout: 10000,
    });
    const parsed = parseSimpleRss(data, "Google News");
    result = { ...parsed, provider: "Google News RSS", articles: parsed.articles.slice((params.page - 1) * params.pageSize, params.page * params.pageSize) as NewsArticle[] };
  }
  cacheService.set(key, result, NEWS_CACHE_TTL / 1000);
  return result;
}
