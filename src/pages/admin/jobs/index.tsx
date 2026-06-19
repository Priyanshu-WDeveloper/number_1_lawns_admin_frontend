import { useState } from 'react';
import {
  Ellipsis,
  Eye,
  Pencil,
  Ban,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

import type { ColumnDef } from '@/components/data-table/data-table';
import DataTable from '@/components/data-table/data-table';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useGetJobsQuery,
  useCancelJobMutation,
  useDeleteJobMutation,
} from '@/API/api';
import { StatusBadge } from '@/components/data-table/status-badge';
import { STATUS_CONFIG } from '@/constants/status-config';
import { formatDate } from '@/lib/format-date';
import { getErrorMessage } from '@/lib/get-error-message';
import { getBaseUrl } from '@/lib/config';
import { getToken } from '@/lib/auth';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import { useResponsiveLimit } from '@/hooks/use-responsive-limit';
import type { IJob } from '@/types';
import type { ListQueryParams } from '@/types/api.types';

export default function JobManagementPage() {
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
    defaultLimit: useResponsiveLimit(),
    defaultStatus: 'pending',
    mapStatusToApi: (status) =>
      status.toLowerCase().replace(' ', '-') as
        | 'pending'
        | 'in-progress'
        | 'completed'
        | 'cancelled',
  });

  const { data: apiData, isLoading } = useGetJobsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [cancelJob] = useCancelJobMutation();
  const [deleteJob] = useDeleteJobMutation();

  const [confirmAction, setConfirmAction] = useState<{
    type: 'cancel' | 'delete';
    jobId: string;
  } | null>(null);

  const jobs = apiData?.jobs ?? [];
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
      await cancelJob({ jobId: id }).unwrap();
      toast.success('Job cancelled successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel job'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJob(id).unwrap();
      toast.success('Job deleted successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete job'));
    }
  };

  const jobColumns: ColumnDef<IJob>[] = [
    // {
    //   accessorKey: 'customerId',
    //   header: 'Customer',
    //   cell: (row: IJob) => {
    //     const image = getCustomerProfileImage(row.customerId);
    //     const name = getCustomerName(row.customerId);
    //     const initial = name ? name.charAt(0).toUpperCase() : '?';
    //     const hue = name ? (name.charCodeAt(0) * 137.5) % 360 : 0;

    //     return (
    //       <div className="flex items-center gap-3">
    //         {image ? (
    //           <img
    //             src={image}
    //             alt={name}
    //             className="h-7 w-7 rounded-full object-cover"
    //           />
    //         ) : (
    //           <div
    //             className="h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold"
    //             style={{
    //               backgroundColor: `hsl(${hue}, 60%, 90%)`,
    //               color: `hsl(${hue}, 60%, 35%)`,
    //             }}
    //           >
    //             {initial}
    //           </div>
    //         )}
    //         <span className="font-medium text-[#151515]">{name}</span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   accessorKey: 'employeeId',
    //   header: 'Employee',
    //   cell: (row: IJob) => {
    //     const image = getEmployeeProfileImage(row.employeeId);
    //     const name = getEmployeeName(row.employeeId);
    //     const code = getEmployeeCode(row.employeeId);
    //     const initial = name ? name.charAt(0).toUpperCase() : '?';
    //     const hue = name ? (name.charCodeAt(0) * 137.5) % 360 : 0;

    //     return (
    //       <div className="flex items-center gap-3">
    //         {image ? (
    //           <img
    //             src={image}
    //             alt={name}
    //             className="h-7 w-7 rounded-full object-cover"
    //           />
    //         ) : (
    //           <div
    //             className="h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold"
    //             style={{
    //               backgroundColor: `hsl(${hue}, 60%, 90%)`,
    //               color: `hsl(${hue}, 60%, 35%)`,
    //             }}
    //           >
    //             {initial}
    //           </div>
    //         )}
    //         <div>
    //           <span className="font-medium text-[#151515]">
    //             {name}
    //           </span>
    //           <p className="text-xs text-[#6b7280]">{code}</p>
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: 'jobId',
      header: 'JobId',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">{row.jobId}</span>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]" title={row.address || ''}>
          {row.address ? (row.address.length > 50 ? `${row.address.slice(0, 50)}...` : row.address) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">
          {formatDate(row.jobDate || '')}
        </span>
      ),
    },
    {
      accessorKey: 'paymentType',
      header: 'Payment Type',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">{row.paymentType}</span>
      ),
    },

    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row: IJob) => (
        <StatusBadge
          status={row.status ?? ''}
          config={STATUS_CONFIG.job}
        />
      ),
    },

    {
      accessorKey: 'jobType',
      header: 'Job Type',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">
          {row.jobType
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">
          {typeof row.adminId === 'object' && row.adminId
            ? `${row.adminId.firstName} ${row.adminId.lastName}`
            : row.adminId || '-'}
        </span>
      ),
    },

    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IJob) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              navigate(ROUTES.JOBS_VIEW_MANAGE.replace(':id', row._id ?? ''))
            }
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-[#f5f5f5] text-[#374151] hover:bg-[#e5e5e5] transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          {row._id && row.status === 'completed' && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const token = getToken();
                  const res = await fetch(
                    `${getBaseUrl()}/jobs/${row._id}/receipt`,
                    {
                      headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                    },
                  );
                  if (!res.ok) {
                    toast.error('Failed to load receipt');
                    return;
                  }
                  const blob = await res.blob();
                  window.open(URL.createObjectURL(blob), '_blank');
                } catch {
                  toast.error('Failed to load receipt');
                }
              }}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-white text-primary border border-primary hover:bg-primary/5 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Receipt
            </button>
          )}
          {row.status !== 'completed' && row.status !== 'cancelled' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#6b7280] hover:bg-[#f5f5f5] transition-colors"
                >
                  <Ellipsis className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      ROUTES.JOBS_EDIT.replace(':id', row._id ?? ''),
                    )
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.success('Reschedule coming soon')
                  }
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Reschedule</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toast.success('Assign employee coming soon')
                  }
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Assign Employee</span>
                </DropdownMenuItem>
          {row.status === 'pending' && row.jobType === 'one_time' && (
                  <>
                    <DropdownMenuSeparator />
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
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
              title="Job Management"
              subtitle="Manage your jobs and view their details."
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <DataTable<IJob>
                data={jobs}
                loading={isLoading}
                columns={jobColumns}
                title=""
                description=""
                searchPlaceholder="Search jobs by customer, employee or address..."
                searchValue={search}
                onSearchChange={setSearch}
                filterField="status"
                filterOptions={['Pending', 'Completed', 'Cancelled']}
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
        title="Cancel Job"
        description="Are you sure you want to cancel this job? This action cannot be undone."
        confirmText="Cancel Job"
        onConfirm={async () => {
          if (confirmAction) await handleCancel(confirmAction.jobId);
          setConfirmAction(null);
        }}
      />
      <ConfirmDialog
        open={confirmAction?.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Delete Job"
        description="Are you sure you want to delete this job? This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (confirmAction) await handleDelete(confirmAction.jobId);
          setConfirmAction(null);
        }}
      />
    </AppLayout>
  );
}
