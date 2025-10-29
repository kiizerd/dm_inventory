import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Button,
  MultiSelect,
  RangeSlider,
  Text,
  type MultiSelectProps,
} from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import type { Vehicle } from '../../types';

type Props = {
  items: Vehicle[];
  onFiltered: (items: Vehicle[]) => void;
};

type FilterState = {
  year: string[];
  make: string[];
  model: string[];
  priceMin: number | null;
  priceMax: number | null;
  mileageMin: number | null;
  mileageMax: number | null;
  source: ('ford' | 'dodge' | 'toyota' | 'nissan' | 'dlr')[];
};

type FilterOptions = {
  year: string[];
  make: string[];
  model: string[];
  priceMin: number;
  priceMax: number;
  mileageMin: number;
  mileageMax: number;
  source: ('ford' | 'dodge' | 'toyota' | 'nissan' | 'dlr')[];
};

const defaultFilter: FilterState = {
  year: [],
  make: [],
  model: [],
  priceMin: null,
  priceMax: null,
  mileageMin: null,
  mileageMax: null,
  source: [],
};

export default function FilterBox({ items, onFiltered }: Props) {
  const [filters, setFilters] = useState<FilterState>(defaultFilter);
  const [open, setOpen] = useState<boolean>(true);

  // derive select options from incoming FILTERED items (years/makes/models)
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
    const filtered = items.filter((v: Vehicle) => {
      if (year.length !== 0 && !year.includes(v.year)) return false;
      if (make.length !== 0 && !make.includes(v.make)) return false;
      if (model.length !== 0 && !model.includes(v.model)) return false;
      if (source.length !== 0 && !source.includes(v.source)) return false;

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

  const multiSelectProps = {
    className: 'w-60',
    clearable: true,
    searchable: true,
    maxDropdownHeight: 600,
  } as MultiSelectProps;

  return (
    <div
      className={`relative pt-2 pl-4 transition-min-w duration-300 ease-in-out ${open ? 'min-w-2xs' : 'min-w-60'}`}
    >
      <div className="fixed z-5 filter-container min-w-3xs">
        <ActionIcon
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          pos={'absolute'}
          className={`top-2 transform transition duration-400 ease-in-out z-1
            ${open ? 'right-2 translate-x-0' : 'right-0 -translate-x-56 md:-translate-x-52 rotate-180'} `}
          title={open ? 'Hide filters' : 'Show filters'}
        >
          <IconChevronLeft stroke={2} />
        </ActionIcon>

        <div
          className={`filter-body p-4 pt-2 space-y-2 md:space-y-4 bg-gray-900/80 border border-gray-700 rounded
            transform transition duration-300 ease-in-out
            ${
              open
                ? 'translate-x-0 opacity-100 scale-none'
                : '-translate-x-full opacity-0 -scale-x-3'
            }`}
        >
          <div className="flex items-center justify-start gap-4">
            <p className="font-semibold text-gray-100">Filters</p>
            <Button size="xs" variant="outline" onClick={() => setFilters(defaultFilter)}>
              Reset
            </Button>
          </div>
          {/* Year */}
          <MultiSelect
            label="Year"
            placeholder="Select years..."
            data={options.year}
            value={filters.year}
            onChange={(e) => setFilters((s) => ({ ...s, year: e }))}
            {...multiSelectProps}
          />

          {/* Make */}
          <MultiSelect
            label="Make"
            placeholder="Select makes..."
            data={options.make}
            value={filters.make}
            onChange={(e) => setFilters((s) => ({ ...s, make: e }))}
            {...multiSelectProps}
          />

          {/* Model */}
          <MultiSelect
            label="Model"
            placeholder="Select models..."
            data={options.model}
            value={filters.model}
            onChange={(e) => setFilters((s) => ({ ...s, model: e }))}
            {...multiSelectProps}
          />

          {/* Source */}
          <MultiSelect
            label="Source"
            placeholder="Select source..."
            data={options.source}
            value={filters.source}
            onChange={(e: string[]) =>
              setFilters((s) => ({ ...s, source: e as FilterOptions['source'] }))
            }
            {...multiSelectProps}
          />

          <hr />

          {/* Price */}
          <div className="my-8 py-4">
            <RangeSlider
              size="lg"
              minRange={500}
              min={options.priceMin - 1000}
              max={options.priceMax + 1000}
              step={1000}
              label={(value) => `$${value.toLocaleString()}`}
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
          <div className="pb-2">
            <RangeSlider
              size="lg"
              minRange={500}
              min={options.mileageMin - 1000}
              max={options.mileageMax + 1000}
              step={1000}
              label={(value) => `${value.toLocaleString()} mi`}
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
