import type { Request, Response } from "express";
import { searchNews } from "../services/newsService";

export async function searchNewsHandler(req: Request, res: Response) {
  const { q, language = "en", sortBy = "publishedAt" } = req.query;
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  if (typeof q !== "string" || !q.trim() || q.length > 500 ||
      typeof language !== "string" || !/^[a-z]{2}$/.test(language) ||
      typeof sortBy !== "string" || !["publishedAt", "relevancy", "popularity"].includes(sortBy) ||
      !Number.isInteger(page) || page < 1 || page > 100 ||
      !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    return res.status(400).json({ success: false, message: "Provide a search query, valid language, sort order and pagination." });
  }
  try {
    const data = await searchNews({ q: q.trim(), language, sortBy, page, pageSize });
    return res.json({ success: true, data });
  } catch {
    return res.status(502).json({ success: false, message: "News providers are temporarily unavailable." });
  }
}
