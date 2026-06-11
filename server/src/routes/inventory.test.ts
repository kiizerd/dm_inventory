import request from 'supertest';
import { createApp } from '../app';
import { inventoryCache } from '../cache/inventoryCache';

jest.mock('../cache/inventoryCache', () => ({
  inventoryCache: {
    get: jest.fn(),
    set: jest.fn(),
    refresh: jest.fn(),
  },
}));

const mockedInventoryCache = inventoryCache as jest.Mocked<typeof inventoryCache>;

const sampleVehicle = {
  year: '2024',
  make: 'Ford',
  model: 'F-150',
  trim: 'XLT',
  price: '$45,000',
  mileage: '12,500',
  vin: '1FTEX1EP0RFA12345',
  stk: 'A-1001',
  link: 'https://example.test/ford',
  image: 'https://example.test/ford.jpg',
  source: 'ford' as const,
};

describe('inventory API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns a health check payload', async () => {
    const app = createApp();

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns raw inventory data in the expected envelope', async () => {
    mockedInventoryCache.get.mockReturnValue([sampleVehicle]);

    const app = createApp();
    const res = await request(app).get('/api/inventory');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      inventory: [sampleVehicle],
      count: 1,
      cached: true,
      timestamp: expect.any(String),
    });
    expect(mockedInventoryCache.get).toHaveBeenCalledTimes(1);
  });
});
