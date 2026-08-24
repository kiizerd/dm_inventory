# CLAUDE.md

Small monorepo: a React + Vite + TS **client** that browses scraped used-car dealership inventory, and an Express + TS **server** that scrapes dealer sites and serves a cached `/api/inventory`.

## Setup & commands

There are **no npm workspaces**. `client/` and `server/` install and run independently — you must `cd` into each package first. Prettier is the only root-level tooling.

**Client** (`cd client`)

- `npm install` — install deps
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — `eslint .`
- `npm run preview` — preview the production build

**Server** (`cd server`)

- `npm install` — install deps
- `npm run dev` — `ts-node-dev --respawn --transpile-only src/index.ts`
- `npm run build` — `tsc`
- `npm run start` — `node dist/index.js`
- `npm test` — `jest --runInBand`

**Root** (repo root)

- `npm run format` — `prettier --write .`
- `npm run format:check` — `prettier --check .`

**Railway deployment**

- Railway deploys from the `origin/server` and `origin/client` branches; push verified changes to both branches when deploying.

## Architecture

**Server** (`server/src/`)

- `index.ts` — bootstrap; calls `void inventoryCache.refresh()` on start; `PORT = process.env.PORT || 3001`.
- `app.ts` — `createApp()`: `express.json` + `helmet` + `cors(origin: process.env.CLIENT_ORIGIN || '*')`; rate limit 15min/100 on `/api/`; `GET /api/health -> {status:'ok'}`; mounts `/api/inventory`.
- `routes/inventory.ts` — `GET /` returns the envelope `{inventory, count, cached, timestamp}`; cache-first, on miss runs `scrapingService.run()` then `inventoryCache.set()`; 500 on error. Standing TODO: add scraper concurrency/retries/timeouts.
- `services/scraper.ts` — `ScrapingService.run()`: `Promise.allSettled` over `scrapeFourStars('ford'|'nissan'|'toyota'|'dodge')` + `scrapeDLR()`; keeps only fulfilled, `flatMap`s, sorts by price ascending (entries whose price lacks `$` sort last). Exports singleton `scrapingService`.
- `scrapers/dlr.ts` — `scrapeDLR()`: paginates the DLR JSON API 15 at a time via `totalResults`, maps `DLRVehicle -> Vehicle`; try/catch -> `console.error` + return `[]`.
- `scrapers/fourStars.ts` — `scrapeFourStars(store)`: per-store URL (`dodge->dcjr`, nissan host gets `ofdenton`), fetch JSON, extract price via regex from nested `BuyContent` HTML, map -> `Vehicle`, `normalizeFuelType(VehicleFuelType || VehicleEngine)`, `source: store`; try/catch -> `console.error` + return `[]`.
- `services/fuel.ts` — `normalizeFuelType(value?: string | null)`: `'diesel' | 'hybrid' | 'electric' | 'gasoline' | 'unknown'`.
- `cache/inventoryCache.ts` — `InventoryCache`, TTL 30min, persists to `inventory-cache.json` (gitignored); `get()/set()/clear()/isStale()/refresh()`; singleton `inventoryCache`; `setInterval` staleness check every 120s.
- `types.ts` — the `Vehicle` interface (see data contract below).

**Client** (`client/src/`)

- `main.tsx`, `App.tsx` — entry and root component.
- `types.ts` — the `Vehicle` interface, kept identical to the server's.
- `components/Inventory/Inventory.tsx` — fetches inventory, wires search + filter.
- `components/Inventory/InventoryGrid.tsx` — grid rendering.
- `components/Inventory/InventoryCard.tsx` — single vehicle card.
- `components/Inventory/FilterBox.tsx`, `SearchBar.tsx` — filter and search controls.

## The data contract

The `Vehicle` interface lives in **both** `server/src/types.ts` and `client/src/types.ts` and **must stay in sync** — they are currently identical. Adding a new scraper source means adding the new literal to the `source` union in **both** files.

```ts
export interface Vehicle {
  year: string;
  make: string;
  model: string;
  trim: string;
  price: string;
  mileage: string;
  vin: string;
  stk: string;
  link: string;
  image: string | undefined;
  fuel?: string;
  source: 'ford' | 'dodge' | 'toyota' | 'nissan' | 'dlr';
}
```

The `/api/inventory` envelope `{inventory, count, cached, timestamp}` is the API contract. Changing its shape means updating the client fetch logic in `Inventory.tsx` and any cache assumptions in `inventoryCache.ts`.

## Scraper rules

Scrapers are network-dependent and flaky; page/JSON shapes drift.

- **Never throw past `Promise.allSettled`** — a failing scraper must not break the rest.
- Wrap each scraper in try/catch: `console.error('<Name> scraping error:', error); return [];`.
- Guard every missing/optional field; never assume a nested property exists.
- Map raw records to `Vehicle`, use `normalizeFuelType(...)` for `fuel`, set the correct `source` literal.

## Testing & verification

> Correction: the old `.github/copilot-instructions.md` claim that "there are no automated tests" is **stale**.

- **Server has Jest tests** — run `cd server && npm test`. Coverage: `server/src/routes/inventory.test.ts` (supertest; mocks `inventoryCache` `get`/`set`/`refresh`) and `server/src/services/fuel.test.ts`.
- **Client has no tests yet** — verify UI changes by running the dev servers (`cd client && npm run dev`, plus `cd server && npm run dev`) and checking the affected flows manually.
- After server changes, verify with `cd server && npm run build && npm test`.
- **There is no CI yet** (backlog item: "Add CI: lint + build checks").

## Conventions

- **Prettier** (`.prettierrc`): printWidth 100, tabWidth 2, no tabs, semicolons, single quotes, trailing commas `all`, bracket spacing. Match this in all code you write.
- **Branch per task**: `feature/<short-name>`.
- Mark code todos with `TODO:`.
- `.gitignore` covers `node_modules`, `server/dist`, `server/src/cache/*.json`, `.env`, `TODO.md`.

## Claude Code automations in this repo

This repo configures Claude Code under `.claude/`:

- **Hooks** — auto-format edited files with Prettier (PostToolUse), block edits to `.env` files (PreToolUse), auto-ESLint edited client `.ts`/`.tsx` files (PostToolUse).
- **Subagents** — `scraper-resilience-reviewer`, `type-sync-checker`.
- **Skills** — `/new-scraper` (add a scraper following the repeatable pattern), `/preflight` (pre-push checks).

Contributors should be aware these run automatically on edits.
