# NarrativeX interface

The landing, sign-in, sign-up, loading, not-found, runtime-error, and auth-error pages share a warm editorial design. References reviewed: [Indisea](https://indisea.com) for typography and simple graphics; [DAQ Consulting](https://daqconsulting.com) for dark technical sections and numbered storytelling. Copy and illustrations are original to NarrativeX.

## Editing

- Page copy and repeated items live in typed-by-inference objects and arrays above their components.
- `src/app/globals.css` owns the semantic color palette, Tailwind theme, base styles, and animation keyframes. Use Tailwind token utilities such as `bg-background`, `text-muted`, and `border-border`; do not add component CSS or literal colors.
- `components/ui/Logo.tsx` is the shared logo used by the landing, auth, and status screens. The same folder contains the status screens, SVG network, and scroll effects. `components/home` contains the source explorer and research sections.
- Source tabs support arrow keys, Home, and End. FAQ uses native details elements. Scroll reveals use IntersectionObserver; content remains visible without JavaScript. Motion respects reduced-motion preferences. Reading progress uses native scroll timelines where supported.
- The narrative graphic is explicitly illustrative. No fake live metrics or evidence verdicts are presented.

## Authentication

The forms use the existing NextAuth credentials provider with `register=true` for signup. Google is shown only when its server-side credentials exist. Auth pages remain accessible with an existing session so people can switch accounts. Success returns to `/dashboard`; its server layout requires an authenticated session. Live credentials/OAuth success requires a running backend, database, and valid provider configuration.

## Dashboard and research studio

The dashboard uses a quiet sidebar and consistent controls inspired by [Linear's interface refresh](https://linear.app/now/behind-the-latest-design-refresh), with NarrativeX's existing cream, sage, coral, and forest palette. The requested Astra reference was unavailable at the supplied local path.

- `/dashboard` displays category-filtered news, topic search, public social posts, and selectable geopolitical signals. Counts reflect only the returned data. Locations are explicitly labeled keyword-inferred schematic positions.
- `/dashboard/bot` starts an investigation; `/dashboard/bot/:conversationId` opens persisted messages. Stories hand off to the composer through a `topic` parameter. The studio supports rename, confirmed deletion, follow-up questions, Markdown briefs, copy, pending states, and failure recovery.
- `lib/workspace.ts` is the typed client API layer. Every data request uses the authenticated Bun server through `lib/api.ts`; the browser never calls the AI service. The server alone delegates chat to FastAPI.
- `components/dashboard` owns modular views, shared copy, scroll reveals, and loading/error states. Motion includes staggered entrances, card lift, moving scan lines, pulsing signals, animated controls, and research progress. Reduced-motion disables animation.
- News and geopolitical endpoints share the bounded `server/src/services/newsService.ts` with NewsAPI and paginated Google News RSS fallback.

`scripts/dashboard-smoke.mjs` checks responsive dashboard/bot layouts, conversation CRUD, follow-up, and authenticated server-only requests against fixture APIs. Start a dedicated client with `NEXTAUTH_SECRET=narrativex-local-ui-smoke-only NEXTAUTH_URL=http://localhost:3100 bun run dev --port 3100`, encode a test session with `next-auth/jwt` using the same test secret and `accessToken: "fixture-only-token"`, then pass `(page, token)` to the script. Do not use production secrets or sessions. These fixtures validate UI contracts, not live AI or provider quality.

Production build verification passed using `bun run build --webpack`; Turbopack was blocked by an internal worker-port permission error in this environment.

## Validation

Run `bun run lint`, `bunx tsc --noEmit`, and `bun run build` from `client/`.

`scripts/ui-smoke.mjs` exports a reusable browser check. With Playwright available and the development server running, call it with an unauthenticated Playwright Page:

```js
import { chromium } from 'playwright';
import smoke from './scripts/ui-smoke.mjs';
const browser = await chromium.launch();
try {
  console.log(await smoke(await browser.newPage()));
} finally {
  await browser.close();
}
```

It checks routes at three viewport sizes, overflow, navigation, password controls, form validation, mocked sign-in failure, keyboard tabs, FAQs, scroll reveals, and reduced motion. It does not create accounts. Browser captures in `.playwright-mcp/` are ignored and must not be committed.
