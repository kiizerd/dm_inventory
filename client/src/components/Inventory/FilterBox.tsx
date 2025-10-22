export default function FilterBox() {
  return (
    <div className="bg-gray-900/40 border border-gray-700 rounded p-4 space-y-4">
      <h2 className="text-base font-semibold text-gray-100">Filters</h2>

      {/* Year */}
      <div>
        <label className="block text-sm text-gray-300">Year</label>
        <select className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-2 text-sm">
          <option className="bg-gray-900 text-gray-100">All</option>
          <option className="bg-gray-900 text-gray-100">2025</option>
          <option className="bg-gray-900 text-gray-100">2024</option>
        </select>
      </div>

      {/* Make */}
      <div>
        <label className="block text-sm text-gray-300">Make</label>
        <select className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-2 text-sm">
          <option className="bg-gray-900 text-gray-100">All</option>
          <option className="bg-gray-900 text-gray-100">Ford</option>
          <option className="bg-gray-900 text-gray-100">Chevrolet</option>
        </select>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm text-gray-300">Model</label>
        <select className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-2 text-sm">
          <option className="bg-gray-900 text-gray-100">All</option>
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm text-gray-300">Price</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-24 rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-24 rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Mileage */}
      <div>
        <label className="block text-sm text-gray-300">Mileage</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-24 rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-24 rounded-md border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
