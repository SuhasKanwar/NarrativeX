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
  -> deterministic routing selects chat or research without a model round trip
  -> NVIDIA Nemotron Ultra plans one paired news/social comparison search
  -> news and social server tools always run concurrently with the same topic
  -> server fetches and normalizes provider data
  -> NVIDIA Nemotron Super extracts structured claims, relationships, and propagation
  -> NVIDIA Embed computes semantic scores with a local TF-IDF fallback
  -> a separate LLM judge scores groundedness, relevance, completeness, and source quality
  -> deterministic evidence metrics are combined with the judge scores
  -> response is stored in the conversation
```

Provider integrations stay in the server so authentication, validation, caching, fallback
behavior, and normalized response contracts have one owner:

- NewsAPI with Google News RSS fallback
- Reddit OAuth client credentials
- Bluesky public search
- Mastodon public hashtag search

Partial social-provider failures remain in `data.errors`; successful sources are still
evaluated.

## Model roles

- `nvidia/nemotron-3-ultra-550b-a55b` performs the single news/social tool-planning call.
- `nvidia/nemotron-3-super-120b-a12b` performs bounded claim analysis and judges the grounded
  output. Deterministic routing avoids spending a model call before research begins.
- `nvidia/nemotron-3-embed-1b` measures semantic query/source relevance and source redundancy.
- Groq `openai/gpt-oss-120b` handles ordinary conversation that needs no retrieval.

Model IDs are fixed in `service/config/models.py`; environment files contain provider
credentials and runtime settings only. Source payloads are treated as untrusted data, and
the evaluator preserves uncertainty instead of treating search results as proof.

The runtime evaluation uses two independent signals. The structured LLM judge assesses
groundedness, relevance, completeness, source quality, and cross-media comparison quality. Every
comparison must cite at least one retrieved news URL and one retrieved social URL. The mathematical
layer reports cosine similarity, Jaccard overlap, evidence coverage, citation validity, cross-media
coverage, comparison-citation validity, cross-source corroboration, normalized source entropy,
source redundancy, and temporal coverage. Reports show the comparison first, then the claims,
evaluation, research coverage, retrieval limitations, and every evaluated source. If the NVIDIA
embedding endpoint is unavailable, semantic scores fall back to local TF-IDF vectors and disclose
that fact.

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

## Docker Compose

After copying the example environment files above, set `DATABASE_URL` in
`server/.env` to a PostgreSQL instance reachable from Docker, then start the full stack:

```bash
docker compose up --build
```

The client and API are available at `http://localhost:3000` and `http://localhost:9000`.
The AI service remains internal to the Compose network; the API calls it at
`http://service:8000`. To use a remotely hosted API from the browser, pass
`NEXT_PUBLIC_HTTP_SERVER_BASE_URL` as a build argument/environment variable.

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
