import { scrapeFourStars } from '../scrapers/fourStars';
import { scrapeDLR } from '../scrapers/dlr';
import { Vehicle } from '../types';

export class ScrapingService {
  async run(): Promise<Vehicle[]> {
    const results = await Promise.allSettled([
      scrapeFourStars('ford'),
      scrapeFourStars('nissan'),
      scrapeFourStars('toyota'),
      scrapeFourStars('dodge'),
      scrapeDLR(),
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
}

export const scrapingService = new ScrapingService();
