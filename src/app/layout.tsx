import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Face Recognition Attendance",
  description: "Sistem absensi dengan pengenalan wajah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white antialiased`}
      >
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M8.3 10a.7.7 0 0 0-.3.6v2.8a.7.7 0 0 0 .3.6l2.2 1.2a.7.7 0 0 0 .6 0l2.2-1.2a.7.7 0 0 0 .3-.6v-2.8a.7.7 0 0 0-.3-.6L11 8.8a.7.7 0 0 0-.6 0L8.3 10Z" />
                <path d="M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0v0Z" />
                <path d="M13 2v3" />
                <path d="M21 10h-3" />
                <path d="M13 22v-3" />
                <path d="M3 10h3" />
              </svg>
              <span>Sistem Absensi Wajah</span>
            </Link>
            <nav className="flex gap-6">
              <Link 
                href="/register" 
                className="text-sm font-medium hover:text-zinc-500 transition-colors"
              >
                Daftar Wajah
              </Link>
              <Link 
                href="/recognize" 
                className="text-sm font-medium hover:text-zinc-500 transition-colors"
              >
                Absensi
              </Link>
            </nav>
          </div>
        </header>
        
        <div className="min-h-[calc(100vh-9rem)]">
          {children}
        </div>
        
        <footer className="border-t py-6 md:py-0">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:h-14">
            <p className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} Sistem Absensi dengan Pengenalan Wajah
            </p>
            <p className="text-xs text-zinc-500">
              Dibuat dengan Next.js dan Face-API.js
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
