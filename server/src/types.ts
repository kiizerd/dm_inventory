export interface InventoryItem {
  id: string;
  title: string;
  price: string | number | null;
  inStock?: boolean;
  imageUrl?: string | null;
  source: string;
  url?: string | null;
}

export interface Vehicle {
  year: string;
  make: string;
  model: string;
  trim: string;
  price: string;
  mileage: string;
  vin: string;
  stk: string;
  link: string;
  image: string | undefined;
}
