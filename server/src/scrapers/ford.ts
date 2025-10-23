import { promises as fs } from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import type { Vehicle } from 'src/types';

// This should work for all FourStars locations
export async function scrapeFord(): Promise<Vehicle[]> {
  const targetUrl = 'https://www.fourstarsford.com/searchused.aspx?pn=96';

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

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

  await page.goto(targetUrl);
  await page.waitForNetworkIdle();

  // Get the number of vehicles and loop that many times extracting data
  // Theres probably a better way to do this now that I'm waiting for the page to load
  const vehicleCountText = await page.$eval('.srp-results-count__text', (el) => el.textContent);
  const vehicleCount = Number(vehicleCountText?.split(' ')[2]);

  const vehicles: Vehicle[] = [];

  for (let i = 0; i < vehicleCount - 1; i++) {
    const elementId = `#vehicle_${i}`;

    const vehicleCard = await page.$(elementId);
    const overview = await vehicleCard?.$('.vehicle-overview');
    const vehicleUrl = await vehicleCard?.$eval('a', (el) => el.href);
    const imageUrl = await vehicleCard?.$eval('img', (el) => {
      return 'https://www.fourstarsford.com' + el.getAttribute('src');
    });

    const price = await vehicleCard?.$eval(
      '.vehiclePricingHighlightAmount',
      (el) => el.textContent,
    );

    const year = await overview?.$eval('.vehicle-title__year', (el) => el.textContent);
    const makeModel = await overview?.$eval('.vehicle-title__make-model', (el) => el.textContent);
    const make = makeModel.split(' ')[1];
    const model = makeModel.split(' ').slice(2).join(' ');
    const trim = await overview?.$eval('.vehicle-title__trim', (el) => el.textContent);
    const vin = await overview?.$eval('.vehicle-identifiers__value', (el) => el.textContent);
    const mileage = await overview?.$eval('.vehicle-mileage', (el) => el.textContent);
    const stockNumSelector = '.vehicle-identifiers__stock > .vehicle-identifiers__value';
    const stockNum = await overview?.$eval(stockNumSelector, (el) => el.textContent);

    const vehicle: Vehicle = {
      year,
      make,
      model,
      trim,
      vin,
      mileage,
      stk: stockNum,
      price,
      link: vehicleUrl,
      image: imageUrl,
    };

    vehicles.push(vehicle);
  }

  const writeToDisk = false;

  // Optionally write the inventory element outer HTML to disk for debugging/archival
  if (writeToDisk) {
    try {
      const dataDir = path.resolve(__dirname, '..', '..', 'data');
      await fs.mkdir(dataDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `ford-inventory-${timestamp}.html`;
      const filePath = path.join(dataDir, filename);

      const mockWrite = '<h1>Uh-Oh</h1>';
      // Prefer the inventory element if it exists, otherwise save the full page
      const toWrite = mockWrite; // $.root().toString() //inventoryElement.length ? inventoryElement.first().toString() : $.root().toString();

      await fs.writeFile(filePath, toWrite, 'utf8');
      console.log(`Wrote inventory HTML to ${filePath}`);
    } catch (err) {
      console.error('Failed to write inventory HTML:', err);
    }
  }

  await browser.close();

  return vehicles;
}
