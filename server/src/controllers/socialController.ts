import type { Request, Response } from "express";
import { SOCIAL_CACHE_TTL } from "../lib/config";
import CacheService, { cacheService } from "../services/cacheService";
import {
  fetchSocialPosts,
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from "../services/socialService";

export async function searchSocialHandler(req: Request, res: Response) {
  const rawTopics = req.body?.topics;
  const topics = Array.isArray(rawTopics)
    ? [...new Set(rawTopics.map((topic) => typeof topic === "string" ? topic.trim() : "").filter(Boolean))]
    : [];
  const platforms = req.body?.platforms ?? SOCIAL_PLATFORMS;
  const limit = Number(req.body?.limit ?? 10);

  if (!topics.length || topics.length > 10 || topics.some((topic) => topic.length > 100)) {
    return res.status(400).json({
      success: false,
      message: "'topics' must contain 1 to 10 non-empty strings of at most 100 characters.",
    });
  }
  if (!Array.isArray(platforms) || !platforms.length ||
      platforms.some((platform) => !SOCIAL_PLATFORMS.includes(platform))) {
    return res.status(400).json({
      success: false,
      message: `'platforms' must contain only: ${SOCIAL_PLATFORMS.join(", ")}.`,
    });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 25) {
    return res.status(400).json({ success: false, message: "'limit' must be an integer from 1 to 25." });
  }

  const query = { topics, platforms: [...new Set(platforms)] as SocialPlatform[], limit };
  const cacheKey = CacheService.generateCacheKey("social_search", query);
  const cachedData = cacheService.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({ success: true, message: "Fetched social posts successfully.", data: cachedData });
  }

  const data = await fetchSocialPosts(query.topics, query.platforms, query.limit);
  if (!data.posts.length && data.errors.length === query.topics.length * query.platforms.length) {
    return res.status(502).json({ success: false, message: "All social sources failed.", data });
  }
  cacheService.set(cacheKey, data, SOCIAL_CACHE_TTL / 1000);
  return res.status(200).json({
    success: true,
    message: data.errors.length ? "Fetched social posts with some source errors." : "Fetched social posts successfully.",
    data,
  });
}
