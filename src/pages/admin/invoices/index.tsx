import { Download, Eye } from 'lucide-react';

import type { ColumnDef } from '@/components/data-table/data-table';
import DataTable, {
  ActionButton,
} from '@/components/data-table/data-table';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useGetInvoicesQuery, useLazyDownloadInvoiceQuery } from '@/API/api';
import { StatusBadge } from '@/components/data-table/status-badge';
import { STATUS_CONFIG } from '@/constants/status-config';
import type { IInvoice } from '@/types';

export default function InvoiceManagementPage() {
  const navigate = useNavigate();
  const { data: apiInvoices, isLoading } = useGetInvoicesQuery({}, {
    refetchOnMountOrArgChange: true,
  });
  const [downloadInvoice] = useLazyDownloadInvoiceQuery();

  const invoices: IInvoice[] = apiInvoices?.invoices ?? [];

  const handleDownload = async (jobId: string) => {
    try {
      const result = await downloadInvoice(jobId);
      if (result.data) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${jobId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

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
              navigate(ROUTES.INVOICES_VIEW.replace(':jobId', row.jobId ?? ''))
            }
          />
          <ActionButton
            icon={<Download className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() => handleDownload(row.jobId ?? '')}
          />
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
                data={invoices}
                loading={isLoading}
                columns={invoiceColumns}
                title=""
                description=""
                searchPlaceholder="Search invoices by customer or invoice number..."
                filterField="status"
                filterOptions={['Paid', 'Pending', 'Overdue']}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
