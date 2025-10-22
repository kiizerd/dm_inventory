import type { Vehicle } from '../../types';

export default function InventoryCard({ vehicle }: { vehicle: Vehicle }) {
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim();
  return (
    <article className="rounded-lg overflow-hidden border border-gray-700 bg-gradient-to-b from-gray-900/60 to-gray-900/50 shadow-sm hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-indigo-500">
      <a
        href={vehicle.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <div className="w-full h-48 bg-gray-800/40 flex items-center justify-center overflow-hidden relative">
          {vehicle.image ? (
            <img src={vehicle.image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-sm text-gray-300">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
        </div>
      </a>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white truncate" title={title}>
          {title}
        </h3>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-lg font-bold text-emerald-300">{vehicle.price}</span>
          <span className="text-sm text-gray-300">{vehicle.mileage}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span className="truncate">
            VIN: <span className="text-gray-300">{vehicle.vin || '—'}</span>
          </span>
          <span className="truncate">
            STK: <span className="text-gray-300">{vehicle.stk || '—'}</span>
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <a
            href={vehicle.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-300 hover:text-indigo-200 hover:underline focus:outline-none"
          >
            View listing
          </a>
          <span className="text-xs text-gray-400">{vehicle.make}</span>
        </div>
      </div>
    </article>
  );
}
