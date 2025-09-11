'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { DynamicRegisterFaceClient } from '@/components/DynamicComponents';

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={true} allowedRoles={['ADMIN']}>
      <DynamicRegisterFaceClient />
    </AuthGuard>
  );
} 