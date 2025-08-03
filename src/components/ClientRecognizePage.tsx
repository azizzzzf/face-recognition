'use client';

import dynamic from 'next/dynamic';

// Import RecognizeFace secara dinamis agar hanya dijalankan di client
const RecognizeFace = dynamic(() => import('@/components/RecognizeFace'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 min-h-[40vh]">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
      </div>
      <p className="text-muted-foreground">Memuat komponen pengenalan wajah...</p>
    </div>
  ),
});

export default function ClientRecognizePage() {
  return <RecognizeFace />;
} 