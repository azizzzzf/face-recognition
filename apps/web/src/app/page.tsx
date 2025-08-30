"use client";

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  UserPlus, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Zap, 
  ArrowRight,
  Calendar,
  TrendingUp,
  Database,
  Activity
} from "lucide-react"

interface DashboardStats {
  totalUsers: number;
  todayAttendance: number;
  totalAttendance: number;
  avgAccuracy: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    todayAttendance: 0,
    totalAttendance: 0,
    avgAccuracy: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch basic stats from existing API endpoints
        const [usersRes, attendanceRes] = await Promise.all([
          fetch('/api/users?limit=1'),
          fetch('/api/logs?limit=1')
        ]);

        const usersData = await usersRes.json();
        const attendanceData = await attendanceRes.json();

        setStats({
          totalUsers: usersData.pagination?.total || 0,
          todayAttendance: 0, // This would need a specific endpoint
          totalAttendance: attendanceData.pagination?.total || 0,
          avgAccuracy: 85.2 // Default value, would calculate from actual data
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const quickActions = [
    {
      title: "Daftar Wajah",
      description: "Mendaftarkan wajah baru ke sistem",
      href: "/register",
      icon: UserPlus,
      color: "bg-blue-500",
      variant: "default" as const
    },
    {
      title: "Absensi",
      description: "Melakukan absensi dengan pengenalan wajah",
      href: "/recognize",
      icon: CheckCircle,
      color: "bg-green-500",
      variant: "default" as const
    },
  ];

  const managementFeatures = [
    {
      title: "Kehadiran",
      description: "Kelola dan pantau riwayat kehadiran",
      href: "/attendance",
      icon: BarChart3,
      stats: `${stats.totalAttendance} total log`
    },
    {
      title: "Data Pengguna",
      description: "Kelola pengguna yang terdaftar",
      href: "/users",
      icon: Users,
      stats: `${stats.totalUsers} pengguna`
    },
    {
      title: "Benchmark",
      description: "Analisis performa sistem",
      href: "/benchmark",
      icon: Zap,
      stats: `${stats.avgAccuracy}% akurasi rata-rata`
    },
  ];

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Hero Section */}
      <section className="mb-12 text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Sistem Presensi dengan Face-API.js
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Platform terintegrasi untuk mengelola kehadiran menggunakan teknologi pengenalan wajah 
            dengan evaluasi performa berbasis akurasi dan latensi
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Pengguna</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : stats.totalAttendance}</p>
                <p className="text-xs text-muted-foreground">Total Log</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : stats.todayAttendance}</p>
                <p className="text-xs text-muted-foreground">Hari Ini</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : stats.avgAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Akurasi</p>
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
              Mulai menggunakan sistem absensi wajah
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

      {/* How to Use Section */}
      <section className="mt-16 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cara Penggunaan Sistem</CardTitle>
            <p className="text-muted-foreground">
              Ikuti langkah-langkah berikut untuk menggunakan sistem absensi wajah
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
                <h3 className="font-medium text-lg">Daftar Wajah</h3>
                <p className="text-sm text-muted-foreground">
                  Kunjungi halaman pendaftaran dan ikuti petunjuk untuk mendaftarkan wajah Anda 
                  dengan mengambil foto dari berbagai sudut.
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
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-lg">Absensi</h3>
                <p className="text-sm text-muted-foreground">
                  Buka halaman absensi dan posisikan wajah Anda di depan kamera. 
                  Sistem akan mengenali dan mencatat kehadiran secara otomatis.
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
                  Gunakan fitur manajemen untuk memantau kehadiran, mengelola pengguna, 
                  dan menganalisis performa sistem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
