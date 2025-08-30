"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
  maxItems?: number;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator,
  showHome = true,
  maxItems = 5,
}) => {
  // Add home item if enabled and not already present
  const allItems = React.useMemo(() => {
    const hasHome = items.some(item => item.href === '/');
    if (showHome && !hasHome) {
      return [
        { label: 'Home', href: '/', icon: Home },
        ...items,
      ];
    }
    return items;
  }, [items, showHome]);

  // Handle truncation if there are too many items
  const displayItems = React.useMemo(() => {
    if (allItems.length <= maxItems) {
      return allItems;
    }

    const first = allItems[0];
    const last = allItems[allItems.length - 1];
    const middle = allItems.slice(1, -1);
    
    if (middle.length <= maxItems - 2) {
      return allItems;
    }

    // Show first, ellipsis, and last few items
    const visibleMiddle = middle.slice(-(maxItems - 3));
    return [
      first,
      { label: '...', current: false },
      ...visibleMiddle,
      last,
    ];
  }, [allItems, maxItems]);

  const defaultSeparator = <ChevronRight className="h-4 w-4 text-muted-foreground" />;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const IconComponent = item.icon;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mr-1">
                  {separator || defaultSeparator}
                </span>
              )}
              
              {item.label === '...' ? (
                <span className="text-muted-foreground px-2">...</span>
              ) : item.href && !item.current && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1 hover:text-foreground transition-colors",
                    "text-muted-foreground hover:underline"
                  )}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center space-x-1",
                    isLast || item.current
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                  aria-current={isLast || item.current ? "page" : undefined}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Simplified version for common use cases
export const SimpleBreadcrumb: React.FC<{
  items: string[];
  links?: string[];
  className?: string;
}> = ({ items, links = [], className }) => {
  const breadcrumbItems: BreadcrumbItem[] = items.map((item, index) => ({
    label: item,
    href: links[index],
    current: index === items.length - 1,
  }));

  return <Breadcrumb items={breadcrumbItems} className={className} />;
};

// Hook for generating breadcrumbs from pathname
export const useBreadcrumbFromPath = (pathname: string) => {
  return React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        label,
        href,
        current: index === segments.length - 1,
      };
    });
  }, [pathname]);
};

// Predefined breadcrumbs for common pages
export const pageBreadcrumbs = {
  attendance: [
    { label: 'Kehadiran', href: '/attendance', current: true }
  ],
  users: [
    { label: 'Data Pengguna', href: '/users', current: true }
  ],
  register: [
    { label: 'Daftar Wajah', href: '/register', current: true }
  ],
  recognize: [
    { label: 'Absensi', href: '/recognize', current: true }
  ],
  benchmark: [
    { label: 'Performance Benchmark', href: '/benchmark', current: true }
  ],
  'user-detail': (userId: string) => [
    { label: 'Data Pengguna', href: '/users' },
    { label: 'Detail User', href: `/users/${userId}`, current: true }
  ],
  'attendance-detail': (logId: string) => [
    { label: 'Kehadiran', href: '/attendance' },
    { label: 'Detail Log', href: `/attendance/${logId}`, current: true }
  ],
};

export default Breadcrumb;