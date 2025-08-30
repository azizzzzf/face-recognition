import { Metadata } from 'next';
import AttendanceManager from '@/components/AttendanceManager';

export const metadata: Metadata = {
  title: 'Kehadiran - Face Recognition Attendance System',
  description: 'Kelola dan pantau riwayat kehadiran karyawan dengan sistem pengenalan wajah',
};

export default function AttendancePage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Kehadiran
        </h1>
        <p className="text-muted-foreground">
          Kelola dan pantau riwayat kehadiran karyawan dengan sistem pengenalan wajah
        </p>
      </div>
      
      <AttendanceManager />
    </div>
  );
}