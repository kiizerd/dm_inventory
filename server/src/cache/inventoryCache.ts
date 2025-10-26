// cache/inventoryCache.ts
import { scrapingService } from '../services/scraper';
import { Vehicle } from '../types';
import fs from 'fs';
import path from 'path';

interface CacheEntry {
  data: Vehicle[];
  timestamp: number;
}

class InventoryCache {
  private cache: CacheEntry | null = null;
  private readonly TTL: number = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly cacheFile = path.join(__dirname, 'inventory-cache.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log('Reading data from disk...');
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8')) as CacheEntry;
        this.cache = data;
      }
    } catch (error) {
      console.error('Error loading cache from disk:', error);
    }
  }

  private saveToDisk(): void {
    console.log('Writing data to disk...');
    try {
      if (this.cache) {
        fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache), 'utf-8');
      }
    } catch (error) {
      console.error('Error saving cache to disk:', error);
    }
  }

  set(data: Vehicle[]): void {
    this.cache = {
      data,
      timestamp: Date.now(),
    };
    this.saveToDisk();
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
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
      }
    } catch (error) {
      console.error('Error clearing cache file:', error);
    }
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
