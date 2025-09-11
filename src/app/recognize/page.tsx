'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { AuthGuard } from '@/components/AuthGuard';
import { DynamicRecognizeFaceClient } from '@/components/DynamicComponents';
import { Alert, AlertDescription } from '@/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function RecognizePage() {
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
        setError('Anda perlu melakukan registrasi wajah terlebih dahulu untuk dapat melakukan presensi. Hubungi administrator untuk registrasi wajah.');
      }
    } catch (err) {
      console.error('Error checking face registration:', err);
      setError('Gagal memverifikasi status registrasi wajah.');
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      {error ? (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : (
        <DynamicRecognizeFaceClient />
      )}
    </AuthGuard>
  );
} 