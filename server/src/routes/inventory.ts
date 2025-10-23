import { Router } from 'express';
import { closeBrowser, getBrowser } from '../browserManager';
import { scrapeFourStars } from '../scrapers/fourStars';

const router = Router();

router.get('/', async (_req, res) => {
  console.log(' #===--- Getting Inventory ---===# ');
  try {
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

    // Improve response with metadata
    // res.json({
    //   inventory: allData,
    //   count: allData.length,
    //   timestamp: new Date().toISOString(),
    // });

    res.json([ford, nissan, toyota, dodge].flat());
  } catch (error) {
    console.error('Browser error:', error);
    res.status(500).json({
      error: 'Failure during browser handling',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  await closeBrowser();
});

export default router;
