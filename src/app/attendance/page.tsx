'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { AuthGuard } from '@/components/AuthGuard';
import { DynamicAttendanceManager } from '@/components/DynamicComponents';
import { Alert, AlertDescription } from '@/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const { appUser } = useUser();
  const [error, setError] = useState<string | null>(null);

  // Check face registration for USER role
  useEffect(() => {
    if (appUser && appUser.role === 'USER') {
      checkFaceRegistration();
    }
  }, [appUser]);

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

  return (
    <AuthGuard requireAuth={true}>
      {error ? (
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {appUser?.role === 'ADMIN' ? 'Kehadiran (Admin)' : 'Kehadiran Saya'}
            </h1>
            <p className="text-muted-foreground">
              {appUser?.role === 'ADMIN' 
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
      ) : (
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {appUser?.role === 'ADMIN' ? 'Kehadiran (Admin)' : 'Kehadiran Saya'}
            </h1>
            <p className="text-muted-foreground">
              {appUser?.role === 'ADMIN' 
                ? 'Kelola dan pantau riwayat kehadiran karyawan dengan sistem pengenalan wajah'
                : 'Lihat riwayat kehadiran pribadi Anda'
              }
            </p>
          </div>
          
          <DynamicAttendanceManager userRole={appUser?.role || 'USER'} />
        </div>
      )}
    </AuthGuard>
  );
}