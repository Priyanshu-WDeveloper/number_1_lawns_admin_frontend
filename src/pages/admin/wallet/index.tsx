import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Loader2,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import DataTable, {
  type ColumnDef,
} from '@/components/data-table/data-table';
import { useGetAdminWalletHistoryQuery } from '@/API/api';
import { formatDate } from '@/lib/format-date';
import type {
  IWalletHistoryEntry,
  IWalletJobRef,
  IWalletCustomerRef,
} from '@/types/wallet.types';

const today = () => new Date().toISOString().split('T')[0];
const monthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
};

const DISPLAY_TYPES: Record<string, string> = {
  admin_settlement: 'Admin Settlement',
  cash_collection: 'Cash Collection',
};

function formatType(type: string): string {
  return (
    DISPLAY_TYPES[type] ||
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function AdminWalletPage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(monthAgo());
  const [endDate, setEndDate] = useState(today());
  const [queryStartDate, setQueryStartDate] = useState(monthAgo());
  const [queryEndDate, setQueryEndDate] = useState(today());

  const {
    data: apiResponse,
    isLoading,
    isFetching,
  } = useGetAdminWalletHistoryQuery(
    { startDate: queryStartDate, endDate: queryEndDate },
    { refetchOnMountOrArgChange: true },
  );

  const history = apiResponse?.history ?? [];
  const loading = isLoading || isFetching;

  const walletBalance = useMemo(() => {
    const first = history[0];
    return first?.toAdminId?.wallet ?? 0;
  }, [history]);

  const handleFilter = () => {
    setQueryStartDate(startDate);
    setQueryEndDate(endDate);
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
        if (row.type === 'admin_settlement') {
          return (
            <span className="font-semibold text-green-600">
              +${row.amount}
            </span>
          );
        }
        return (
          <span className="font-semibold text-red-600">
            -${row.amount}
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
            <div className="text-sm">
              <span className="font-medium text-foreground">
                {row.fromEmployeeId?.fullName || '-'}
              </span>
              {row.fromEmployeeId?.employeeId && (
                <span className="text-muted-foreground">
                  {' '}
                  ({row.fromEmployeeId.employeeId})
                </span>
              )}
              <span className="mx-1.5 text-muted-foreground/50">
                →
              </span>

              <span className="font-medium text-foreground">
                {row.toAdminId?.fullName || '-'}
              </span>
            </div>
          );
        }
        if (row.type === 'cash_collection') {
          const job =
            typeof row.jobId === 'object' && row.jobId
              ? (row.jobId as IWalletJobRef)
              : null;
          const customer =
            typeof row.customerId === 'object' && row.customerId
              ? (row.customerId as IWalletCustomerRef)
              : null;
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
      accessorKey: 'adminWalletBalanceAfter',
      header: 'Balance',
      cell: (row) => (
        <span className="text-[#6b7280]">
          ${row.adminWalletBalanceAfter ?? '-'}
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
              onClick={() => navigate(-1)}
              className="mb-4 text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <h1 className="text-2xl font-bold text-foreground mb-1">
              My Wallet
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              View your wallet transaction history
            </p>

            <Card className="border border-[#e5e7eb] shadow-sm mb-6 bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Balance
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      ${walletBalance}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[#e5e7eb] shadow-sm mb-6 bg-gray-50/50">
              <CardHeader className="border-b border-[#e5e7eb]/50 pb-0">
                <CardTitle className="text-base font-semibold">
                  Date Range
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-end gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      From
                    </label>
                    <DatePicker
                      value={startDate}
                      onChange={setStartDate}
                      placeholder="Start date"
                    />
                  </div>
                  <div className="flex items-center pb-2.5">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      To
                    </label>
                    <DatePicker
                      value={endDate}
                      onChange={setEndDate}
                      placeholder="End date"
                    />
                  </div>
                  <Button
                    onClick={handleFilter}
                    disabled={loading}
                    className="ml-auto min-w-[120px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1 min-h-0 flex flex-col">
              <DataTable<IWalletHistoryEntry>
                data={history}
                loading={loading}
                columns={columns}
                title=""
                description=""
                searchPlaceholder=""
                serverSideFiltering
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
