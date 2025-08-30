"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isExpanded={isMobile ? false : undefined}
        onExpandedChange={setIsSidebarExpanded}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isMobile 
            ? 'ml-16' // Fixed margin on mobile
            : isSidebarExpanded 
              ? 'ml-64' // Expanded sidebar width
              : 'ml-16' // Collapsed sidebar width
        }`}
      >
        <div className="min-h-screen py-6">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 py-6 md:py-0 bg-white">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:h-14">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Sistem Absensi dengan Pengenalan Wajah
            </p>
            <p className="text-xs text-gray-500">
              Dibuat dengan Next.js dan Face-API.js
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}