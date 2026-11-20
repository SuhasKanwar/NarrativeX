import { expect, test } from "bun:test";
import type { Request, Response } from "express";
import { searchSocialHandler } from "./socialController";
import { REDDIT_APPROVED_ACCESS } from "../lib/config";

async function search(body: unknown) {
  let statusCode = 0;
  let payload: any;
  const response = {
    status(code: number) { statusCode = code; return this; },
    json(body: any) { payload = body; return this; },
  } as unknown as Response;

  await searchSocialHandler({ body } as Request, response);
  return { statusCode, payload };
}

test("rejects malformed topics before calling social providers", async () => {
  const { statusCode, payload } = await search({ topics: ["valid", 42] });
  expect(statusCode).toBe(400);
  expect(payload.success).toBe(false);
});

test.skipIf(REDDIT_APPROVED_ACCESS)("skips Reddit by default and blocks explicit unapproved requests before fetching", async () => {
  const realFetch = globalThis.fetch;
  const hosts: string[] = [];
  globalThis.fetch = (async input => {
    hosts.push(new URL(String(input)).hostname);
    return Response.json({ posts: [], hashtags: [] });
  }) as typeof fetch;

  try {
    const result = await search({ topics: ["approval-gate-fixture"] });
    expect(result.statusCode).toBe(200);
    expect(result.payload.data.errors).toEqual([]);
    expect(hosts.sort()).toEqual(["api.bsky.app", "mastodon.social"]);
    const reddit = await search({ topics: ["approval-gate-fixture"], platforms: ["reddit"] });
    expect(reddit.statusCode).toBe(502);
    expect(reddit.payload.data.errors[0]?.message).toContain("requires approved access");
    expect(hosts).toHaveLength(2);
  } finally {
    globalThis.fetch = realFetch;
  }
});
