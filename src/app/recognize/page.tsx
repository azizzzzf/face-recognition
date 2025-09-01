'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/ui/card';
import { Alert, AlertDescription } from '@/ui/alert';
import { AlertCircle } from 'lucide-react';

// Import komponen secara dinamis tanpa SSR untuk menghindari error TextEncoder
const RecognizeFaceClient = dynamic(() => import('./recognize-face-client').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Memuat sistem pengenalan wajah...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});

export default function RecognizePage() {
  const { user, loading } = useAuth();
  const { appUser } = useUser();
  const [error, setError] = useState<string | null>(null);

  // Check authentication and permissions
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
        setError('Anda perlu melakukan registrasi wajah terlebih dahulu untuk dapat melakukan presensi. Hubungi administrator untuk registrasi wajah.');
      }
    } catch (err) {
      console.error('Error checking face registration:', err);
      setError('Gagal memverifikasi status registrasi wajah.');
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Memuat...</p>
            </div>
          </CardContent>
        </Card>
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
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <RecognizeFaceClient />;
} 