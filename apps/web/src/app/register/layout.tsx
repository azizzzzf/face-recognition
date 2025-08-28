import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pendaftaran Wajah - Sistem Absensi',
  description: 'Daftar wajah baru untuk sistem absensi dengan pengenalan wajah',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 w-full overflow-hidden">
      {children}
    </div>
  );
}
