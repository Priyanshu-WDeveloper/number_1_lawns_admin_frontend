import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { resolveFileUrl } from '@/lib/media';
import { useGetExpenseByIdQuery } from '@/data/expenses';

export default function ExpenseReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: expense } = useGetExpenseByIdQuery(id ?? '', {
    skip: !id,
  });

  const fileUrl = expense?.fileUrl
    ? resolveFileUrl(expense.fileUrl)
    : null;

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
                    ROUTES.EXPENSES_VIEW.replace(':id', id ?? ''),
                  )
                }
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Expense
              </Button>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Document
                </span>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-[#ececec] px-3 py-1.5 text-xs font-medium text-[#555] hover:bg-[#f5f5f5] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                )}
              </div>
            </div>

            {fileUrl ? (
              <div className="w-full h-full bg-white rounded-xl border border-[#ececec] shadow-sm overflow-hidden flex-1">
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0&view=FitH&zoom=100`}
                  className="w-full h-full"
                  title="Document"
                />
              </div>
            ) : (
              <div className="w-full rounded-xl border border-[#ececec] shadow-sm p-4 flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No document found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
