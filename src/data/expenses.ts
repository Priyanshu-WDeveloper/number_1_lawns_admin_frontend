import { useMemo } from 'react';
import {
  useGetExpensesQuery as useGetExpensesQueryApi,
  useCreateExpenseMutation as useCreateExpenseMutationApi,
  useUpdateExpenseMutation as useUpdateExpenseMutationApi,
  useDeleteExpenseMutation as useDeleteExpenseMutationApi,
  useToggleExpenseStatusMutation as useToggleExpenseStatusMutationApi,
  useGetExpenseByIdQuery as useGetExpenseByIdQueryApi,
  useUploadDocumentMutation as useUploadDocumentMutationApi,
} from '@/API/api';
import type { IExpense } from '@/types';

export interface ExpensesData {
  expenses: IExpense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useGetExpensesQuery(params: {
  page?: number;
  limit?: number;
  search?: string;
  isDeleted?: boolean | undefined;
}) {
  const { page = 1, limit = 12, search, isDeleted } = params;

  const result = useGetExpensesQueryApi({
    page,
    limit,
    search,
    status: isDeleted !== undefined ? (isDeleted ? 'inactive' : 'active') : undefined,
  });

  const data = useMemo(() => {
    if (!result.data) return null;
    return {
      expenses: result.data.expenses,
      total: result.data.total,
      page: result.data.page,
      limit: result.data.limit,
      totalPages: result.data.totalPages,
    } satisfies ExpensesData;
  }, [result.data]);

  return { data, isLoading: result.isLoading, isFetching: result.isFetching };
}

export function useCreateExpenseMutation() {
  const [mutate] = useCreateExpenseMutationApi();
  return [mutate] as const;
}

export function useUpdateExpenseMutation() {
  const [mutate] = useUpdateExpenseMutationApi();
  return [mutate] as const;
}

export function useDeleteExpenseMutation() {
  const [mutate] = useDeleteExpenseMutationApi();
  return [mutate] as const;
}

export function useToggleExpenseStatusMutation() {
  const [mutate] = useToggleExpenseStatusMutationApi();
  return [mutate] as const;
}

export function useGetExpenseByIdQuery(
  id: string,
  options?: { skip?: boolean },
) {
  return useGetExpenseByIdQueryApi(id, options);
}

export { useUploadDocumentMutationApi as useUploadDocumentMutation };