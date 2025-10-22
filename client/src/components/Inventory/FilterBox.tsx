import { useEffect, useMemo, useState } from 'react';
import type { Vehicle } from '../../types';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

type Props = {
  items: Vehicle[];
  onFiltered: (items: Vehicle[]) => void;
};

type FilterState = {
  year: string;
  make: string;
  model: string;
  priceMin: number | null;
  priceMax: number | null;
  mileageMin: number | null;
  mileageMax: number | null;
};

type FilterOptions = {
  year: string[];
  make: string[];
  model: string[];
  priceMin: number;
  priceMax: number;
  mileageMin: number;
  mileageMax: number;
};

export default function FilterBox({ items, onFiltered }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    year: 'All',
    make: 'All',
    model: 'All',
    priceMin: null,
    priceMax: null,
    mileageMin: null,
    mileageMax: null,
  });

  const parseNum = (v: string) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // derive select options from incoming items (years/makes/models)
  const options = useMemo(() => {
    const result = {
      year: [],
      make: [],
      model: [],
      priceMin: 0,
      priceMax: 0,
      mileageMin: 0,
      mileageMax: 0,
    } as FilterOptions;

    items.forEach((item) => {
      if (!result.year.includes(item.year)) result.year.push(item.year);
      if (!result.make.includes(item.make)) result.make.push(item.make);
      if (!result.model.includes(item.model)) result.model.push(item.model);
      const price = Number(item.price.replace(/[^0-9.-]+/g, ''));
      if (result.priceMin > price) result.priceMin = price;
      if (result.priceMax < price) result.priceMax = price;

      const mileage = Number(item.mileage.replace(/[^0-9.-]+/g, ''));
      if (result.priceMin > mileage) result.priceMin = mileage;
      if (result.priceMax < mileage) result.priceMax = mileage;
    });

    return result;
  }, [items]);

  // compute filtered items whenever filters or items change
  useEffect(() => {
    const { year, make, model, priceMin, priceMax, mileageMin, mileageMax } = filters;
    const filtered = items.filter((v) => {
      if (year !== 'All' && String(v.year) !== String(year)) return false;
      if (make !== 'All' && v.make !== make) return false;
      if (model !== 'All' && v.model !== model) return false;

      const priceNum = Number(String(v.price).replace(/[^0-9.-]+/g, '')) || 0;
      if (priceMin !== null && priceNum < priceMin) return false;
      if (priceMax !== null && priceNum > priceMax) return false;

      const mileageNum = Number(String(v.mileage).replace(/[^0-9.-]+/g, '')) || 0;
      if (mileageMin !== null && mileageNum < mileageMin) return false;
      if (mileageMax !== null && mileageNum > mileageMax) return false;

      return true;
    });

    onFiltered(filtered);
  }, [items, filters, onFiltered]);

  return (
    <div className="bg-gray-900/40 border border-gray-700 rounded p-4 pt-2 space-y-4">
      <p className="font-semibold text-gray-100">Filters</p>
      {/* Year */}
      <div>
        <label className="block text-sm text-gray-300">Year</label>
        <select
          value={filters.year}
          onChange={(e) => setFilters((s) => ({ ...s, year: e.target.value }))}
          className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-2 text-sm"
        >
          <option className="bg-gray-900 text-gray-100">All</option>
          {options.year.map((y) => (
            <option key={y} className="bg-gray-900 text-gray-100">
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Make */}
      <div>
        <label className="block text-sm text-gray-300">Make</label>
        <select
          value={filters.make}
          onChange={(e) => setFilters((s) => ({ ...s, make: e.target.value }))}
          className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-2 text-sm"
        >
          <option className="bg-gray-900 text-gray-100">All</option>
          {options.make.map((m) => (
            <option key={m} className="bg-gray-900 text-gray-100">
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm text-gray-300">Model</label>
        <select
          value={filters.model}
          onChange={(e) => setFilters((s) => ({ ...s, model: e.target.value }))}
          className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-2 text-sm"
        >
          <option className="bg-gray-900 text-gray-100">All</option>
          {options.model.map((mo) => (
            <option key={mo} value={mo} className="bg-gray-900 text-gray-100">
              {mo}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm text-gray-300">Price</label>
        <div className="mt-1 flex items-center gap-2">
          <ReactRangeSliderInput />
          {/* <input
            type="number"
            placeholder="Min"
            value={filters.priceMin ?? ''}
            onChange={(e) => setFilters((s) => ({ ...s, priceMin: parseNum(e.target.value) }))}
            className="w-24 rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax ?? ''}
            onChange={(e) => setFilters((s) => ({ ...s, priceMax: parseNum(e.target.value) }))}
            className="w-24 rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 text-sm"
          /> */}
        </div>
      </div>

      {/* Mileage */}
      <div>
        <label className="block text-sm text-gray-300">Mileage</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.mileageMin ?? ''}
            onChange={(e) => setFilters((s) => ({ ...s, mileageMin: parseNum(e.target.value) }))}
            className="w-24 rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.mileageMax ?? ''}
            onChange={(e) => setFilters((s) => ({ ...s, mileageMax: parseNum(e.target.value) }))}
            className="w-24 rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
