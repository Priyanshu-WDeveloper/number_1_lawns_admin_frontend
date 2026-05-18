import React from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import {
  // Shield,
  // Plus,
  // Search,
  // MoreHorizontal,
  Bell,
  ChevronDown,
  Eye,
  Pencil,
  LucideTrash2,
  MoreVertical,
  LogIn,
  UserX,
} from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import DataTable, {
  ActionButton,
  type ColumnDef,
} from '../../../components/data-table/DataTable';
import type { IAdmins } from '../../../types/admins.types';
import { useGetAdminUsersQuery } from '../../../store/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

// interface IAdmins {
//   id: number;
//   adminId: string;
//   name: string;
//   email: string;
//   status: 'Active' | 'Inactive' | 'Expired';
//   validity: string;
//   createdAt: string;
// }

// const admins: IAdmins[] = [
//   {
//     id: 1,
//     adminId: 'ADM-001',
//     name: 'John Smith',
//     email: 'john@no1lawns.com',
//     status: 'Active',
//     validity: '2026-12-31',
//     createdAt: '2024-01-15',
//   },
//   {
//     id: 2,
//     adminId: 'ADM-002',
//     name: 'Sarah Johnson',
//     email: 'sarah@no1lawns.com',
//     status: 'Active',
//     validity: '2026-10-20',
//     createdAt: '2024-02-20',
//   },
//   {
//     id: 3,
//     adminId: 'ADM-003',
//     name: 'Mike Brown',
//     email: 'mike@no1lawns.com',
//     status: 'Inactive',
//     validity: '2025-08-10',
//     createdAt: '2023-11-05',
//   },
//   {
//     id: 4,
//     adminId: 'ADM-004',
//     name: 'Emily Davis',
//     email: 'emily@no1lawns.com',
//     status: 'Expired',
//     validity: '2024-05-01',
//     createdAt: '2024-03-10',
//   },
// ];
const SuperAdminAdminsPage: React.FC = () => {
  // const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  // const adminsColumns: ColumnDef<IAdmins>[] = [
  //   // {
  //   //   accessorKey: 'id',
  //   //   header: 'ID',
  //   // },
  //   {
  //     accessorKey: 'id',
  //     header: 'Admin ID',
  //   },
  //   {
  //     accessorKey: 'name',
  //     header: 'Name',
  //   },
  //   {
  //     accessorKey: 'email',
  //     header: 'Email',
  //   },
  //   {
  //     accessorKey: 'status',
  //     header: 'Status',
  //     filterField: 'status',
  //     filterOptions: ['Active', 'Inactive', 'Expired'],
  //   },
  //   {
  //     accessorKey: 'validity',
  //     header: 'Validity',
  //   },
  //   {
  //     accessorKey: 'createdAt',
  //     header: 'Joined',
  //   },

  //   // {
  //   //   accessorKey: 'balance',
  //   //   header: 'Balance',
  //   //   cell: (row: IAdmins) => (
  //   //     <span
  //   //       className={
  //   //         row.balance < 0 ? 'text-red-500' : 'text-green-600'
  //   //       }
  //   //     >
  //   //       ${row.balance.toFixed(2)}
  //   //     </span>
  //   //   ),
  //   // },
  //   {
  //     accessorKey: 'actions',
  //     header: 'Actions',
  //     cell: (row: IAdmins) => (
  //       <div className="flex flex-wrap gap-2">
  //         <ActionButton
  //           icon={<Eye className="h-4 w-4" />}
  //           onClick={() => navigate(`/admins/${row._id}`)}
  //         />
  //         <ActionButton
  //           icon={<Pencil className="h-4 w-4" />}
  //           onClick={() => console.log('Edit admin:', row._id)}
  //         />
  //         <ActionButton
  //           className="hover:text-white hover:bg-red-600"
  //           icon={<LucideTrash2 className="h-3 w-3" />}
  //           onClick={() =>
  //             console.log('Deleting access for job ID:', row._id)
  //           }
  //         />
  //       </div>
  //     ),
  //   },
  // ];
  const { data } = useGetAdminUsersQuery({
    page: 1,
    limit: 10,
  });
  console.log(
    '\n===================== 🟢 data =====================',
  );
  console.log(data);
  console.log('=================================================\n');
  const adminsColumns: ColumnDef<IAdmins>[] = [
    {
      accessorKey: 'adminId',
      header: 'Admin ID',
    },
    {
      accessorKey: 'fullName',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterField: 'status',
      filterOptions: ['active', 'inactive', 'expired'],
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: (row: IAdmins) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IAdmins) => (
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={<Eye className="h-4 w-4" />} />

          <ActionButton
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => navigate(`/super-admin/admin/${row._id}`)}
          />

          {/* <ActionButton
            className="hover:text-white hover:bg-red-600"
            icon={<LucideTrash2 className="h-3 w-3" />}
          /> */}
          <ActionButton
            icon={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ActionButton
                    icon={<MoreVertical className="h-4 w-4" />}
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login as Admin
                  </DropdownMenuItem>

                  <DropdownMenuItem className="text-red-500 focus:text-red-500">
                    <UserX className="mr-2 h-4 w-4" />
                    Set Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        </div>
      ),
    },
  ];

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }
  return (
    <SuperAdminLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto px-4 py-5">
          <div className="flex w-full flex-col">
            <div className="mb-1 p-1 flex items-center justify-between">
              <div className=" px-3">
                <h2 className="text-[24px] font-bold text-[#151515]">
                  Admin Users
                </h2>
                <p className="mt-1 text-[13px] text-[#777]">
                  Manage admin accounts and permissions
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] text-white">
                    3
                  </span>
                </button>
                <div className="flex items-center gap-2 rounded-xl border border-[#ececec] bg-white px-3 py-1.5 shadow-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">Admin</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
            {/* <DataTable<IAdmins> */}
            {/* /TODO: Fix this */}
            <DataTable<IAdmins>
              data={data?.admins || []}
              columns={adminsColumns}
              title="Admins"
              description="Manage all your admins in one place."
              searchPlaceholder="Search admins..."
              filterField="status"
              filterOptions={['Active', 'Inactive', 'Expired']}
              addButtonLabel="Add admin"
              // onAddClick={() => navigate('/admins/create')}
              onAddClick={() => navigate(`/super-admin/admin/create`)}
            />
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAdminsPage;
