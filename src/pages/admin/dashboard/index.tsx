import {
  Briefcase,
  CalendarDays,
  FileText,
  Users,
  UserSquare2,
  type LucideIcon,
} from 'lucide-react';

import {
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area as RechartsArea,
} from 'recharts';

// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useMemo } from 'react';

import { AppLayout } from '@/components/layout/app-layout';
import { Navbar } from '@/components/layout/navbar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { format, formatDistanceToNow } from 'date-fns';
import { ROUTES } from '@/constants';
import { useGetDashboardAnalyticsQuery } from '@/API/api';

const ACTIVITY_ICON_MAP: Record<string, LucideIcon> = {
  customer: Users,
  employee: UserSquare2,
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const statConfig = [
  {
    title: 'Total Customers',
    key: 'totalCustomers' as const,
    icon: Users,
    url: ROUTES.CUSTOMERS,
  },
  {
    title: 'Total Employees',
    key: 'totalEmployees' as const,
    icon: UserSquare2,
    url: ROUTES.EMPLOYEES,
  },
  {
    title: 'Total Jobs',
    key: 'totalJobs' as const,
    icon: Briefcase,
    url: ROUTES.JOBS,
  },
  {
    title: 'Total Invoices',
    key: 'totalInvoices' as const,
    icon: FileText,
  },
];

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const { data: analytics, isLoading } =
    useGetDashboardAnalyticsQuery({
      year: new Date().getFullYear(),
    });
  const [selectedSeries, setSelectedSeries] = useState<
    'customers' | 'employees' | 'jobs'
  >('customers');

  const stats = analytics?.summary
    ? statConfig.map((cfg) => ({
        ...cfg,
        value: String(Math.round(analytics.summary[cfg.key] ?? 0)),
      }))
    : statConfig.map((cfg) => ({ ...cfg, value: '0' }));

  const chartData = analytics?.charts
    ? MONTHS.map((name, i) => {
        let value: number;
        switch (selectedSeries) {
          case 'customers':
            value = analytics.charts.customers?.[i] ?? 0;
            break;
          case 'employees':
            value = analytics.charts.employees?.[i] ?? 0;
            break;
          case 'jobs':
            value = analytics.charts.jobs?.[i] ?? 0;
            break;
          default:
            value =
              (analytics.charts.customers?.[i] ?? 0) +
              (analytics.charts.employees?.[i] ?? 0) +
              (analytics.charts.jobs?.[i] ?? 0);
        }
        return { name, value: Math.round(value) };
      })
    : [];

  const activities = analytics?.recentActivities ?? [];

  const daysLeft = useMemo(() => {
    if (!user?.validity) return null;
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    return Math.ceil(
      (new Date(user.validity).getTime() - now) / (1000 * 60 * 60 * 24),
    );
  }, [user]);

  if (isLoading) {
    return (
      <AppLayout>
        <main className="flex-1 h-full px-4">
          <div className="min-h-full">
            <div className="mb-6 space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-72" />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="rounded-[20px] border border-[#ececec] py-4 shadow-sm"
                >
                  <CardContent className="flex flex-col items-center text-center">
                    <Skeleton className="mb-2 h-12 w-12 rounded-full" />
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="mt-1 h-3 w-24" />
                    <Skeleton className="mt-2 h-3 w-14" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-2.5 grid gap-3 xl:grid-cols-2">
              <Card className="rounded-[20px] border border-[#ececec] p-8 shadow-sm">
                <Skeleton className="mb-3 h-6 w-40" />
                <div className="space-y-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-1.5"
                    >
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-3">
                <Card className="rounded-[20px] border border-[#ececec] p-3.5 shadow-sm">
                  <div className="mb-3 p-2 flex items-center justify-between">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-7 w-[130px] rounded-lg" />
                  </div>
                  <Skeleton className="h-[170px] w-full rounded-lg" />
                </Card>

                <Card className="rounded-[20px] border border-[#ececec] shadow-sm">
                  <CardContent className="flex items-center justify-between px-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-52" />
                      </div>
                    </div>
                    <Skeleton className="hidden h-20 w-20 lg:block" />
                  </CardContent>
                </Card>
              </div>
            </div>

            <Skeleton className="mt-2 mx-auto h-3 w-72" />
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* This div contains the main dashboard content */}
      {/* Sidebar is handled by AppLayout */}
      <main className="flex-1 h-full px-4 pt-3">
        <div className="min-h-full">
          {/* Validity Warning */}
          {daysLeft !== null && daysLeft <= 7 && (
            <div
              className={` mx-[-15px] py-4 text-center ${
                daysLeft <= 3
                  ? 'bg-red-50 border border-red-100'
                  : 'bg-amber-50 border border-amber-100'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  daysLeft <= 3 ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                Your subscription expires on{' '}
                {format(new Date(user!.validity), 'MMM dd, yyyy')}
                {daysLeft <= 0
                  ? ' (expired)'
                  : ` (in ${daysLeft} day${daysLeft > 1 ? 's' : ''})`}
              </p>
            </div>
          )}

          {/* Header */}
          <Navbar
            title="Dashboard"
            subtitle="Here's what's happening with your system today."
          />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4 pt-4">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <Card
                  key={index}
                  className="rounded-[20px] border border-[#ececec] py-4 shadow-sm"
                >
                  <CardContent className="flex flex-col items-center text-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <h3 className="text-[30px] font-bold leading-none">
                      {item.value}
                    </h3>

                    <p className="mt-1 text-[12px] text-gray-500">
                      {item.title}
                    </p>

                    <button
                      className="mt-2 text-[12px] font-medium text-primary"
                      onClick={() => item.url && navigate(item.url)}
                    >
                      View all →
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom Grid */}
          <div className="mt-2.5 grid gap-3 xl:grid-cols-2">
            {/* Activities */}
            <Card className="rounded-[20px] border border-[#ececec] px-6  pt-6 shadow-sm">
              <h3 className="text-2xl font-bold">
                Recent Activities
              </h3>

              {activities.length > 0 ? (
                <div className="space-y-2.5">
                  {activities.slice(0, 7).map((item) => {
                    const Icon =
                      ACTIVITY_ICON_MAP[item.type] ?? CalendarDays;

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-1"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>

                        <div>
                          <h4 className="text-[13px] font-medium text-[#1b1b1b]">
                            {item.message}
                          </h4>

                          <p className="mt-0.5 text-[11px] text-gray-500">
                            {formatDistanceToNow(
                              new Date(item.timestamp),
                              { addSuffix: true },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center text-muted-foreground">
                  <CalendarDays className="mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </Card>

            {/* Right */}
            <div className="space-y-3">
              {/* Chart */}
              <Card className="rounded-[20px] border border-[#ececec] p-3.5 shadow-sm">
                <div className="mb-3 p-2 flex items-center justify-between">
                  <h3 className="text-[17px] font-bold">
                    Summary Overview
                  </h3>

                  <Select
                    value={selectedSeries}
                    onValueChange={(v) =>
                      setSelectedSeries(
                        v as 'customers' | 'employees' | 'jobs', // | 'all'
                      )
                    }
                  >
                    <SelectTrigger className="h-7 w-[130px] rounded-lg text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="all">All</SelectItem> */}
                      <SelectItem value="customers">
                        Customers
                      </SelectItem>
                      <SelectItem value="employees">
                        Employees
                      </SelectItem>
                      <SelectItem value="jobs">Jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="green"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--primary)"
                            stopOpacity={0.35}
                          />

                          <stop
                            offset="95%"
                            stopColor="var(--primary)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{ fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <RechartsArea
                        type="monotone"
                        dataKey="value"
                        stroke="var(--primary)"
                        fill="url(#green)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Banner */}
              <Card className="rounded-[20px] border border-[#ececec] shadow-sm">
                <CardContent className="flex items-center justify-between px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <h3 className="text-[16px] font-bold">
                        Stay Organized
                      </h3>

                      <p className="mt-1 max-w-sm text-[11px] text-gray-500">
                        Manage users, employees, jobs and invoices
                        efficiently.
                      </p>
                    </div>
                  </div>

                  <img
                    src="/management-logo.png"
                    alt="illustration"
                    className="hidden h-20 w-20 object-contain lg:block"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 border-t border-[#e9e9e9] p-2 pt-4 text-center text-[11px] text-gray-500">
            © 2026 No. 1 Lawns Admin Panel. All rights reserved.
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
