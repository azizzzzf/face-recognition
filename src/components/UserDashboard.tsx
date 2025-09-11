'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Activity,
  User as UserIcon,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';

interface FaceRegistrationStatus {
  hasAccount: boolean;
  hasFaceRegistration: boolean;
  canAccessAttendance: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  faceRegistration?: {
    id: string;
    registeredAt: string;
    hasValidDescriptor: boolean;
  };
  attendanceStats?: {
    totalRecords: number;
    lastAttendance?: string;
  };
}

interface UserDashboardProps {
  appUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const UserDashboard = memo<Omit<UserDashboardProps, 'appUser'>>(({}) => {
  const [faceStatus, setFaceStatus] = useState<FaceRegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaceStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users/face-status');
        const data = await response.json();
        
        if (data.success) {
          setFaceStatus(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch face registration status');
        }
      } catch (err) {
        console.error('Error fetching face status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFaceStatus();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !faceStatus) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Gagal memuat status registrasi wajah. Silakan muat ulang halaman.'}
        </AlertDescription>
      </Alert>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Welcome Section */}
      <section className="mb-8 text-center space-y-4">
        <div className="space-y-2">
          <div className="mb-4">
            <Badge variant="outline" className="text-sm px-3 py-1">
              <UserIcon className="h-3 w-3 mr-1" />
              {faceStatus.user.name}
            </Badge>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Dashboard Presensi
          </h1>
          <p className="text-muted-foreground text-lg">
            Kelola presensi dan lihat riwayat kehadiran Anda
          </p>
        </div>
      </section>

      {/* Registration Status Section */}
      <section className="mb-8">
        {!faceStatus.hasFaceRegistration ? (
          // Belum registrasi wajah
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-amber-800">Registrasi Wajah Diperlukan</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-amber-700">
                Untuk dapat melakukan presensi dan melihat data kehadiran, Anda perlu melakukan registrasi wajah terlebih dahulu.
              </p>
              <Alert className="border-amber-300 bg-amber-50">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Cara registrasi wajah:</strong><br />
                  Hubungi administrator untuk melakukan registrasi wajah Anda ke sistem. 
                  Administrator dapat mengakses menu &quot;Daftar Wajah&quot; dan memilih akun Anda untuk proses registrasi.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          // Sudah registrasi wajah
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Wajah Terdaftar</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-green-700">
                Wajah Anda telah terdaftar dalam sistem. Anda dapat melakukan presensi dan melihat riwayat kehadiran.
              </p>
              <div className="text-sm text-green-600">
                Terdaftar: {formatDate(faceStatus.faceRegistration!.registeredAt)}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {faceStatus.canAccessAttendance && (
        <>
          {/* Stats Section */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {faceStatus.attendanceStats?.totalRecords || 0}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Total Presensi
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {faceStatus.attendanceStats?.lastAttendance 
                          ? formatDate(faceStatus.attendanceStats.lastAttendance).split(',')[0]
                          : 'Belum ada'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Presensi Terakhir
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date().toLocaleDateString('id-ID', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Hari Ini
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Actions Section */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Presensi Action */}
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-green-500 text-white">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Presensi</h3>
                        <p className="text-muted-foreground text-sm">
                          Lakukan presensi dengan pengenalan wajah
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="group-hover:bg-primary">
                      <Link href="/recognize" className="flex items-center gap-2">
                        Mulai <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Riwayat Kehadiran Action */}
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <Activity className="h-6 w-6 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Riwayat Presensi</h3>
                        <p className="text-muted-foreground text-sm">
                          Lihat data kehadiran pribadi Anda
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="group-hover:border-primary">
                      <Link href="/attendance" className="flex items-center gap-2">
                        Lihat <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      {/* How to Use Section */}
      <section className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Cara Menggunakan Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={faceStatus.hasAccount ? "default" : "outline"}
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                  >
                    <span>1</span>
                  </Badge>
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">Registrasi Akun</h3>
                <p className="text-sm text-muted-foreground">
                  {faceStatus.hasAccount 
                    ? "✅ Akun Anda sudah terdaftar dalam sistem"
                    : "Daftar akun terlebih dahulu untuk menggunakan sistem"
                  }
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={faceStatus.hasFaceRegistration ? "default" : "outline"}
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                  >
                    <span>2</span>
                  </Badge>
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">Registrasi Wajah</h3>
                <p className="text-sm text-muted-foreground">
                  {faceStatus.hasFaceRegistration
                    ? "✅ Wajah Anda sudah terdaftar dalam sistem"
                    : "Hubungi admin untuk mendaftarkan wajah Anda ke sistem"
                  }
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={faceStatus.canAccessAttendance ? "default" : "outline"}
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                  >
                    <span>3</span>
                  </Badge>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">Mulai Presensi</h3>
                <p className="text-sm text-muted-foreground">
                  {faceStatus.canAccessAttendance
                    ? "✅ Anda dapat melakukan presensi dan melihat riwayat"
                    : "Setelah registrasi wajah, Anda dapat melakukan presensi"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
})

UserDashboard.displayName = 'UserDashboard'