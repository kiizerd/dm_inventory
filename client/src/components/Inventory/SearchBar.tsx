import type { ChangeEvent } from 'react';

type Props = {
  search: string;
  onSearchChange: (s: string) => void;
  onClear?: () => void;
  resultsCount?: number;
  totalCount?: number;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  search,
  onSearchChange,
  onClear,
  resultsCount,
  totalCount,
  placeholder = 'Search by year, make, model, VIN, STK, price...',
  className,
}: Props) {
  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-auto">
          <label htmlFor="inventory-search" className="sr-only">
            Search inventory
          </label>
          <div className="relative">
            <input
              id="inventory-search"
              type="search"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className="w-full sm:w-96 bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {search && (
              <button
                onClick={onClear}
                aria-label="Clear search"
                className="absolute text-xs right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 px-2 py-px"
                type="button"
              >
                {/* × */}X
              </button>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-300">
          {typeof resultsCount === 'number' && typeof totalCount === 'number'
            ? `${resultsCount} / ${totalCount} results`
            : ''}
        </div>
      </div>
    </div>
  );
}
