import type { Request, Response } from "express";
import CacheService, { cacheService } from "../services/cacheService";
import { NEWS_CACHE_TTL } from "../lib/config";
import { newsapi } from "../lib/news";

const GEO_MAP: Record<string, { lat: number; lng: number }> = {
    "trump": { lat: 38.8951, lng: -77.0364 }, // Washington D.C
    "biden": { lat: 38.8951, lng: -77.0364 }, // Washington D.C
    "us": { lat: 38.8951, lng: -77.0364 },
    "usa": { lat: 38.8951, lng: -77.0364 },
    "united states": { lat: 38.8951, lng: -77.0364 },
    "china": { lat: 39.9042, lng: 116.4074 }, // Beijing
    "beijing": { lat: 39.9042, lng: 116.4074 },
    "russia": { lat: 55.7558, lng: 37.6173 }, // Moscow
    "putin": { lat: 55.7558, lng: 37.6173 },
    "iran": { lat: 35.6892, lng: 51.3890 }, // Tehran
    "israel": { lat: 31.7683, lng: 35.2137 }, // Jerusalem
    "saudi": { lat: 24.7136, lng: 46.6753 }, // Riyadh
    "opec": { lat: 48.2082, lng: 16.3738 }, // OPEC HQ Vienna
    "taiwan": { lat: 25.0329, lng: 121.5654 }, // Taipei
    "europe": { lat: 50.8503, lng: 4.3517 }, // Brussels
    "eu": { lat: 50.8503, lng: 4.3517 },
    "uk": { lat: 51.5074, lng: -0.1278 }, // London
    "london": { lat: 51.5074, lng: -0.1278 },
    "india": { lat: 28.6139, lng: 77.2090 }, // New Delhi
    "modi": { lat: 28.6139, lng: 77.2090 }, // New Delhi
    "japan": { lat: 35.6762, lng: 139.6503 }, // Tokyo
    "korea": { lat: 37.5665, lng: 126.9780 }, // Seoul
    "ukraine": { lat: 50.4501, lng: 30.5234 }, // Kyiv
    "mexico": { lat: 19.4326, lng: -99.1332 }, // Mexico City
};
const GEOPOLITICAL_EVENTS_QUERY = '(tariffs OR sanctions OR OPEC OR "supply chain" OR oil OR trade) AND (Trump OR Biden OR China OR Russia OR Iran OR Israel OR Saudi OR Ukraine OR India OR Modi)';

export async function getGeopoliticalEventsHandler(req: Request, res: Response) {
    try {
        const limit = parseInt((req.query.limit as string) || "0");
        const cacheKey = CacheService.generateCacheKey("geopolitical_events", { limit });
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                message: "Fetched geopolitical events successfully.",
                data: cachedData,
            });
        }
        const queryParams = {
            q: GEOPOLITICAL_EVENTS_QUERY,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 50
        };

        const response = await newsapi.v2.everything(queryParams);
        if (!response || !response.articles) {
            throw new Error("NewsAPI returned no articles");
        }
        const geocodedEvents: any[] = [];
        let eventIdCounter = 1;
        for (const article of response.articles) {
            if (!article.title) continue;
            const contentToScan = `${article.title} ${article.description || ""}`.toLowerCase();
            let matchedCoords: { lat: number; lng: number } | null = null;
            let matchedKeyword = "";
            for (const [keyword, coords] of Object.entries(GEO_MAP)) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(contentToScan)) {
                    matchedCoords = coords;
                    matchedKeyword = keyword;
                    break;
                }
            }
            if (matchedCoords) {
                geocodedEvents.push({
                    id: `GEO_${eventIdCounter++}`,
                    title: article.title,
                    description: article.description,
                    sourceUrl: article.url,
                    imageUrl: article.urlToImage || null,
                    latitude: matchedCoords.lat,
                    longitude: matchedCoords.lng,
                    date: article.publishedAt,
                    categoryTitle: "Geopolitics",
                    matchedKeyword: matchedKeyword
                });
                
                if (limit > 0 && geocodedEvents.length >= limit) {
                    break;
                }
            }
        }
        cacheService.set(cacheKey, geocodedEvents, NEWS_CACHE_TTL / 1000);
        return res.status(200).json({
            success: true,
            message: "Fetched and geocoded news successfully.",
            data: geocodedEvents,
        });
    } catch (error) {
        console.error("Error fetching geopolitical events:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching geopolitical events.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}