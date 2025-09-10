"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Menu, 
  X, 
  Home, 
  UserPlus, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Zap 
} from "lucide-react";
// import { ThemeSwitcher } from "./theme-switcher";
import { usePathname } from "next/navigation";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Daftar Wajah", href: "/register", icon: UserPlus },
    { name: "Absensi", href: "/recognize", icon: CheckCircle },
    { name: "Kehadiran", href: "/attendance", icon: BarChart3 },
    { name: "Data Pengguna", href: "/users", icon: Users },
    { name: "Benchmark", href: "/benchmark", icon: Zap },
  ];

  return (
    <header className="border-b dark:border-zinc-800 bg-white dark:bg-zinc-950 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold" onClick={closeMobileMenu}>
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
          <span className="hidden sm:inline">Sistem Absensi Wajah</span>
          <span className="sm:hidden">Absensi</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex gap-6" role="navigation" aria-label="Menu utama">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {/* <ThemeSwitcher /> */}
        </div>
        
        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* <ThemeSwitcher /> */}
          <button 
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-navigation"
          className="lg:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 shadow-lg"
        >
          <nav 
            className="flex flex-col container mx-auto px-4 py-2"
            role="navigation"
            aria-label="Menu utama (mobile)"
          >
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 py-3 px-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                  onClick={closeMobileMenu}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
} 