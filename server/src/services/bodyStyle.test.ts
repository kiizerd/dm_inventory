import { normalizeBodyStyle } from './bodyStyle';

describe('normalizeBodyStyle', () => {
  it.each([
    ['2D Sport Utility', 'SUV'],
    ['Sports Activity Vehicle', 'SUV'],
    ['4D Crew Cab', 'Truck'],
    ['4D Passenger Van', 'Van'],
    ['3D Hatchback', 'Hatchback'],
    ['4D Sedan', 'Sedan'],
    ['2D Coupe', 'Coupe'],
  ])('normalizes %s to %s', (value, expected) => {
    expect(normalizeBodyStyle(value)).toBe(expected);
  });

  it('preserves unknown non-empty styles', () => {
    expect(normalizeBodyStyle('Wagon')).toBe('Wagon');
  });

  it('returns undefined for missing styles', () => {
    expect(normalizeBodyStyle(null)).toBeUndefined();
  });
});