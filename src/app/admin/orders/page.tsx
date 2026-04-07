'use client';

import React, { Suspense } from 'react';
import { OrderProvider } from '@/components/providers/OrderProvider';
import { OrderManager } from '@/components/admin/OrderManager';

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <OrderProvider>
        <OrderManager />
      </OrderProvider>
    </Suspense>
  );
}
