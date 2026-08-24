import type { Vehicle } from '../types';
import { normalizeBodyStyle } from '../services/bodyStyle';
import { normalizeFuelType } from '../services/fuel';

// DealerSync-powered "lease returns" sites (Dallas, Apple, Houston) all expose the
// same JSON endpoint and vehicle shape, so they share one parameterized scraper.

interface DealerSyncVehicle {
  Year: string;
  Make: string;
  Model: string;
  Trim: string;
  PriceDisplay: string;
  Mileage: number;
  Fuel?: string;
  BodyStyle?: string;
  Vin: string;
  StockNo: string;
  VehicleDetailUrl: string;
  FirstImageUrl: string;
}

interface DealerSyncResponse {
  startIndex: number;
  totalResults: number;
  results: number;
  vehicles: DealerSyncVehicle[];
}

const PAGE_SIZE = 15; // the endpoint returns at most 15 results per request
const REQUEST_TIMEOUT_MS = 15000;

async function fetchPage(url: string): Promise<DealerSyncResponse> {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
  }
  return (await response.json()) as DealerSyncResponse;
}

function mapVehicle(item: DealerSyncVehicle, urlBase: string, source: Vehicle['source']): Vehicle {
  return {
    year: item.Year,
    make: item.Make,
    model: item.Model,
    trim: item.Trim,
    price: item.PriceDisplay,
    mileage:
      typeof item.Mileage === 'number'
        ? `${item.Mileage.toLocaleString()} mi`
        : String(item.Mileage ?? ''),
    vin: item.Vin,
    stk: (item.StockNo ?? '').replace('STK', ''),
    link: urlBase + (item.VehicleDetailUrl ?? ''),
    image: item.FirstImageUrl,
    fuel: normalizeFuelType(item.Fuel),
    bodyStyle: normalizeBodyStyle(item.BodyStyle),
    source,
  };
}

/**
 * Scrape a DealerSync "lease returns" site.
 * @param urlBase Origin of the site, e.g. `https://www.dallasleasereturns.com` (no trailing slash).
 * @param source  The `Vehicle.source` literal to tag each result with.
 */
export async function scrapeDealerSync(
  urlBase: string,
  source: Vehicle['source'],
): Promise<Vehicle[]> {
  const searchUrl = `${urlBase}/Inventory/Search?IsSold=false&version=2`;

  console.log(`Scraping ${source}...`);

  try {
    // First page tells us the total; reuse its results instead of re-fetching page 0.
    const firstData = await fetchPage(searchUrl);
    const vehicles: Vehicle[] = [];

    const collect = (data: DealerSyncResponse) => {
      const list = Array.isArray(data?.vehicles) ? data.vehicles : [];
      for (const item of list) vehicles.push(mapVehicle(item, urlBase, source));
    };

    collect(firstData);

    const total = firstData.totalResults ?? 0;
    const pageCount = Math.ceil(total / PAGE_SIZE);

    for (let n = 1; n < pageCount; n++) {
      const pageUrl = `${searchUrl}&startIndex=${n * PAGE_SIZE}`;
      try {
        collect(await fetchPage(pageUrl));
      } catch (pageError) {
        // One flaky page shouldn't drop everything we've gathered so far.
        console.error(`${source} page ${n} error:`, pageError);
      }
    }

    return vehicles;
  } catch (error) {
    console.error(`${source} scraping error:`, error);
    return [];
  }
}
