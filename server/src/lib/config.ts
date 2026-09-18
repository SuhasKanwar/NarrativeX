import 'dotenv/config';

export const PORT: number = Number(process.env.PORT) || 9000;
export const DATABASE_URL: string = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
export const MICROSERVICE_BASE_URL: string = process.env.MICROSERVICE_BASE_URL || "http://localhost:8000";
export const JWT_SECRET: string = process.env.JWT_SECRET || "secret";

export const LOGS_DIRECTORY: string = "logs";

export const NEWS_API_KEY: string = process.env.NEWS_API_KEY || "";
export const NEWS_API_BASE_URL: string = "https://newsapi.org/v2";
export const NEWS_CACHE_TTL: number = 900000;

export const FALLBACK_NEWS_SOURCES = {
  REUTERS: {
    BASE_URL: "https://www.reuters.com",
    RSS_FEEDS: {
      ENERGY: "https://www.reuters.com/business/energy/rss.xml",
      COMMODITIES: "https://www.reuters.com/markets/commodities/rss.xml",
      WORLD: "https://www.reuters.com/world/rss.xml",
      BUSINESS: "https://www.reuters.com/business/rss.xml"
    }
  },
  GOOGLE_NEWS: {
    BASE_URL: "https://news.google.com/rss",
    SEARCH_BASE: "https://news.google.com/rss/search?q="
  }
};