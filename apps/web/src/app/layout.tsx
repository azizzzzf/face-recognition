import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SidebarLayout } from "@/components/SidebarLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToastProvider from "@/components/Toast";

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
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-50 text-gray-900 antialiased`}
      >
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <ToastProvider>
            <SidebarLayout>
              {children}
            </SidebarLayout>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
