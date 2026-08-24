import type { Vehicle } from '../types';
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

export async function scrapeFourStars(
  store: 'ford' | 'dodge' | 'toyota' | 'nissan',
): Promise<Vehicle[]> {
  const extra = store == 'nissan' ? 'ofdenton' : '';
  const dest = (store == 'dodge' ? 'dcjr' : store) + extra;
  const urlBase = `https://www.fourstars${dest}.com`;
  const urlEndpoint = '/api/vhcliaa/vehicle-pages/cosmos/srp/vehicles/';
  const keys = {
    ford: '29552/3149037',
    dodge: '22463/1964388',
    toyota: '24148/2321907',
    nissan: '29553/3150150',
  };
  const url = `${urlBase}${urlEndpoint}/${keys[store]}?pn=96`;

  console.log(`Scraping ${store[0]?.toUpperCase() + store.slice(1)}...`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
    const data = (await response.json()) as FourStarsResponse;
    const vehicles: Vehicle[] = [];
    const displayCards = Array.isArray(data?.DisplayCards) ? data.DisplayCards : [];
    displayCards.forEach((displayCard) => {
      const item = displayCard.VehicleCard;
      if (!item) return;

      // Extract price from nested HTML content
      const priceHtml =
        item.WasabiVehiclePricingPanelViewModel?.PriceStakViewModel?.PriceStakTabsModel
          ?.BuyContent || '';
      const priceMatch = priceHtml.match(/\$[\d,]+/);
      const price = priceMatch ? priceMatch[0] : 'N/A';

      vehicles.push({
        year: String(item.VehicleYear),
        make: item.VehicleMake,
        model: item.VehicleModel,
        trim: item.VehicleTrim,
        price,
        mileage: item.Mileage,
        vin: item.VehicleVin,
        stk: item.VehicleStockNumber,
        link: item.VehicleDetailUrl,
        image: item.VehicleImageModel?.VehiclePhotoSrc
          ? urlBase + item.VehicleImageModel.VehiclePhotoSrc
          : undefined,
        fuel: normalizeFuelType(item.VehicleFuelType || item.VehicleEngine),
        bodyStyle: typeof item.VehicleBodyStyle === 'string' ? item.VehicleBodyStyle : undefined,
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
