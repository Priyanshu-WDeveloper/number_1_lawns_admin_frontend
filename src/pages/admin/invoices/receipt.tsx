import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { PDFViewer } from '@/components/pdf-viewer';
import { ROUTES } from '@/constants';
import { useLazyDownloadInvoiceQuery } from '@/API/api';
import { getErrorMessage } from '@/lib/get-error-message';
import toast from 'react-hot-toast';

export default function InvoiceReceiptPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const id = jobId ?? '';
  const navigate = useNavigate();
  const location = useLocation();
  const returnJobId = (location.state as { returnJobId?: string })?.returnJobId ?? id;
  const [downloadInvoice] = useLazyDownloadInvoiceQuery();
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      try {
        const result = await downloadInvoice(id).unwrap();
        if (cancelled) return;
        const buffer = await result.arrayBuffer();
        if (cancelled) return;
        setFileData(buffer.slice());
      } catch (err) {
        if (!cancelled) {
          const msg = getErrorMessage(err, 'Failed to load receipt');
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [jobId, downloadInvoice]);

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
                    ROUTES.INVOICES_VIEW.replace(':jobId', returnJobId),
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
                  Receipt
                </span>
              </div>
            </div>

            <div className="w-full rounded-xl border border-[#ececec] shadow-sm p-4">
              {isLoading && (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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

              {!isLoading && !error && fileData && (
                <PDFViewer file={fileData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
