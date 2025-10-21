import { Router } from 'express';
import { InventoryItem } from '../types';
import { scrapeFord } from '../scrapers/ford';

const router = Router();

// TEMP MOCK - will replace with real scraper
const mockData: InventoryItem[] = [
  {
    id: '123',
    title: '2021 Example Truck',
    price: 35000,
    inStock: true,
    source: 'Mock Dealer',
    imageUrl: null,
    url: null
  }
];



router.get('/', async (_req, res) => {
  // Later we'll call real scrapers and merge results
  const fordData = await scrapeFord()
  console.log('Getting Inventory')
  res.json(fordData);
});

export default router;
