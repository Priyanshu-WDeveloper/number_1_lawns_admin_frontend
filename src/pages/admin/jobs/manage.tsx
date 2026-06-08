import { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import type { ColumnDef } from '@/components/data-table/data-table';
import DataTable from '@/components/data-table/data-table';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
  useGetParentJobsQuery,
  useCancelParentJobMutation,
} from '@/API/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import type { IParentJob } from '@/types';
import type { ListQueryParams } from '@/types/api.types';

export default function ManageJobsPage() {
  const navigate = useNavigate();

  const {
    setPage,
    setLimit,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
    queryParams,
  } = useDataTableQueryParams<ListQueryParams>({
    defaultLimit: 10,
    defaultStatus: 'All',
    mapStatusToApi: (status) =>
      status === 'All'
        ? undefined
        : (status.toLowerCase().replace(' ', '_') as
            | 'one_time'
            | 'recurring'),
  });

  const queryParamsForApi = useMemo(() => {
    const { status, ...rest } = queryParams;
    return {
      ...rest,
      ...(status ? { jobType: status } : {}),
    } as ListQueryParams;
  }, [queryParams]);

  const { data: apiData, isLoading } = useGetParentJobsQuery(
    { ...queryParamsForApi, status: 'pending' },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [cancelParentJob] = useCancelParentJobMutation();

  const [confirmAction, setConfirmAction] = useState<{
    type: 'cancel';
    jobId: string;
  } | null>(null);

  const parentJobs = apiData?.jobs ?? [];
  const pagination = apiData
    ? {
        page: apiData.page,
        limit: apiData.limit,
        total: apiData.total,
        totalPages: apiData.totalPages,
      }
    : undefined;

  const handleCancel = async (id: string) => {
    try {
      await cancelParentJob(id).unwrap();
      toast.success('Parent job cancelled successfully');
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Failed to cancel parent job'),
      );
    }
  };

  const columns: ColumnDef<IParentJob>[] = [
    {
      accessorKey: 'jobId',
      header: 'JobId',
      cell: (row: IParentJob) => (
        <span className="text-[#6b7280]">{row.jobId}</span>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: (row: IParentJob) => (
        <span className="text-[#6b7280]">
          {/* {row.address || row.customerId?.address || '-'} */}
          {row.address ||
            (typeof row.customerId === 'object'
              ? row.customerId?.address
              : undefined) ||
            '-'}
        </span>
      ),
    },
    {
      accessorKey: 'jobType',
      header: 'Type',
      cell: (row: IParentJob) => (
        <span className="text-[#6b7280] capitalize">
          {row.jobType.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: (row: IParentJob) => (
        <span className="text-[#6b7280]">
          {row.jobType === 'recurring' &&
          row.frequencyValue &&
          row.frequencyUnit
            ? `Every ${row.frequencyValue} ${row.frequencyUnit}${row.frequencyValue > 1 ? 's' : ''}`
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'paymentType',
      header: 'Payment Type',
      cell: (row: IParentJob) => (
        <span className="text-[#6b7280] capitalize">
          {row.paymentType?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: (row: IParentJob) => (
        <span className="text-[#6b7280]">
          {row.price != null ? `$${row.price}` : '-'}
        </span>
      ),
    },
    // {
    //   accessorKey: 'status',
    //   header: 'Status',
    //   cell: (row: IParentJob) => (
    //     <StatusBadge
    //       status={row.status ?? ''}
    //       config={STATUS_CONFIG.job}
    //     />
    //   ),
    // },
    // {
    //   accessorKey: 'jobDate',
    //   header: 'Job Date',
    //   cell: (row: IParentJob) => (
    //     <span className="text-[#6b7280]">
    //       {formatDate(row.jobDate || '')}
    //     </span>
    //   ),
    // },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IParentJob) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              navigate(
                ROUTES.JOBS_VIEW_MANAGE.replace(':id', row._id ?? ''),
              )
            }
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-[#f5f5f5] text-[#374151] hover:bg-[#e5e5e5] transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#6b7280] hover:bg-[#f5f5f5] transition-colors"
              >
                <Ellipsis className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {row.status === 'pending' && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmAction({
                        type: 'cancel',
                        jobId: row._id ?? '',
                      })
                    }
                  >
                    <Ban className="mr-2 h-4 w-4 text-red-500" />
                    <span>Cancel Job</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 w-full px-2 sm:px-5 py-1 sm:py-4 min-h-0 flex flex-col">
          <div className="flex w-full flex-col flex-1">
            <Navbar
              title="Manage Jobs"
              subtitle="View and manage recurring parent jobs."
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <DataTable<IParentJob>
                data={parentJobs}
                loading={isLoading}
                columns={columns}
                title=""
                description=""
                searchPlaceholder="Search parent jobs..."
                searchValue={search}
                onSearchChange={setSearch}
                filterField="jobType"
                filterOptions={['One Time', 'Recurring']}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                serverSideFiltering
                sortValue={sort}
                onSortChange={setSort}
                serverSideSorting
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                addButtonLabel="Add Job"
                onAddClick={() => navigate(ROUTES.JOBS_CREATE)}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction?.type === 'cancel'}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Cancel Parent Job"
        description="Are you sure you want to cancel this parent job? This will also cancel all scheduled child jobs."
        confirmText="Cancel Job"
        onConfirm={async () => {
          if (confirmAction) {
            await handleCancel(confirmAction.jobId);
          }
          setConfirmAction(null);
        }}
      />
    </AppLayout>
  );
}
