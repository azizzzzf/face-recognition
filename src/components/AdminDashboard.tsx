'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { 
  UserPlus, 
  CheckCircle, 
  BarChart3, 
  Users, 
  ArrowRight,
  Calendar,
  Activity,
  Shield
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  todayAttendance: number;
  totalAttendance: number;
}

interface StatsResponse {
  success: boolean;
  data: {
    overview: {
      totalUsers: number;
      totalAttendanceRecords: number;
      todayAttendanceCount: number;
      uniqueUsersInPeriod: number;
      periodDays: number;
    };
    userDistribution: {
      faceApiEnabled: number;
      noDescriptors: number;
      avgEnrollmentImages: number;
    };
    performance: {
      periodAttendanceCount: number;
      attendanceGrowthRate: number;
    };
  };
  error?: string;
}

interface AdminDashboardProps {
  appUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function AdminDashboard({ appUser }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    todayAttendance: 0,
    totalAttendance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }
      
      const response = await fetch('/api/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.status} ${response.statusText}`);
      }
      
      const result: StatsResponse = await response.json();
      
      if (result.success && result.data) {
        const { overview } = result.data;
        
        setStats({
          totalUsers: overview.totalUsers || 0,
          todayAttendance: overview.todayAttendanceCount || 0,
          totalAttendance: overview.totalAttendanceRecords || 0
        });
        setError(null);
      } else {
        throw new Error(result.error || 'Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Failed to fetch dashboard stats:', err);
      setError(errorMessage);
      
      if (!silent) {
        setStats({
          totalUsers: 0,
          todayAttendance: 0,
          totalAttendance: 0
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (appUser) {
      fetchDashboardStats();
      
      const refreshInterval = setInterval(() => {
        fetchDashboardStats(true);
      }, 5 * 60 * 1000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [appUser]);

  const quickActions = [
    {
      title: "Daftar Wajah",
      description: "Mendaftarkan wajah pengguna ke sistem",
      href: "/register",
      icon: UserPlus,
      color: "bg-blue-500",
      variant: "default" as const,
    },
    {
      title: "Absensi",
      description: "Melakukan absensi dengan pengenalan wajah",
      href: "/recognize",
      icon: CheckCircle,
      color: "bg-green-500",
      variant: "default" as const,
    },
  ];

  const managementFeatures = [
    {
      title: "Kehadiran",
      description: "Kelola dan pantau riwayat kehadiran",
      href: "/attendance",
      icon: BarChart3,
      stats: `${stats.totalAttendance} total log`,
    },
    {
      title: "Data Pengguna",
      description: "Kelola pengguna yang terdaftar",
      href: "/users",
      icon: Users,
      stats: `${stats.totalUsers} pengguna`,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Hero Section */}
      <section className="mb-12 text-center space-y-6">
        <div className="space-y-4">
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Admin Dashboard - {appUser.name}
            </Badge>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Sistem Presensi dengan Face-API.js
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Platform terintegrasi untuk mengelola kehadiran menggunakan teknologi pengenalan wajah 
            dengan evaluasi performa berbasis akurasi dan latensi
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {error && (
            <div className="col-span-full mb-4">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-red-600">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fetchDashboardStats()}
                      disabled={isLoading}
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <span className="animate-pulse bg-gray-200 rounded h-8 w-12 block"></span>
                  ) : (
                    stats.totalUsers.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Pengguna Terdaftar</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <span className="animate-pulse bg-gray-200 rounded h-8 w-12 block"></span>
                  ) : (
                    stats.totalAttendance.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Total Log Kehadiran</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <span className="animate-pulse bg-gray-200 rounded h-8 w-12 block"></span>
                  ) : (
                    stats.todayAttendance.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Kehadiran Hari Ini</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Quick Actions */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Aksi Cepat</h2>
            <p className="text-muted-foreground">
              Kelola sistem presensi wajah
            </p>
          </div>

          <div className="grid gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Card key={action.href} className="group hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${action.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{action.title}</h3>
                          <p className="text-muted-foreground text-sm">{action.description}</p>
                        </div>
                      </div>
                      <Button asChild variant={action.variant} size="sm" className="group-hover:bg-primary">
                        <Link href={action.href} className="flex items-center gap-2">
                          Mulai <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Management Features */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Fitur Manajemen</h2>
            <p className="text-muted-foreground">
              Kelola sistem dan analisis data kehadiran
            </p>
          </div>

          <div className="grid gap-4">
            {managementFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.href} className="group hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                          <IconComponent className="h-6 w-6 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{feature.title}</h3>
                          <p className="text-muted-foreground text-sm">{feature.description}</p>
                          {feature.stats && (
                            <Badge variant="secondary" className="mt-1">
                              {feature.stats}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="group-hover:border-primary">
                        <Link href={feature.href} className="flex items-center gap-2">
                          Kelola <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      {/* Admin Guide Section */}
      <section className="mt-16 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Panduan Administrator</CardTitle>
            <p className="text-muted-foreground">
              Langkah-langkah mengelola sistem presensi wajah
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0 border-primary text-primary"
                  >
                    <span>1</span>
                  </Badge>
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Registrasi Wajah</h3>
                <p className="text-sm text-muted-foreground">
                  Pilih pengguna yang sudah memiliki akun dari combobox, 
                  lalu lakukan proses registrasi wajah dengan mengambil foto dari berbagai sudut.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0 border-primary text-primary"
                  >
                    <span>2</span>
                  </Badge>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Kelola Pengguna</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor status registrasi wajah setiap pengguna, 
                  kelola data pengguna, dan pantau aktivitas sistem.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0 border-primary text-primary"
                  >
                    <span>3</span>
                  </Badge>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Pantau Data</h3>
                <p className="text-sm text-muted-foreground">
                  Analisis riwayat kehadiran semua pengguna, 
                  export data, dan monitor performa sistem pengenalan wajah.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}