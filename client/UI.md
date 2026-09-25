# NarrativeX interface

The landing, sign-in, sign-up, loading, not-found, runtime-error, and auth-error pages share a warm editorial design. References reviewed: [Indisea](https://indisea.com) for typography and simple graphics; [DAQ Consulting](https://daqconsulting.com) for dark technical sections and numbered storytelling. Copy and illustrations are original to NarrativeX.

## Editing

- Page copy and repeated items live in typed-by-inference objects and arrays above their components.
- `src/app/globals.css` owns the semantic color palette, Tailwind theme, base styles, and animation keyframes. Use Tailwind token utilities such as `bg-background`, `text-muted`, and `border-border`; do not add component CSS or literal colors.
- `components/ui` contains shared branding, status screens, the SVG network, and scroll effects. `components/home` contains the source explorer and research sections.
- Source tabs support arrow keys, Home, and End. FAQ uses native details elements. Scroll reveals use IntersectionObserver; content remains visible without JavaScript. Motion respects reduced-motion preferences. Reading progress uses native scroll timelines where supported.
- The narrative graphic is explicitly illustrative. No fake live metrics or evidence verdicts are presented.

## Authentication

The forms use the existing NextAuth credentials provider with `register=true` for signup. Google is shown only when its server-side credentials exist. Success returns to `/` because there is no dashboard route yet. Original backend contracts are preserved. Live credentials/OAuth success still requires a running backend, database, and valid provider configuration.

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
