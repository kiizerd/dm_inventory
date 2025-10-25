// cache/inventoryCache.ts
import { scrapingService } from '../services/scraper';
import { Vehicle } from '../types';

interface CacheEntry {
  data: Vehicle[];
  timestamp: number;
}

class InventoryCache {
  private cache: CacheEntry | null = null;
  private readonly TTL: number = 30 * 60 * 1000; // 30 minutes in milliseconds

  set(data: Vehicle[]): void {
    this.cache = {
      data,
      timestamp: Date.now(),
    };
  }

  get(): Vehicle[] | null {
    if (!this.cache) return null;

    const age = Date.now() - this.cache.timestamp;
    if (age > this.TTL) {
      this.cache = null;
      return null;
    }

    return this.cache.data;
  }

  clear(): void {
    this.cache = null;
  }

  isStale(): boolean {
    if (!this.cache) return true;
    const age = Date.now() - this.cache.timestamp;
    return age > this.TTL;
  }

  async refresh(): Promise<void> {
    try {
      const inventory = await scrapingService.run();
      this.set(inventory);
    } catch (error) {
      console.error('Cache Refresh Error: ', error);
    }
  }
}

export const inventoryCache = new InventoryCache();

const timeoutRefresh = async () => {
  console.log('Checking if cache is stale....');
  const stale = inventoryCache.isStale();

  if (stale) {
    console.log('Cache stale - Refreshing');
    inventoryCache.refresh();
  }
};

setInterval(timeoutRefresh, 120 * 1000);
