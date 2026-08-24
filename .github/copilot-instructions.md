# Project instructions for Copilot

This repository is a small monorepo with:

- `client/` — React + Vite + TypeScript front end
- `server/` — Express + TypeScript API and scrapers

## Start here

- Client dev server: `cd client && npm install && npm run dev`
- Server dev server: `cd server && npm install && npm run dev`
- Build client: `cd client && npm run build`
- Build server: `cd server && npm run build`
- Format files: `npm run format`

Railway deploys from the `origin/server` and `origin/client` branches. Push verified changes to both branches when deploying.

## Key files

- `server/src/index.ts` — server bootstrap and route mounting
- `server/src/routes/inventory.ts` — inventory API response and cache behavior
- `server/src/routes/newInventory.ts` — new vehicle inventory API response and cache behavior
- `server/src/services/scraper.ts` — scraper orchestration
- `server/src/cache/inventoryCache.ts` — cached inventory data
- `server/src/cache/newInventoryCache.ts` — in-memory new inventory cache
- `server/src/scrapers/fourStars.ts` — FourStars new and pre-owned scrapers
- `server/src/scrapers/dealerSync.ts` — shared paginated scraper used by DLR, Apple, and Houston
- `server/src/services/bodyStyle.ts` — normalizes source labels for body-style filtering
- `client/src/App.tsx` — owns the `new`/`pre-owned` page selection and derives the endpoint from `VITE_API_BASE` (default `/api`)
- `client/src/components/Inventory/Inventory.tsx` — fetches inventory and wires search/filter UI
- `client/src/components/Inventory/InventoryGrid.tsx` — inventory grid rendering
- `client/src/components/Inventory/FilterBox.tsx` and `SearchBar.tsx` — filter/search controls
- `client/src/types.ts` and `server/src/types.ts` — vehicle shape definitions

## Project rules

- Keep the client and server type definitions in sync when the inventory JSON shape changes.
- Prefer defensive handling for scraper output because page data can be missing or inconsistent.
- If you change API behavior, update the related UI fetch logic and any cache assumptions.
- Avoid introducing framework-specific assumptions that do not match this Vite + React setup.
- Finish all implementation changes for the current prompt before running builds, tests, lint, or other validation commands.
- Client and server dependencies are installed independently; there are no npm workspaces.
- Railway deploys from the `origin/server` and `origin/client` branches when deploying.

## API contract

- `GET /api/inventory` serves pre-owned inventory.
- `GET /api/new-inventory` serves new FourStars inventory.
- Both endpoints return `{ inventory, count, cached, timestamp }`.
- The `Vehicle` interface in `client/src/types.ts` and `server/src/types.ts` must remain identical.
- The shared `Vehicle.source` union currently includes `ford`, `dodge`, `toyota`, `nissan`, `dlr`, `apple`, `houston`, and `chevrolet`.
- FourStars new sources include Ford, Chevrolet (Ranch GM), Dodge (Ranch CDJR), Toyota, and Nissan.

## Scraper rules

- Scrapers must handle drifting or missing page fields defensively and return `[]` on failure.
- Use `Promise.allSettled` so one dealer failure does not break the rest of an inventory response.
- Preserve the correct `Vehicle.source` literal in both client and server type unions when adding a source.
- FourStars pre-owned and new feeds must filter cards by their `VehicleType` or `VehicleCondition`.
- The new-inventory cache is in-memory only; the pre-owned cache persists to the gitignored JSON file.
- The pre-owned cache runs its staleness refresh check every 120 seconds; the new-inventory cache has no disk persistence or scheduled refresh.
- `ScrapingService.run()` covers pre-owned FourStars Ford/Nissan/Toyota/Dodge plus DLR, Apple, and Houston. `runNew()` covers new FourStars Ford, Chevrolet, Dodge, Toyota, and Nissan.
- `Inventory` receives `page` and `endpoint` from `App`; switching pages resets loaded items, filters, search, and sort state. Search is debounced by 300ms and filter options are dependent on the other active filters.
- Inventory cards are deduplicated by VIN before rendering. Price, mileage, and body-style sorting place values without a numeric value at the end.
- `bodyStyle` is an optional field in `Vehicle` and must be normalized with `normalizeBodyStyle` when scraper data supplies it.

## Verification

- Run validation only after the current prompt's edits are complete; then use the narrowest relevant build, test, lint, or manual flow check.
- Server validation: `cd server && npm run build && npm test`.
- Client validation: `cd client && npm run build && npm run lint`.
- Scraper code is network-dependent and may be flaky; handle failures gracefully and avoid breaking the API contract.
