import ClientRegisterPage from '@/components/ClientRegisterPage';

export const metadata = {
  title: 'Pendaftaran Wajah - Sistem Absensi',
  description: 'Daftar wajah baru untuk sistem absensi dengan pengenalan wajah',
};

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Pendaftaran Wajah</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Daftarkan wajah Anda untuk menggunakan sistem absensi otomatis
        </p>
      </section>
      
      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <ClientRegisterPage />
      </section>
    </main>
  );
} 