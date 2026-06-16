import React, { useState } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  DollarSign,
  User,
  Calendar,
  CreditCard,
  MoreVertical,
  Mail,
  Loader2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/get-error-message';
import {
  useGetInvoiceByJobIdQuery,
  useLazyDownloadInvoiceQuery,
  useResendInvoiceMutation,
  useUpdatePaymentStatusMutation,
} from '@/API/api';
import type { IInvoice, IJob, IPopulatedCustomer } from '@/types';
import { PaymentStatusDialog } from '@/components/payment-status-dialog';

function getJobDisplayId(jobId: IInvoice['jobId']): string {
  if (typeof jobId === 'object' && jobId) {
    return String(jobId.jobId ?? '—');
  }
  return jobId ?? '—';
}

function getPopulatedField<T>(
  value: string | T | undefined,
): T | undefined {
  if (typeof value === 'object' && value) return value;
  return undefined;
}

export default function InvoiceViewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const invoiceFromState = (location.state as { invoice?: IInvoice })
    ?.invoice;

  const invoiceFromStorage = React.useMemo(() => {
    if (!jobId) return undefined;
    const stored = sessionStorage.getItem(`invoice-${jobId}`);
    if (!stored) return undefined;
    try {
      return JSON.parse(stored) as IInvoice;
    } catch {
      return undefined;
    }
  }, [jobId]);

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(jobId ?? '');

  const { data: apiInvoice, isLoading: isApiLoading } =
    useGetInvoiceByJobIdQuery(jobId!, {
      skip: !jobId || !isValidObjectId,
    });

  const invoice =
    invoiceFromState ?? invoiceFromStorage ?? apiInvoice;
  const isLoading =
    isApiLoading && !invoiceFromState && !invoiceFromStorage;
  const [downloadInvoice] = useLazyDownloadInvoiceQuery();

  const mongoJobId = React.useMemo(() => {
    const job = invoice?.jobId;
    if (typeof job === 'object' && job) return job._id ?? '';
    return job ?? '';
  }, [invoice?.jobId]);
  // const [getReceipt] = useLazyGetReceiptQuery();

  const handleDownload = async () => {
    const job = invoice?.jobId;
    const mongoId = typeof job === 'object' && job ? job._id : undefined;
    
    if (!mongoId) {
        toast.error('Job ID not available for download');
        return;
    }
    
    try {
      const result = await downloadInvoice(mongoId);
      if (result.data) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        const displayId = typeof job === 'object' ? job.jobId : jobId;
        a.download = `invoice-${displayId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(getErrorMessage(error, 'Download failed'));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [isResending, setIsResending] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const [resendInvoice] = useResendInvoiceMutation();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();

  const getMongoJobId = (): string => {
    const job = invoice?.jobId;
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
      toast.error('Failed to resend invoice');
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
      toast.error('Failed to update payment status');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-[#6b7280]">Loading invoice...</p>
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-[#6b7280]">Invoice not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <div className="mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.INVOICES)}
              className="mb-4 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>

            {/* Header Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">
                      {/* Invoice # */}
                      {invoice.invoiceNumber}
                    </h1>
                    {/* <StatusBadge
                      status={getInvoiceStatus(invoice)}
                      config={STATUS_CONFIG.invoice}
                    /> */}
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <div className="mt-2 text-right">
                    <span className="text-lg font-semibold text-primary">
                      ${(invoice.amount ?? 0).toFixed(2)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Total
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary">
                      <MoreVertical className="h-4 w-4" />
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
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-[#ececec] pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-9"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Invoice
                </Button>
                {mongoJobId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-9"
                    onClick={() =>
                      navigate(
                        ROUTES.INVOICES_RECEIPT.replace(
                          ':jobId',
                          mongoJobId,
                        ),
                        { state: { returnJobId: jobId } },
                      )
                    }
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Receipt
                  </Button>
                )}
                </div>
              </div>

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer & Job Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Customer & Job
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Customer
                      </p>
                      <p className="text-foreground font-medium">
                        {getPopulatedField<IPopulatedCustomer>(
                          invoice.customerId,
                        )?.fullName ||
                          invoice.customer ||
                          '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Job
                      </p>
                      <p className="text-foreground font-medium">
                        {getJobDisplayId(invoice.jobId)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Payment Summary
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-foreground font-medium">
                        ${(invoice.amount ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Received
                      </p>
                      <p className="text-foreground font-medium text-primary">
                        $
                        {(
                          getPopulatedField<IJob>(
                            invoice.jobId as
                              | string
                              | IJob
                              | undefined,
                          )?.receivePrice ??
                          invoice.receivedAmount ??
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Balance
                      </p>
                      <p
                        className={`text-foreground font-medium ${(invoice.amount ?? 0) - (getPopulatedField<IJob>(invoice.jobId as string | IJob | undefined)?.receivePrice ?? invoice.receivedAmount ?? 0) > 0 ? 'text-red-500' : 'text-primary'}`}
                      >
                        $
                        {(
                          (invoice.amount ?? 0) -
                          (getPopulatedField<IJob>(
                            invoice.jobId as
                              | string
                              | IJob
                              | undefined,
                          )?.receivePrice ??
                            invoice.receivedAmount ??
                            0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div> */}
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment Type
                      </p>
                      <p className="text-foreground font-medium">
                        {(() => {
                          const pt =
                            invoice.paymentType ??
                            getPopulatedField<IJob>(
                              invoice.jobId as
                                | string
                                | IJob
                                | undefined,
                            )?.paymentType;
                          return pt
                            ? pt
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (c) =>
                                  c.toUpperCase(),
                                )
                            : '—';
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment Status
                      </p>
                      <p className="text-foreground font-medium">
                        {(() => {
                          const s = invoice.paymentStatus ?? 'unpaid';
                          return s.charAt(0).toUpperCase() + s.slice(1);
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details & Notes Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Invoice Date
                      </p>
                      <p className="text-foreground font-medium">
                        {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created At
                      </p>
                      <p className="text-foreground font-medium">
                        {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                  </div> */}
                  {/* <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="text-foreground font-medium">
                        {formatDate(invoice.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-foreground font-medium">
                        {invoice.notes || 'Not provided'}
                      </p>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentDialog && (
        <PaymentStatusDialog
          onClose={() => setShowPaymentDialog(false)}
          onUpdate={handleUpdatePaymentStatus}
          isLoading={isUpdatingPayment}
        />
      )}
    </AppLayout>
  );
}


