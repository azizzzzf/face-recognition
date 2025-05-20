import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

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
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="face-attendance-theme">
          <Header />
          
          <div className="min-h-[calc(100vh-9rem)] pt-16">
            {children}
          </div>
          
          <footer className="border-t py-6 md:py-0 dark:border-zinc-800">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:h-14">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                &copy; {new Date().getFullYear()} Sistem Absensi dengan Pengenalan Wajah
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dibuat dengan Next.js dan Face-API.js
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
