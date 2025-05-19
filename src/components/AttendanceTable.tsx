'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      <div className="rounded-md border border-border p-6 w-full bg-muted">
        <div className="flex justify-center mb-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">Memuat data kehadiran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-3">
          <Button 
            onClick={() => fetchLogs(currentPage)}
            variant="outline"
            size="sm"
          >
            Coba Lagi
          </Button>
        </div>
      </Alert>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-md border border-border p-6 w-full bg-muted">
        <p className="text-center text-muted-foreground">Belum ada data kehadiran</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nama</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Kecocokan</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Latency (ms)</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 align-middle text-muted-foreground">{log.id.substring(0, 8)}...</td>
                  <td className="p-3 align-middle font-medium">{log.user.name}</td>
                  <td className="p-3 align-middle">{(log.similarity * 100).toFixed(2)}%</td>
                  <td className="p-3 align-middle text-muted-foreground">{log.latencyMs.toFixed(2)}</td>
                  <td className="p-3 align-middle text-muted-foreground">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-sm">
          <p className="text-muted-foreground">
            Menampilkan {logs.length} dari {pagination.total} data
          </p>
          <div className="flex gap-1">
            <Button
              onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage <= 1}
              variant="outline"
              size="sm"
            >
              Sebelumnya
            </Button>
            <span className="px-3 py-1.5 rounded-md border border-border bg-muted text-foreground">
              {currentPage} / {pagination.totalPages || 1}
            </span>
            <Button
              onClick={() => setCurrentPage(
                currentPage < pagination.totalPages ? currentPage + 1 : pagination.totalPages
              )}
              disabled={currentPage >= pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 