import type { Vehicle } from '../types';
import { scrapeDealerSync } from './dealerSync';

// Apple Lease Returns — a DealerSync site (see scrapeDealerSync).
export const scrapeApple = (): Promise<Vehicle[]> =>
  scrapeDealerSync('https://www.appleleasereturns.com', 'apple');
