import { useLocation, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Shield,
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
} from '@/components/ui/sidebar';

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
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar style={{ width: '19rem' }} className="border-r-0 bg-gradient-to-b from-[#0f5b0c] to-[#0b4308]">
      <SidebarHeader className="bg-gradient-to-b from-[#0f5b0c] to-[#0b4308] text-white border-b border-[#0a3a0a]">
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <Shield className="h-5 w-5 text-[#0b4308]" />
          </div>

          <h2 className="text-xl font-bold text-white">
            Super Admin
          </h2>
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
                  className="
                    h-12
                    rounded-xl
                    text-sm
                    text-white
                    hover:bg-[#2a7d20]
                    data-[active=true]:bg-[#2a7d20]
                    data-[active=true]:text-white
                  "
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#0b4308] border-t border-[#0a3a0a] p-4">
        <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Shield className="h-5 w-5 text-[#0b4308]" />
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm">
                Super Admin
              </h4>

              <p className="text-xs text-white/70">Control Panel</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
