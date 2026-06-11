import { normalizeFuelType } from './fuel';

describe('normalizeFuelType', () => {
  it.each([
    ['Electric', 'electric'],
    ['electric', 'electric'],
    ['Hybrid Electric', 'hybrid'],
    ['Gas/Electric', 'hybrid'],
    ['Gasoline Fuel', 'gasoline'],
    ['Flex Fuel', 'gasoline'],
    ['Diesel', 'diesel'],
    ['Hybrid and Diesel', 'diesel'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeFuelType(input)).toBe(expected);
  });
});
