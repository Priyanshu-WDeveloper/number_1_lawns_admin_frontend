import { Ellipsis, Eye, Pencil, X, Check, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

import type { ColumnDef } from '@/components/data-table/data-table';
import DataTable, {
  ActionButton,
} from '@/components/data-table/data-table';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useGetJobsQuery,
  useCancelJobMutation,
  useCompleteJobMutation,
  useDeleteJobMutation,
} from '@/API/api';
import { StatusBadge } from '@/components/data-table/status-badge';
import { STATUS_CONFIG } from '@/constants/status-config';
import { formatDate } from '@/lib/format-date';
import { getErrorMessage } from '@/lib/get-error-message';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import type { IJob } from '@/types';
import type { ListQueryParams } from '@/types/api.types';

function getCustomerName(customer: IJob['customerId']): string {
  if (typeof customer === 'object' && customer) {
    return customer.fullName || `${customer.firstName} ${customer.lastName}`;
  }
  return (customer as string) || '-';
}

function getCustomerProfileImage(customer: IJob['customerId']): string {
  if (typeof customer === 'object' && customer) {
    return customer.profileImage || '';
  }
  return '';
}

function getEmployeeName(employee: IJob['employeeId']): string {
  if (typeof employee === 'object' && employee) {
    return employee.fullName || `${employee.firstName} ${employee.lastName}`;
  }
  return (employee as string) || '-';
}

function getEmployeeCode(employee: IJob['employeeId']): string {
  if (typeof employee === 'object' && employee && employee.employeeId) {
    return employee.employeeId;
  }
  return (typeof employee === 'string' ? employee : '') || '-';
}

function getEmployeeProfileImage(employee: IJob['employeeId']): string {
  if (typeof employee === 'object' && employee) {
    return employee.profileImage || '';
  }
  return '';
}

export default function JobManagementPage() {
  const navigate = useNavigate();

  const { setPage, setLimit, search, setSearch, statusFilter, setStatusFilter, sort, setSort, queryParams } =
    useDataTableQueryParams<ListQueryParams>({
      defaultLimit: 10,
      mapStatusToApi: (status) => status.toLowerCase().replace(' ', '-') as 'pending' | 'in-progress' | 'completed' | 'cancelled',
    });

  const { data: apiData, isLoading } = useGetJobsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [cancelJob] = useCancelJobMutation();
  const [completeJob] = useCompleteJobMutation();
  const [deleteJob] = useDeleteJobMutation();

  const jobs = apiData?.jobs ?? [];
  const pagination = apiData
    ? { page: apiData.page, limit: apiData.limit, total: apiData.total, totalPages: apiData.totalPages }
    : undefined;

  const handleCancel = async (id: string) => {
    try {
      await cancelJob({ jobId: id }).unwrap();
      toast.success('Job cancelled successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel job'));
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeJob({ jobId: id }).unwrap();
      toast.success('Job completed successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to complete job'));
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
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: (row: IJob) => {
        const image = getCustomerProfileImage(row.customerId);
        const name = getCustomerName(row.customerId);
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        const hue = name ? (name.charCodeAt(0) * 137.5) % 360 : 0;

        return (
          <div className="flex items-center gap-3">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `hsl(${hue}, 60%, 90%)`,
                  color: `hsl(${hue}, 60%, 35%)`,
                }}
              >
                {initial}
              </div>
            )}
            <span className="font-medium text-[#151515]">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'employeeId',
      header: 'Employee',
      cell: (row: IJob) => {
        const image = getEmployeeProfileImage(row.employeeId);
        const name = getEmployeeName(row.employeeId);
        const code = getEmployeeCode(row.employeeId);
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        const hue = name ? (name.charCodeAt(0) * 137.5) % 360 : 0;

        return (
          <div className="flex items-center gap-3">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `hsl(${hue}, 60%, 90%)`,
                  color: `hsl(${hue}, 60%, 35%)`,
                }}
              >
                {initial}
              </div>
            )}
            <div>
              <span className="font-medium text-[#151515]">{name}</span>
              <p className="text-xs text-[#6b7280]">{code}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">{row.address}</span>
      ),
    },
    {
      accessorKey: 'jobType',
      header: 'Job Type',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">
          {row.jobType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (row: IJob) => (
        <span className="text-[#6b7280]">{formatDate(row.date || row.jobDate || '')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row: IJob) => (
        <StatusBadge status={row.status ?? ''} config={STATUS_CONFIG.job} />
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IJob) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(ROUTES.JOBS_VIEW.replace(':id', row._id ?? ''))
            }
          />
            <ActionButton
              icon={<Pencil className="h-3.5 w-3.5" />}
              className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
              onClick={() =>
                navigate(ROUTES.JOBS_EDIT.replace(':id', row._id ?? ''))
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionButton
                icon={<Ellipsis className="h-3.5 w-3.5" />}
                className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {row.status === 'pending' && (
                <>
                  <DropdownMenuItem onClick={() => handleComplete(row._id ?? '')}>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <span>Complete</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCancel(row._id ?? '')}>
                    <Ban className="mr-2 h-4 w-4 text-red-500" />
                    <span>Cancel</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => handleDelete(row._id ?? '')}
              >
                <X className="mr-2 h-4 w-4" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 w-full px-5 py-4 min-h-0 flex flex-col">
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
                filterOptions={[
                  'Pending',
                  'In Progress',
                  'Completed',
                  'Cancelled',
                ]}
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
    </AppLayout>
  );
}
