import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resolveFileUrl } from '@/lib/media';
import {
  ArrowLeft,
  CreditCard,
  FileText,
  ExternalLink,
  User,
  MoreVertical,
  Calendar,
  Building2,
  Briefcase,
  Mail,
  Download,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ROUTES } from '@/constants';
import Loader from '@/components/loader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/data-table/status-badge';
import { STATUS_CONFIG } from '@/constants/status-config';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useGetExpenseByIdQuery } from '@/data/expenses';
import { formatDate } from '@/lib/format-date';
import type { IAdminUser } from '@/types';

export default function ExpenseViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState<{
    key: string;
    value: string;
  } | null>(null);

  const isImageUrl = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
  const isPdfUrl = (url: string) => /\.pdf(\?.*)?$/i.test(url);

  const expenseQueryArgs = id ?? '';
  const queryOptions = {
    skip: !id,
  };

  const {
    data: expense,
    isLoading,
    isError,
  } = useGetExpenseByIdQuery(expenseQueryArgs, queryOptions);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader />
        </div>
      </AppLayout>
    );
  }

  if (isError || !expense) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-[#6b7280]">Expense not found</p>
        </div>
      </AppLayout>
    );
  }

  const status = expense.isDeleted ? 'inactive' : 'active';

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <div className="mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.EXPENSES)}
              className="mb-4 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Button>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] mb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="truncate text-2xl font-bold text-foreground">
                        {expense.title}
                      </h1>
                      <StatusBadge
                        status={status}
                        config={STATUS_CONFIG.expense}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t pt-4 lg:border-t-0 lg:pt-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex size-10 items-center justify-center rounded-xl text-green-700 hover:bg-green-50">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 rounded-2xl"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(
                            `${ROUTES.EXPENSES}?edit=${expense._id}`,
                          )
                        }
                        className="cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4 text-amber-500" />
                        Edit Expense
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Added By
                  </h3>
                </div>
                {expense.addedBy && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        image={expense.addedBy.profileImage}
                        name={expense.addedBy.fullName}
                        size="md"
                      />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">
                          {expense.addedBy.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex w-10 items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">
                          {expense.addedBy.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Role & Company
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex w-10 items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium text-foreground">
                        {expense.addedByType === 'admin'
                          ? 'Admin'
                          : 'Employee'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex w-10 items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium text-foreground">
                        {typeof expense.adminId === 'object'
                          ? (expense.adminId as IAdminUser).companyName
                          : expense.adminId}
                      </p>
                    </div>
                  </div>
                  {expense.isDeleted && expense.deletedAt && (
                    <div className="flex items-center gap-3">
                      <div className="flex w-10 items-center justify-center shrink-0">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deleted At</p>
                        <p className="font-medium text-foreground text-red-500">
                          {formatDate(expense.deletedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec]">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Expense Details
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Title
                  </h4>
                  <p className="text-foreground font-medium">
                    {expense.title}
                  </p>
                </div>
                {expense.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </h4>
                    <p className="text-foreground bg-secondary/50 p-4 rounded-xl whitespace-pre-wrap">
                      {expense.description}
                    </p>
                  </div>
                )}
                {expense.fileUrl && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Attached Document
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        if (!expense.fileUrl) return;
                        if (isPdfUrl(expense.fileUrl)) {
                          navigate(ROUTES.EXPENSES_RECEIPT.replace(':id', expense._id));
                          return;
                        }
                        setSelectedDoc({
                          key: 'Attached Document',
                          value: expense.fileUrl,
                        })
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-background hover:bg-primary/10 transition-colors group text-left"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {expense.fileUrl.split('/').pop() || 'Attached Document'}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedDoc}
        onOpenChange={(open) => {
          if (!open) setSelectedDoc(null);
        }}
      >
        <DialogContent className="w-[calc(100%-24px)] sm:max-w-lg rounded-3xl border-0 p-0 overflow-hidden shadow-2xl bg-white">
          <DialogHeader className="px-6 pt-8 sm:px-8">
            <DialogTitle className="truncate text-lg sm:text-xl font-semibold tracking-tight text-zinc-900">
              {selectedDoc?.key}
            </DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="px-6 pb-6 sm:px-8">
              {isImageUrl(selectedDoc.value) ? (
                <div className="flex items-center justify-center">
                  <img
                    src={resolveFileUrl(selectedDoc.value)}
                    alt={selectedDoc.key}
                    className="max-h-[65vh] w-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[40vh] text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    Preview not available
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    This file type cannot be previewed
                  </p>
                  <a
                    href={resolveFileUrl(selectedDoc.value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download to view
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
