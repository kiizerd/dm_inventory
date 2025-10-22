// import Refresh from "@/components/Refresh";
import { useEffect, useMemo, useState } from 'react';
import InventoryGrid from './InventoryGrid';
import SearchBar from './SearchBar.tsx';
import FilterBox from './FilterBox.tsx';
import type { Vehicle } from '../../types.ts';

export default function Inventory() {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);

  // Get inventory
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/inventory');
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const data = (await res.json()) as Vehicle[] | { items: Vehicle[] };
        const resolved = Array.isArray(data) ? data : 'items' in data ? data.items : [];
        setItems(resolved);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.name === 'AbortError' ? 'Cancelled' : err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // debounce the search input to avoid filtering on every keystroke
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((v) => {
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
  }, [items, debouncedSearch]);

  return (
    <div className="min-h-screen w-screen flex items-start justify-center">
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

      <main className="flex w-screen mx-auto p-20">
        <aside>
          <FilterBox />
        </aside>
        <div className="container mx-auto px-4">
          {loading ? <div>Loading inventory…</div> : ''}
          {error ? <div>Error: {error}</div> : ''}
          <InventoryGrid items={filteredItems} />
        </div>
      </main>
    </div>
  );
}
