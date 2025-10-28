import type { Vehicle } from '../../types';
import InventoryCard from './InventoryCard';

type Props = {
  items: Vehicle[];
};

export default function InventoryGrid({ items }: Props) {
  return (
    <div>
      <div className="container mx-auto pt-6">
        {items.length === 0 ? (
          <div className="text-gray-400">No matching items.</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {items.map((v) => (
              <InventoryCard key={v.stk} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
