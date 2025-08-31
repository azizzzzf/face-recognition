"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const pathname = usePathname();
  
  // Check if current path is auth-related
  const isAuthPage = pathname?.startsWith('/auth/') || false;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Handle initial load to prevent animation glitch
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  // If it's an auth page, render without sidebar
  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

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
        className={`flex-1 will-change-transform ${
          isInitialLoad 
            ? '' // No transition on initial load to prevent flash
            : 'transition-all duration-[350ms] ease-[cubic-bezier(0.4,0.0,0.2,1)]'
        } ${
          isMobile 
            ? 'ml-16' // Fixed margin on mobile
            : isSidebarExpanded 
              ? 'ml-64 transform translate-x-0' // Expanded sidebar width with transform
              : 'ml-16 transform translate-x-0' // Collapsed sidebar width with transform
        }`}
        style={{
          // Hardware acceleration for smooth animation
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
      >
        <div 
          className={`min-h-screen py-6 transition-all duration-[350ms] ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
            !isInitialLoad && isSidebarExpanded && !isMobile 
              ? 'bg-white/50 backdrop-blur-[1px]' // Subtle background change when sidebar is expanded
              : ''
          }`}
        >
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <footer className={`border-t border-gray-200 py-6 md:py-0 bg-white transition-all duration-[350ms] ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
          !isInitialLoad && isSidebarExpanded && !isMobile 
            ? 'shadow-lg border-gray-300' 
            : ''
        }`}>
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:h-14">
          </div>
        </footer>
      </main>
    </div>
  );
}