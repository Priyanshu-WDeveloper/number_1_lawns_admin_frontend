import { Ellipsis, Eye, Pencil } from 'lucide-react';

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
import { useGetInvoicesQuery } from '@/API/api';
import { useMemo } from 'react';
import { StatusBadge } from '@/components/data-table/status-badge';
import { STATUS_CONFIG } from '@/constants/status-config';
import type { IInvoice } from '@/types';

const mockInvoices: IInvoice[] = [
  {
    _id: 'INV-001',
    invoiceNumber: '41321',
    customer: 'Jason',
    jobId: 'JOB-001',
    totalAmount: 60.0,
    receivedAmount: 60.0,
    date: '2026-05-05',
    status: 'paid',
  },
  {
    _id: 'INV-002',
    invoiceNumber: '41320',
    customer: 'John',
    jobId: 'JOB-002',
    totalAmount: 50.0,
    receivedAmount: 0,
    date: '2026-03-26',
    status: 'overdue',
  },
  {
    _id: 'INV-003',
    invoiceNumber: '41319',
    customer: 'Michael',
    jobId: 'JOB-003',
    totalAmount: 75.0,
    receivedAmount: 75.0,
    date: '2026-04-14',
    status: 'paid',
  },
  {
    _id: 'INV-004',
    invoiceNumber: '41318',
    customer: 'Sophia',
    jobId: 'JOB-004',
    totalAmount: 120.0,
    receivedAmount: 50.0,
    date: '2026-04-09',
    status: 'pending',
  },
];

export default function InvoiceManagementPage() {
  const navigate = useNavigate();
  const { data: apiInvoices, isLoading } = useGetInvoicesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const allInvoices = useMemo(() => {
    const apiRows: IInvoice[] = (apiInvoices?.invoices ?? []).map((inv: any) => ({
      _id: inv._id || inv.id,
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customer,
      jobId: inv.jobId,
      totalAmount: inv.totalAmount,
      receivedAmount: inv.receivedAmount,
      date: inv.date,
      status: inv.status || 'pending',
    }));
    return [...mockInvoices, ...apiRows];
  }, [apiInvoices]);

  const invoiceColumns: ColumnDef<IInvoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: (row: IInvoice) => (
        <span className="font-medium text-[#151515]">
          #{row.invoiceNumber}
        </span>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (row: IInvoice) => (
        <span className="text-[#6b7280]">{row.customer}</span>
      ),
    },
    {
      accessorKey: 'jobId',
      header: 'Job',
      cell: (row: IInvoice) => (
        <span className="text-[#6b7280]">{row.jobId}</span>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: (row: IInvoice) => (
        <span className="font-medium text-[#151515]">
          ${(row.totalAmount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'receivedAmount',
      header: 'Received',
      cell: (row: IInvoice) => (
        <span
          className={
            (row.receivedAmount ?? 0) < (row.totalAmount ?? 0)
              ? 'text-red-500'
              : 'text-green-600'
          }
        >
          ${(row.receivedAmount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (row: IInvoice) => (
        <span className="text-[#6b7280]">{row.date}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row: IInvoice) => (
        <StatusBadge
          status={row.status ?? 'pending'}
          config={STATUS_CONFIG.invoice}
        />
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IInvoice) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(ROUTES.INVOICES_VIEW.replace(':id', row._id ?? ''))
            }
          />
          <ActionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() =>
              navigate(ROUTES.INVOICES_EDIT.replace(':id', row._id ?? ''))
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
                className="text-red-500 focus:text-red-500"
                onClick={() =>
                  console.log('Delete invoice:', row._id ?? '')
                }
              >
                Delete Invoice
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
              title="Invoice Management"
              subtitle="View and manage invoices linked to jobs."
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <DataTable<IInvoice>
                data={allInvoices}
                loading={isLoading}
                columns={invoiceColumns}
                title=""
                description=""
                searchPlaceholder="Search invoices by customer or invoice number..."
                filterField="status"
                filterOptions={['Paid', 'Pending', 'Overdue']}
                addButtonLabel="Add Invoice"
                onAddClick={() => navigate(ROUTES.INVOICES_CREATE)}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
