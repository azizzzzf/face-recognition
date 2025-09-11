"use client";

import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/AuthGuard'
import { DynamicAdminDashboard, DynamicUserDashboard } from '@/components/DynamicComponents'

export default function Home() {
  const { appUser } = useAuth();

  return (
    <AuthGuard requireAuth={true}>
      {appUser && appUser.role === 'ADMIN' ? (
        <DynamicAdminDashboard appUser={appUser} />
      ) : (
        <DynamicUserDashboard />
      )}
    </AuthGuard>
  );
}
