import { closeBrowser, getBrowser } from '../services/browserManager';
import { scrapeFourStars } from '../scrapers/fourStars';
import { Vehicle } from '../types';

export class ScrapingService {
  async run(): Promise<Vehicle[]> {
    const browser = await getBrowser();

    // Do everything sequentially for now.
    // Work out concurrency later
    const ford = await scrapeFourStars(browser, 'ford');
    const nissan = await scrapeFourStars(browser, 'nissan');
    const toyota = await scrapeFourStars(browser, 'toyota');
    const dodge = await scrapeFourStars(browser, 'dodge');

    // Concurrent method - last results overwrote earlier ones
    // -------------------------------------------------------|
    // const results = await Promise.allSettled([
    //   scrapeFourStars(browser, 'ford'),
    //   scrapeFourStars(browser, 'nissan'),
    // ]);

    // const allData = results
    //   .filter((result) => result.status === 'fulfilled')
    //   .flatMap((result) => result.value);
    // -------------------------------------------------------|

    const inventory = [ford, nissan, toyota, dodge].flat().sort((a, b) => {
      if (!a.price.includes('$')) return 1;
      if (!b.price.includes('$')) return -1;

      const price_a = Number(a.price.replace(/\D+/g, ''));
      const price_b = Number(b.price.replace(/\D+/g, ''));
      return price_a - price_b;
    });

    await closeBrowser();

    return inventory;
  }
}

export const scrapingService = new ScrapingService();
