import { useState } from 'react';
import {
  Eye,
  DollarSign,
  Wallet,
  CreditCard,
  Building2,
  ArrowRight,
  Search,
  Loader2,
} from 'lucide-react';

import type { ColumnDef } from '@/components/data-table/data-table';
import DataTable from '@/components/data-table/data-table';
import { Navbar } from '@/components/layout/navbar';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useGetFinancialReportQuery } from '@/API/api';
import { formatDate } from '@/lib/format-date';
import type { IJob } from '@/types';
import type {
  FinancialSummary,
  PaymentBreakdownItem,
} from '@/types/finance.types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { Skeleton } from '@/components/ui/skeleton';

const today = () => new Date().toISOString().split('T')[0];
const monthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
};

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border border-[#e5e7eb] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border border-[#e5e7eb] shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FinancePage() {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(monthAgo());
  const [endDate, setEndDate] = useState(today());
  const [queryStartDate, setQueryStartDate] = useState(monthAgo());
  const [queryEndDate, setQueryEndDate] = useState(today());
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching, isUninitialized } =
    useGetFinancialReportQuery({
      startDate: queryStartDate,
      endDate: queryEndDate,
      page,
      limit,
    });

  const handleGenerate = () => {
    setQueryStartDate(startDate);
    setQueryEndDate(endDate);
    setPage(1);
  };

  const summary: FinancialSummary | undefined = data?.summary;
  const breakdown: PaymentBreakdownItem[] =
    data?.paymentBreakdown ?? [];
  const jobs: IJob[] = data?.jobs ?? [];

  const pagination = data
    ? {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      }
    : undefined;

  const formatCurrency = (amount: number | undefined) =>
    amount != null ? `$${amount.toFixed(2)}` : '$0.00';

  const columns: ColumnDef<IJob>[] = [
    {
      accessorKey: 'jobId',
      header: 'Job ID',
      cell: (row) => (
        <span className="text-[#6b7280]">#{row.jobId}</span>
      ),
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: (row) => (
        <span className="text-[#6b7280]">
          {typeof row.customerId === 'object' && row.customerId
            ? row.customerId.fullName
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'employeeId',
      header: 'Employee',
      cell: (row) => (
        <span className="text-[#6b7280]">
          {typeof row.employeeId === 'object' && row.employeeId
            ? row.employeeId.fullName
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: (row) => (
        <span className="font-medium text-[#151515]">
          {formatCurrency(row.price)}
        </span>
      ),
    },
    {
      accessorKey: 'paymentType',
      header: 'Payment Type',
      cell: (row) => (
        <span className="text-[#6b7280]">
          {row.paymentType
            ? row.paymentType
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => {
        const status = row.status ?? '';
        const color =
          status === 'completed'
            ? 'bg-green-100 text-green-700'
            : status === 'in-progress'
              ? 'bg-blue-100 text-blue-700'
              : status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700';
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
          >
            {status
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (row) => (
        <span className="text-[#6b7280]">
          {formatDate(row.jobDate || row.date)}
        </span>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              navigate(
                ROUTES.JOBS_VIEW_MANAGE.replace(':id', row._id ?? ''),
              )
            }
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-[#f5f5f5] text-[#374151] hover:bg-[#e5e5e5] transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
        </div>
      ),
    },
  ];

  const loading = isUninitialized || isLoading || isFetching;

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col">
        <div className="flex-1 w-full px-2 sm:px-5 py-1 sm:py-4 min-h-0 flex flex-col">
          <div className="flex w-full flex-col flex-1">
            <Navbar
              title="Financial Report "
              subtitle="View financial summary, payment breakdown, and job details."
              showWelcome={false}
            />

            <Card className="border border-[#e5e7eb] shadow-sm mt-4 mb-6 bg-gray-50/50">
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
                    onClick={handleGenerate}
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

            <div className="mt-6">
              {loading && !data ? (
                <SummarySkeleton />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <SummaryCard
                    title="Total Revenue"
                    value={formatCurrency(summary?.totalRevenue)}
                    icon={DollarSign}
                    color="#22c55e"
                  />
                  <SummaryCard
                    title="Cash Payment"
                    value={formatCurrency(summary?.totalCashPayments)}
                    icon={Wallet}
                    color="#f59e0b"
                  />
                  <SummaryCard
                    title="Online Payment"
                    value={formatCurrency(
                      summary?.totalOnlinePayments,
                    )}
                    icon={CreditCard}
                    color="#3b82f6"
                  />
                  <SummaryCard
                    title="Other Payment"
                    value={formatCurrency(
                      summary?.totalOtherPayments,
                    )}
                    icon={Building2}
                    color="#8b5cf6"
                  />
                </div>
              )}

              {breakdown.length > 0 && (
                <Card className="border border-[#e5e7eb] shadow-sm mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Payment Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e7eb]">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                            Type
                          </th>
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                            Jobs
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {breakdown.map((item, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-[#e5e7eb] last:border-0"
                          >
                            <td className="py-3 px-2 text-[#374151]">
                              {item.label}
                            </td>
                            <td className="py-3 px-2 text-right font-medium">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="py-3 px-2 text-right text-[#6b7280]">
                              {item.jobCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {summary && (
                <Card className="border border-[#e5e7eb] shadow-sm mb-6">
                  <CardHeader className="border-b border-[#e5e7eb]/50 pb-3">
                    <CardTitle className="text-base font-semibold">
                      Job Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="flex items-stretch gap-6">
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div className="rounded-xl p-4 bg-[#22c55e]/5 border border-[#22c55e]/10">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                              Completed
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[#151515]">
                            {summary.completedJobs}
                          </div>
                          <div className="mt-3 h-1 w-full rounded-full bg-[#22c55e]/10">
                            <div
                              className="h-full rounded-full bg-[#22c55e] transition-all duration-500"
                              style={{
                                width: `${summary.totalJobs > 0 ? (summary.completedJobs / summary.totalJobs) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="rounded-xl p-4 bg-[#f59e0b]/5 border border-[#f59e0b]/10">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                              Pending
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[#151515]">
                            {summary.pendingJobs}
                          </div>
                          <div className="mt-3 h-1 w-full rounded-full bg-[#f59e0b]/10">
                            <div
                              className="h-full rounded-full bg-[#f59e0b] transition-all duration-500"
                              style={{
                                width: `${summary.totalJobs > 0 ? (summary.pendingJobs / summary.totalJobs) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                        {/* <div className="rounded-xl p-4 bg-[#3b82f6]/5 border border-[#3b82f6]/10">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                              In Progress
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[#151515]">
                            {summary.inProgressJobs}
                          </div>
                          <div className="mt-3 h-1 w-full rounded-full bg-[#3b82f6]/10">
                            <div
                              className="h-full rounded-full bg-[#3b82f6] transition-all duration-500"
                              style={{
                                width: `${summary.totalJobs > 0 ? (summary.inProgressJobs / summary.totalJobs) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div> */}
                        <div className="rounded-xl p-4 bg-[#ef4444]/5 border border-[#ef4444]/10">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                              Cancelled
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-[#151515]">
                            {summary.cancelledJobs}
                          </div>
                          <div className="mt-3 h-1 w-full rounded-full bg-[#ef4444]/10">
                            <div
                              className="h-full rounded-full bg-[#ef4444] transition-all duration-500"
                              style={{
                                width: `${summary.totalJobs > 0 ? (summary.cancelledJobs / summary.totalJobs) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="w-px bg-[#e5e7eb]" />
                      <div className="flex flex-col items-center justify-center min-w-[120px] px-2">
                        <div className="text-4xl font-bold bg-gradient-to-b from-[#151515] to-[#6b7280] bg-clip-text text-transparent">
                          {summary.totalJobs}
                        </div>
                        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mt-2">
                          Total Jobs
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex-1 min-h-0 flex flex-col">
                <DataTable<IJob>
                  data={jobs}
                  loading={loading}
                  columns={columns}
                  title="Jobs"
                  description=""
                  searchPlaceholder=""
                  pagination={pagination}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
