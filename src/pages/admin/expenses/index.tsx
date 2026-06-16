import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Type,
  FileText,
  CreditCard,
  Calendar,
  User,
  X,
  Search,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';
import { UploadField } from '@/components/forms/upload-field';
import { ROUTES } from '@/constants';
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useUploadDocumentMutation,
} from '@/API/api';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import type { ListQueryParams } from '@/types/api.types';
import { formatDate } from '@/lib/format-date';
import { getErrorMessage } from '@/lib/get-error-message';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

function getExpenseErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const fetchError = error as FetchBaseQueryError & {
      data?: { message?: string };
    };

    return fetchError.data?.message || 'Failed to save expense';
  }

  return 'Failed to save expense';
}

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { search, setSearch, queryParams, setPage } =
    useDataTableQueryParams<ListQueryParams>({
      defaultLimit: 12,
    });

  const { data: apiResponse, isLoading } = useGetExpensesQuery(
    queryParams,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [createExpense] = useCreateExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeleting }] =
    useDeleteExpenseMutation();

  const [editingExpense, setEditingExpense] = useState<{
    id?: string;
    title: string;
    description: string;
    fileUrl?: string;
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadDocument] = useUploadDocumentMutation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [removingExpense, setRemovingExpense] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [dialogImgError, setDialogImgError] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setLocalPreview(null);
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const expenses = apiResponse?.expenses ?? [];
  const pagination = apiResponse
    ? {
        page: apiResponse.page,
        limit: apiResponse.limit,
        total: apiResponse.total,
        totalPages: apiResponse.totalPages,
      }
    : undefined;

  const openEdit = (expense: {
    _id: string;
    title: string;
    description: string;
    fileUrl?: string;
  }) => {
    setDialogImgError(false);
    setEditingExpense({
      id: expense._id,
      title: expense.title,
      description: expense.description,
      fileUrl: expense.fileUrl,
    });
    setFile(null);
    setIsEditOpen(true);
  };

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const expense = expenses.find((e) => e._id === editId);
      if (expense) {
        setEditingExpense({
          id: expense._id,
          title: expense.title,
          description: expense.description,
          fileUrl: expense.fileUrl,
        });
        setFile(null);
        setIsEditOpen(true);
        const newParams = new URLSearchParams(
          searchParams.toString(),
        );
        newParams.delete('edit');
        navigate(`${ROUTES.EXPENSES}?${newParams.toString()}`, {
          replace: true,
        });
      }
    }
  }, [searchParams, expenses, navigate]);

  const openAdd = () => {
    setEditingExpense({
      title: '',
      description: '',
      fileUrl: '',
    });
    setFile(null);
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingExpense) return;
    if (!editingExpense.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      let fileUrl = editingExpense.fileUrl;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadDocument(formData).unwrap();
        fileUrl = (res as any).file.url;
      }

      if (editingExpense.id) {
        const res = await updateExpense({
          id: editingExpense.id,
          title: editingExpense.title,
          description: editingExpense.description,
          fileUrl,
        });
        console.log(res);

        if ((res as any).data.expense) {
          toast.success('Expense updated');
        } else {
          toast.error(getExpenseErrorMessage(res.error));
        }
      } else {
        const res = await createExpense({
          title: editingExpense.title,
          description: editingExpense.description,
          fileUrl,
        });
        console.log(res);

        if ((res as any).data.expense) {
          toast.success('Expense added');
        } else {
          toast.error(getExpenseErrorMessage(res.error));
        }
      }
      setIsEditOpen(false);
      setEditingExpense(null);
      setFile(null);
    } catch (err) {
      // console.error(err);
      // toast.error(err.message || 'Failed to save expense');
      toast.error(getErrorMessage(err, 'Failed to save expense'));
    }
  };

  const handleRemove = async () => {
    if (!removingExpense) return;
    try {
      await deleteExpense(removingExpense.id);
      toast.success('Expense removed');
      setRemovingExpense(null);
    } catch {
      toast.error('Failed to remove expense');
    }
  };

  return (
    <AppLayout>
      <div
        className="flex flex-1 flex-col"
        style={{ background: '#f8faf8' }}
      >
        <div className="flex-1 w-full px-2 sm:px-5 py-1 sm:py-4 min-h-0 flex flex-col">
          <div className="flex w-full flex-col flex-1">
            <Navbar
              title="Expenses"
              subtitle="Manage business expenses"
              showWelcome={false}
            />

            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8699]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search expenses..."
                  className="w-52 sm:w-64 h-9 rounded-xl border-[#e8edf3] bg-white pl-10 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <Button
                onClick={openAdd}
                className="h-9 px-4 rounded-xl bg-[#00a63e] text-white font-semibold text-sm hover:bg-[#008c34]"
              >
                Add Expense
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-[#edf2f7] animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-[84px] h-[84px] rounded-[20px] bg-[#f5f8fb] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-6 bg-[#f5f8fb] rounded w-3/4 mb-2" />
                        <div className="h-4 bg-[#f5f8fb] rounded w-full mb-1" />
                        <div className="h-4 bg-[#f5f8fb] rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))
              ) : expenses.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#7a8699]">
                  <FileText className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">
                    No expenses found
                  </p>
                  <p className="text-sm mt-1">
                    Get started by adding a new expense.
                  </p>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="bg-white rounded-2xl p-5 border border-[#edf2f7] transition-all duration-[250ms] hover:-translate-y-1"
                    style={{
                      boxShadow:
                        '0 1px 3px rgba(0,0,0,.04), 0 10px 30px rgba(0,0,0,.03)',
                    }}
                  >
                    <div className="flex gap-4">
                      <CardThumbnail fileUrl={expense.fileUrl} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[#202a34] truncate">
                              {expense.title}
                            </h3>
                            <p
                              className="text-sm text-[#7c8798] leading-relaxed mt-1"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {expense.description ||
                                'No description'}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEdit(expense)}
                              className="h-8 w-8 rounded-[10px] bg-[#fff7e8] text-[#f59e0b] flex items-center justify-center hover:bg-[#ffefd0] transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setRemovingExpense({
                                  id: expense._id,
                                  title: expense.title,
                                })
                              }
                              className="h-8 w-8 rounded-[10px] bg-[#fff1f1] text-[#ef4444] flex items-center justify-center hover:bg-[#ffe0e0] transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-[18px] pt-4 border-t border-[#f2f4f8] text-xs text-[#7d8796]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(expense.createdAt)}</span>
                      <span>|</span>
                      <User className="h-3.5 w-3.5" />
                      <span>
                        {expense.addedBy?.fullName || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
                  className="rounded-xl border-[#e8edf3]"
                >
                  Previous
                </Button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((p) => (
                  <Button
                    key={p}
                    variant={
                      p === pagination.page ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setPage(p)}
                    className={`rounded-xl min-w-[40px] ${
                      p === pagination.page
                        ? 'bg-[#00a63e] text-white'
                        : 'border-[#e8edf3]'
                    }`}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage(pagination.page + 1)}
                  className="rounded-xl border-[#e8edf3]"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="
      max-w-[520px]
      rounded-[30px]
      border-0
      bg-[#F8F8F7]
      p-0
      shadow-[0_20px_60px_rgba(0,0,0,0.12)]
      overflow-hidden
      w-[calc(100%-2rem)] sm:w-full
    "
        >
          <div className="p-5 sm:p-7 max-h-[95vh] overflow-y-auto">
            <div className="flex items-start gap-4">
              <div
                className="
            flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center
            rounded-2xl
            bg-[#E7F1E7]
          "
              >
                <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-[#2E7D32]" />
              </div>

              <div>
                <DialogTitle className="text-[22px] sm:text-[28px] font-semibold leading-none text-[#1E1E1E]">
                  {editingExpense?.id
                    ? 'Edit Expense'
                    : 'Add Expense'}
                </DialogTitle>

                <DialogDescription className="mt-2 text-sm text-[#8D96A7]">
                  {editingExpense?.id
                    ? 'Update the expense details'
                    : 'Add a new expense'}
                </DialogDescription>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {file ? (
                <div>
                  <label className="text-sm font-medium text-[#5D6778]">
                    {editingExpense?.fileUrl
                      ? 'New attachment'
                      : 'Attachment'}
                  </label>
                  <div className="relative mt-2">
                    {file.type.startsWith('image/') &&
                    localPreview ? (
                      <img
                        src={localPreview}
                        alt="Preview"
                        className="w-full h-48 size-full object-cover rounded-xl border border-[#DDE5EC]"
                      />
                    ) : file.type === 'application/pdf' ? (
                      <div className="w-full h-48 rounded-xl border border-[#DDE5EC] overflow-hidden">
                        <img
                          src="/pdf-logo.svg"
                          alt="PDF"
                          className="size-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-[#DDE5EC] bg-[#EEF3F7]">
                        <FileText className="h-5 w-5 text-[#2E7D32]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#5D6778] truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-[#7a8699]">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm"
                    >
                      <X className="h-3.5 w-3.5 text-[#6b7280]" />
                    </button>
                  </div>
                </div>
              ) : editingExpense?.fileUrl ? (
                /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(
                  editingExpense.fileUrl,
                ) ? (
                  <div>
                    <label className="text-sm font-medium text-[#5D6778]">
                      Current attachment
                    </label>
                    <div className="relative mt-2">
                      {dialogImgError ? (
                        <div className="w-full h-48 flex flex-col items-center justify-center rounded-xl border border-[#DDE5EC] bg-[#f5f8fb] gap-2">
                          <FileText className="h-8 w-8 text-[#7a8699]" />
                          <p className="text-sm text-[#7a8699]">
                            Failed to load image
                          </p>
                          <a
                            href={editingExpense.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <img
                          src={editingExpense.fileUrl}
                          alt="Attachment"
                          className="size-full w-full h-48  object-cover rounded-xl border border-[#DDE5EC]"
                          onError={() => setDialogImgError(true)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setEditingExpense((prev) =>
                            prev ? { ...prev, fileUrl: '' } : null,
                          )
                        }
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm"
                      >
                        <X className="h-3.5 w-3.5 text-[#6b7280]" />
                      </button>
                    </div>
                  </div>
                ) : /\.(pdf)(\?.*)?$/i.test(
                    editingExpense.fileUrl,
                  ) ? (
                  <div>
                    <label className="text-sm font-medium text-[#5D6778]">
                      Current attachment
                    </label>
                    <div className="relative mt-2">
                      <div className="w-full h-48 rounded-xl border border-[#DDE5EC] overflow-hidden">
                        <img
                          src="/pdf-logo.svg"
                          alt="PDF"
                          className="size-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingExpense((prev) =>
                            prev ? { ...prev, fileUrl: '' } : null,
                          )
                        }
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm"
                      >
                        <X className="h-3.5 w-3.5 text-[#6b7280]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[#DDE5EC] bg-[#EEF3F7]">
                    <FileText className="h-5 w-5 text-[#2E7D32]" />
                    <span className="text-sm text-[#5D6778] flex-1">
                      Current attachment
                    </span>
                    <a
                      href={editingExpense.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#2E7D32] hover:underline"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingExpense((prev) =>
                          prev ? { ...prev, fileUrl: '' } : null,
                        )
                      }
                      className="h-6 w-6 rounded-full hover:bg-[#DDE5EC] flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5 text-[#6b7280]" />
                    </button>
                  </div>
                )
              ) : (
                <UploadField
                  label="Attachment"
                  value={file}
                  onChange={setFile}
                />
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D6778]">
                  Title
                </label>

                <div className="relative">
                  <Type className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2E7D32]" />

                  <Input
                    value={editingExpense?.title ?? ''}
                    onChange={(e) =>
                      setEditingExpense((prev) =>
                        prev
                          ? { ...prev, title: e.target.value }
                          : prev,
                      )
                    }
                    placeholder="e.g. Fuel for Mowers"
                    className="
                h-14
                rounded-2xl
                border-[#DDE5EC]
                bg-[#EEF3F7]
                pl-12
                text-[15px]
                shadow-none
                focus-visible:ring-0
                focus-visible:border-[#C9D5E0]
              "
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D6778]">
                  Description
                </label>

                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-5 w-5 text-[#2E7D32]" />

                  <Textarea
                    value={editingExpense?.description ?? ''}
                    onChange={(e) =>
                      setEditingExpense((prev) =>
                        prev
                          ? { ...prev, description: e.target.value }
                          : prev,
                      )
                    }
                    placeholder="Describe this expense"
                    className="
                min-h-[100px]
                rounded-2xl
                border-[#DDE5EC]
                bg-[#EEF3F7]
                pl-12 md:pl-12
                pt-4
                resize-none
                shadow-none
                focus-visible:ring-0
              "
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingExpense(null);
                }}
                className="
            h-12
            flex-1
            rounded-2xl
            border-[#D7DDE4]
            bg-white
            text-[15px]
            font-medium
            text-[#4E5665]
            hover:bg-white
          "
              >
                Cancel
              </Button>

              <Button
                onClick={handleEditSave}
                className="
            h-12
            flex-1
            rounded-2xl
            bg-[#2E7D32]
            text-[15px]
            font-semibold
            text-white
            hover:bg-[#276B2B]
          "
              >
                {editingExpense?.id ? 'Save Changes' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        loading={isDeleting}
        open={!!removingExpense}
        onOpenChange={(open) => {
          if (!open) setRemovingExpense(null);
        }}
        title="Remove expense"
        description={`Are you sure you want to remove "${removingExpense?.title}"?`}
        confirmText="Remove"
        onConfirm={handleRemove}
      />
    </AppLayout>
  );
}

function CardThumbnail({ fileUrl }: { fileUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!fileUrl) return null;

  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(fileUrl)) {
    if (imgError) {
      return (
        <div className="w-[84px] h-[84px] rounded-[20px] bg-[#f5f8fb] flex items-center justify-center shrink-0">
          <FileText className="h-8 w-8 text-[#7a8699]" />
        </div>
      );
    }
    return (
      <div className="w-[84px] h-[84px] rounded-[20px] shrink-0 overflow-hidden">
        <img
          src={fileUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  if (/\.(pdf)(\?.*)?$/i.test(fileUrl)) {
    return (
      <div className="w-[84px] h-[84px] rounded-[20px] shrink-0 overflow-hidden">
        <img
          src="/pdf-logo.svg"
          alt="PDF"
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-[84px] h-[84px] rounded-[20px] bg-[#f5f8fb] flex items-center justify-center shrink-0">
      <FileText className="h-8 w-8 text-[#7a8699]" />
    </div>
  );
}
