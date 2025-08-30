import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pengenalan Wajah - Sistem Absensi',
  description: 'Teknologi modern untuk mencatat kehadiran secara otomatis dengan pengenalan wajah',
};

export default function RecognizeLayout({
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