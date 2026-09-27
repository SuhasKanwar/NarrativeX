import http from "./api";

type Envelope<T> = { success: boolean; data: T; message?: string };
export type Article = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description?: string | null;
  image?: string | null;
};
export type GeoEvent = {
  id: string;
  title: string;
  sourceUrl: string;
  date: string;
  latitude: number;
  longitude: number;
  matchedKeyword: string;
  source?: string;
  imageUrl?: string | null;
};
export type Post = {
  id: string;
  platform: string;
  title: string | null;
  content: string | null;
  author: string | null;
  url: string;
  publishedAt: string;
};
export type Conversation = {
  id: string;
  title: string | null;
  lastUpdated: string;
};
export type Chat = {
  id: string;
  sender: "user" | "bot" | "system";
  content: string | null;
  createdAt: string;
};

async function get<T>(
  path: string,
  signal?: AbortSignal,
  params?: Record<string, string | number>,
) {
  return (await http.get<Envelope<T>>(path, { signal, params })).data.data;
}
export const workspace = {
  news: (q: string, signal?: AbortSignal) =>
    get<{ articles: Article[]; provider?: string }>(
      "/api/news/search",
      signal,
      { q, pageSize: 12 },
    ),
  events: (signal?: AbortSignal) =>
    get<GeoEvent[]>("/api/events/geopolitics", signal, { limit: 12 }),
  social: async (topic: string, signal?: AbortSignal) =>
    (
      await http.post<
        Envelope<{
          posts: Post[];
          errors: { platform: string; message: string }[];
        }>
      >("/api/social/search", { topics: [topic], limit: 4 }, { signal })
    ).data.data,
  conversations: (signal?: AbortSignal) =>
    get<Conversation[]>("/api/conversation", signal),
  messages: (id: string, signal?: AbortSignal) =>
    get<Chat[]>(`/api/conversation/chat/${encodeURIComponent(id)}`, signal),
  create: async (title: string) =>
    (
      await http.post<Envelope<Conversation>>("/api/conversation", {
        title,
        variant: "chat",
      })
    ).data.data,
  send: async (id: string, content: string) =>
    (
      await http.post<Envelope<Chat[]>>(
        `/api/conversation/chat/${encodeURIComponent(id)}`,
        { content },
        { timeout: 210000 },
      )
    ).data.data,
  rename: async (id: string, title: string) =>
    http.put(`/api/conversation/rename/${encodeURIComponent(id)}`, { title }),
  remove: async (id: string) =>
    http.delete(`/api/conversation/${encodeURIComponent(id)}`),
};

export function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en", { month: "short", day: "numeric" });
}
