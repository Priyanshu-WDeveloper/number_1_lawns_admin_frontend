'use client';

import {
  Bell,
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileText,
  Users,
  UserSquare2,
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { AppLayout } from '../../components/layout/AppLayout'; // Corrected import path
import { useNavigate } from 'react-router-dom';
import AccountDropdown from '../../components/account-dropdown';

const stats = [
  {
    title: 'Total Customers',
    value: '245',
    icon: Users,
    url: '/customers',
  },
  {
    title: 'Total Employees',
    value: '158',
    icon: UserSquare2,
    url: '/employees',
  },
  {
    title: 'Total Jobs',
    value: '89',
    icon: Briefcase,
    url: '/jobs',
  },
  {
    title: 'Total Invoices',
    value: '320',
    icon: FileText,
  },
];

const activities = [
  {
    title: 'New user John Doe has been registered.',
    time: '10 minutes ago',
    icon: Users,
  },
  {
    title: 'Employee Sarah Smith has been added.',
    time: '1 hour ago',
    icon: ClipboardList,
  },
  {
    title: 'New job "Web Developer" has been posted.',
    time: '3 hours ago',
    icon: Briefcase,
  },
  {
    title: 'Invoice INV-2024-320 has been generated.',
    time: '5 hours ago',
    icon: FileText,
  },
];

const chartData = [
  { name: 'May 1', value: 12 },
  { name: 'May 5', value: 38 },
  { name: 'May 8', value: 34 },
  { name: 'May 12', value: 49 },
  { name: 'May 15', value: 52 },
  { name: 'May 18', value: 66 },
  { name: 'May 21', value: 60 },
  { name: 'May 24', value: 74 },
  { name: 'May 27', value: 70 },
  { name: 'May 29', value: 95 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      {/* This div contains the main dashboard content */}
      {/* Sidebar is handled by AppLayout */}
      <main className="flex-1 h-full px-4 pt-9">
        <div className="min-h-full">
          {/* Header */}
          <div className="mb-3 px-4 flex items-center justify-between flex-col sm:flex-row">
            <div className="pb-4">
              <h2 className="text-[24px]  font-bold text-[#151515]">
                Welcome back, Admin! 👋
              </h2>

              <p className="mt-1 text-[13px] text-[#777]">
                Here's what's happening with your system today.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                <Bell
                  className="h-4 w-4"
                  onClick={() => navigate('/notifications')}
                />

                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] text-white">
                  3
                </span>
              </button>

              <div className="flex items-center justify-end p-6">
                <AccountDropdown superAccess={false} />
              </div>
              {/* <div className="flex items-center gap-2 rounded-xl border border-[#ececec] bg-white px-3 py-1.5 shadow-sm"> */}
              {/* <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    A
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm font-semibold">Admin</span> */}
              {/* <AccountDropdown /> */}
              {/* <ChevronDown className="h-4 w-4 text-gray-500" /> */}
              {/* </div> */}
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <Card
                  key={index}
                  className="rounded-[20px] border border-[#ececec] py-4 shadow-sm"
                >
                  <CardContent className="flex flex-col items-center text-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf8e7]">
                      <Icon className="h-6 w-6 text-[#16610E]" />
                    </div>

                    <h3 className="text-[30px] font-bold leading-none">
                      {item.value}
                    </h3>

                    <p className="mt-1 text-[12px] text-gray-500">
                      {item.title}
                    </p>

                    <button
                      className="mt-2 text-[12px] font-medium text-[#1d7a16]"
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
            <Card className="rounded-[20px] border border-[#ececec] p-8 shadow-sm">
              <h3 className="mb-3 text-2xl font-bold">
                Recent Activities
              </h3>

              <div className="space-y-2.5">
                {activities.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-1.5"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf8e7]">
                        <Icon className="h-3.5 w-3.5 text-[#16610E]" />
                      </div>

                      <div>
                        <h4 className="text-[13px] font-medium text-[#1b1b1b]">
                          {item.title}
                        </h4>

                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Right */}
            <div className="space-y-3">
              {/* Chart */}
              <Card className="rounded-[20px] border border-[#ececec] p-3.5 shadow-sm">
                <div className="mb-3 p-2 flex items-center justify-between">
                  <h3 className="text-[17px] font-bold">
                    Summary Overview
                  </h3>

                  <Button
                    variant="outline"
                    className="h-7 rounded-lg px-3 text-[11px]"
                  >
                    This Month
                  </Button>
                </div>

                <div className="h-[170px]">
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
                            stopColor="#4CAF50"
                            stopOpacity={0.35}
                          />

                          <stop
                            offset="95%"
                            stopColor="#4CAF50"
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
                      />

                      <Tooltip />

                      <RechartsArea
                        type="monotone"
                        dataKey="value"
                        stroke="#3FAE2A"
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf8e7]">
                      <CalendarDays className="h-5 w-5 text-[#16610E]" />
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
