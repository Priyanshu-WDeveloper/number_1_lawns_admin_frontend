import {
  Calendar,
  Ellipsis,
  Eye,
  Pencil,
  Power,
  PowerOff,
} from 'lucide-react';

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
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
  useToggleEmployeeStatusMutation,
  useDeleteEmployeeValidityMutation,
} from '@/API/api';
import type { ListQueryParams } from '@/types/common.types';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import { AvatarCell } from '@/components/data-table/avatar-cell';
import { StatusBadge } from '@/components/data-table/status-badge';
import { STATUS_CONFIG } from '@/constants/status-config';
import type { IEmployee } from '@/types';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { EmployeeValidityDialog } from '@/components/admin/employee-validity-dialog';

import { getErrorMessage } from '@/lib/get-error-message';

export default function EmployeeManagementPage() {
  const navigate = useNavigate();
  const [_deleteEmployee] = useDeleteEmployeeMutation();
  const [toggleEmployeeStatus] = useToggleEmployeeStatusMutation();
  const [deleteEmployeeValidity] =
    useDeleteEmployeeValidityMutation();
  const [validityEmployee, setValidityEmployee] =
    useState<IEmployee | null>(null);

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
    defaultLimit: 8,
    mapStatusToApi: (status) =>
      status.toLowerCase() as 'active' | 'inactive' | 'expired',
  });

  const { data: apiEmployees, isLoading } = useGetEmployeesQuery(
    queryParams,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const allEmployees = apiEmployees?.employees ?? [];

  const handleStatusChange = async (
    id: string,
    status: 'active' | 'inactive',
  ) => {
    try {
      await toggleEmployeeStatus({ id, status }).unwrap();
      toast.success(`Employee set to ${status}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    }
  };

  const employeeColumns: ColumnDef<IEmployee>[] = [
    {
      accessorKey: 'employeeId',
      header: 'EmployeeId',
      cell: (row: IEmployee) => (
        <span className="text-[#6b7280]">{row.employeeId}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (row: IEmployee) => (
        <AvatarCell
          name={row.fullName}
          email={row.email}
          profileImage={row.profileImage}
        />
      ),
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      sortable: true,
      cell: (row: IEmployee) => (
        <span className="text-[#6b7280]">
          {row.countryCode} {row.phoneNumber}
        </span>
      ),
    },

    // {
    //   accessorKey: 'balance',
    //   header: 'Balance',
    //   cell: (row: IEmployee) => (
    //     <span
    //       className={
    //         row.balance < 0 ? 'text-red-500' : 'text-green-600'
    //       }
    //     >
    //       ${row.balance.toFixed(2)}
    //     </span>
    //   ),
    // },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row: IEmployee) => (
        <StatusBadge
          status={row.status}
          config={STATUS_CONFIG.employee}
        />
      ),
    },
    // {
    //   accessorKey: 'validity',
    //   header: 'Validity',
    //   cell: (row: IEmployee) => {
    //     if (row.validity) {
    //       return (
    //         <StatusBadge
    //           status="valid"
    //           config={validityConfig}
    //           label={format(new Date(row.validity), 'MMM d, yyyy')}
    //         />
    //       );
    //     }
    //     return (
    //       <StatusBadge status="notSet" config={validityConfig} />
    //     );
    //   },
    // },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IEmployee) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(
                ROUTES.EMPLOYEES_VIEW.replace(':id', row._id),
                {
                  state: { employee: row },
                },
              )
            }
          />
          <ActionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(
                ROUTES.EMPLOYEES_EDIT.replace(':id', row._id),
                {
                  state: { employee: row },
                },
              )
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
                  className="text-green-600 focus:text-green-600"
                  onClick={() =>
                    handleStatusChange(row._id, 'active')
                  }
                >
                  <Power className="mr-2 h-4 w-4 text-green-600 focus:text-green-600" />
                  Set Active
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setValidityEmployee(row)}
                className="truncate"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {row.validity ? 'Change Validity' : 'Set Validity'}
              </DropdownMenuItem>
              {row.validity && (
                <DropdownMenuItem
                  onClick={async () => {
                    await deleteEmployeeValidity(row._id).unwrap();
                    toast.success('Validity removed');
                  }}
                  className="text-red-500 focus:text-red-500 truncate"
                >
                  <PowerOff className="mr-2 h-4 w-4" />
                  Remove Validity
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
        <div className="flex-1 w-full px-5 py-4 min-h-0 flex flex-col">
          <div className="flex flex-1 w-full flex-col">
            <Navbar
              title="Employee Management"
              subtitle="Manage your employees and view their details."
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <DataTable<IEmployee>
                data={allEmployees}
                loading={isLoading}
                columns={employeeColumns}
                title=""
                description=""
                searchPlaceholder="Search employees by name, email or phone..."
                filterField="status"
                filterOptions={['Active', 'Inactive']}
                addButtonLabel="Add Employee"
                onAddClick={() => navigate(ROUTES.EMPLOYEES_CREATE)}
                searchValue={search}
                onSearchChange={setSearch}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                sortValue={sort}
                onSortChange={setSort}
                serverSideFiltering
                serverSideSorting
                pagination={
                  apiEmployees
                    ? {
                        page: apiEmployees.page,
                        limit: apiEmployees.limit,
                        total: apiEmployees.total,
                        totalPages: apiEmployees.totalPages,
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
      {validityEmployee && (
        <EmployeeValidityDialog
          employee={validityEmployee}
          open={!!validityEmployee}
          onOpenChange={(open) => {
            if (!open) setValidityEmployee(null);
          }}
        />
      )}
    </AppLayout>
  );
}
