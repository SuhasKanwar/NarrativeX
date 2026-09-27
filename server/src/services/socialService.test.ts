import { afterEach, expect, test } from "bun:test";
import { fetchSocialPosts } from "./socialService";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

test("normalizes posts and reports a failed source without losing successful data", async () => {
  globalThis.fetch = (async (input) => {
    const url = new URL(String(input));
    if (url.hostname === "api.bsky.app") {
      expect(url.pathname).toBe("/xrpc/app.bsky.feed.searchPosts");
      expect(url.searchParams.get("q")).toBe("test topic");
      expect(url.searchParams.get("sort")).toBe("latest");
      return Response.json({ posts: [{
        uri: "at://did:plc:test/app.bsky.feed.post/abc",
        author: { handle: "reporter.test" },
        record: { text: "A test claim", createdAt: "2026-09-23T00:00:00.000Z" },
        likeCount: 2,
        replyCount: 1,
        repostCount: 3,
      }] });
    }
    return new Response("unavailable", { status: 503 });
  }) as typeof fetch;

  const result = await fetchSocialPosts(["test topic"], ["bluesky", "hackernews"], 5);

  expect(result.totalResults).toBe(1);
  expect(result.posts[0]).toMatchObject({
    platform: "bluesky",
    topic: "test topic",
    author: "reporter.test",
    content: "A test claim",
  });
  expect(result.errors).toEqual([{
    topic: "test topic",
    platform: "hackernews",
    message: "HTTP 503",
  }]);
});
