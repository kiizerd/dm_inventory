// cache/inventoryCache.ts
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
}

export const inventoryCache = new InventoryCache();
