import { Card } from '@mantine/core';
import type { Vehicle } from '../../types';

export default function InventoryCard({ vehicle }: { vehicle: Vehicle }) {
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim();
  const metaText = 'text-xs text-gray-400';

  return (
    <Card p={0}>
      <a
        href={vehicle.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none"
      >
        <div className="w-full h-44 sm:h-48 bg-gray-800/40 flex items-center justify-center overflow-hidden relative">
          {vehicle.image ? (
            <img src={vehicle.image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-sm text-gray-300">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
        </div>
      </a>

      <div className="p-3 sm:p-4">
        <h3 className="text-sm font-semibold text-white truncate" title={title}>
          {title}
        </h3>

        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-lg font-bold text-emerald-300">{vehicle.price}</span>
          <span className="text-sm text-gray-300">{vehicle.mileage}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className={metaText + ' truncate'}>
            VIN: <span className="text-gray-300">{vehicle.vin || '—'}</span>
          </div>
          <div className={metaText + ' truncate'}>
            STK: <span className="text-gray-300">{vehicle.stk || '—'}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <a
            href={vehicle.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-300 hover:text-indigo-200 hover:underline"
          >
            View listing
          </a>
          <span className="text-xs text-gray-400">{vehicle.source.toUpperCase()}</span>
        </div>
      </div>
    </Card>
  );
}
