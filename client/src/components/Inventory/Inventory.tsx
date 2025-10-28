// import Refresh from "@/components/Refresh";
import { useEffect, useMemo, useState } from 'react';
import InventoryGrid from './InventoryGrid';
import SearchBar from './SearchBar.tsx';
import FilterBox from './FilterBox.tsx';
import type { Vehicle } from '../../types.ts';

export default function Inventory({ endpoint = '/api/inventory' }) {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [filteredItems, setFilteredItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
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
    if (!q) return filteredItems.length ? filteredItems : items;
    const source = filteredItems.length ? filteredItems : items;
    return source.filter((v) => {
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
    });
  }, [items, filteredItems, debouncedSearch]);

  return (
    <div className="min-h-screen w-full flex items-start justify-center">
      <header className="fixed inset-x-0 top-0 bg-gray-900/80 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-3">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            onClear={() => setSearch('')}
            // resultsCount={filteredItems.length}
            // totalCount={items.length}
          />
        </div>
      </header>

      <main className="flex flex-col md:flex-row w-screen mx-auto pt-16 md:pt-20">
        <aside>
          <FilterBox items={items} onFiltered={setFilteredItems} />
        </aside>
        <div className="px-8">
          {loading ? <div>Loading inventory…</div> : ''}
          {error ? <div>Error: {error}</div> : ''}
          <InventoryGrid
            items={searchedItems.filter(
              (obj, index, self) => index === self.findIndex((o) => o.vin === obj.vin),
            )}
          />
        </div>
      </main>
    </div>
  );
}
