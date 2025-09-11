'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DynamicUserManager } from '@/components/DynamicComponents';

export default function UsersPage() {
  return (
    <AuthGuard requireAuth={true} allowedRoles={['ADMIN']}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Data Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola pengguna yang telah mendaftar dalam sistem kehadiran wajah
          </p>
        </div>
        
        <DynamicUserManager />
      </div>
    </AuthGuard>
  );
}