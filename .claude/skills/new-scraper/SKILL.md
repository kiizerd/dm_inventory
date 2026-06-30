---
name: new-scraper
description: Scaffold a new dealership inventory scraper following this repo's pattern (server/src/scrapers/<name>.ts returning Vehicle[]), wire it into the ScrapingService, and add the new source literal to both the server and client Vehicle unions.
disable-model-invocation: true
argument-hint: [source-name] [data-url-or-endpoint]
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Add a New Scraper

Scaffold a new dealership inventory scraper end-to-end, mirroring the existing
`server/src/scrapers/dlr.ts` and `server/src/scrapers/fourStars.ts` style. Each
scraper is defensive: it never throws past `Promise.allSettled`, returns `[]` on
failure, and guards null/missing/optional fields because page shapes drift.

## Step 0 — Gather inputs

If the user did not provide both of the following, ask for them before writing any
code:

1. **Source name** — a short lowercase identifier (e.g. `autonation`, `carmax`).
   This becomes the file name (`server/src/scrapers/<name>.ts`), the exported
   function name (`scrape<Name>`), and the new `source` literal in the `Vehicle`
   union. Use the name verbatim as the source literal.
2. **Data URL / endpoint** — the JSON API or page URL the scraper will `fetch`.
   Ask whether the endpoint paginates (and how — e.g. a `totalResults` field plus
   a `startIndex`/`page` query param) so the loop can be modeled like `dlr.ts`.

Also confirm the raw response shape if the user can share it (a sample JSON
record), so the source-specific interface in Step 2 maps cleanly to `Vehicle`.

## Step 1 — Create the scraper file

Create `server/src/scrapers/<name>.ts` exporting
`async function scrape<Name>(args?): Promise<Vehicle[]>`. Use this template
(replace `Example`/`example` with the real source name and adapt the raw
interface + field mapping to the actual response):

```ts
import type { Vehicle } from '../types';
import { normalizeFuelType } from '../services/fuel';

// Step 2: source-specific raw shape. Mark fields optional/nullable when the
// upstream payload is not guaranteed to include them — page shapes drift.
interface ExampleVehicle {
  Year?: string;
  Make?: string;
  Model?: string;
  Trim?: string;
  PriceDisplay?: string;
  Mileage?: number;
  Fuel?: string | null;
  Vin?: string;
  StockNo?: string;
  DetailUrl?: string;
  ImageUrl?: string;
}

interface ExampleResponse {
  vehicles?: ExampleVehicle[];
}

export async function scrapeExample(): Promise<Vehicle[]> {
  const url = 'https://example.com/api/inventory';

  console.log('Scraping Example...');

  try {
    const response = await fetch(url);
    const data = (await response.json()) as ExampleResponse;

    // Step 3: map each raw record -> Vehicle. Optional-chain and coalesce every
    // field; never assume a key exists. Use normalizeFuelType for fuel and set
    // source to the new literal.
    const vehicles: Vehicle[] = (data.vehicles ?? []).map((item) => ({
      year: item.Year ?? '',
      make: item.Make ?? '',
      model: item.Model ?? '',
      trim: item.Trim ?? '',
      price: item.PriceDisplay ?? '',
      mileage: item.Mileage != null ? item.Mileage.toLocaleString() + ' mi' : '',
      vin: item.Vin ?? '',
      stk: item.StockNo ?? '',
      link: item.DetailUrl ?? '',
      image: item.ImageUrl ?? undefined,
      fuel: normalizeFuelType(item.Fuel),
      source: 'example',
    }));

    return vehicles;
  } catch (error) {
    // Step 4: never throw — log and return [] so Promise.allSettled stays clean.
    console.error('Example scraping error: ', error);
    return [];
  }
}
```

Notes on the template:

- If the endpoint paginates, model the loop on `dlr.ts`: read a total count from
  the first response (`data.totalResults ?? 0`), then loop fetching a fixed page
  size at a time, pushing into a single `vehicles` array.
- `image` is typed `string | undefined` in `Vehicle`, so coalesce a missing image
  to `undefined` (not `''`).
- Keep the whole body inside one `try/catch`. The `catch` MUST
  `console.error(...)` and `return []`. Never let an error escape.
- Match the repo Prettier style: 2-space indent, single quotes, semicolons,
  trailing commas, 100-char width.

## Step 5 — Add the source literal to BOTH Vehicle unions

The `Vehicle` interface is duplicated and MUST stay in sync. Add the new source
string to the `source` union in **both** files:

- `server/src/types.ts`
- `client/src/types.ts`

Both currently read:

```ts
  source: 'ford' | 'dodge' | 'toyota' | 'nissan' | 'dlr';
```

Append the new literal in both (example for source `example`):

```ts
  source: 'ford' | 'dodge' | 'toyota' | 'nissan' | 'dlr' | 'example';
```

Make the exact same edit in both files — they must remain identical.

## Step 6 — Register the call in the ScrapingService

In `server/src/services/scraper.ts`, import the new function and add the call to
the `Promise.allSettled([...])` array inside `run()`:

```ts
import { scrapeExample } from '../scrapers/example';
```

```ts
    const results = await Promise.allSettled([
      scrapeFourStars('ford'),
      scrapeFourStars('nissan'),
      scrapeFourStars('toyota'),
      scrapeFourStars('dodge'),
      scrapeDLR(),
      scrapeExample(),
    ]);
```

No other changes are needed in the service — `run()` already filters to fulfilled
results, flat-maps, and sorts by price ascending (entries whose price lacks `$`
sort to the end).

## Step 7 — Verify

From the server package, build and run the tests:

```sh
cd server && npm run build && npm test
```

`npm run build` (tsc) catches the new source literal being out of sync or any
type mismatch in the mapping. `npm test` runs the existing Jest suite
(`jest --runInBand`).

If the build fails because the client union was not updated, fix
`client/src/types.ts` to match `server/src/types.ts` — the two `Vehicle`
interfaces must stay identical.
