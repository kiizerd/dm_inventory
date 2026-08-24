import { scrapingService } from '../services/scraper';
import { Vehicle } from '../types';

class NewInventoryCache {
  private cache: { data: Vehicle[]; timestamp: number } | null = null;
  private readonly ttl = 30 * 60 * 1000;

  set(data: Vehicle[]): void {
    this.cache = { data, timestamp: Date.now() };
  }

  get(): Vehicle[] | null {
    if (!this.cache || Date.now() - this.cache.timestamp > this.ttl) {
      this.cache = null;
      return null;
    }

    return this.cache.data;
  }

  async refresh(): Promise<void> {
    try {
      this.set(await scrapingService.runNew());
    } catch (error) {
      console.error('New inventory cache refresh error:', error);
    }
  }
}

export const newInventoryCache = new NewInventoryCache();