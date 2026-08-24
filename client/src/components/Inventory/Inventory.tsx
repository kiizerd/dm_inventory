// import Refresh from "@/components/Refresh";
import { useCallback, useEffect, useMemo, useState } from 'react';
import InventoryGrid from './InventoryGrid';
import SearchBar from './SearchBar.tsx';
import FilterBox from './FilterBox.tsx';
import type { Vehicle } from '../../types.ts';
import { SegmentedControl } from '@mantine/core';

type InventoryPage = 'new' | 'pre-owned';

type Props = {
  endpoint?: string;
  page?: InventoryPage;
  onPageChange?: (page: InventoryPage) => void;
};

// Parse a display string like "$23,015" or "70,119 mi" into a sortable number.
// Returns NaN for values with no real figure (e.g. "N/A", "Call for Price") so the
// comparator can push them to the end of the list in either sort direction.
function toSortNumber(value: string | undefined): number {
  const raw = String(value ?? '');
  if (!/\d/.test(raw)) return NaN;
  const n = Number(raw.replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

export default function Inventory({
  endpoint = '/api/inventory',
  page = 'pre-owned',
  onPageChange,
}: Props) {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [filteredItems, setFilteredItems] = useState<Vehicle[]>([]);
  const [filterReady, setFilterReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
  const [sortBy, setSortBy] = useState<'price' | 'mileage' | 'bodyStyle'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Note: Filter state is now owned by FilterBox. `filteredItems` contains items filtered by those controls.

  // Get inventory
  useEffect(() => {
    setItems([]);
    setFilteredItems([]);
    setFilterReady(false);
    setSearch('');
    setDebouncedSearch('');
    setSortBy('price');
    setSortDirection('asc');

    let aborted = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        // backend now returns { inventory: Vehicle[], count, timestamp, cached }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await res.json();
        let resolved: Vehicle[] = [];
        if (data && Array.isArray(data.inventory)) {
          resolved = data.inventory;
        } else {
          resolved = [];
        }

        if (!aborted) setItems(resolved);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!aborted)
          setError(err.name === 'AbortError' ? 'Cancelled' : err.message || 'Unknown error');
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    load();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [endpoint]);

  const handleFiltered = useCallback((nextItems: Vehicle[]) => {
    setFilteredItems(nextItems);
    setFilterReady(true);
  }, []);

  // debounce the search input to avoid filtering on every keystroke
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // apply search on top of the list produced by FilterBox
  const searchedItems = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const source = filterReady ? filteredItems : items;

    const filtered = q
      ? source.filter((v) => {
          const hay = [
            String(v.year),
            v.make,
            v.model,
            v.trim || '',
            v.vin || '',
            v.stk || '',
            String(v.price || ''),
            String(v.mileage || ''),
          ]
            .join(' ')
            .toLowerCase();
          return hay.includes(q);
        })
      : source;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'bodyStyle') {
        const aValue = a.bodyStyle?.trim() || '';
        const bValue = b.bodyStyle?.trim() || '';
        if (!aValue || !bValue) {
          if (!aValue && !bValue) return 0;
          return !aValue ? 1 : -1;
        }
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      const aValue = toSortNumber(a[sortBy]);
      const bValue = toSortNumber(b[sortBy]);
      const aInvalid = Number.isNaN(aValue);
      const bInvalid = Number.isNaN(bValue);
      // Vehicles without a real price/mileage always sink to the end, in both directions.
      if (aInvalid || bInvalid) {
        if (aInvalid && bInvalid) return 0;
        return aInvalid ? 1 : -1;
      }
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [items, filteredItems, filterReady, debouncedSearch, sortBy, sortDirection]);

  return (
    <div className="min-h-screen w-full flex items-start justify-center">
      <header className="fixed inset-x-0 top-0 bg-gray-900/80 backdrop-blur z-40">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            onClear={() => setSearch('')}
            className="flex-1"
            // resultsCount={filteredItems.length}
            // totalCount={items.length}
          />
          <SegmentedControl
            aria-label="Inventory page"
            value={page}
            onChange={(value) => onPageChange?.(value as InventoryPage)}
            data={[
              { label: 'New', value: 'new' },
              { label: 'Pre-Owned', value: 'pre-owned' },
            ]}
            size="sm"
            color="indigo"
          />
        </div>
      </header>

      <main className="flex flex-col md:flex-row w-screen mx-auto pt-16 md:pt-20">
        <aside>
          <FilterBox
            key={endpoint}
            items={items}
            onFiltered={handleFiltered}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={(nextSortBy, nextSortDirection) => {
              setSortBy(nextSortBy);
              setSortDirection(nextSortDirection);
            }}
          />
        </aside>
        <div className="px-8">
          {loading ? <div>Loading inventory…</div> : ''}
          {error ? <div>Error: {error}</div> : ''}
          <InventoryGrid
            isNew={page === 'new'}
            items={searchedItems.filter(
              (obj, index, self) => index === self.findIndex((o) => o.vin === obj.vin),
            )}
          />
        </div>
      </main>
    </div>
  );
}
