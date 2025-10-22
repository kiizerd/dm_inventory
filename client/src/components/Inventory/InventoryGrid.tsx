import type { Vehicle } from '../../types';
import InventoryCard from './InventoryCard';

type Props = {
  items: Vehicle[];
};

export default function InventoryGrid({ items }: Props) {
  // const [items, setItems] = useState<Vehicle[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   let aborted = false;
  //   const controller = new AbortController();

  //   async function load() {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await fetch('/api/inventory', { signal: controller.signal });
  //       if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  //       const data = (await res.json()) as Vehicle[] | { items: Vehicle[] };
  //       const resolved = Array.isArray(data) ? data : 'items' in data ? data.items : [];
  //       if (!aborted) setItems(resolved);
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     } catch (err: any) {
  //       if (!aborted)
  //         setError(err.name === 'AbortError' ? 'Cancelled' : err.message || 'Unknown error');
  //     } finally {
  //       if (!aborted) setLoading(false);
  //     }
  //   }

  //   load();
  //   let intervalId: number | undefined;
  //   if (refreshIntervalMs && refreshIntervalMs > 0) {
  //     intervalId = window.setInterval(load, refreshIntervalMs);
  //   }

  //   return () => {
  //     aborted = true;
  //     controller.abort();
  //     if (intervalId) clearInterval(intervalId);
  //   };
  // }, [refreshIntervalMs]);

  return (
    <div>
      <div className="container mx-auto p-6">
        {items.length === 0 ? (
          <div className="text-gray-400">No matching items.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((v) => (
              <InventoryCard key={v.stk || v.vin} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
