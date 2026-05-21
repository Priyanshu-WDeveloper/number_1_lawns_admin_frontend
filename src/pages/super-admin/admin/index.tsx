import { SuperAdminLayout } from '@/components/layout/super-layout';
import { Navbar } from '@/components/layout/navbar';
import { Calendar, Eye, Pencil, Ellipsis, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable, {
  ActionButton,
  type ColumnDef,
} from '../../../components/data-table/data-table';
import type { IAdmins } from '../../../types/admins.types';
import toast from 'react-hot-toast';

import { getErrorMessage } from '@/lib/get-error-message';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { ROUTES } from '@/constants';
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminValidityMutation,
} from '../../../API/api';
import type { GetAdminsParams } from '../../../types/api.types';
import { useDataTableState } from '../../../hooks/use-data-table-state';
import { StatusBadge } from '../../../components/data-table/status-badge';
import { AvatarCell } from '../../../components/data-table/avatar-cell';
import { format } from 'date-fns';
import { useState } from 'react';
import { AdminValidityDialog } from '../../../components/admin/admin-validity-dialog';

const statusConfig: Record<string, { color: string; label: string }> =
  {
    active: { color: '#22c55e', label: 'Active' },
    inactive: { color: '#ef4444', label: 'Inactive' },
    suspended: { color: '#f59e0b', label: 'Suspended' },
  };

const validityConfig: Record<
  string,
  { color: string; label: string }
> = {
  valid: { color: '#22c55e', label: 'Valid' },
  notSet: { color: '#6b7280', label: 'Not set' },
};

const mapSortToApi = (sortValue: string): GetAdminsParams['sort'] => {
  if (
    sortValue === 'fullName' ||
    sortValue === 'adminId' ||
    sortValue === 'phoneNumber'
  )
    return 'a_z';
  if (
    sortValue === 'fullName_desc' ||
    sortValue === 'adminId_desc' ||
    sortValue === 'phoneNumber_desc'
  )
    return 'z_a';
  if (sortValue === 'createdAt' || sortValue === 'updatedAt')
    return 'newest';
  if (
    sortValue === 'createdAt_desc' ||
    sortValue === 'updatedAt_desc'
  )
    return 'oldest';
  return 'newest';
};

const SuperAdminAdminsPage = () => {
  const navigate = useNavigate();
  const [updateAdminUser] = useUpdateAdminUserMutation();
  const [deleteAdminValidity] = useDeleteAdminValidityMutation();
  const [validityAdmin, setValidityAdmin] = useState<IAdmins | null>(
    null,
  );

  const {
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
  } = useDataTableState({ defaultLimit: 8 });

  const { data, isLoading } = useGetAdminUsersQuery(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
      status: statusFilter === 'All' ? undefined : statusFilter,
      sort: mapSortToApi(sort),
    },
    { refetchOnMountOrArgChange: true },
  );

  const handleStatusChange = async (
    id: string,
    status: 'active' | 'inactive',
  ) => {
    try {
      await updateAdminUser({ id, status }).unwrap();
      toast.success(`Admin set to ${status}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    }
  };

  const adminsColumns: ColumnDef<IAdmins>[] = [
    {
      accessorKey: 'adminId',
      header: 'Admin ID',
      sortable: true,
      cell: (row: IAdmins) => (
        <span className="text-[#6b7280]">{row.adminId}</span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Name',
      sortable: true,
      cell: (row: IAdmins) => (
        <AvatarCell name={row.fullName} email={row.email} />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row: IAdmins) => (
        <StatusBadge status={row.status} config={statusConfig} />
      ),
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      sortable: true,
      cell: (row: IAdmins) => (
        <span className="text-[#6b7280]">
          {row.countryCode} {row.phoneNumber}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      sortable: true,
      cell: (row: IAdmins) => (
        <span className="text-[#6b7280]">
          {format(new Date(row.createdAt), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      accessorKey: 'validity',
      header: 'Validity',
      cell: (row: IAdmins) => {
        if (row.validity) {
          return (
            <StatusBadge
              status="valid"
              config={validityConfig}
              label={format(new Date(row.validity), 'MMM d, yyyy')}
            />
          );
        }
        return (
          <StatusBadge status="notSet" config={validityConfig} />
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IAdmins) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(
                ROUTES.ADMIN_VIEW.replace(':id', String(row._id)),
                {
                  state: { admin: row },
                },
              )
            }
          />
          <ActionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(
                ROUTES.ADMIN_EDIT.replace(':id', String(row._id)),
                {
                  state: { admin: row },
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
              <DropdownMenuItem
                onClick={() => {
                  toast.success('Login as Admin — frontend only');
                }}
                className="truncate"
              >
                Login as Admin
              </DropdownMenuItem>
              {row.status === 'active' ? (
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() =>
                    handleStatusChange(row._id, 'inactive')
                  }
                >
                  Set Inactive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-green-600 focus:text-green-600"
                  onClick={() =>
                    handleStatusChange(row._id, 'active')
                  }
                >
                  Set Active
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setValidityAdmin(row)}
                className="truncate"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {row.validity ? 'Change Validity' : 'Set Validity'}
              </DropdownMenuItem>
              {row.validity && (
                <DropdownMenuItem
                  onClick={async () => {
                    await deleteAdminValidity({ id: row._id }).unwrap();
                    toast.success('Validity removed');
                  }}
                  className="text-red-500 focus:text-red-500 truncate"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Validity
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  toast.success('Change Password — frontend only');
                }}
                className="truncate"
              >
                Change Password
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 w-full px-5 py-4 min-h-0 flex flex-col">
          <div className="flex w-full flex-col flex-1">
            <Navbar
              superAccess
              title="Admin Users"
              subtitle="Manage admin accounts and permissions"
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <DataTable<IAdmins>
                data={data?.admins || []}
                columns={adminsColumns}
                loading={isLoading}
                title=""
                description=""
                searchPlaceholder="Search admins by name, email or ID..."
                filterField="status"
                filterOptions={['Active', 'Inactive', 'Suspended']}
                addButtonLabel="Add admin"
                onAddClick={() => navigate(ROUTES.ADMIN_CREATE)}
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
      {validityAdmin && (
        <AdminValidityDialog
          admin={validityAdmin}
          open={!!validityAdmin}
          onOpenChange={(open) => {
            if (!open) setValidityAdmin(null);
          }}
        />
      )}
    </SuperAdminLayout>
  );
};

export default SuperAdminAdminsPage;
