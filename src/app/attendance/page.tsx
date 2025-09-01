'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import AttendanceManager from '@/components/AttendanceManager';
import { Alert, AlertDescription } from '@/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const { user, loading } = useAuth();
  const { appUser } = useUser();
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/login';
      return;
    }
    
    if (appUser && appUser.role === 'USER') {
      // Check if user has face registration for attendance access
      checkFaceRegistration();
    }
  }, [user, appUser, loading]);

  const checkFaceRegistration = async () => {
    try {
      const response = await fetch('/api/users/face-status');
      const data = await response.json();
      
      if (data.success && !data.data.canAccessAttendance) {
        setError('Anda perlu melakukan registrasi wajah terlebih dahulu untuk dapat mengakses data kehadiran. Hubungi administrator untuk registrasi wajah.');
      }
    } catch (err) {
      console.error('Error checking face registration:', err);
      setError('Gagal memverifikasi status registrasi wajah.');
    }
  };

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

  // Show error if user can't access attendance
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {appUser.role === 'ADMIN' ? 'Kehadiran (Admin)' : 'Kehadiran Saya'}
          </h1>
          <p className="text-muted-foreground">
            {appUser.role === 'ADMIN' 
              ? 'Kelola dan pantau riwayat kehadiran karyawan dengan sistem pengenalan wajah'
              : 'Lihat riwayat kehadiran pribadi Anda'
            }
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
        <h1 className="text-3xl font-bold tracking-tight">
          {appUser.role === 'ADMIN' ? 'Kehadiran (Admin)' : 'Kehadiran Saya'}
        </h1>
        <p className="text-muted-foreground">
          {appUser.role === 'ADMIN' 
            ? 'Kelola dan pantau riwayat kehadiran karyawan dengan sistem pengenalan wajah'
            : 'Lihat riwayat kehadiran pribadi Anda'
          }
        </p>
      </div>
      
      <AttendanceManager userRole={appUser.role} userId={appUser.id} />
    </div>
  );
}