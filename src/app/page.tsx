"use client";

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { UserDashboard } from '@/components/UserDashboard'
import { AdminDashboard } from '@/components/AdminDashboard'

export default function Home() {
  const { user, loading } = useAuth();
  const { appUser } = useUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/login';
      return;
    }
  }, [user, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render content if user is not authenticated
  if (!user || !appUser) {
    return null;
  }

  // Role-based dashboard rendering
  if (appUser.role === 'ADMIN') {
    return <AdminDashboard appUser={appUser} />;
  } else {
    return <UserDashboard appUser={appUser} />;
  }
}
