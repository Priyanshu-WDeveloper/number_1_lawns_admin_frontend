import { useMemo } from 'react';
import { useDataTableState } from './use-data-table-state';
import { mapSortToApi } from '@/lib/map-sort-to-api';

interface UseDataTableQueryParamsOptions<TParams extends Record<string, unknown>> {
  defaultLimit?: number;
  debounceMs?: number;
  defaultStatus?: string;
  defaultSort?: string;
  mapStatusToApi?: (
    statusValue: string,
  ) => TParams['status'] extends string | undefined
    ? TParams['status']
    : undefined;
}

interface UseDataTableQueryParamsReturn<TParams> {
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
  queryParams: TParams;
}

export function useDataTableQueryParams<TParams extends Record<string, unknown>>(
  options: UseDataTableQueryParamsOptions<TParams> = {},
): UseDataTableQueryParamsReturn<TParams> {
  const { defaultLimit, debounceMs, mapStatusToApi, defaultStatus, defaultSort } = options;

  const state = useDataTableState({ defaultLimit, debounceMs, defaultStatus, defaultSort });

  const queryParams = useMemo(() => {
    const params = {
      page: state.page,
      limit: state.limit,
      search: state.debouncedSearch || undefined,
      sort: mapSortToApi(state.sort),
    } as Record<string, unknown>;

    if (mapStatusToApi && state.statusFilter !== 'All') {
      params.status = mapStatusToApi(state.statusFilter);
    }

    return params as TParams;
  }, [
    state.page,
    state.limit,
    state.debouncedSearch,
    state.statusFilter,
    state.sort,
    mapStatusToApi,
  ]);

  return {
    ...state,
    queryParams,
  };
}
