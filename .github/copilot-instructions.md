This repository is a small monorepo with a React (Vite + Tailwind) client and a TypeScript Express server that runs scrapers.

Key facts (big picture)
- Two main services: `client/` (React + Vite) and `server/` (Express scrapers). See `client/package.json` and `server/package.json` for scripts.
- Server scrapers live in `server/src/scrapers/` (see `server/src/scrapers/ford.ts`). They use Puppeteer and page request interception; treat scraping code as I/O-heavy and stateful.
- Server exposes a small API: `/api/inventory` and `/api/health` (see `server/src/index.ts` and `server/src/routes/inventory.ts`). Client fetches `/api/inventory` to populate the grid.

Developer workflows / useful commands
- Start client dev server: `cd client && npm install && npm run dev` (Vite).
- Start server in dev mode with hot-reload: `cd server && npm install && npm run dev` (uses `ts-node-dev`).
- Build client: `cd client && npm run build` (runs `tsc -b && vite build`).
- Build server: `cd server && npm run build` (`tsc`).
- Format repo: at repo root `npm run format` (Prettier configured in `.prettierrc`).

Project-specific patterns & conventions
- Types are defined separately for server and client: `server/src/types.ts` and `client/src/types.ts`. Be careful: some fields differ (e.g. `year` types). Prefer editing both if you change the public shape of inventory objects.
- The client UI for inventory lives under `client/src/components/Inventory/`:
  - `Inventory.tsx` wires the SearchBar and inventory grid.
  - `InventoryGrid.tsx`, `InventoryCard.tsx`, `SearchBar.tsx` contain display + filtering logic (debounced search, client-side filtering).
- Filtering flow: `Inventory` holds `search` and `debouncedSearch` (300ms), passes `debouncedSearch` down to the grid. If you change filtering behavior, update the debounce/prop contract in `Inventory.tsx`.
- Network integration: client calls `GET /api/inventory` (see `client/src/components/Inventory/InventoryGrid.tsx` in earlier iterations). Server route calls scrapers (see `server/src/routes/inventory.ts`). When changing JSON shape, update both sides.

Scraper notes (important)
- `server/src/scrapers/ford.ts`:
  - Launches Puppeteer (`puppeteer.launch()`), sets request interception with an explicit blacklist.
  - Extracts many strings from page DOM; strings can be null/undefined — handle missing data defensively.
  - The scraper returns `Vehicle[]` which is directly returned by the API route. If you add fields, ensure they are safe to JSON.stringify.

Editing guidance & examples
- Small UI change: edit `client/src/components/Inventory/InventoryGrid.tsx` or `InventoryCard.tsx`. Use Tailwind classes already in use.
- If you change an API contract, update `server/src/types.ts` and `client/src/types.ts` together. Example: change `Vehicle.price` from `string` to `number` — update both files and any formatting code.
- To add a new server route, modify `server/src/routes/` and register it in `server/src/index.ts`.

Example: add a new query param `?make=Ford` to the inventory endpoint
- server: accept `req.query.make` in `server/src/routes/inventory.ts`, filter the returned array from the scraper before res.json
- client: append query param to fetch URL in the InventoryGrid fetch call or let Inventory component pass `endpoint` prop to the grid

Files to inspect first (high signal)
- `server/src/scrapers/ford.ts` — scraping implementation and request interception
- `server/src/routes/inventory.ts` — API entry for inventory
- `server/src/index.ts` — server startup and routes mounting
- `client/src/components/Inventory/Inventory.tsx` — search + grid wiring (debounce pattern)
- `client/src/components/Inventory/InventoryGrid.tsx` and `InventoryCard.tsx` — UI and filtering logic
- `client/src/types.ts` and `server/src/types.ts` — keep these in sync for cross-service changes

Testing / verification hints
- There are no automated tests. Validate changes by running both dev servers and exercising the UI.
- Scrapers are network- and site-dependent; run scrapers behind a stable connection and be prepared for flakiness.

Common pitfalls for an agent
- Do NOT assume types are shared: update both type files when modifying the inventory shape.
- Scraper code expects DOM nodes — always guard against `null` when using `page.$eval` or `element?.$eval`.
- Avoid adding Next.js-specific eslint comments (project is Vite + React); one-off eslint rules may not exist.

If anything here is unclear or you want the instructions tuned to a specific task (for example: add an API filter, improve scraper resilience, write unit tests), say which area and I'll iterate.
