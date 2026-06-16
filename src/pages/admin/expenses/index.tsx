import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Type,
  FileText,
  Eye,
  CreditCard,
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
import type { ColumnDef } from '@/components/data-table/data-table';
import DataTable, {
  ActionButton,
} from '@/components/data-table/data-table';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import type { ListQueryParams } from '@/types/api.types';
import type { IExpense } from '@/types';
import { AvatarCell } from '@/components/data-table/avatar-cell';

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { queryParams, setPage, setLimit } =
    useDataTableQueryParams<ListQueryParams>({
      defaultLimit: 12,
    });

  const { data: apiResponse, isLoading } = useGetExpensesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [createExpense] = useCreateExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const [editingExpense, setEditingExpense] = useState<{
    id?: string;
    title: string;
    description: string;
    fileUrl?: string;
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadDocument] = useUploadDocumentMutation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const expenses = apiResponse?.expenses ?? [];
  const pagination = apiResponse
    ? {
        page: apiResponse.page,
        limit: apiResponse.limit,
        total: apiResponse.total,
        totalPages: apiResponse.totalPages,
      }
    : undefined;

  const openEdit = (expense: { _id: string; title: string; description: string; fileUrl?: string }) => {
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
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('edit');
        navigate(`${ROUTES.EXPENSES}?${newParams.toString()}`, { replace: true });
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
        await updateExpense({
          id: editingExpense.id,
          title: editingExpense.title,
          description: editingExpense.description,
          fileUrl,
        });
        toast.success('Expense updated');
      } else {
        await createExpense({
          title: editingExpense.title,
          description: editingExpense.description,
          fileUrl,
        });
        toast.success('Expense added');
      }
      setIsEditOpen(false);
      setEditingExpense(null);
      setFile(null);
    } catch {
      toast.error('Failed to save expense');
    }
  };

  const handleRemove = async () => {
    if (!removeId) return;
    try {
      await deleteExpense(removeId);
      toast.success('Expense removed');
      setRemoveId(null);
    } catch {
      toast.error('Failed to remove expense');
    }
  };

  const expenseColumns: ColumnDef<IExpense>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: (row: IExpense) => (
        <span className="font-medium text-[#151515]">{row.title}</span>
      ),
      sortable: true,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (row: IExpense) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.description || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'addedBy',
      header: 'Added By',
      cell: (row: IExpense) =>
        row.addedBy ? (
          <AvatarCell
            name={row.addedBy.fullName}
            email={row.addedBy.email}
            profileImage={row.addedBy.profileImage}
          />
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row: IExpense) => (
        <div className="flex items-center gap-0.5">
          <ActionButton
            icon={<Eye className="h-3.5 w-3.5" />}
            intent="view"
            onClick={() =>
              navigate(ROUTES.EXPENSES_VIEW.replace(':id', row._id))
            }
          />
          <ActionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            intent="edit"
            onClick={() => openEdit(row)}
          />
          <ActionButton
            icon={<Trash2 className="h-3.5 w-3.5" />}
            intent="delete"
            onClick={() => setRemoveId(row._id)}
          />
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
              title="Expenses"
              subtitle="Manage business expenses"
              showWelcome={false}
            />
            <div className="flex-1 min-h-0 mt-4 flex flex-col">
              <DataTable<IExpense>
                data={expenses}
                loading={isLoading}
                columns={expenseColumns}
                title=""
                description=""
                searchPlaceholder="Search expenses..."
                addButtonLabel="Add Expense"
                onAddClick={openAdd}
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </div>
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
          <div className="p-5 sm:p-7 max-h-[85vh] overflow-y-auto">
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
                  {editingExpense?.id ? 'Edit Expense' : 'Add Expense'}
                </DialogTitle>

                <DialogDescription className="mt-2 text-sm text-[#8D96A7]">
                  {editingExpense?.id
                    ? 'Update the expense details'
                    : 'Add a new expense'}
                </DialogDescription>
              </div>
            </div>

              <div className="mt-8 space-y-5">
                <UploadField
                  label="Attachment"
                  value={file}
                  onChange={setFile}
                />
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
        open={!!removeId}
        onOpenChange={(open) => {
          if (!open) setRemoveId(null);
        }}
        title="Remove Expense"
        description="Are you sure you want to remove this expense? This action cannot be undone."
        confirmText="Remove"
        onConfirm={handleRemove}
      />
    </AppLayout>
  );
}
