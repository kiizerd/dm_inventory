import { Router } from 'express';
import { closeBrowser, getBrowser } from '../browserManager';
import { scrapeFourStars } from '../scrapers/fourStars';
import { inventoryCache } from '../cache/inventoryCache';

// TODO: Improve scraping concurrency and resilience
// - Consider running scrapers concurrently with Promise.allSettled
// - Merge results deterministically (preserve order or dedupe)
// - Add retry wrapper and timeouts for flaky pages
// When starting work: create branch `feature/scraper-concurrency`

const router = Router();

router.get('/', async (_req, res) => {
  console.log(' #===--- Getting Inventory ---===# ');
  try {
    const cachedData = inventoryCache.get();
    if (cachedData) {
      res.json({
        inventory: cachedData,
        count: cachedData.length,
        cached: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

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
    inventoryCache.set(inventory);

    res.json({
      inventory,
      count: inventory.length,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Browser error: ', error);
    res.status(500).json({
      error: 'Failure during browser handling',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  await closeBrowser();
});

export default router;
