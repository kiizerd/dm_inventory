import { Router } from 'express';
import { closeBrowser } from '../browserManager';
import { inventoryCache } from '../cache/inventoryCache';
import { scrapingService } from '../services/scraper';

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

    const inventory = await scrapingService.run();

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
});

export default router;
