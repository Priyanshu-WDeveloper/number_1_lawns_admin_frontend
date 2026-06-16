import { useState } from 'react';
import { Download, Eye, MoreVertical, Mail, CreditCard, Loader2 } from 'lucide-react';

import type { ColumnDef } from '@/components/data-table/data-table';
import DataTable, {
  ActionButton,
} from '@/components/data-table/data-table';
import toast from 'react-hot-toast';

import { Navbar } from '@/components/layout/navbar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
  useGetInvoicesQuery,
  useLazyDownloadInvoiceQuery,
  useResendInvoiceMutation,
  useUpdatePaymentStatusMutation,
} from '@/API/api';
import { formatDate } from '@/lib/format-date';
import type { IInvoice, IJob, IPopulatedCustomer } from '@/types';
import { AppLayout } from '@/components/layout/app-layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaymentStatusDialog } from '@/components/payment-status-dialog';
import { getErrorMessage } from '@/lib/get-error-message';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import type { ListQueryParams } from '@/types/api.types';

export default function InvoiceManagementPage() {
  const navigate = useNavigate();

  const { statusFilter, setStatusFilter, queryParams } = useDataTableQueryParams<ListQueryParams>({
    defaultLimit: 10,
    mapStatusToApi: (status) => status.toLowerCase(),
  });

  const { data: apiInvoices, isLoading } = useGetInvoicesQuery(
    queryParams,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const [downloadInvoice] = useLazyDownloadInvoiceQuery();

  const getJobId = (row: IInvoice): string => {
    if (row.jobId && typeof row.jobId === 'object') {
      return String((row.jobId as IJob).jobId ?? '');
    }
    return row.jobId ?? '';
  };

  const invoices: IInvoice[] = apiInvoices?.invoices ?? [];

  const handleDownload = async (
    jobId: string,
    jobDisplayId: string,
  ) => {
    try {
      const result = await downloadInvoice(jobId);
      if (result.data) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${jobDisplayId}.pdf`;
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
          {row.invoiceNumber ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: (row: IInvoice) => (
        <span className="text-[#6b7280]">
          {row.customerId && typeof row.customerId === 'object'
            ? ((row.customerId as IPopulatedCustomer).fullName ?? '-')
            : (row.customerId ?? '-')}
        </span>
      ),
    },
    {
      accessorKey: 'jobId',
      header: 'Job',
      cell: (row: IInvoice) => (
        <span className="text-[#6b7280]">
          {row.jobId && typeof row.jobId === 'object'
            ? ((row.jobId as IJob).jobId ?? '-')
            : (row.jobId ?? '-')}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (row: IInvoice) => (
        <span className="font-medium text-[#151515]">
          ${(row.amount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (row: IInvoice) => (
        <span className="text-[#6b7280]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment Status',
      cell: (row: IInvoice) => {
        const status = row.paymentStatus ?? 'unpaid';
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              status === 'paid'
                ? 'bg-green-100 text-green-700'
                : status === 'unpaid'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IInvoice) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() => {
              const id = getJobId(row);
              sessionStorage.setItem(
                `invoice-${id}`,
                JSON.stringify(row),
              );
              navigate(ROUTES.INVOICES_VIEW.replace(':jobId', id), {
                state: { invoice: row },
              });
            }}
          />
          <ActionButton
            icon={<Download className="h-3.5 w-3.5" />}
            className="h-8 w-8 rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none"
            onClick={() => {
              const job = row.jobId;
              const mongoId =
                typeof job === 'object' && job ? job._id : '';
              const displayId =
                typeof job === 'object' && job
                  ? job.jobId
                  : (job ?? '');
              if (mongoId) {
                handleDownload(mongoId, String(displayId));
              } else {
                toast.error('Job ID not available for download');
              }
            }}
          />
          <InvoiceRowActions invoice={row} />
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
                filterOptions={['Paid', 'Unpaid', 'Cancel']}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                serverSideFiltering
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function InvoiceRowActions({ invoice }: { invoice: IInvoice }) {
  const [isResending, setIsResending] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const [resendInvoice] = useResendInvoiceMutation();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();

  const getMongoJobId = (): string => {
    const job = invoice.jobId;
    if (typeof job === 'object' && job) return job._id ?? '';
    return job ?? '';
  };

  const handleResend = async () => {
    const jobId = getMongoJobId();
    if (!jobId) {
      toast.error('Job ID not available');
      return;
    }
    setIsResending(true);
    try {
      await resendInvoice(jobId).unwrap();
      toast.success('Invoice resend initiated successfully');
    } catch (error) {
      console.error('Failed to resend invoice:', error);
      toast.error(getErrorMessage(error, 'Failed to resend invoice'));
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdatePaymentStatus = async (paymentStatus: string) => {
    const jobId = getMongoJobId();
    if (!jobId) {
      toast.error('Job ID not available');
      return;
    }
    setIsUpdatingPayment(true);
    try {
      await updatePaymentStatus({ jobId, paymentStatus }).unwrap();
      toast.success('Payment status updated successfully');
      setShowPaymentDialog(false);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast.error(getErrorMessage(error, 'Failed to update payment status'));
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] shadow-none">
          <MoreVertical className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-2xl">
          <DropdownMenuItem
            onClick={handleResend}
            disabled={isResending}
            className="cursor-pointer"
          >
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Mail className="h-4 w-4 text-muted-foreground" />
            )}
            Resend Invoice
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowPaymentDialog(true)}
            className="cursor-pointer"
          >
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Update Payment Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showPaymentDialog && (
        <PaymentStatusDialog
          onClose={() => setShowPaymentDialog(false)}
          onUpdate={handleUpdatePaymentStatus}
          isLoading={isUpdatingPayment}
        />
      )}
    </>
  );
}
