import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/get-error-message';
import {
  useGetInvoiceByJobIdQuery,
  useLazyDownloadInvoiceQuery,
} from '@/API/api';

export default function InvoiceReceiptPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(jobId ?? '');

  const { data: apiInvoice, isLoading: isApiLoading } =
    useGetInvoiceByJobIdQuery(jobId!, {
      skip: !jobId || !isValidObjectId,
    });

  const [downloadInvoice] = useLazyDownloadInvoiceQuery();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    if (!jobId) return;

    const downloadUrl = apiInvoice?.downloadUrl;
    if (downloadUrl) {
      setPreviewUrl(downloadUrl);
      setIsLoading(false);
      return;
    }

    const effectiveJobId = isValidObjectId
      ? jobId
      : typeof apiInvoice?.jobId === 'object' && apiInvoice?.jobId?._id;
    if (!effectiveJobId) return;

    try {
      const result = await downloadInvoice(effectiveJobId).unwrap();
      const url = window.URL.createObjectURL(result);
      setPreviewUrl(url);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load receipt'));
      toast.error(getErrorMessage(err, 'Failed to load receipt'));
    } finally {
      setIsLoading(false);
    }
  }, [jobId, apiInvoice, isValidObjectId, downloadInvoice]);

  useEffect(() => {
    if (!isApiLoading) {
      loadPreview();
    }
  }, [isApiLoading, loadPreview]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <div className="mx-auto flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() =>
                  navigate(
                    ROUTES.INVOICES_VIEW.replace(':jobId', jobId ?? ''),
                  )
                }
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoice
              </Button>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Receipt — {apiInvoice?.invoiceNumber ?? jobId}
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-[#ececec] bg-white shadow-sm">
              {isLoading && (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Loading receipt...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {!isLoading && !error && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="h-full w-full rounded-xl"
                  title="Invoice Receipt"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
