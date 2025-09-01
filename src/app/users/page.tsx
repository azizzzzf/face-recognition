'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import UserManager from '@/components/UserManager';
import { Alert, AlertDescription } from '@/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function UsersPage() {
  const { user, loading } = useAuth();
  const { appUser } = useUser();
  const [error, setError] = useState<string | null>(null);

  // Check authentication and admin permission
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/login';
      return;
    }
    
    if (appUser && appUser.role !== 'ADMIN') {
      setError('Akses ditolak. Hanya administrator yang dapat mengakses halaman data pengguna.');
    }
  }, [user, appUser, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Don't render content if user is not authenticated
  if (!user || !appUser) {
    return null;
  }

  // Show error if user is not admin
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Data Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola pengguna yang telah mendaftar dalam sistem kehadiran wajah
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola pengguna yang telah mendaftar dalam sistem kehadiran wajah
        </p>
      </div>
      
      <UserManager />
    </div>
  );
}