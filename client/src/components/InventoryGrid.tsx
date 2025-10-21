import { useEffect, useState, useMemo } from "react";
import type { Vehicle } from "../types";
import InventoryCard from "./InventoryCard";
import InventorySearch from "./InventorySearch";

type Props = {
  endpoint?: string; // express route to hit, e.g. "/api/inventory"
  className?: string;
  refreshIntervalMs?: number | null; // optional polling
};

export default function InventoryGrid({
  endpoint = "/api/inventory",
  className,
  refreshIntervalMs = null,
}: Props) {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const data = (await res.json()) as Vehicle[] | { items: Vehicle[] };
        const resolved = Array.isArray(data) ? data : ("items" in data ? data.items : []);
        if (!aborted) setItems(resolved);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!aborted) setError(err.name === "AbortError" ? "Cancelled" : err.message || "Unknown error");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    load();
    let intervalId: number | undefined;
    if (refreshIntervalMs && refreshIntervalMs > 0) {
      intervalId = window.setInterval(load, refreshIntervalMs);
    }

    return () => {
      aborted = true;
      controller.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [endpoint, refreshIntervalMs]);

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
        v.trim || "",
        v.vin || "",
        v.stk || "",
        String(v.price || ""),
        String(v.mileage || ""),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, debouncedSearch]);

  if (loading) {
    return <div className={className}>Loading inventory…</div>;
  }
  if (error) {
    return <div className={className}>Error: {error}</div>;
  }

  if (items.length === 0) {
    return <div className={className}>No items found.</div>;
  }

  return (
    <div className={className}>
      <div className="container mx-auto px-4">
        <InventorySearch
          search={search}
          onSearchChange={setSearch}
          onClear={() => setSearch("")}
          resultsCount={filteredItems.length}
          totalCount={items.length}
        />

        {filteredItems.length === 0 ? (
          <div className="text-gray-400">No matching items.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((v) => (
              <InventoryCard key={v.stk || v.vin} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


