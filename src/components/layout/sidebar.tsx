import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { LogOutIcon, Video } from 'lucide-react';

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
} from '@/components/ui/sidebar';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import { useLogoutMutation } from '@/API/api';
// import { ChangeAdminPasswordDialog } from '@/pages/admin/change-password';

const items = [
  {
    title: 'Dashboard',
    icon: Dashboard,
    url: ROUTES.DASHBOARD,
  },
  {
    title: 'Customer Management',
    icon: Customer,
    url: ROUTES.CUSTOMERS,
  },
  {
    title: 'Employee Management',
    icon: Employee,
    url: ROUTES.EMPLOYEES,
  },
  {
    title: 'Manage Job',
    icon: Job,
    url: ROUTES.MANAGE_JOBS,
  },
  {
    title: 'Scheduled Job',
    icon: Job,
    url: ROUTES.SCHEDULED_JOBS,
  },
  {
    title: 'Invoice',
    icon: Invoices,
    url: ROUTES.INVOICES,
  },
  {
    title: 'Training Center',
    icon: Video,
    url: ROUTES.TRAINING_CENTER,
    isLucide: true,
  },
];

export function DashboardSidebar() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // const [confirmAction, setConfirmAction] = useState<{
  //   type: 'change-password';
  // } | null>(null);

  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success('Logged out');
      setShowLogoutDialog(false);
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="bg-gradient-to-b from-[var(--sidebar-bg-from)] to-[var(--sidebar-bg-to)] border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <img
              src="/image.png"
              alt="logo"
              className="h-10 w-10 rounded-full"
            />
            <h2 className="text-2xl font-bold">No. 1 Lawns</h2>
          </div>

        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-[var(--sidebar-bg-from)] to-[var(--sidebar-bg-to)]">
        <SidebarGroup>
          <SidebarMenu className="space-y-2 px-3">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  className="h-11 rounded-2xl text-base hover:bg-[var(--sidebar-active)] data-[active=true]:bg-[var(--sidebar-active)]"
                >
                  <Link to={item.url}>
                    {'isLucide' in item ? (
                      <item.icon className="h-5 w-5 " />
                    ) : (
                      <img
                        src={item.icon}
                        alt={item.title}
                        className="h-5 w-5 invert"
                      />
                    )}{' '}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[var(--sidebar-bg-to)] p-4 space-y-2">
        {/* <button
          className="w-full rounded-2xl bg-white/10 p-4 text-left backdrop-blur transition hover:bg-white/20"
          onClick={() =>
            setConfirmAction({
              type: 'change-password',
            })
          }
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <KeyRound className="h-5 w-5 text-sidebar" />
            </div>

            <div>
              <h4 className="text-base font-semibold text-white">
                Change Password
              </h4>

              <p className="text-sm text-white/70">Update password</p>
            </div>
          </div>
        </button> */}

        <button
          className="w-full rounded-2xl bg-white/10 p-4 text-left backdrop-blur transition hover:bg-white/20"
          onClick={() => setShowLogoutDialog(true)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <span className="font-bold text-sidebar">
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

      {/* <ChangeAdminPasswordDialog
        open={confirmAction?.type === 'change-password'}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      /> */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Logout"
        description="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        onConfirm={handleLogout}
      />
    </Sidebar>
  );
}
