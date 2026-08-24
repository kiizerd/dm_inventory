import { scrapeFourStars, scrapeFourStarsNew } from '../scrapers/fourStars';
import { scrapeDLR } from '../scrapers/dlr';
import { scrapeApple } from '../scrapers/apple';
import { scrapeHouston } from '../scrapers/houston';
import { Vehicle } from '../types';

export class ScrapingService {
  async run(): Promise<Vehicle[]> {
    const results = await Promise.allSettled([
      scrapeFourStars('ford'),
      scrapeFourStars('nissan'),
      scrapeFourStars('toyota'),
      scrapeFourStars('dodge'),
      scrapeDLR(),
      scrapeApple(),
      scrapeHouston(),
    ]);

    const inventory: Vehicle[] = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value)
      .sort((a, b) => {
        if (!a.price.includes('$')) return 1;
        if (!b.price.includes('$')) return -1;

        const price_a = Number(a.price.replace(/\D+/g, ''));
        const price_b = Number(b.price.replace(/\D+/g, ''));
        return price_a - price_b;
      });

    return inventory;
  }

  async runNew(): Promise<Vehicle[]> {
    const results = await Promise.allSettled([
      scrapeFourStarsNew('ford'),
      scrapeFourStarsNew('chevrolet'),
      scrapeFourStarsNew('dodge'),
      scrapeFourStarsNew('toyota'),
      scrapeFourStarsNew('nissan'),
    ]);

    return results
      .filter((result): result is PromiseFulfilledResult<Vehicle[]> => result.status === 'fulfilled')
      .flatMap((result) => result.value)
      .sort((a, b) => {
        const priceA = Number(a.price.replace(/\D+/g, ''));
        const priceB = Number(b.price.replace(/\D+/g, ''));
        if (!Number.isFinite(priceA)) return 1;
        if (!Number.isFinite(priceB)) return -1;
        return priceA - priceB;
      });
  }
}

export const scrapingService = new ScrapingService();
