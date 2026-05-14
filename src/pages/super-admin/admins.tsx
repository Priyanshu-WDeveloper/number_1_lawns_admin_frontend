import React from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Shield, Plus, Search, MoreHorizontal, Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const admins = [
  { id: 1, name: 'John Smith', email: 'john@no1lawns.com', role: 'Admin', status: 'Active', createdAt: '2024-01-15' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@no1lawns.com', role: 'Admin', status: 'Active', createdAt: '2024-02-20' },
  { id: 3, name: 'Mike Brown', email: 'mike@no1lawns.com', role: 'Admin', status: 'Inactive', createdAt: '2023-11-05' },
  { id: 4, name: 'Emily Davis', email: 'emily@no1lawns.com', role: 'Admin', status: 'Active', createdAt: '2024-03-10' },
];

const SuperAdminAdminsPage: React.FC = () => {
  return (
    <SuperAdminLayout>
      <main className="flex-1 w-full overflow-y-auto px-4 pt-5 pb-5">
        <div className="min-h-full w-full">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h2 className="text-[24px] font-bold text-[#151515]">
                Admin Users
              </h2>
              <p className="mt-1 text-[13px] text-[#777]">
                Manage admin accounts and permissions
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
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </div>

          <div className="bg-white rounded-[20px] border border-[#ececec] p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777] size-5" />
                <input
                  type="text"
                  placeholder="Search admins..."
                  className="w-full h-10 pl-10 pr-4 border border-[#ececec] rounded-xl text-[#151515] placeholder:text-[#777] focus:outline-none focus:border-green-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ececec]">
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Name</th>
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Email</th>
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Role</th>
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Status</th>
                    <th className="text-left text-[#777] text-sm font-medium pb-3">Created</th>
                    <th className="text-right text-[#777] text-sm font-medium pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-[#ececec] hover:bg-[#f4f7ef]">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#edf8e7] flex items-center justify-center">
                            <Shield className="size-5 text-[#16610E]" />
                          </div>
                          <span className="text-sm font-medium text-[#151515]">{admin.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-[#777]">{admin.email}</td>
                      <td className="py-4">
                        <Badge variant="default" className="bg-[#f4f7ef] text-[#16610E] border-[#ececec]">
                          {admin.role}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant="default"
                          className={admin.status === 'Active' ? 'bg-[#edf8e7] text-[#16610E] border-[#16610E]/20' : 'bg-gray-100 text-gray-500 border-gray-200'}
                        >
                          {admin.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-[#777]">{admin.createdAt}</td>
                      <td className="py-4 text-right">
                        <button className="p-2 hover:bg-[#f4f7ef] rounded-lg transition-colors">
                          <MoreHorizontal className="size-5 text-[#777]" />
                        </button>
                      </td>
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

export default SuperAdminAdminsPage;