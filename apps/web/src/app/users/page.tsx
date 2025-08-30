import { Metadata } from 'next';
import UserManager from '@/components/UserManager';

export const metadata: Metadata = {
  title: 'Data Pengguna | Face Attendance System',
  description: 'Kelola data pengguna yang telah mendaftar wajah dalam sistem kehadiran',
};

export default function UsersPage() {
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