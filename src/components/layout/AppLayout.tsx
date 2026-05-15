'use client';

import React from 'react';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DashboardSidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#F4F7EF]">
        <div className="flex min-h-screen bg-[#f8f8f5] shadow-xl">
          <DashboardSidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto px-4 md:ml-12">
            {/* Mobile menu toggle */}
            <div className="pt-4 md:hidden">
              <SidebarTrigger className="h-10 w-10 rounded-lg border border-[#ececec] bg-white shadow-sm" />
            </div>

            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
