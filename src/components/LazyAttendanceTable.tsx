'use client';

import { Suspense, lazy, useState } from 'react';
import { Button } from '@/components/ui/button';

// Lazy load the AttendanceTable
const AttendanceTable = lazy(() => import('./AttendanceTable'));

export default function LazyAttendanceTable() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    // Increment key to force refresh
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Riwayat Kehadiran</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
          Refresh
        </Button>
      </div>
      
      <Suspense fallback={
        <div className="rounded-md border border-border p-6 w-full bg-muted">
          <div className="flex justify-center mb-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Memuat data kehadiran...</p>
        </div>
      }>
        <AttendanceTable key={refreshKey} />
      </Suspense>
    </div>
  );
} 