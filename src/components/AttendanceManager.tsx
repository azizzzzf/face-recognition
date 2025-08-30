'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Calendar, Trash2, Eye, X, Users } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Alert, AlertDescription } from '@/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/ui/dialog';

interface AttendanceLog {
  id: string;
  userId: string;
  similarity: number;
  latencyMs: number;
  createdAt: string;
  model: string;
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

interface AttendanceStats {
  todayCount: number;
  weekCount: number;
  averageAccuracy: number;
  mostUsedModel: string;
}

export default function AttendanceManager() {
  // State management
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [stats, setStats] = useState<AttendanceStats>({
    todayCount: 0,
    weekCount: 0,
    averageAccuracy: 0,
    mostUsedModel: 'face-api'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null);
  const [deleteLog, setDeleteLog] = useState<AttendanceLog | null>(null);

  // Fetch all logs for client-side filtering and statistics
  const fetchAllLogs = async () => {
    try {
      const response = await fetch('/api/logs?page=1&limit=1000');
      const data: AttendanceResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch logs');
      }
      
      calculateStats(data.data);
    } catch (err) {
      console.error('Error fetching all logs:', err);
    }
  };

  // Fetch paginated logs
  const fetchLogs = async (page: number, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/logs?page=${page}&limit=${limit}`);
      const data: AttendanceResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengambil data kehadiran');
      }
      
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics from all logs
  const calculateStats = (allLogsData: AttendanceLog[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayCount = allLogsData.filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate >= today;
    }).length;

    const weekCount = allLogsData.filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate >= weekAgo;
    }).length;

    const averageAccuracy = allLogsData.length > 0 
      ? allLogsData.reduce((sum, log) => sum + log.similarity, 0) / allLogsData.length * 100
      : 0;

    const modelCounts = allLogsData.reduce((acc, log) => {
      acc[log.model] = (acc[log.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedModel = Object.entries(modelCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'face-api';

    setStats({
      todayCount,
      weekCount,
      averageAccuracy,
      mostUsedModel
    });
  };

  // Filter logs based on search query and date range
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.user.name.toLowerCase().includes(query) ||
        log.id.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;
        
        if (start && logDate < start) return false;
        if (end && logDate > end) return false;
        return true;
      });
    }

    return filtered;
  }, [logs, searchQuery, startDate, endDate]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  // Format date in Indonesian locale
  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString === 'undefined' || dateString === 'null') {
        return 'Tanggal tidak tersedia';
      }
      
      if (!isNaN(Number(dateString))) {
        const timestamp = Number(dateString);
        const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
        if (isNaN(date.getTime())) {
          return dateString;
        }
        return new Intl.DateTimeFormat('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return dateString;
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
      return dateString;
    }
  };

  // Delete attendance record
  const handleDeleteLog = async (logId: string) => {
    try {
      const response = await fetch(`/api/logs/${logId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data after successful deletion
        fetchLogs(currentPage);
        fetchAllLogs();
        setDeleteLog(null);
      } else {
        throw new Error('Gagal menghapus data kehadiran');
      }
    } catch (err) {
      console.error('Error deleting log:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus data');
    }
  };


  // Load data on component mount
  useEffect(() => {
    fetchLogs(currentPage);
    fetchAllLogs();
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading && logs.length === 0) {
    return (
      <div className="w-full space-y-6">
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading skeleton for table */}
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-32 mb-2"></div>
              <div className="h-4 bg-muted rounded w-48"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Hari Ini</p>
                <p className="text-2xl font-bold">{stats.todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Minggu Ini</p>
                <p className="text-2xl font-bold">{stats.weekCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Data Kehadiran</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola dan pantau riwayat kehadiran karyawan
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchLogs(currentPage)}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Cari Nama</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Ketik nama..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label htmlFor="start-date">Tanggal Mulai</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">Tanggal Akhir</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || startDate || endDate) && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Hapus Filter</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
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
          )}

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {searchQuery || startDate || endDate
                  ? 'Tidak ada data yang sesuai dengan filter'
                  : 'Belum ada data kehadiran'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          Nama
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">
                          Tanggal/Waktu
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-3 align-middle">
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">
                              {formatDate(log.createdAt)}
                            </div>
                          </td>
                          <td className="p-3 align-middle text-muted-foreground hidden sm:table-cell">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="p-3 align-middle">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Lihat detail</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteLog(log)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-sm">
                  <p className="text-muted-foreground">
                    Menampilkan {filteredLogs.length} dari {pagination.total} data
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
                    <span className="px-3 py-1.5 rounded-md border bg-muted text-foreground">
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Kehadiran</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang record kehadiran
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nama</Label>
                  <p className="text-sm">{selectedLog.user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <p className="text-sm font-mono text-xs">{selectedLog.userId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Record ID</Label>
                  <p className="text-sm font-mono text-xs">{selectedLog.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Waktu</Label>
                  <p className="text-sm">{formatDate(selectedLog.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteLog} onOpenChange={() => setDeleteLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Data Kehadiran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data kehadiran ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          {deleteLog && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{deleteLog.user.name}</p>
                <p className="text-sm text-muted-foreground">{formatDate(deleteLog.createdAt)}</p>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button
              variant="destructive"
              onClick={() => deleteLog && handleDeleteLog(deleteLog.id)}
            >
              Hapus Data
            </Button>
            <Button variant="outline" onClick={() => setDeleteLog(null)}>
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}