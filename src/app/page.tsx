import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Sistem Absensi dengan Pengenalan Wajah</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
          Teknologi modern untuk mencatat kehadiran secara otomatis, aman, dan efisien.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/register" 
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
          >
            Daftar Wajah
          </Link>
          <Link 
            href="/recognize" 
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
          >
            Absensi
          </Link>
        </div>
      </section>

      <section className="rounded-lg border bg-zinc-50 p-6 mb-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Cara Penggunaan</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-50">
              <span>1</span>
            </div>
            <h3 className="font-medium">Daftar Wajah</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Kunjungi halaman pendaftaran dan ikuti petunjuk untuk mendaftarkan wajah Anda.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-50">
              <span>2</span>
            </div>
            <h3 className="font-medium">Absensi</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Buka halaman absensi dan posisikan wajah Anda di depan kamera.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-50">
              <span>3</span>
            </div>
            <h3 className="font-medium">Verifikasi</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sistem akan otomatis mengenali wajah Anda dan mencatat kehadiran.
            </p>
          </div>
        </div>
      </section>
      
      <section className="text-center border-t pt-8">
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Sistem Absensi dengan Pengenalan Wajah
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Dibuat dengan Next.js dan Face-API.js
        </p>
      </section>
    </main>
  );
}
