import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, DollarSign } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import DataTable, {
  type ColumnDef,
} from '@/components/data-table/data-table';
import { UserAvatar } from '@/components/ui/user-avatar';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import {
  useGetWalletHistoryQuery,
  useSettleWalletMutation,
  useGetAdminDetailsQuery,
} from '@/API/api';
import { useDataTableQueryParams } from '@/hooks/use-data-table-query-params';
import { formatDate } from '@/lib/format-date';
import { getErrorMessage } from '@/lib/get-error-message';
import type { IWalletHistoryEntry, IWalletJobRef, IWalletCustomerRef } from '@/types/wallet.types';

const DISPLAY_TYPES: Record<string, string> = {
  admin_settlement: 'Admin Settlement',
  cash_collection: 'Cash Collection',
};

function formatType(type: string): string {
  return DISPLAY_TYPES[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EmployeeWalletPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: adminDetails } = useGetAdminDetailsQuery();

  const { setPage, setLimit, queryParams } = useDataTableQueryParams({
    defaultLimit: 10,
  });

  const walletQueryParams = { ...queryParams, engineerId: id || '' };

  const { data: apiResponse, isLoading } = useGetWalletHistoryQuery(walletQueryParams, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const [settleWallet, { isLoading: isSettling }] = useSettleWalletMutation();

  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');

  const history = apiResponse?.history ?? [];
  const employee = apiResponse?.employee;
  const pagination = apiResponse
    ? {
        page: apiResponse.page,
        limit: apiResponse.limit,
        total: apiResponse.total,
        totalPages: apiResponse.totalPages,
      }
    : undefined;

  const handleSettle = async () => {
    if (!settleAmount || Number(settleAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const adminId = adminDetails?.admin?._id;
    if (!adminId) {
      toast.error('Admin ID not found');
      return;
    }
    if (!id) {
      toast.error('Employee ID not found');
      return;
    }
    try {
      await settleWallet({
        adminId,
        fromEmployeeId: id,
        moneyReceiving: Number(settleAmount),
      }).unwrap();
      toast.success('Wallet settled successfully');
      setSettleDialogOpen(false);
      setSettleAmount('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to settle wallet'));
    }
  };

  const columns: ColumnDef<IWalletHistoryEntry>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (row) => (
        <span className="font-medium text-foreground">
          {formatType(row.type)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (row) => {
        const isPositive = row.type === 'cash_collection';
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : '-'}${row.amount}
          </span>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Details',
      cell: (row) => {
        if (row.type === 'admin_settlement') {
          return (
            <div className="text-[#6b7280] text-sm">
              <span className="font-medium text-foreground">{row.fromEmployeeId?.fullName || '-'}</span>
              {' → '}
              {row.toAdminId?.fullName || '-'}
            </div>
          );
        }
        if (row.type === 'cash_collection') {
          const job = typeof row.jobId === 'object' && row.jobId ? (row.jobId as IWalletJobRef) : null;
          const customer = typeof row.customerId === 'object' && row.customerId ? (row.customerId as IWalletCustomerRef) : null;
          return (
            <div className="text-[#6b7280] text-sm">
              {job?.jobId} · {customer?.fullName} ({job?.paymentType})
            </div>
          );
        }
        return <span className="text-[#6b7280]">-</span>;
      },
    },
    {
      accessorKey: 'employeeWalletBalanceAfter',
      header: 'Employee Balance',
      cell: (row) => (
        <span className="text-[#6b7280]">
          ${row.employeeWalletBalanceAfter}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: (row) => (
        <span className="text-[#6b7280]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="flex-1 w-full overflow-y-auto p-5 md:pl-10">
          <div className="mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.EMPLOYEES_VIEW.replace(':id', id || ''))}
              className="mb-4 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employee
            </Button>

            {employee && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#ececec] mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      image=""
                      name={employee.firstName + ' ' + employee.lastName}
                      size="lg"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        {employee.firstName} {employee.lastName}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Employee ID: {employee.employeeId}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Wallet className="h-4 w-4 text-primary" />
                        <span className="text-lg font-semibold text-foreground">
                          ${employee.wallet}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Current Wallet Balance
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSettleDialogOpen(true)}
                    className="h-10 rounded-xl bg-green-600 text-white hover:bg-green-700 px-5"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Settle Wallet
                  </Button>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0 flex flex-col">
              <DataTable<IWalletHistoryEntry>
                data={history}
                loading={isLoading}
                columns={columns}
                title=""
                description=""
                searchPlaceholder=""
                serverSideFiltering
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

      <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <DialogContent className="w-[calc(100%-24px)] sm:max-w-md rounded-3xl border-0 p-0 overflow-hidden shadow-2xl bg-white">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold text-foreground">
                Settle Wallet
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Receive money from {employee?.firstName} {employee?.lastName}'s wallet
              </DialogDescription>
            </DialogHeader>

            {employee && (
              <div className="mb-6 p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground">Current Employee Balance</p>
                <p className="text-2xl font-bold text-foreground">${employee.wallet}</p>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-foreground">
                Amount to Receive ($)
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="h-12 rounded-xl border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-0 focus-visible:border-foreground/30"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSettleDialogOpen(false);
                  setSettleAmount('');
                }}
                className="flex-1 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSettle}
                disabled={isSettling}
                className="flex-1 h-12 rounded-xl bg-green-600 text-white hover:bg-green-700"
              >
                {isSettling ? 'Processing...' : 'Settle'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
