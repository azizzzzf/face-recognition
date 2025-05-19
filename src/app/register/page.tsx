import ClientRegisterPage from '@/components/ClientRegisterPage';

export const metadata = {
  title: 'Pendaftaran Wajah - Sistem Absensi',
  description: 'Daftar wajah baru untuk sistem absensi dengan pengenalan wajah',
};

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Pendaftaran Wajah</h1>
      <ClientRegisterPage />
    </main>
  );
} 