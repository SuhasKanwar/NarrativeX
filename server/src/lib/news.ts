import NewsAPI from "newsapi";
import { NEWS_API_KEY } from "./config";

export const newsapi = new (NewsAPI as any)(NEWS_API_KEY);