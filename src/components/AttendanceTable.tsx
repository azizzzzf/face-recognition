'use client';

import { useEffect, useState } from 'react';

interface AttendanceLog {
  id: string;
  userId: string;
  similarity: number;
  latencyMs: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AttendanceResponse {
  success: boolean;
  data: AttendanceLog[];
  pagination: PaginationInfo;
  error?: string;
}

export default function AttendanceTable() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page: number, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/logs?page=${page}&limit=${limit}`);
      
      const data: AttendanceResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengambil data log kehadiran');
      }
      
      console.log('Data logs received:', data.data);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Jika dateString tidak valid, coba parsing manual
      if (!dateString || dateString === 'undefined' || dateString === 'null') {
        return 'Tanggal tidak tersedia';
      }
      
      // Jika dateString adalah timestamp Unix (string angka), konversi ke ms
      if (!isNaN(Number(dateString))) {
        const timestamp = Number(dateString);
        // Jika angka terlalu kecil, mungkin waktu dalam detik, bukan millidetik
        const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
        if (isNaN(date.getTime())) {
          return dateString; // Kembalikan string asli jika konversi gagal
        }
        return new Intl.DateTimeFormat('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
      
      // Coba parsing standar
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return dateString; // Kembalikan string asli jika konversi gagal
      }
      
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString; // Kembalikan string asli jika terjadi error
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-4 w-full">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        <p className="text-center mt-2 text-gray-500">Memuat data kehadiran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 w-full">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={() => fetchLogs(currentPage)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-md border p-4 w-full">
        <p className="text-center text-gray-500">Belum ada data kehadiran</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b transition-colors">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kecocokan</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Latency (ms)</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle">{log.id}</td>
                <td className="p-4 align-middle font-medium">{log.user.name}</td>
                <td className="p-4 align-middle">{(log.similarity * 100).toFixed(2)}%</td>
                <td className="p-4 align-middle">{log.latencyMs.toFixed(2)}</td>
                <td className="p-4 align-middle">{formatDate(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Menampilkan {logs.length} dari {pagination.total} data
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1 rounded border bg-blue-50 border-blue-200">
              {currentPage} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(
                currentPage < pagination.totalPages ? currentPage + 1 : pagination.totalPages
              )}
              disabled={currentPage >= pagination.totalPages}
              className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 