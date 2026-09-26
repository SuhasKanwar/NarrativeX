import { afterEach, expect, test } from "bun:test";
import axios from "axios";
import { searchNews } from "./newsService";
import { cacheService } from "./cacheService";

const originalGet = axios.get;
afterEach(() => { axios.get = originalGet; cacheService.flush(); });

test("news fallback respects pagination and shares the cached provider result", async () => {
  let rssCalls = 0;
  axios.get = (async (url: string) => {
    if (!url.includes("news.google.com")) throw new Error("Provider unavailable");
    rssCalls++;
    return { data: `<rss><channel>${[1, 2, 3].map(i => `<item><title>Story ${i}</title><link>https://example.com/${i}</link><pubDate>Sat, 26 Sep 2026 12:00:00 GMT</pubDate></item>`).join("")}</channel></rss>` };
  }) as typeof axios.get;
  const query = { q: "test topic", language: "en", page: 2, pageSize: 1, sortBy: "publishedAt" };
  const result = await searchNews(query);
  expect(result.provider).toBe("Google News RSS");
  expect(result.articles.map(a => a.title)).toEqual(["Story 2"]);
  expect(await searchNews(query)).toEqual(result);
  expect(rssCalls).toBe(1);
});
