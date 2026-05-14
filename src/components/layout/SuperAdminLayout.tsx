'use client';

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SuperAdminSidebar } from '@/components/layout/super-admin-sidebar';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="h-screen overflow-hidden w-full bg-[#F4F7EF]">
        <div className="flex h-full rounded-[22px] bg-[#f8f8f5] shadow-xl">
          <div className="w-[19rem] flex-shrink-0">
            <SuperAdminSidebar />
          </div>
          <main className="flex-1 overflow-y-auto px-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}