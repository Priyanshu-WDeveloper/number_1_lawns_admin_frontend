import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Shield,
  LogOutIcon,
} from 'lucide-react';

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

const items = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    url: '/super-admin/dashboard',
  },
  {
    title: 'Admin Users',
    icon: Users,
    url: '/super-admin/admins',
  },
  {
    title: 'Billing',
    icon: CreditCard,
    url: '/super-admin/billing',
  },
];

export function SuperAdminSidebar() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    try {
      // remove auth data manually if needed
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // redirect to login page
      navigate('/login');
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Sidebar className="border-r-0 w-78 bg-gradient-to-b from-[#0f5b0c] to-[#0b4308]">
      <SidebarHeader className="bg-gradient-to-b from-[#0f5b0c] to-[#0b4308] text-white border-b border-[#0a3a0a]">
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Shield className="h-5 w-5 text-[#0b4308]" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Super Admin
            </h2>
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
          <SidebarMenu className="space-y-2 px-3">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => navigate(item.url)}
                  isActive={location.pathname === item.url}
                  className="h-14 rounded-2xl text-base text-white hover:bg-[#2a7d20] hover:text-white data-[active=true]:bg-[#2a7d20] data-[active=true]:text-white"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
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
                Logout (Super Admin)
              </h4>

              <p className="text-sm text-white/70">Control Panel</p>
            </div>
          </div>
        </button>
      </SidebarFooter>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Logout</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to logout? You will need to login again to
              access your account.
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
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
