import React from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import {
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  Bell,
  ChevronDown,
  PanelLeftIcon,
  Eye,
  Pencil,
  LucideTrash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import DataTable, {
  ActionButton,
  type ColumnDef,
} from '../../components/data-table/DataTable';

interface IAdmins {
  id: string;
  adminId: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Expired';
  validity: string;
  createdAt: string;
}

const admins: IAdmins[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@no1lawns.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@no1lawns.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    name: 'Mike Brown',
    email: 'mike@no1lawns.com',
    role: 'Admin',
    status: 'Inactive',
    createdAt: '2023-11-05',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@no1lawns.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2024-03-10',
  },
];

const SuperAdminAdminsPage: React.FC = () => {
  // const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const adminsColumns: ColumnDef<IAdmins>[] = [
    // {
    //   accessorKey: 'id',
    //   header: 'ID',
    // },
    {
      accessorKey: 'id',
      header: 'Admin ID',
    },
    {
      accessorKey: 'name',
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
      filterOptions: ['Active', 'Inactive', 'Expired'],
    },
    {
      accessorKey: 'validity',
      header: 'Validity',
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
    },

    // {
    //   accessorKey: 'balance',
    //   header: 'Balance',
    //   cell: (row: IAdmins) => (
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
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IAdmins) => (
        <div className="flex flex-wrap gap-2">
          <ActionButton
            icon={<Eye className="h-4 w-4" />}
            onClick={() => navigate(`/admins/${row.id}`)}
          />
          <ActionButton
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => console.log('Edit admin:', row.id)}
          />
          <ActionButton
            className="hover:text-white hover:bg-red-600"
            icon={<LucideTrash2 className="h-3 w-3" />}
            onClick={() =>
              console.log('Deleting access for job ID:', row.id)
            }
          />
        </div>
      ),
    },
  ];

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

            <DataTable<IAdmins>
              data={admins}
              columns={adminsColumns}
              title="Admins"
              description="Manage all your admins in one place."
              searchPlaceholder="Search admins..."
              filterField="status"
              filterOptions={['Active', 'Inactive', 'Expired']}
              addButtonLabel="Add admin"
              onAddClick={() => navigate('/admins/create')}
            />
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAdminsPage;
