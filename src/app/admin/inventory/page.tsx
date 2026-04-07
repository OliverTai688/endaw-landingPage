'use client';

import React, { Suspense } from 'react';
import { InventoryProvider } from '@/components/providers/InventoryProvider';
import { InventoryManager } from '@/components/admin/InventoryManager';

export default function AdminInventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <InventoryProvider>
        <InventoryManager />
      </InventoryProvider>
    </Suspense>
  );
}
