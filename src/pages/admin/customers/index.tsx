import { Ellipsis, Eye, Pencil, Power, PowerOff } from 'lucide-react';

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
  useGetCustomersQuery,
  useToggleCustomerStatusMutation,
} from '@/API/api';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import type { GetCustomersParams } from '@/types/api.types';
import type { ICustomer } from '@/types';
import { StatusBadge } from '@/components/data-table/status-badge';
import { AvatarCell } from '@/components/data-table/avatar-cell';
import { formatDate } from '@/lib/format-date';
import { STATUS_CONFIG } from '@/constants/status-config';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';

export default function CustomerManagementPage() {
  const navigate = useNavigate();
  const [toggleCustomerStatus] = useToggleCustomerStatusMutation();

  const {
    page: _page,
    setPage,
    limit: _limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch: _debouncedSearch,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
    queryParams,
  } = useDataTableQueryParams<GetCustomersParams>({
    defaultLimit: 8,
    mapStatusToApi: (status) =>
      status.toLowerCase() as 'active' | 'inactive' | 'expired',
  });

  const { data, isLoading } = useGetCustomersQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });
  const handleStatusChange = async (
    id: string,
    status: 'active' | 'inactive',
  ) => {
    try {
      await toggleCustomerStatus({ id, status }).unwrap();
      toast.success(`Customer set to ${status}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    }
  };

  const customerColumns: ColumnDef<ICustomer>[] = [
    {
      accessorKey: 'customerId',
      header: 'Customer Id',
      sortable: true,
      cell: (row: ICustomer) => (
        <span className="text-[#6b7280]">{row.customerId}</span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Name',
      sortable: true,
      cell: (row: ICustomer) => (
        <AvatarCell
          profileImage={row.profileImage}
          name={row.fullName}
          email={row.email}
        />
      ),
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      sortable: true,
      cell: (row: ICustomer) => (
        <span className="text-[#6b7280]">
          {row.countryCode} {row.phoneNumber}
        </span>
      ),
    },
    {
      accessorKey: 'city',
      header: 'City',
      sortable: true,
      cell: (row: ICustomer) => (
        <span className="text-[#6b7280]">{row.city || '-'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row: ICustomer) => (
        <StatusBadge
          status={row.status}
          config={STATUS_CONFIG.customer}
        />
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: (row: ICustomer) => (
        <span
            className={
              (row.balance ?? 0) < 0 ? 'text-red-500' : 'text-primary'
            }
          >
            ${(row.balance ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      sortable: true,
      cell: (row: ICustomer) => (
        <span className="text-[#6b7280]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: ICustomer) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(ROUTES.CUSTOMERS_VIEW.replace(':id', row._id))
            }
          />
          <ActionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(ROUTES.CUSTOMERS_EDIT.replace(':id', row._id))
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
              {row.status === 'active' ? (
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() =>
                    handleStatusChange(row._id, 'inactive')
                  }
                >
                  <PowerOff className="mr-2 h-4 w-4 text-red-500 focus:text-red-500" />
                  Set Inactive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-primary focus:text-primary"
                  onClick={() =>
                    handleStatusChange(row._id, 'active')
                  }
                >
                  <Power className="mr-2 h-4 w-4 text-primary focus:text-primary" />
                  Set Active
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
              title="Customer Management"
              subtitle="Manage your customers and view their details."
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <DataTable<ICustomer>
                data={data?.customers ?? []}
                columns={customerColumns}
                loading={isLoading}
                title=""
                description=""
                searchPlaceholder="Search customers by name, email or phone..."
                filterField="status"
                filterOptions={['Active', 'Inactive', 'Expired']}
                addButtonLabel="Add Customer"
                onAddClick={() => navigate(ROUTES.CUSTOMERS_CREATE)}
                searchValue={search}
                onSearchChange={setSearch}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                sortValue={sort}
                onSortChange={setSort}
                serverSideFiltering
                serverSideSorting
                pagination={
                  data
                    ? {
                        page: data.page,
                        limit: data.limit,
                        total: data.total,
                        totalPages: data.totalPages,
                      }
                    : undefined
                }
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
