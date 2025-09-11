import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ErrorBoundary from "@/components/ErrorBoundary";
import ToastProvider from "@/components/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { PerformanceOptimizer, PerformanceMonitor, ResourceHints } from "@/components/PerformanceOptimizer";
import { ConditionalLayout } from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false // Only load when needed
});

export const metadata: Metadata = {
  title: {
    default: "Face Recognition Attendance",
    template: "%s | Face Recognition Attendance"
  },
  description: "Sistem absensi canggih dengan teknologi pengenalan wajah AI. Akurat, cepat, dan mudah digunakan.",
  keywords: ['face recognition', 'attendance', 'AI', 'biometric', 'absensi', 'pengenalan wajah'],
  authors: [{ name: 'Face Recognition Team' }],
  creator: 'Face Recognition Team',
  publisher: 'Face Recognition Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Face Attendance'
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'Face Attendance'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom for better UX in face capture
  themeColor: '#2563eb',
  colorScheme: 'light'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Critical resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/models/tiny_face_detector_model-weights_manifest.json" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/icons/icon-192.png" as="image" />
        
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Face Attendance" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        
        {/* Performance hints */}
        <ResourceHints />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-50 text-gray-900 antialiased`}
      >
        <PerformanceMonitor>
          <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            <ToastProvider>
              <AuthProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                {/* Performance optimizer - runs in background */}
                <PerformanceOptimizer />
              </AuthProvider>
            </ToastProvider>
          </ErrorBoundary>
        </PerformanceMonitor>
      </body>
    </html>
  );
}
