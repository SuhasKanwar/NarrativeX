import { afterEach, expect, test } from "bun:test";
import { fetchBluesky, fetchSocialPosts } from "./socialService";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

test("Bluesky publication time comes from the post record", async () => {
  const indexedAt = "2026-11-25T09:00:00Z";
  const createdAt = "2026-11-24T09:00:00Z";
  globalThis.fetch = (async () => Response.json({ posts: [
    { uri: "at://example/post/1", record: { createdAt }, indexedAt },
    { uri: "at://example/post/2", record: {}, indexedAt },
  ] })) as typeof fetch;

  expect((await fetchBluesky("timeline", 2)).map(post => post.publishedAt)).toEqual([createdAt, ""]);
});

test("normalizes posts and reports a failed source without losing successful data", async () => {
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.pathname === "/api/v2/search") {
      expect(url.searchParams.get("q")).toBe("test topic");
      return Response.json({ hashtags: [{ name: "TestTopic" }] });
    }
    if (url.pathname === "/api/v1/timelines/tag/TestTopic") {
      return Response.json([{
        id: "123",
        account: { acct: "reporter@example.social" },
        content: "<p>A test &amp; verified claim</p>",
        url: "https://example.social/@reporter/123",
        created_at: "2026-09-23T00:00:00.000Z",
        favourites_count: 2,
        replies_count: 1,
        reblogs_count: 3,
      }]);
    }
    return new Response("unavailable", { status: 503 });
  }) as typeof fetch;

  const result = await fetchSocialPosts(["test topic"], ["mastodon", "bluesky"], 5);

  expect(result.totalResults).toBe(1);
  expect(result.posts[0]).toMatchObject({
    platform: "mastodon",
    topic: "test topic",
    author: "reporter@example.social",
    content: "A test & verified claim",
  });
  expect(result.errors).toEqual([{
    topic: "test topic",
    platform: "bluesky",
    message: "HTTP 503",
  }]);
});
