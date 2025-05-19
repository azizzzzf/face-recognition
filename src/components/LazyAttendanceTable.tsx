'use client';

import { Suspense, lazy, useState } from 'react';

// Lazy load the AttendanceTable
const AttendanceTable = lazy(() => import('./AttendanceTable'));

export default function LazyAttendanceTable() {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <div className="w-full mt-8 text-center">
        <button
          onClick={() => setIsExpanded(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Tampilkan Riwayat Kehadiran
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Riwayat Kehadiran</h2>
        <button
          onClick={() => setIsExpanded(false)}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 transition"
        >
          Sembunyikan
        </button>
      </div>
      
      <Suspense fallback={
        <div className="rounded-md border p-4 w-full">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          <p className="text-center mt-2 text-gray-500">Memuat komponen tabel...</p>
        </div>
      }>
        <AttendanceTable />
      </Suspense>
    </div>
  );
} 