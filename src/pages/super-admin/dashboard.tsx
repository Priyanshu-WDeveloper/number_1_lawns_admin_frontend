import React from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import {
  Users,
  Shield,
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import AccountDropdown from '../../components/account-dropdown';

const SuperAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  // const { / } = useSidebar();

  return (
    <SuperAdminLayout>
      <main className="flex-1 w-full overflow-y-auto px-4 pt-5 pb-5">
        <div className="min-h-full w-full">
          <div className="mb-3 px-4 flex flex-col-reverse items-center justify-between sm:flex-row">
            <div className="pb-4">
              <h2 className="text-[24px] font-bold text-[#151515]">
                Super Admin Dashboard
              </h2>
              <p className="mt-1 text-[13px] text-[#777]">
                Overview of system administration
              </p>
            </div>
            <div className="flex pb-4 items-center gap-2.5">
              {/* <button
                // onClick={toggleSidebar}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ececec] bg-white shadow-sm md:hidden"
              >
                <PanelLeftIcon className="h-4 w-4 text-[#151515]" />
              </button> */}
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                <Bell
                  className="h-4 w-4"
                  onClick={() =>
                    navigate('super-admin/notifications')
                  }
                />
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] text-white">
                  3
                </span>
              </button>
              {/* <div className="flex items-center gap-2 rounded-xl border border-[#ececec] bg-white px-3 py-1.5 shadow-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-green-600 text-white">
                    SA
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">
                  Super Admin
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div> */}
              <div className="flex items-center justify-end p-6">
                <AccountDropdown superAccess={true} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-[20px] border border-[#ececec] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[#777]">
                    Total Admin Users
                  </p>
                  <p className="text-2xl font-bold text-[#151515] mt-1">
                    12
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#edf8e7] flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#16610E]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#ececec] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[#777]">
                    Active Sessions
                  </p>
                  <p className="text-2xl font-bold text-[#151515] mt-1">
                    8
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#edf8e7] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#16610E]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#ececec] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[#777]">
                    System Status
                  </p>
                  <Badge
                    variant="default"
                    className="mt-2 bg-[#edf8e7] text-[#16610E] border-[#16610E]/20"
                  >
                    Online
                  </Badge>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#edf8e7] flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#16610E]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#ececec] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[#777]">
                    Admin Actions
                  </p>
                  <p className="text-2xl font-bold text-[#151515] mt-1">
                    156
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#edf8e7] flex items-center justify-center">
                  <Settings className="w-6 h-6 text-[#16610E]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-[#ececec] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#151515] mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#ececec]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#edf8e7] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#16610E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#151515]">
                      New admin user created
                    </p>
                    <p className="text-xs text-[#777]">
                      admin@no1lawns.com
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#777]">
                  2 hours ago
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#ececec]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#edf8e7] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#16610E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#151515]">
                      Login from new device
                    </p>
                    <p className="text-xs text-[#777]">
                      192.168.1.100
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#777]">
                  5 hours ago
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#edf8e7] flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#16610E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#151515]">
                      System settings updated
                    </p>
                    <p className="text-xs text-[#777]">
                      Security policy modified
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#777]">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboardPage;
