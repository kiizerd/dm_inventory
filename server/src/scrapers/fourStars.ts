import type { Vehicle } from '../types';

interface FourStarsVehicleCard {
  VehicleYear: number;
  VehicleMake: string;
  VehicleModel: string;
  VehicleTrim: string;
  Mileage: string;
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
    const response = await fetch(url);
    const data = (await response.json()) as FourStarsResponse;
    const vehicles: Vehicle[] = [];
    data.DisplayCards.forEach((displayCard) => {
      const item = displayCard.VehicleCard;

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
        image: urlBase + item.VehicleImageModel.VehiclePhotoSrc,
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
