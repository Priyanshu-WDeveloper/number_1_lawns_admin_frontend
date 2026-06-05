import React from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  DollarSign,
  User,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';
import {
  useGetInvoiceByJobIdQuery,
  useLazyDownloadInvoiceQuery,
  useLazyGetReceiptQuery,
} from '@/API/api';
import type { IInvoice, IJob, IPopulatedCustomer } from '@/types';

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

  const invoice = invoiceFromState ?? invoiceFromStorage ?? apiInvoice;
  const downloadUrl = apiInvoice?.downloadUrl ?? invoice?.downloadUrl;
  const isLoading = isApiLoading && !invoiceFromState && !invoiceFromStorage;
  const [downloadInvoice] = useLazyDownloadInvoiceQuery();
  const [getReceipt] = useLazyGetReceiptQuery();

  const handleDownload = async () => {
    if (!jobId) return;
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

  const handleViewReceipt = async () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      return;
    }
    if (!jobId) return;
    try {
      const result = await getReceipt(jobId);
      if (result.data) {
        window.open(URL.createObjectURL(result.data), '_blank');
      }
    } catch {
      toast.error('Failed to load receipt');
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
                <div className="text-right">
                  <div className="mt-2">
                    <span className="text-lg font-semibold text-primary">
                      ${(invoice.amount ?? 0).toFixed(2)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Total
                    </p>
                  </div>
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
                {jobId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-9"
                    onClick={handleViewReceipt}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
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
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created At
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
    </AppLayout>
  );
}
