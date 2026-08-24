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
  fuel?: string;
  bodyStyle?: string | undefined;
  source:
    | 'ford'
    | 'dodge'
    | 'toyota'
    | 'nissan'
    | 'dlr'
    | 'apple'
    | 'houston'
    | 'chevrolet';
}
