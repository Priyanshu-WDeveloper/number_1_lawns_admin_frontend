import React from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { CreditCard, DollarSign, TrendingUp, Calendar, Download, Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const billingStats = [
  { label: 'Total Revenue', value: '$45,231', change: '+12.5%', icon: DollarSign, color: 'text-[#16610E]', bgColor: 'bg-[#edf8e7]' },
  { label: 'Pending Payments', value: '$3,450', change: '-2.3%', icon: CreditCard, color: 'text-[#16610E]', bgColor: 'bg-[#edf8e7]' },
  { label: 'Monthly Growth', value: '+18.2%', change: '', icon: TrendingUp, color: 'text-[#16610E]', bgColor: 'bg-[#edf8e7]' },
  { label: 'Active Subscriptions', value: '142', change: '+8.1%', icon: Calendar, color: 'text-[#16610E]', bgColor: 'bg-[#edf8e7]' },
];

const recentInvoices = [
  { id: 'INV-001', customer: 'Acme Corp', amount: '$2,500', status: 'Paid', date: '2024-05-10' },
  { id: 'INV-002', customer: 'John Doe', amount: '$450', status: 'Pending', date: '2024-05-12' },
  { id: 'INV-003', customer: 'Smith & Co', amount: '$1,800', status: 'Overdue', date: '2024-05-08' },
  { id: 'INV-004', customer: 'Jane Wilson', amount: '$320', status: 'Paid', date: '2024-05-14' },
];

const SuperAdminBillingPage: React.FC = () => {
  return (
    <SuperAdminLayout>
      <main className="flex-1 w-full overflow-y-auto px-4 pt-5 pb-5">
        <div className="min-h-full w-full">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h2 className="text-[24px] font-bold text-[#151515]">
                Billing & Payments
              </h2>
              <p className="mt-1 text-[13px] text-[#777]">
                Monitor revenue and manage invoices
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] text-white">
                  3
                </span>
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-[#ececec] bg-white px-3 py-1.5 shadow-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-green-600 text-white">
                    SA
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">Super Admin</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="mb-1 flex justify-end">
            <Button className="rounded-xl gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {billingStats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-[20px] border border-[#ececec] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-[#777]">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#151515] mt-1">{stat.value}</p>
                    {stat.change && (
                      <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`size-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[20px] border border-[#ececec] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#151515] mb-4">Recent Invoices</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ececec]">
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Invoice</th>
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Customer</th>
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Amount</th>
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Status</th>
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-[#ececec] hover:bg-[#f4f7ef]">
                      <td className="py-4 text-sm font-medium text-[#151515]">{invoice.id}</td>
                      <td className="py-4 text-sm text-[#777]">{invoice.customer}</td>
                      <td className="py-4 text-sm font-medium text-[#151515]">{invoice.amount}</td>
                      <td className="py-4">
                        <Badge
                          variant="default"
                          className={
                            invoice.status === 'Paid'
                              ? 'bg-[#edf8e7] text-[#16610E] border-[#16610E]/20'
                              : invoice.status === 'Pending'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-red-100 text-red-600 border-red-200'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-[#777]">{invoice.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </SuperAdminLayout>
  );
};

export default SuperAdminBillingPage;