import { useEffect, useMemo, useState } from 'react';
import { Group, NativeSelect, Pagination, Text } from '@mantine/core';
import type { Vehicle } from '../../types';
import InventoryCard from './InventoryCard';

type Props = {
  items: Vehicle[];
};

export default function InventoryGrid({ items }: Props) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);

  useEffect(() => {
    setPage(1);
  }, [items.length, perPage]);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  return (
    <div className="container mx-auto pt-6 pb-10">
      {items.length === 0 ? (
        <div className="text-gray-400">No matching items.</div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {pagedItems.map((v) => (
              <InventoryCard key={v.stk} vehicle={v} />
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-2 pt-0.5 pb-0">
            <div className="flex flex-col items-start gap-1">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                boundaries={1}
                siblings={1}
                size="sm"
              />
              <Text size="xs" c="dimmed">
                Page {page} of {totalPages}
              </Text>
            </div>
            <Group gap="xs" align="flex-end">
              <NativeSelect
                size="sm"
                label=""
                description="Per page"
                w={90}
                data={['12', '24', '48', '96']}
                value={String(perPage)}
                onChange={(event) => setPerPage(Number(event.currentTarget.value))}
              />
            </Group>
          </div>
        </div>
      )}
    </div>
  );
}
