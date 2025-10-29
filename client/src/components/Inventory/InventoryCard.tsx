import { Image, Title, Paper } from '@mantine/core';
import type { Vehicle } from '../../types';

export default function InventoryCard({ vehicle }: { vehicle: Vehicle }) {
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim();
  const metaText = 'text-xs text-gray-400';

  return (
    <div>
      <Paper p={0} withBorder bg="dark">
        <a
          href={vehicle.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus:outline-none"
        >
          <div className="w-full h-44 sm:h-50 bg-gray-800/40 overflow-hidden relative rounded-t">
            <Image src={vehicle.image} alt={title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
          </div>
        </a>

        <div className="p-2 sm:p-3">
          <Title order={6}>{title}</Title>

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
      </Paper>
    </div>
  );
}
