import { useState } from 'react';
import { AspectRatio, Image, Paper, Title } from '@mantine/core';
import { IconPhotoOff } from '@tabler/icons-react';
import type { Vehicle } from '../../types';

// Best-effort detection of dealer "no photo" placeholder images so we render our
// own consistent tile instead of a foreign "PHOTOS COMING SOON" graphic.
// Tunable — extend once we capture a real placeholder URL.
const PLACEHOLDER_HINTS = [
  'coming-soon',
  'comingsoon',
  'coming_soon',
  'photos-coming',
  'placeholder',
  'no-photo',
  'nophoto',
  'no-image',
  'noimage',
];

function isLikelyPlaceholder(url: string): boolean {
  const u = url.toLowerCase();
  return PLACEHOLDER_HINTS.some((hint) => u.includes(hint));
}

export default function InventoryCard({ vehicle }: { vehicle: Vehicle }) {
  const [imgError, setImgError] = useState(false);

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim();
  const fullName = `${title} ${vehicle.trim || ''}`.trim();
  const spec = [vehicle.mileage, vehicle.trim, vehicle.fuel].filter(Boolean).join(' · ');
  const hasPhoto = !!vehicle.image && !imgError && !isLikelyPlaceholder(vehicle.image);

  return (
    <Paper p={0} withBorder bg="dark">
      <a
        href={vehicle.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View listing for ${fullName}`}
        className="block rounded-t focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <div className="relative overflow-hidden rounded-t">
          <AspectRatio ratio={16 / 10}>
            {hasPhoto ? (
              <Image
                src={vehicle.image}
                alt={fullName}
                fit="cover"
                h="100%"
                w="100%"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-1 bg-gray-800/60 text-gray-500"
                aria-hidden="true"
              >
                <IconPhotoOff size={28} stroke={1.5} />
                <span className="text-xs">No photo available</span>
              </div>
            )}
          </AspectRatio>

          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            {vehicle.source.toUpperCase()}
          </span>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>
      </a>

      <div className="p-2 sm:p-3">
        <Title order={5} className="line-clamp-2">
          {title}
        </Title>

        <div className="mt-1">
          <span className="text-lg font-bold text-emerald-300">{vehicle.price}</span>
        </div>

        <div className="mt-0.5 truncate text-sm text-gray-300">{spec}</div>

        <div className="mt-2 truncate text-xs text-gray-400">
          VIN {vehicle.vin || '—'} · STK {vehicle.stk || '—'}
        </div>

        <a
          href={vehicle.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View listing for ${fullName}`}
          className="mt-2 inline-block rounded text-sm text-indigo-300 hover:text-indigo-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          View listing
        </a>
      </div>
    </Paper>
  );
}
