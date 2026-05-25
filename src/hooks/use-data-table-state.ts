import { useState, useEffect } from 'react';
import { useDebounce } from './use-debounce';

interface UseDataTableStateOptions {
  defaultLimit?: number;
  debounceMs?: number;
  defaultStatus?: string;
}

interface UseDataTableStateReturn {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  search: string;
  setSearch: (search: string) => void;
  debouncedSearch: string;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sort: string;
  setSort: (sort: string) => void;
}

export function useDataTableState(
  options: UseDataTableStateOptions = {},
): UseDataTableStateReturn {
  const { defaultLimit = 10, debounceMs = 300 } = options;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(options.defaultStatus ?? 'All');
  const [sort, setSort] = useState<string>('createdAt');

  const debouncedSearch = useDebounce(search, debounceMs);

  // Reset page when search/filter/sort changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sort]);

  return {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
  };
}
