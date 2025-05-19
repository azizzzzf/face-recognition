import ClientRecognizePage from '@/components/ClientRecognizePage';

export const metadata = {
  title: 'Absensi - Sistem Absensi Wajah',
  description: 'Sistem absensi dengan pengenalan wajah menggunakan face-api.js',
};

export default function RecognizePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Absensi Dengan Pengenalan Wajah</h1>
      <ClientRecognizePage />
    </main>
  );
} 