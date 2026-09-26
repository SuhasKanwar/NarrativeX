# NarrativeX

NarrativeX collects news and social posts, lets an LLM choose source-specific search
parameters, and evaluates how claims relate, change, and spread.

## Architecture

| App | Port | Responsibility |
| --- | ---: | --- |
| `client/` | 3000 | Next.js interface, authentication, conversations, and visualizations |
| `server/` | 9000 | Bun/Express API, JWT auth, Prisma/PostgreSQL, provider fetchers, and cache |
| `service/` | 8000 | FastAPI/LangGraph routing, tool-calling research agent, and evaluation |

```text
authenticated chat request
  -> server /api/conversation/chat/:id
  -> service /api/agent/query
  -> GPT-OSS selects news/social tool parameters
  -> service tools call authenticated server APIs
  -> server fetches and normalizes provider data
  -> Nemotron compares claims, evidence, relationships, and propagation
  -> response is stored in the conversation
```

Provider integrations stay in the server so authentication, validation, caching, fallback
behavior, and normalized response contracts have one owner:

- NewsAPI with Google News RSS fallback
- Reddit OAuth client credentials
- Bluesky public search
- Hacker News Algolia search

Partial social-provider failures remain in `data.errors`; successful sources are still
evaluated.

## Model roles

- `openai/gpt-oss-120b` routes requests and chooses tool calls and parameters.
- `nvidia/nemotron-3-ultra-550b-a55b` performs long-context claim and relationship analysis.
- `llama-3.3-70b-versatile` handles ordinary conversation that needs no retrieval.

All model IDs are environment-configurable. Source payloads are treated as untrusted data,
and the evaluator preserves uncertainty instead of treating search results as proof.

## Setup

Copy each example environment file and add your credentials:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
cp service/.env.example service/.env
```

Required external credentials are `NEWS_API_KEY`, Reddit client credentials,
`GROQ_API_KEY`, and `NVIDIA_API_KEY`. News and social endpoints require the JWT returned by
the server auth endpoints.

Run each application in its own terminal:

```bash
cd client && bun install && bun run dev
cd server && bun install && bun run dev
cd service && python -m pip install -r requirements.txt && uvicorn app:app --reload --port 8000
```

## Relevant APIs

- `GET /api/news/search?q=...` on the server
- `POST /api/social/search` with `topics`, `platforms`, and `limit` on the server
- `POST /api/agent/query` with `query`, `session_history`, and the internally forwarded
  `access_token` on the AI service

The public chat flow should use the conversation endpoints rather than calling the AI
service directly; this preserves authentication and persistence.

## Checks

```bash
cd server && bun test && bun run build
cd service && python -m unittest discover -s tests -v
```
