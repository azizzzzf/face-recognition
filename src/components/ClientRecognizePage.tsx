'use client';

import dynamic from 'next/dynamic';

// Import RecognizeFace secara dinamis agar hanya dijalankan di client
const RecognizeFace = dynamic(() => import('@/components/RecognizeFace'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
      <p className="text-gray-600">Memuat komponen deteksi wajah...</p>
    </div>
  ),
});

export default function ClientRecognizePage() {
  return <RecognizeFace />;
} 