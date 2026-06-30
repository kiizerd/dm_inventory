// import Refresh from "@/components/Refresh";
import { useEffect, useMemo, useState } from 'react';
import InventoryGrid from './InventoryGrid';
import SearchBar from './SearchBar.tsx';
import FilterBox from './FilterBox.tsx';
import type { Vehicle } from '../../types.ts';

// Parse a display string like "$23,015" or "70,119 mi" into a sortable number.
// Returns NaN for values with no real figure (e.g. "N/A", "Call for Price") so the
// comparator can push them to the end of the list in either sort direction.
function toSortNumber(value: string | undefined): number {
  const raw = String(value ?? '');
  if (!/\d/.test(raw)) return NaN;
  const n = Number(raw.replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

export default function Inventory({ endpoint = '/api/inventory' }) {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [filteredItems, setFilteredItems] = useState<Vehicle[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
  const [sortBy, setSortBy] = useState<'price' | 'mileage'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Note: Filter state is now owned by FilterBox. `filteredItems` contains items filtered by those controls.

  // Get inventory
  useEffect(() => {
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

  // debounce the search input to avoid filtering on every keystroke
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // apply search on top of the list produced by FilterBox
  const searchedItems = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    // `null` = FilterBox hasn't reported yet -> show everything. A real `[]` means
    // the active filters matched zero vehicles and must be respected (empty state).
    const source = filteredItems ?? items;

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

    const sorted = [...filtered].sort((a, b) => {
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

    // De-duplicate by VIN, falling back to source+stk so VIN-less cars aren't collapsed.
    const seen = new Set<string>();
    const deduped: Vehicle[] = [];
    for (const v of sorted) {
      const key = v.vin || `${v.source}-${v.stk}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(v);
    }
    return deduped;
  }, [items, filteredItems, debouncedSearch, sortBy, sortDirection]);

  return (
    <div className="min-h-screen w-full flex items-start justify-center">
      <header className="fixed inset-x-0 top-0 bg-gray-900/80 backdrop-blur z-40">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <span className="whitespace-nowrap font-semibold text-gray-100">DM Inventory</span>
          <div className="flex-1">
            <SearchBar
              search={search}
              onSearchChange={setSearch}
              onClear={() => setSearch('')}
              resultsCount={searchedItems.length}
              totalCount={items.length}
            />
          </div>
        </div>
      </header>

      <main className="flex flex-col md:flex-row w-screen mx-auto pt-16 md:pt-20">
        <aside>
          <FilterBox
            items={items}
            onFiltered={setFilteredItems}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={(nextSortBy, nextSortDirection) => {
              setSortBy(nextSortBy);
              setSortDirection(nextSortDirection);
            }}
          />
        </aside>
        <div className="px-8">
          {loading ? (
            <div role="status" className="pt-6 text-gray-400">
              Loading inventory…
            </div>
          ) : error ? (
            <div role="alert" className="pt-6 text-red-300">
              Error: {error}
            </div>
          ) : (
            <InventoryGrid items={searchedItems} />
          )}
        </div>
      </main>
    </div>
  );
}
