"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Home, 
  UserPlus, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Zap,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Pin,
  PinOff
} from "lucide-react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  isMobile?: boolean;
}

export function Sidebar({ isExpanded = false, onExpandedChange, isMobile = false }: SidebarProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const pathname = usePathname();

  // Load pinned state from localStorage
  useEffect(() => {
    const savedPinnedState = localStorage.getItem('sidebar-pinned');
    if (savedPinnedState) {
      setIsPinned(JSON.parse(savedPinnedState));
    }
  }, []);

  const expanded = isExpanded || internalExpanded || isPinned || (isMobile && mobileMenuOpen);

  const handleMouseEnter = () => {
    if (!isMobile && !isPinned) {
      setInternalExpanded(true);
      onExpandedChange?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isPinned) {
      setInternalExpanded(false);
      onExpandedChange?.(false);
    }
  };

  const togglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    localStorage.setItem('sidebar-pinned', JSON.stringify(newPinnedState));
    
    if (newPinnedState) {
      setInternalExpanded(false); // Reset internal expanded when pinning
      onExpandedChange?.(true);
    } else {
      onExpandedChange?.(false);
    }
  };

  const toggleMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
      onExpandedChange?.(!mobileMenuOpen);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
      onExpandedChange?.(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Daftar Wajah", href: "/register", icon: UserPlus },
    { name: "Absensi", href: "/recognize", icon: CheckCircle },
    { name: "Kehadiran", href: "/attendance", icon: BarChart3 },
    { name: "Data Pengguna", href: "/users", icon: Users },
    { name: "Benchmark", href: "/benchmark", icon: Zap },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-[60] p-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors lg:hidden shadow-lg"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out shadow-lg ${
          expanded ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand and Pin Button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-3 text-gray-800 hover:text-gray-600 transition-colors">
              <div className="flex-shrink-0">
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
              </div>
              <span 
                className={`font-semibold whitespace-nowrap transition-all duration-300 ${
                  expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}
              >
                Sistem Absensi
              </span>
            </Link>

            {/* Pin Button - Only show when expanded and not on mobile */}
            {expanded && !isMobile && (
              <button
                onClick={togglePin}
                className="flex-shrink-0 p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  title={!expanded ? item.name : undefined}
                  onClick={closeMobileMenu}
                >
                  <div className="flex-shrink-0">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span 
                    className={`whitespace-nowrap transition-all duration-300 ${
                      expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>


          {/* Expand/Collapse indicator - Hide on mobile and when pinned */}
          {!isMobile && !isPinned && (
            <div className="absolute top-1/2 -right-3 transform -translate-y-1/2">
              <div className="bg-white border border-gray-300 rounded-full p-1.5 shadow-lg">
                {expanded ? (
                  <ChevronLeft className="h-3 w-3 text-gray-600" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-600" />
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {expanded && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
}