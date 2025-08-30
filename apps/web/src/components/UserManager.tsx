'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  Users,
  Calendar,
  UserCheck,
  Camera,
  Eye,
  Edit,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  faceApiDescriptor: number[];
  arcfaceDescriptor: number[];
  enrollmentImages: string;
  attendanceCount: number;
  lastAttendance: string | null;
  todayAttendance: number;
  enrollmentImageCount: number;
  hasArcface: boolean;
  hasFaceApi: boolean;
}

interface Stats {
  totalUsers: number;
  arcfaceEnabledUsers: number;
  usersRegisteredToday: number;
  avgPhotosPerUser: number;
}

interface ApiResponse {
  success: boolean;
  data: User[];
  stats: Stats;
  error?: string;
}

interface UserActionsDropdownProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onReprocessArcface: (user: User) => void;
  onViewAttendance: (user: User) => void;
}

function UserActionsDropdown({ user, onView, onEdit, onDelete, onReprocessArcface, onViewAttendance }: UserActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md">
            <button
              onClick={() => {
                onView(user);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Eye className="h-4 w-4" />
              Lihat Detail
            </button>
            <button
              onClick={() => {
                onEdit(user);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Edit className="h-4 w-4" />
              Edit Nama
            </button>
            <button
              onClick={() => {
                onReprocessArcface(user);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              disabled={!user.hasFaceApi}
            >
              <RefreshCw className="h-4 w-4" />
              Proses Ulang ArcFace
            </button>
            <button
              onClick={() => {
                onViewAttendance(user);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
              Lihat Kehadiran
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                onDelete(user);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Pengguna
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  let enrollmentImages: string[] = [];
  try {
    enrollmentImages = JSON.parse(user.enrollmentImages);
  } catch {
    enrollmentImages = [];
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pengguna: {user.name}</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang pengguna dan foto registrasi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Kehadiran</p>
              <p className="text-2xl font-bold">{user.attendanceCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kehadiran Hari Ini</p>
              <p className="text-2xl font-bold">{user.todayAttendance}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jumlah Foto</p>
              <p className="text-2xl font-bold">{user.enrollmentImageCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="flex gap-1 mt-1">
                {user.hasFaceApi && (
                  <Badge variant="secondary">Face-API</Badge>
                )}
                {user.hasArcface && (
                  <Badge variant="default">ArcFace</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Enrollment Photos */}
          {enrollmentImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Foto Registrasi</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {enrollmentImages.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={`Foto registrasi ${index + 1} dari ${user.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descriptor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Deskriptor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Face-API Descriptor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {user.hasFaceApi 
                      ? `Tersedia (${user.faceApiDescriptor.length} dimensi)`
                      : 'Tidak tersedia'
                    }
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">ArcFace Descriptor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {user.hasArcface 
                      ? `Tersedia (${user.arcfaceDescriptor.length} dimensi)`
                      : 'Tidak tersedia'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Last Attendance */}
          {user.lastAttendance && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Kehadiran Terakhir</h3>
              <p className="text-muted-foreground">
                {new Date(user.lastAttendance).toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDeleteModalProps {
  user: User | null;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isBulk?: boolean;
}

function ConfirmDeleteModal({ 
  user, 
  users, 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  isBulk = false 
}: ConfirmDeleteModalProps) {
  const userCount = isBulk ? users.length : 1;
  const userName = isBulk ? `${userCount} pengguna` : user?.name || 'pengguna';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus {userName}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium">
              Peringatan: Tindakan ini tidak dapat dibatalkan!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Data kehadiran dan semua informasi terkait akan ikut terhapus.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm} 
              disabled={isLoading}
            >
              {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    arcfaceEnabledUsers: 0,
    usersRegisteredToday: 0,
    avgPhotosPerUser: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selection state for bulk operations
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  // Modal state
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ 
    isOpen: boolean; 
    user: User | null; 
    isBulk: boolean;
  }>({
    isOpen: false,
    user: null,
    isBulk: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }
    
    const filtered = users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'arcface') {
        matchesStatus = user.hasArcface;
      } else if (statusFilter === 'faceapi') {
        matchesStatus = user.hasFaceApi && !user.hasArcface;
      }
      
      return matchesSearch && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'attendance':
          aValue = a.attendanceCount;
          bValue = b.attendanceCount;
          break;
        case 'photos':
          aValue = a.enrollmentImageCount;
          bValue = b.enrollmentImageCount;
          break;
        case 'lastAttendance':
          aValue = a.lastAttendance ? new Date(a.lastAttendance).getTime() : 0;
          bValue = b.lastAttendance ? new Date(b.lastAttendance).getTime() : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, statusFilter, sortBy, sortOrder]);

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredAndSortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredAndSortedUsers.map(u => u.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Handle delete actions
  const handleDelete = async (user?: User) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users?${user ? `id=${user.id}` : `ids=${Array.from(selectedUsers).join(',')}`}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUsers(); // Refresh data
        setSelectedUsers(new Set());
      } else {
        setError(data.error || 'Failed to delete user(s)');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, user: null, isBulk: false });
    }
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Nama', 'ID', 'Status ArcFace', 'Jumlah Foto', 'Total Kehadiran', 'Kehadiran Terakhir'],
      ...filteredAndSortedUsers.map(user => [
        user.name,
        user.id,
        user.hasArcface ? 'Ya' : 'Tidak',
        user.enrollmentImageCount.toString(),
        user.attendanceCount.toString(),
        user.lastAttendance ? new Date(user.lastAttendance).toLocaleDateString('id-ID') : 'Belum pernah'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-pengguna-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getUserAvatar = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchUsers} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pengguna</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ArcFace Aktif</p>
                <p className="text-2xl font-bold">{stats.arcfaceEnabledUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registrasi Hari Ini</p>
                <p className="text-2xl font-bold">{stats.usersRegisteredToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rata-rata Foto</p>
                <p className="text-2xl font-bold">{stats.avgPhotosPerUser}</p>
              </div>
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>
                Kelola pengguna yang terdaftar dalam sistem
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {selectedUsers.size > 0 && (
                <Button
                  onClick={() => setDeleteModal({ isOpen: true, user: null, isBulk: true })}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Terpilih ({selectedUsers.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="arcface">ArcFace Ready</SelectItem>
                <SelectItem value="faceapi">Face-API Only</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nama A-Z</SelectItem>
                <SelectItem value="name-desc">Nama Z-A</SelectItem>
                <SelectItem value="attendance-desc">Kehadiran Tertinggi</SelectItem>
                <SelectItem value="attendance-asc">Kehadiran Terendah</SelectItem>
                <SelectItem value="photos-desc">Foto Terbanyak</SelectItem>
                <SelectItem value="photos-asc">Foto Tersedikit</SelectItem>
                <SelectItem value="lastAttendance-desc">Kehadiran Terbaru</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tidak ada pengguna yang sesuai dengan filter'
                  : 'Belum ada pengguna terdaftar'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <a href="/register">Daftarkan Pengguna Baru</a>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead>Kehadiran</TableHead>
                    <TableHead>Terakhir Hadir</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {getUserAvatar(user.name)}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.hasFaceApi && (
                            <Badge variant="secondary" className="text-xs">
                              Face-API
                            </Badge>
                          )}
                          {user.hasArcface && (
                            <Badge variant="default" className="text-xs">
                              ArcFace
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{user.enrollmentImageCount}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{user.attendanceCount}</span>
                          {user.todayAttendance > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {user.todayAttendance} hari ini
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.lastAttendance 
                            ? new Date(user.lastAttendance).toLocaleDateString('id-ID')
                            : 'Belum pernah'
                          }
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActionsDropdown
                          user={user}
                          onView={(user) => setDetailsModal({ isOpen: true, user })}
                          onEdit={(user) => {
                            // TODO: Implement edit functionality
                            console.log('Edit user:', user);
                          }}
                          onDelete={(user) => setDeleteModal({ isOpen: true, user, isBulk: false })}
                          onReprocessArcface={(user) => {
                            // TODO: Implement reprocess functionality
                            console.log('Reprocess ArcFace for user:', user);
                          }}
                          onViewAttendance={(user) => {
                            // TODO: Navigate to attendance page with user filter
                            window.open(`/attendance?user=${user.id}`, '_blank');
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <UserDetailsModal
        user={detailsModal.user}
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, user: null })}
      />
      
      <ConfirmDeleteModal
        user={deleteModal.user}
        users={filteredAndSortedUsers.filter(u => selectedUsers.has(u.id))}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null, isBulk: false })}
        onConfirm={() => handleDelete(deleteModal.user || undefined)}
        isLoading={isDeleting}
        isBulk={deleteModal.isBulk}
      />
    </div>
  );
}