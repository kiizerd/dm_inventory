import type { Vehicle } from '../types';
import { normalizeBodyStyle } from '../services/bodyStyle';
import { normalizeFuelType } from '../services/fuel';

interface FourStarsVehicleCard {
  VehicleYear: number;
  VehicleMake: string;
  VehicleModel: string;
  VehicleTrim: string;
  Mileage: string;
  VehicleFuelType?: string;
  VehicleEngine?: string;
  VehicleBodyStyle?: string;
  VehicleCondition?: string;
  VehicleType?: string;
  VehicleVin: string;
  VehicleStockNumber: string;
  VehicleDetailUrl: string;
  VehicleImageModel: {
    VehiclePhotoSrc: string;
  };
  WasabiVehiclePricingPanelViewModel: {
    PriceStakViewModel: {
      PriceStakTabsModel: {
        BuyContent: string;
      };
    };
  };
}

interface FourStarsDisplayCard {
  VehicleCard: FourStarsVehicleCard;
}

interface FourStarsResponse {
  DisplayCards: FourStarsDisplayCard[];
}

type FourStarsUsedStore = 'ford' | 'dodge' | 'toyota' | 'nissan';
type FourStarsNewStore = FourStarsUsedStore | 'chevrolet';

const dealerConfig: Record<FourStarsNewStore, { urlBase: string; key: string }> = {
  ford: { urlBase: 'https://www.fourstarsford.com', key: '29552/3149029' },
  dodge: { urlBase: 'https://www.fourstarsdcjr.com', key: '22463/1964353' },
  toyota: { urlBase: 'https://www.fourstarstoyota.com', key: '24148/2321894' },
  nissan: { urlBase: 'https://www.fourstarsnissanofdenton.com', key: '29553/3150140' },
  chevrolet: { urlBase: 'https://www.fourstarschevrolet.com', key: '28298/2956931' },
};

const newInventoryFilter = 'dHlwZT0nbic=';

export async function scrapeFourStars(
  store: FourStarsUsedStore,
): Promise<Vehicle[]> {
  const urlBase = dealerConfig[store].urlBase;
  const urlEndpoint = '/api/vhcliaa/vehicle-pages/cosmos/srp/vehicles/';
  const keys = {
    ford: '29552/3149037',
    dodge: '22463/1964388',
    toyota: '24148/2321907',
    nissan: '29553/3150150',
  };
  const url = `${urlBase}${urlEndpoint}${keys[store]}?pn=96`;

  return scrapeFourStarsFeed(url, urlBase, store, 'used');
}

export async function scrapeFourStarsNew(store: FourStarsNewStore): Promise<Vehicle[]> {
  const { urlBase, key } = dealerConfig[store];
  const urlEndpoint = '/api/vhcliaa/vehicle-pages/cosmos/srp/vehicles/';
  const url = `${urlBase}${urlEndpoint}${key}?host=${new URL(urlBase).host}&baseFilter=${newInventoryFilter}&displayCardsShown=NaN`;

  return scrapeFourStarsFeed(url, urlBase, store, 'new');
}

async function scrapeFourStarsFeed(
  url: string,
  urlBase: string,
  store: FourStarsNewStore,
  condition: 'new' | 'used',
): Promise<Vehicle[]> {

  console.log(`Scraping ${store[0]?.toUpperCase() + store.slice(1)}...`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
    const data = (await response.json()) as FourStarsResponse;
    const vehicles: Vehicle[] = [];
    const displayCards = Array.isArray(data?.DisplayCards) ? data.DisplayCards : [];
    displayCards.forEach((displayCard) => {
      const item = displayCard?.VehicleCard;
      if (!item) return;

      const vehicleType = String(item.VehicleType ?? '').toLowerCase();
      const vehicleCondition = String(item.VehicleCondition ?? '').toLowerCase();
      if (vehicleType !== condition && vehicleCondition !== condition) return;

      // Extract price from nested HTML content
      const priceContent =
        item.WasabiVehiclePricingPanelViewModel?.PriceStakViewModel?.PriceStakTabsModel
          ?.BuyContent;
      const priceHtml = typeof priceContent === 'string' ? priceContent : '';
      const price = extractPrice(priceHtml, condition);
      const vin = String(item.VehicleVin ?? '');
      const stock = String(item.VehicleStockNumber ?? '').trim() || vin.slice(-8);

      vehicles.push({
        year: String(item.VehicleYear),
        make: item.VehicleMake,
        model: item.VehicleModel,
        trim: item.VehicleTrim,
        price,
        mileage: item.Mileage,
        vin,
        stk: stock,
        link: item.VehicleDetailUrl,
        image: item.VehicleImageModel?.VehiclePhotoSrc
          ? urlBase + item.VehicleImageModel.VehiclePhotoSrc
          : undefined,
        fuel: normalizeFuelType(item.VehicleFuelType || item.VehicleEngine),
        bodyStyle: normalizeBodyStyle(item.VehicleBodyStyle),
        source: store,
      });
    });

    return vehicles;
  } catch (error) {
    console.error('FourStars scraping error:', error);
    return [];
  } finally {
  }
}

function extractPrice(priceHtml: string, condition: 'new' | 'used'): string {
  if (condition === 'new') {
    const prices = Array.from(priceHtml.matchAll(/\$[\d,]+/g), (match) => match[0]);
    const fullPrices = prices
      .map((price) => ({ price, value: Number(price.replace(/\D+/g, '')) }))
      .filter(({ value }) => Number.isFinite(value));
    const highestPrice = fullPrices.sort((a, b) => b.value - a.value)[0];
    if (highestPrice) return highestPrice.price;
  }

  const highlightedPrice = priceHtml.match(
    /vehiclePricingHighlightAmount[^>]*>\s*(\$[\d,]+)/i,
  )?.[1];
  if (highlightedPrice) return highlightedPrice;

  const labeledPrices = Array.from(
    priceHtml.matchAll(
      /priceBlocItemPriceLabel[^>]*>\s*([^<]+?)\s*<.*?priceBlocItemPriceValue[^>]*>\s*(\$[\d,]+)/gis,
    ),
  );
  const preferredLabels = condition === 'new'
    ? ['dealer price', 'our price', 'msrp']
    : ['our price', 'internet price', 'price', 'msrp'];

  for (const label of preferredLabels) {
    const match = labeledPrices.find((entry) => entry[1]?.trim().toLowerCase() === label);
    if (match?.[2]) return match[2];
  }

  return priceHtml.match(/\$[\d,]+/)?.[0] || 'N/A';
}
