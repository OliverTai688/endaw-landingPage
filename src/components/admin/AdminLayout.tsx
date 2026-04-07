'use client';

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import FeedbackOverlay from './FeedbackOverlay';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define a page name for feedback context
  const getPageName = (path: string) => {
    if (path === '/admin') return 'Dashboard';
    if (path.startsWith('/admin/orders')) return 'Orders';
    if (path.startsWith('/admin/products')) return 'Products';
    if (path.startsWith('/admin/inventory')) return 'Inventory';
    if (path.startsWith('/admin/content')) return 'Content Management';
    if (path.startsWith('/admin/announcements')) return 'Announcements';
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 h-screen overflow-hidden relative">
        <FeedbackOverlay pageName={getPageName(pathname)}>
            <div className="h-full overflow-auto p-8">
                <div className="max-w-7xl mx-auto pb-20">
                    {children}
                </div>
            </div>
        </FeedbackOverlay>
      </main>
    </div>
  );
}
