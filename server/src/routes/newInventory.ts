import { Router } from 'express';
import { newInventoryCache } from '../cache/newInventoryCache';
import { scrapingService } from '../services/scraper';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const cachedData = newInventoryCache.get();
    if (cachedData) {
      res.json({
        inventory: cachedData,
        count: cachedData.length,
        cached: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const inventory = await scrapingService.runNew();
    newInventoryCache.set(inventory);

    res.json({
      inventory,
      count: inventory.length,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('New inventory error:', error);
    res.status(500).json({
      error: 'Failure during new inventory handling',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;