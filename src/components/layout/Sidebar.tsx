import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { LogOutIcon } from 'lucide-react';

import Dashboard from '@/assets/dashboard.png';
import Customer from '@/assets/customer.png';
import Employee from '@/assets/employee.png';
import Job from '@/assets/job.png';
import Invoices from '@/assets/invoices.png';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { PanelLeftIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

const items = [
  {
    title: 'Dashboard',
    icon: Dashboard,
    url: '/dashboard',
  },
  {
    title: 'Customer Management',
    icon: Customer,
    url: '/customers',
  },
  {
    title: 'Employee Management',
    icon: Employee,
    url: '/employees',
  },
  {
    title: 'Job Management',
    icon: Job,
    url: '/jobs',
  },
  {
    title: 'Invoice',
    icon: Invoices,
    // url: '/invoices',
  },
];

export function DashboardSidebar() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutDialog(false);
  };

  return (
    <Sidebar className="border-r-0 w-78">
      <SidebarHeader className="bg-gradient-to-b from-[#0f5b0c] to-[#0b4308] text-white">
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <img
              src="/image.png"
              alt="logo"
              className="h-10 w-10 rounded-full"
            />
            <h2 className="text-2xl font-bold">No. 1 Lawns</h2>
          </div>
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <PanelLeftIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-[#0f5b0c] to-[#0b4308] text-white">
        <SidebarGroup>
          <SidebarMenu className="space-y-3 px-3">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  className="h-14 rounded-2xl text-base text-white hover:bg-[#2a7d20] hover:text-blue-50 data-[active=true]:bg-[#2a7d20] data-[active=true]:text-white"
                >
                  <a href={item.url}>
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="h-5 w-5 invert"
                    />{' '}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#0b4308] p-4">
        <button
          className="w-full rounded-2xl bg-white/10 p-4 text-left backdrop-blur transition hover:bg-white/20"
          onClick={() => setShowLogoutDialog(true)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <span className="font-bold text-[#0b4308]">
                <LogOutIcon />
              </span>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white">
                Logout (Admin)
              </h4>

              <p className="text-sm text-white/70">Administrator</p>
            </div>
          </div>
        </button>
      </SidebarFooter>

      <Dialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Logout</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to logout? You will need to login
              again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
