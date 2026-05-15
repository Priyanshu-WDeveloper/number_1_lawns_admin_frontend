'use client';

import { Bell, ChevronDown, Eye, Pencil, Trash } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import type { ColumnDef } from '@/components/data-table/DataTable';
import DataTable, {
  ActionButton,
} from '@/components/data-table/DataTable';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';

// Define the structure for Job data
interface Job {
  id?: string;
  address: string;
  date: string;
  paymentType: 'Cash' | 'Card' | 'Online' | 'UPI' | 'Bank Transfer';
  status: 'Active' | 'Inactive';
  jobType: string;
  particulars: string;
  assignedTo?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
}

// Sample Job Data
const Jobs: Job[] = [
  {
    id: 'JOB-001',
    address: '123 Main Street, Delhi',
    date: '2026-05-10',
    paymentType: 'Cash',
    status: 'Active',
    jobType: 'Installation',
    particulars: 'AC installation service',
    assignedTo: 'Rahul Verma',
    // name: 'Rahul Verma',
    // email: 'rahul@example.com',
    // phone: '+91 9876543210',
    // role: 'Technician',
    // department: 'Installation',
  },
  {
    id: 'JOB-002',
    address: '45 Park Avenue, Mumbai',
    date: '2026-05-11',
    paymentType: 'Card',
    status: 'Active',
    jobType: 'Repair',
    particulars: 'Washing machine repair',
    assignedTo: 'Amit Singh',
  },
  {
    id: 'JOB-003',
    address: '78 Lake View, Bangalore',
    date: '2026-05-12',
    paymentType: 'UPI',
    status: 'Inactive',
    jobType: 'Maintenance',
    particulars: 'Electrical maintenance',
    assignedTo: 'Karan Mehta',
  },
  {
    id: 'JOB-004',
    address: '12 Green Colony, Chandigarh',
    date: '2026-05-13',
    paymentType: 'Bank Transfer',
    status: 'Active',
    jobType: 'Inspection',
    particulars: 'Generator inspection',
    assignedTo: 'Sandeep Kumar',
  },
  {
    id: 'JOB-005',
    address: '90 River Road, Pune',
    date: '2026-05-14',
    paymentType: 'Cash',
    status: 'Inactive',
    jobType: 'Cleaning',
    particulars: 'Water tank cleaning',
    assignedTo: 'Vikram Joshi',
  },
];

// Main Job Management Page Component
export default function JobManagementPage() {
  const navigate = useNavigate();

  // Define columns inside component to access navigate
  const JobColumns: ColumnDef<Job>[] = [
    {
      accessorKey: 'address',
      header: 'Address',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'paymentType',
      header: 'Payment Type',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterField: 'status',
      filterOptions: ['Active', 'Inactive'],
    },
    {
      accessorKey: 'jobType',
      header: 'Job type',
    },
    {
      accessorKey: 'particulars',
      header: 'Particulars',
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: Job) => (
        <div className="flex flex-wrap gap-2">
          <ActionButton
            icon={<Eye className="h-4 w-4" />}
            onClick={() => navigate(`/jobs/${row.id}`)}
          />
          <ActionButton
            icon={<Pencil className="h-4 w-4" />}
            onClick={() =>
              console.log('Editing job with ID:', row.id)
            }
          />
          <ActionButton
            className="hover:text-white hover:bg-red-600"
            icon={<Trash className="h-4 w-4 " />}
            onClick={() =>
              console.log('Deleting access for job ID:', row.id)
            }
          />
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      {/* <main className="flex-1 w-full overflow-y-auto px-4 pt-9 pb-9"> */}
      <main className="flex-1 w-full overflow-y-auto px-4 pt-5 pb-5">
        <div className="min-h-full w-full">
          <div className="pb-3 flex items-center justify-between">
            <div className="px-3">
              <h2 className="text-[24px] font-bold text-[#151515]">
                Job Management
              </h2>
              <p className="mt-1 text-[13px] text-[#777]">
                Manage your Jobs and view their details.
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

          <DataTable<Job>
            data={Jobs}
            columns={JobColumns}
            title="Jobs"
            description="Manage all your Jobs in one place."
            searchPlaceholder="Search Jobs..."
            filterField="status"
            filterOptions={['Active', 'Inactive']}
            addButtonLabel="Add Job"
            onAddClick={() => navigate('/jobs/create')}
          />
        </div>
      </main>
    </AppLayout>
  );
}
