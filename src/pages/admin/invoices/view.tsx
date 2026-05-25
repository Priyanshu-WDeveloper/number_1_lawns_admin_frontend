import { useParams, useNavigate } from 'react-router-dom';
import { Download, FileText, DollarSign, User, Calendar } from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';
import { ROUTES } from '@/constants';
import { StatusBadge } from '@/components/data-table/status-badge';
import { DetailRow } from '@/components/admin/detail-row';
import { SectionCard } from '@/components/admin/section-card';
import { ViewPageHeader } from '@/components/admin/view-page-header';
import { Button } from '@/components/ui/button';
import { STATUS_CONFIG } from '@/constants/status-config';
import { useGetInvoiceByJobIdQuery, useLazyDownloadInvoiceQuery } from '@/API/api';

export default function InvoiceViewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const { data: invoice, isLoading } = useGetInvoiceByJobIdQuery(jobId!, {
    skip: !jobId,
  });
  const [downloadInvoice] = useLazyDownloadInvoiceQuery();

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
          <p className="text-[#6b7280]">Loading invoice...</p>
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col">
          <div className="flex-1 w-full overflow-y-auto px-4 py-5">
            <ViewPageHeader
              title="Invoice Not Found"
              subtitle="Invoice Details"
              onBack={() => navigate(ROUTES.INVOICES)}
            />
            <p className="mt-4 text-[#6b7280]">
              The requested invoice could not be found.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto px-4 py-5">
          <div className="flex w-full flex-col">
            <ViewPageHeader
              title={`Invoice #${invoice.invoiceNumber}`}
              subtitle="Invoice Details"
              onBack={() => navigate(ROUTES.INVOICES)}
            />

            <div className="mb-4 flex items-center gap-3">
              <StatusBadge
                status={invoice.status ?? 'pending'}
                config={STATUS_CONFIG.invoice}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="space-y-6">
              <SectionCard
                icon={<User className="h-4 w-4 text-[#16610E]" />}
                title="Customer & Job"
              >
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Customer"
                  value={invoice.customer || '—'}
                />
                <DetailRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Job"
                  value={invoice.jobId || '—'}
                  isLast
                />
              </SectionCard>

              <SectionCard
                icon={
                  <DollarSign className="h-4 w-4 text-[#16610E]" />
                }
                title="Payment Summary"
              >
                <DetailRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Total Amount"
                  value={`$${(invoice.totalAmount ?? 0).toFixed(2)}`}
                />
                <DetailRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Received"
                  value={`$${(invoice.receivedAmount ?? 0).toFixed(2)}`}
                  valueClassName="text-sm font-medium text-green-600"
                />
                <DetailRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Balance"
                  value={`$${(invoice.balance ?? invoice.totalAmount ?? 0).toFixed(2)}`}
                  valueClassName={`text-sm font-medium ${(invoice.balance ?? invoice.totalAmount ?? 0) > 0 ? 'text-red-500' : 'text-green-600'}`}
                />
                <DetailRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Payment Type"
                  value={invoice.paymentType || '—'}
                  isLast
                />
              </SectionCard>

              <SectionCard
                icon={<Calendar className="h-4 w-4 text-[#16610E]" />}
                title="Details & Notes"
              >
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Invoice Date"
                  value={invoice.date || '—'}
                />
                <DetailRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Notes"
                  value={invoice.notes || 'Not provided'}
                  isLast
                />
              </SectionCard>

              <SectionCard
                icon={<Calendar className="h-4 w-4 text-[#16610E]" />}
                title="Timestamps"
              >
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Created By"
                  value={invoice.createdBy || '—'}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Created At"
                  value={formatDate(invoice.createdAt)}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Last Updated"
                  value={formatDate(invoice.updatedAt)}
                  isLast
                />
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
