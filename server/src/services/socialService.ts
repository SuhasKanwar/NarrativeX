import {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_USER_AGENT,
} from "../lib/config";

export const SOCIAL_PLATFORMS = ["reddit", "bluesky", "hackernews"] as const;
export type SocialPlatform = typeof SOCIAL_PLATFORMS[number];

export type SocialPost = {
  id: string;
  platform: SocialPlatform;
  topic: string;
  author: string | null;
  title: string | null;
  content: string | null;
  url: string;
  externalUrl: string | null;
  community: string | null;
  publishedAt: string;
  engagement: {
    score?: number;
    comments?: number;
    likes?: number;
    reposts?: number;
  };
};

type RedditToken = { value: string; expiresAt: number };
let redditToken: RedditToken | undefined;

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

async function getRedditToken(): Promise<string> {
  if (redditToken && redditToken.expiresAt > Date.now()) return redditToken.value;
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    throw new Error("Reddit credentials are not configured");
  }

  const credentials = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64");
  const data = await getJson<{ access_token?: string; expires_in?: number }>(
    "https://www.reddit.com/api/v1/access_token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": REDDIT_USER_AGENT,
      },
      body: "grant_type=client_credentials",
    },
  );
  if (!data.access_token) throw new Error("Reddit did not return an access token");

  redditToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max((data.expires_in || 3600) - 60, 60) * 1000,
  };
  return redditToken.value;
}

export async function fetchReddit(topic: string, limit: number): Promise<SocialPost[]> {
  const token = await getRedditToken();
  const params = new URLSearchParams({ q: topic, sort: "new", limit: String(limit), raw_json: "1" });
  const data = await getJson<any>(`https://oauth.reddit.com/search?${params}`, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": REDDIT_USER_AGENT },
  });

  return (data.data?.children || []).map(({ data: post }: any) => ({
    id: post.name || `t3_${post.id}`,
    platform: "reddit",
    topic,
    author: post.author || null,
    title: post.title || null,
    content: post.selftext || null,
    url: `https://www.reddit.com${post.permalink}`,
    externalUrl: post.url_overridden_by_dest || null,
    community: post.subreddit_name_prefixed || null,
    publishedAt: new Date(post.created_utc * 1000).toISOString(),
    engagement: { score: post.score || 0, comments: post.num_comments || 0 },
  }));
}

export async function fetchBluesky(topic: string, limit: number): Promise<SocialPost[]> {
  const params = new URLSearchParams({ query: topic, sort: "recent", limit: String(limit) });
  const data = await getJson<any>(
    `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPostsV2?${params}`,
  );

  return (data.posts || []).map((post: any) => {
    const record = post.record || {};
    const postId = String(post.uri).split("/").pop();
    return {
      id: post.uri,
      platform: "bluesky",
      topic,
      author: post.author?.handle || null,
      title: null,
      content: record.text || null,
      url: `https://bsky.app/profile/${post.author?.handle}/post/${postId}`,
      externalUrl: post.embed?.external?.uri || null,
      community: null,
      publishedAt: record.createdAt || post.indexedAt,
      engagement: {
        comments: post.replyCount || 0,
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
      },
    };
  });
}

export async function fetchHackerNews(topic: string, limit: number): Promise<SocialPost[]> {
  const params = new URLSearchParams({ query: topic, tags: "story", hitsPerPage: String(limit) });
  const data = await getJson<any>(`https://hn.algolia.com/api/v1/search_by_date?${params}`);

  return (data.hits || []).map((post: any) => ({
    id: post.objectID,
    platform: "hackernews",
    topic,
    author: post.author || null,
    title: post.title || null,
    content: post.story_text || null,
    url: `https://news.ycombinator.com/item?id=${post.objectID}`,
    externalUrl: post.url || null,
    community: "Hacker News",
    publishedAt: post.created_at,
    engagement: { score: post.points || 0, comments: post.num_comments || 0 },
  }));
}

const fetchers: Record<SocialPlatform, (topic: string, limit: number) => Promise<SocialPost[]>> = {
  reddit: fetchReddit,
  bluesky: fetchBluesky,
  hackernews: fetchHackerNews,
};

export async function fetchSocialPosts(
  topics: string[],
  platforms: SocialPlatform[],
  limit: number,
) {
  const requests = topics.flatMap((topic) =>
    platforms.map(async (platform) => ({
      topic,
      platform,
      posts: await fetchers[platform](topic, limit),
    })),
  );
  const results = await Promise.allSettled(requests);
  const posts: SocialPost[] = [];
  const errors: { topic: string; platform: SocialPlatform; message: string }[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") posts.push(...result.value.posts);
    else {
      const topic = topics[Math.floor(index / platforms.length)]!;
      const platform = platforms[index % platforms.length]!;
      errors.push({
        topic,
        platform,
        message: result.reason instanceof Error ? result.reason.message : "Request failed",
      });
    }
  });

  return { totalResults: posts.length, posts, errors };
}
