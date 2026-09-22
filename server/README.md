# narrativex-server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Social search

Authenticated clients can fetch normalized posts from Reddit, Bluesky, and Hacker News:

```http
POST /api/social/search
Content-Type: application/json

{
  "topics": ["climate policy", "renewable energy"],
  "platforms": ["reddit", "bluesky", "hackernews"],
  "limit": 10
}
```

`platforms` and `limit` are optional. Reddit requires the credentials documented in `.env.example`; Bluesky and Hacker News do not require API keys. Source failures are returned in `data.errors` without discarding successful posts from other sources.
