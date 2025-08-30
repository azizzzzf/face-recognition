'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/ui/card';

// Import komponen secara dinamis tanpa SSR untuk menghindari error TextEncoder
const RecognizeFaceClient = dynamic(() => import('./recognize-face-client').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Memuat sistem pengenalan wajah...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});

export default function RecognizePage() {
  return <RecognizeFaceClient />;
} 