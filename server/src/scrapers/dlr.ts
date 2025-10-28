import type { Vehicle } from '../types';

interface DLRVehicle {
  Year: string;
  Make: string;
  Model: string;
  Trim: string;
  PriceDisplay: string;
  Mileage: number;
  Vin: string;
  StockNo: string;
  VehicleDetailUrl: string;
  FirstImageUrl: string;
}

interface DLRResponse {
  success: boolean;
  startIndex: number;
  totalResults: number;
  results: number;
  vehicles: DLRVehicle[];
}

export async function scrapeDLR(): Promise<Vehicle[]> {
  const urlBase = 'https://www.dallasleasereturns.com';
  const url = `${urlBase}/Inventory/Search?IsSold=false&version=2`;

  console.log('Scraping DLR...');

  try {
    // API route returns max of 15 results
    // Get totalResults from first response,
    // use that to loop thru 15 at a time
    const firstResponse = await fetch(url);
    const firstData: DLRResponse = (await firstResponse.json()) as DLRResponse;
    const vehicles: Vehicle[] = [];
    const vehicleCount: number = firstData.totalResults ?? 0;

    for (let n = 0; n < Math.floor(vehicleCount / 15) + 1; n++) {
      const adjustedUrl = url + `&startIndex=${n * 15}`;
      const response = await fetch(adjustedUrl);
      const data: DLRResponse = (await response.json()) as DLRResponse;

      data.vehicles.forEach((item: DLRVehicle) => {
        vehicles.push({
          year: item.Year,
          make: item.Make,
          model: item.Model,
          trim: item.Trim.slice(2),
          price: item.PriceDisplay,
          mileage: item.Mileage.toLocaleString() + ' mi',
          vin: item.Vin,
          stk: item.StockNo.replace('STK', ''),
          link: urlBase + item.VehicleDetailUrl,
          image: item.FirstImageUrl,
          source: 'dlr',
        });
      });
    }

    return vehicles;
  } catch (error) {
    console.error('DLR scraping error: ', error);
    return [];
  }
}
