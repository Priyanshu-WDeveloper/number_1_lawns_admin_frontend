import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '18rem' } as React.CSSProperties}
    >
      <div className="h-screen overflow-hidden w-full bg-[#F4F7EF]">
        <div className="flex h-full rounded-[22px] bg-[#f8f8f5] shadow-xl">
          <DashboardSidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto  flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
