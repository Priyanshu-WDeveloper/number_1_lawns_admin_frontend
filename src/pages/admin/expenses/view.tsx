import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  FileText,
  ExternalLink,
  Mail,
  User,
  MoreVertical,
  Calendar,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
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
  const [viewImgError, setViewImgError] = useState(false);

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

            <div className="grid gap-6 md:grid-cols-2">
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
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </h4>
                    <p className="text-foreground bg-secondary/50 p-4 rounded-xl">
                      {expense.description}
                    </p>
                  </div>
                  {expense.fileUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Attached Document
                      </h4>
                      {/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(expense.fileUrl) ? (
                        viewImgError ? (
                          <div className="w-full h-64 flex flex-col items-center justify-center rounded-xl border border-[#ececec] bg-[#f5f8fb] gap-2">
                            <FileText className="h-8 w-8 text-[#7a8699]" />
                            <p className="text-sm text-[#7a8699]">Failed to load image</p>
                            <a
                              href={expense.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Download
                            </a>
                          </div>
                        ) : (
                          <img
                            src={expense.fileUrl}
                            alt="Attachment"
                            className="w-full max-h-64 object-contain rounded-xl border border-[#ececec]"
                            onError={() => setViewImgError(true)}
                          />
                        )
                      ) : /\.(pdf)(\?.*)?$/i.test(expense.fileUrl) ? (
                        <div className="w-full h-64 rounded-xl border border-[#ececec] overflow-hidden">
                          <img src="/pdf-logo.svg" alt="PDF" className="w-full max-h-64 object-contain rounded-xl border border-[#ececec]" />
                        </div>
                      ) : (
                        <a
                          href={expense.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View Attachment
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

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
                        <p className="text-sm text-muted-foreground">
                          Name
                        </p>
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
                        <p className="text-sm text-muted-foreground">
                          Email
                        </p>
                        <p className="font-medium text-foreground">
                          {expense.addedBy.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex w-10 items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Role
                        </p>
                        <p className="font-medium text-foreground">
                          {expense.addedByType === 'admin'
                            ? 'Admin'
                            : 'Employee'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex w-10 items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Company Name
                        </p>
                        <p className="font-medium text-foreground">
                          {typeof expense.adminId === 'object'
                            ? (expense.adminId as IAdminUser)
                                .companyName
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
                          <p className="text-sm text-muted-foreground">
                            Deleted At
                          </p>
                          <p className="font-medium text-foreground text-red-500">
                            {formatDate(expense.deletedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
