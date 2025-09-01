'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/ui/card';
import { Alert, AlertDescription } from '@/ui/alert';
import { AlertCircle } from 'lucide-react';

// Import komponen secara dinamis tanpa SSR untuk menghindari error TextEncoder
const RegisterFaceClient = dynamic(() => import('./register-face-client').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Memuat sistem registrasi wajah...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});

export default function RegisterPage() {
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
      setError('Akses ditolak. Hanya administrator yang dapat mengakses halaman registrasi wajah.');
    }
  }, [user, appUser, loading]);

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

  // Show error if user is not admin
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

  return <RegisterFaceClient />;
} 