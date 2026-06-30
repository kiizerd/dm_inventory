import type { Vehicle } from '../types';
import { scrapeDealerSync } from './dealerSync';

// Houston Lease Returns — a DealerSync site (see scrapeDealerSync).
export const scrapeHouston = (): Promise<Vehicle[]> =>
  scrapeDealerSync('https://www.dmhoustonleasereturns.com', 'houston');
