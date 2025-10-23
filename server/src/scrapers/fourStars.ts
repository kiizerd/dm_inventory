import { Browser } from 'puppeteer';
import type { Vehicle } from '../types';
import { PuppeteerCrawler } from 'crawlee';

// interface VehicleData {
//   source: 'ford' | 'dodge' | 'toyota' | 'nissan';
//   vehicle: Vehicle;
// }

export async function scrapeFourStars(
  browser: Browser,
  store: 'ford' | 'dodge' | 'toyota' | 'nissan',
): Promise<Vehicle[]> {
  const page = await browser.newPage();
  const extra = store == 'nissan' ? 'ofdenton' : '';
  const dest = (store == 'dodge' ? 'dcjr' : store) + extra;
  // Only gets first page for now
  const url = `https://www.fourstars${dest}.com/searchused.aspx?pn=96`;

  await page.setRequestInterception(true);

  const blacklist: string[] = [
    'prequalnavigator',
    'adobedtm.com',
    'lesa.video',
    'lesautomotive',
    'nr-data.net',
    'google',
    'auto-driven',
    'autodriven',
    'dealeron.com',
    'dlron',
    'complyauto',
    'facebook',
  ];

  page.on('request', (req) => {
    if (blacklist.some((str) => req.url().includes(str))) {
      return req.abort();
    }

    return req.continue();
  });

  try {
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 60000,
    });

    const data = await page.evaluate((dest) => {
      const items = Array.from(document.querySelectorAll('.vehicle-card'));
      return items.map((item) => {
        const year = item.querySelector('.vehicle-title__year')?.textContent ?? 'YEAR';
        const makeModel =
          item.querySelector('.vehicle-title__make-model')?.textContent ?? 'MAKE MODEL';
        const make = makeModel.split(' ')[1] ?? 'MAKE';
        const model = makeModel.split(' ').slice(2).join(' ');
        const trim = item.querySelector('.vehicle-title__trim')?.textContent ?? 'TRIM';
        const vin = item.querySelector('.vehicle-identifiers__value')?.textContent ?? 'VIN';
        const price = item.querySelector('.vehiclePricingHighlightAmount')?.textContent ?? 'PRICE';
        const mileage = item.querySelector('.vehicle-mileage')?.textContent ?? 'MILEAGE';
        const stockNumSelector = '.vehicle-identifiers__stock > .vehicle-identifiers__value';
        const stk = item.querySelector(stockNumSelector)?.textContent ?? 'STK';
        const link = item.querySelector('a')?.href ?? url;
        const imageUrl = item.querySelector('img')?.getAttribute('src') ?? '/IMAGE';
        const image = `https://www.fourstars${dest}.com` + imageUrl;

        return {
          year,
          make,
          model,
          trim,
          vin,
          price,
          mileage,
          stk,
          link,
          image,
        };
      });
    }, dest);

    return data;
  } catch (error) {
    console.error('FourStars scraping error:', error);
    return [];
  } finally {
    await page.close();
  }
}
