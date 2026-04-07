'use client';

import React, { Suspense } from 'react';
import { MusicManager } from '@/components/admin/MusicManager';

export default function AdminMusicPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <MusicManager />
    </Suspense>
  );
}
