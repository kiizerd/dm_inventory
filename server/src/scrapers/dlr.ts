import type { Vehicle } from '../types';
import { scrapeDealerSync } from './dealerSync';

// Dallas Lease Returns — a DealerSync site (see scrapeDealerSync).
export const scrapeDLR = (): Promise<Vehicle[]> =>
  scrapeDealerSync('https://www.dallasleasereturns.com', 'dlr');
