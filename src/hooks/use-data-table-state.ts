import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './use-debounce';

interface UseDataTableStateOptions {
  defaultLimit?: number;
  debounceMs?: number;
  defaultStatus?: string;
  defaultSort?: string;
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
  const defaultSort = options.defaultSort ?? 'createdAt';
  const defaultStatus = options.defaultStatus ?? 'All';

  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || String(defaultLimit), 10);
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || defaultStatus;
  const sort = searchParams.get('sort') || defaultSort;

  const debouncedSearch = useDebounce(search, debounceMs);

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === '') {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (p: number) => {
      setParams({ page: p > 1 ? String(p) : undefined });
    },
    [setParams],
  );

  const setLimit = useCallback(
    (l: number) => {
      setParams({ limit: l !== defaultLimit ? String(l) : undefined });
    },
    [setParams, defaultLimit],
  );

  const setSearch = useCallback(
    (s: string) => {
      setParams({ search: s || undefined });
    },
    [setParams],
  );

  const setStatusFilter = useCallback(
    (s: string) => {
      setParams({
        status: s !== defaultStatus ? s : undefined,
        page: undefined,
      });
    },
    [setParams, defaultStatus],
  );

  const setSort = useCallback(
    (s: string) => {
      setParams({
        sort: s !== defaultSort ? s : undefined,
        page: undefined,
      });
    },
    [setParams, defaultSort],
  );

  useEffect(() => {
    setParams({ page: undefined });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

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
