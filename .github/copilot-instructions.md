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

## Key files
- `server/src/index.ts` — server bootstrap and route mounting
- `server/src/routes/inventory.ts` — inventory API response and cache behavior
- `server/src/services/scraper.ts` — scraper orchestration
- `server/src/cache/inventoryCache.ts` — cached inventory data
- `client/src/components/Inventory/Inventory.tsx` — fetches inventory and wires search/filter UI
- `client/src/components/Inventory/InventoryGrid.tsx` — inventory grid rendering
- `client/src/components/Inventory/FilterBox.tsx` and `SearchBar.tsx` — filter/search controls
- `client/src/types.ts` and `server/src/types.ts` — vehicle shape definitions

## Project rules
- Keep the client and server type definitions in sync when the inventory JSON shape changes.
- Prefer defensive handling for scraper output because page data can be missing or inconsistent.
- If you change API behavior, update the related UI fetch logic and any cache assumptions.
- Avoid introducing framework-specific assumptions that do not match this Vite + React setup.

## Verification
- There are no automated tests in this repo today, so verify UI and API changes by running the relevant dev servers and checking the affected flows manually.
- Scraper code is network-dependent and may be flaky; handle failures gracefully and avoid breaking the API contract.
