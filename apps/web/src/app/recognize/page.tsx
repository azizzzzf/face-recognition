import ClientRecognizePage from '@/components/ClientRecognizePage';

export const metadata = {
  title: 'Absensi - Sistem Absensi Wajah',
  description: 'Teknologi modern untuk mencatat kehadiran secara otomatis',
};

export default function RecognizePage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-2 mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Absensi Wajah</h1>
        <p className="text-muted-foreground">
          Arahkan wajah Anda ke kamera untuk verifikasi kehadiran otomatis
        </p>
      </div>
      
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <ClientRecognizePage />
      </div>
    </div>
  );
} 