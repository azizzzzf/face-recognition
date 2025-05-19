'use client';

import dynamic from 'next/dynamic';

// Import RegisterFace secara dinamis agar hanya dijalankan di client
const RegisterFace = dynamic(() => import('@/components/RegisterFace'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
      <p className="text-gray-600">Memuat komponen pendaftaran wajah...</p>
    </div>
  ),
});

export default function ClientRegisterPage() {
  return <RegisterFace />;
} 