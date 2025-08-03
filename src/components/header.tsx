"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
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
    { name: "Register Face", href: "/register" },
    { name: "Recognize Face", href: "/recognize" },
    { name: "Benchmark", href: "/benchmark" },
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
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <ThemeSwitcher />
        </div>
        
        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeSwitcher />
          <button 
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-950 border-b dark:border-zinc-800">
          <nav className="flex flex-col container mx-auto px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                }`}
                onClick={closeMobileMenu}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
} 