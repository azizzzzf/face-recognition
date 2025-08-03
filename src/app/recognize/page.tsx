import ClientRecognizePage from '@/components/ClientRecognizePage';

export const metadata = {
  title: 'Absensi - Sistem Absensi Wajah',
  description: 'Teknologi modern untuk mencatat kehadiran secara otomatis',
};

export default function RecognizePage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Absensi Wajah</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Arahkan wajah Anda ke kamera untuk verifikasi kehadiran otomatis
        </p>
      </section>
      
      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <ClientRecognizePage />
      </section>
    </main>
  );
} 