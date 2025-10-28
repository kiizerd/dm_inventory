import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, RangeSlider, Text } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import type { Vehicle } from '../../types';

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
  source: 'All' | 'ford' | 'dodge' | 'toyota' | 'nissan' | 'dlr';
};

type FilterOptions = {
  year: string[];
  make: string[];
  model: string[];
  priceMin: number;
  priceMax: number;
  mileageMin: number;
  mileageMax: number;
  source: 'All' | 'ford' | 'dodge' | 'toyota' | 'nissan' | 'dlr'[];
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
    source: 'All',
  });

  // UI open/closed state for sliding animation (desktop)
  const [open, setOpen] = useState<boolean>(true);

  // derive select options from incoming items (years/makes/models)
  const options = useMemo(() => {
    const result = {
      year: [],
      make: [],
      model: [],
      priceMin: -1,
      priceMax: 0,
      mileageMin: -1,
      mileageMax: 0,
      source: ['ford', 'dodge', 'toyota', 'nissan', 'dlr'],
    } as FilterOptions;

    items.forEach((item) => {
      if (!result.year.includes(item.year)) result.year.push(item.year);
      if (!result.make.includes(item.make)) result.make.push(item.make);
      if (!result.model.includes(item.model)) result.model.push(item.model);
      const price = Number(item.price.replace(/[^0-9.-]+/g, ''));
      if ((result.priceMin > price && price != 0) || result.priceMin == -1) result.priceMin = price;
      if (result.priceMax < price) result.priceMax = price;

      const mileage = Number(item.mileage.replace(/[^0-9.-]+/g, ''));
      if ((result.mileageMin > mileage && mileage != 0) || result.mileageMin == -1)
        result.mileageMin = mileage;
      if (result.mileageMax < mileage) result.mileageMax = mileage;
    });

    result.year.sort().reverse();
    result.make.sort();
    result.model.sort();

    return result;
  }, [items]);

  // compute filtered items whenever filters or items change
  useEffect(() => {
    const { year, make, model, priceMin, priceMax, mileageMin, mileageMax, source } = filters;
    const filtered = items.filter((v) => {
      if (year !== 'All' && String(v.year) !== String(year)) return false;
      if (make !== 'All' && v.make !== make) return false;
      if (model !== 'All' && v.model !== model) return false;
      if (source !== 'All' && v.source !== source) return false;

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

  const inputBase =
    'w-full rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-2 text-sm';
  const labelBase = 'block text-sm text-gray-300';
  const optionBase = 'bg-gray-900 text-gray-100';

  return (
    <div
      className={`relative pt-2 pl-4 transition-min-w duration-300 ease-in-out ${open ? 'min-w-2xs' : 'min-w-60'}`}
    >
      <div className="fixed z-5 filter-container min-w-3xs">
        <ActionIcon
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          pos={'absolute'}
          className={`top-2 transition bg-gray-600 text-xl duration-250 ease-in-out z-1
            ${open ? 'right-2 translate-x-0' : 'right-0 -translate-x-56 md:-translate-x-52 rotate-180'} `}
          title={open ? 'Hide filters' : 'Show filters'}
        >
          <IconChevronLeft stroke={2} />
        </ActionIcon>

        <div
          className={`filter-body bg-gray-900 border border-gray-700 rounded p-4 pt-2 space-y-2 md:space-y-4
            transform transition duration-300 ease-in-out
            ${
              open
                ? 'translate-x-0 opacity-100 scale-none'
                : '-translate-x-full opacity-0 -scale-x-3'
            }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-100">Filters</p>
          </div>

          {/* Year */}
          <div>
            <label className={labelBase}>Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters((s) => ({ ...s, year: e.target.value }))}
              className={`mt-1 ${inputBase}`}
            >
              <option className={optionBase}>All</option>
              {options.year.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Make */}
          <div>
            <label className={labelBase}>Make</label>
            <select
              value={filters.make}
              onChange={(e) => setFilters((s) => ({ ...s, make: e.target.value }))}
              className={`mt-1 ${inputBase}`}
            >
              <option className={optionBase}>All</option>
              {options.make.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className={labelBase}>Model</label>
            <select
              value={filters.model}
              onChange={(e) => setFilters((s) => ({ ...s, model: e.target.value }))}
              className={`mt-1 ${inputBase}`}
            >
              <option className={optionBase}>All</option>
              {options.model.map((mo) => (
                <option key={mo} value={mo}>
                  {mo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelBase}>Source</label>
            <select
              value={filters.source}
              onChange={(e) =>
                setFilters((s) => ({ ...s, source: e.target.value as FilterState['source'] }))
              }
              className={`mt-1 ${inputBase}`}
            >
              <option className={optionBase}>All</option>
              {Array.from(options.source).map((so) => (
                <option key={so} value={so}>
                  {so}
                </option>
              ))}
            </select>
          </div>
          <hr />
          {/* Price */}
          <div className="my-8 py-6">
            <RangeSlider
              size="lg"
              minRange={500}
              min={options.priceMin - 1000}
              max={options.priceMax + 1000}
              step={1000}
              label={(value) => `$${value}`}
              labelAlwaysOn
              value={[
                filters.priceMin ?? options.priceMin - (options.priceMin % 1000),
                filters.priceMax ?? options.priceMax + (options.priceMax % 1000),
              ]}
              onChange={(price) => {
                setFilters((s) => ({ ...s, priceMin: price[0], priceMax: price[1] }));
              }}
            />
            <Text size="sm">Price</Text>
          </div>

          {/* Mileage */}
          <div className="pb-4">
            <RangeSlider
              size="lg"
              minRange={500}
              min={options.mileageMin - 1000}
              max={options.mileageMax + 1000}
              step={1000}
              label={(value) => `${value} mi`}
              labelAlwaysOn
              value={[
                filters.mileageMin ?? options.mileageMin - (options.mileageMin % 1000),
                filters.mileageMax ?? options.mileageMax + (options.mileageMax % 1000),
              ]}
              onChange={(price) => {
                setFilters((s) => ({ ...s, mileageMin: price[0], mileageMax: price[1] }));
              }}
            />
            <Text size="sm">Mileage</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
