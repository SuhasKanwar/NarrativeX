import {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_USER_AGENT,
} from "../lib/config";

export const SOCIAL_PLATFORMS = ["reddit", "bluesky", "mastodon"] as const;
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
  const params = new URLSearchParams({ q: topic, sort: "latest", limit: String(limit) });
  const data = await getJson<any>(
    `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?${params}`,
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

export async function fetchMastodon(topic: string, limit: number): Promise<SocialPost[]> {
  const searchParams = new URLSearchParams({ q: topic, type: "hashtags", limit: "3" });
  const search = await getJson<any>(`https://mastodon.social/api/v2/search?${searchParams}`);
  const tags = (search.hashtags || []).map((tag: any) => tag.name).filter(Boolean).slice(0, 3);
  if (!tags.length) return [];

  const statuses = (await Promise.all(tags.map((tag: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    return getJson<any[]>(`https://mastodon.social/api/v1/timelines/tag/${encodeURIComponent(tag)}?${params}`);
  }))).flat();
  const unique = [...new Map(statuses.map((status: any) => [
    (status.reblog || status).id,
    status,
  ])).values()];

  return unique.slice(0, limit).map((item: any) => {
    const post = item.reblog || item;
    const account = post.account || {};
    return {
      id: post.id,
      platform: "mastodon",
      topic,
      author: account.acct || account.username || null,
      title: post.spoiler_text || null,
      content: stripHtml(post.content || "") || null,
      url: post.url || post.uri,
      externalUrl: post.card?.url || null,
      community: account.acct?.split("@")[1] || "mastodon.social",
      publishedAt: post.created_at,
      engagement: {
        comments: post.replies_count || 0,
        likes: post.favourites_count || 0,
        reposts: post.reblogs_count || 0,
      },
    };
  });
}

function stripHtml(value: string): string {
  const entities: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " ",
  };
  return value
    .replace(/<\/?(?:p|div|br)[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, entity) => entities[entity])
    .replace(/\s+/g, " ")
    .trim();
}

const fetchers: Record<SocialPlatform, (topic: string, limit: number) => Promise<SocialPost[]>> = {
  reddit: fetchReddit,
  bluesky: fetchBluesky,
  mastodon: fetchMastodon,
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
