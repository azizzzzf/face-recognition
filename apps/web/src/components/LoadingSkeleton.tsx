"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SkeletonVariant = "pulse" | "wave" | "shimmer";

export interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  rounded?: boolean | "sm" | "md" | "lg" | "xl" | "full";
}

// Base Skeleton component
export function Skeleton({
  className,
  variant = "pulse",
  width,
  height,
  rounded = true,
  ...props
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const roundedClass = {
    true: "rounded",
    false: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }[rounded.toString()] || "rounded";

  const variantClass = {
    pulse: "animate-pulse bg-muted",
    wave: "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-wave",
    shimmer: "relative bg-muted overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
  }[variant];

  const style = {
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && { height: typeof height === "number" ? `${height}px` : height }),
  };

  return (
    <div
      className={cn(
        variantClass,
        roundedClass,
        className
      )}
      style={style}
      {...props}
    />
  );
}

// Table Skeleton
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  variant?: SkeletonVariant;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  variant = "pulse",
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {showHeader && (
              <thead>
                <tr className="bg-muted/50 border-b">
                  {Array.from({ length: columns }).map((_, index) => (
                    <th key={index} className="h-10 px-4 text-left align-middle">
                      <Skeleton 
                        variant={variant}
                        className="h-4 w-20" 
                      />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="p-3 align-middle">
                      <Skeleton 
                        variant={variant}
                        className="h-4 w-full max-w-[150px]" 
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Card Skeleton
export interface CardSkeletonProps {
  variant?: SkeletonVariant;
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
  className?: string;
}

export function CardSkeleton({
  variant = "pulse",
  showHeader = true,
  showFooter = false,
  lines = 3,
  className,
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton variant={variant} className="h-6 w-32" />
          <Skeleton variant={variant} className="h-4 w-48" />
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index}
            variant={variant}
            className={cn(
              "h-4",
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </CardContent>
      {showFooter && (
        <div className="px-6 pb-6">
          <Skeleton variant={variant} className="h-9 w-20" />
        </div>
      )}
    </Card>
  );
}

// Stats Card Skeleton
export interface StatCardSkeletonProps {
  count?: number;
  variant?: SkeletonVariant;
  compact?: boolean;
  className?: string;
}

export function StatCardSkeleton({
  count = 4,
  variant = "pulse",
  compact = false,
  className,
}: StatCardSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className={cn("p-6", compact && "p-4")}>
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-2 flex-1">
                <Skeleton variant={variant} className="h-4 w-20" />
                <Skeleton variant={variant} className="h-8 w-16" />
                {!compact && (
                  <>
                    <Skeleton variant={variant} className="h-3 w-16" />
                    <Skeleton variant={variant} className="h-3 w-24" />
                  </>
                )}
              </div>
              <Skeleton variant={variant} className="h-5 w-5 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Text Skeleton
export interface TextSkeletonProps {
  lines?: number;
  variant?: SkeletonVariant;
  className?: string;
}

export function TextSkeleton({
  lines = 3,
  variant = "pulse",
  className,
}: TextSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          variant={variant}
          className={cn(
            "h-4",
            index === 0 ? "w-3/4" : index === lines - 1 ? "w-1/2" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// Form Skeleton
export interface FormSkeletonProps {
  fields?: number;
  variant?: SkeletonVariant;
  showButtons?: boolean;
  className?: string;
}

export function FormSkeleton({
  fields = 4,
  variant = "pulse",
  showButtons = true,
  className,
}: FormSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant={variant} className="h-4 w-20" />
          <Skeleton variant={variant} className="h-9 w-full" />
        </div>
      ))}
      
      {showButtons && (
        <div className="flex space-x-2 pt-4">
          <Skeleton variant={variant} className="h-9 w-20" />
          <Skeleton variant={variant} className="h-9 w-16" />
        </div>
      )}
    </div>
  );
}

// List Skeleton
export interface ListSkeletonProps {
  items?: number;
  variant?: SkeletonVariant;
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

export function ListSkeleton({
  items = 5,
  variant = "pulse",
  showAvatar = false,
  showActions = false,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          {showAvatar && (
            <Skeleton variant={variant} className="h-10 w-10 rounded-full" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant={variant} className="h-4 w-3/4" />
            <Skeleton variant={variant} className="h-3 w-1/2" />
          </div>
          {showActions && (
            <Skeleton variant={variant} className="h-8 w-8 rounded" />
          )}
        </div>
      ))}
    </div>
  );
}

// Page Skeleton
export interface PageSkeletonProps {
  showHeader?: boolean;
  showStats?: boolean;
  showTable?: boolean;
  showSidebar?: boolean;
  variant?: SkeletonVariant;
  className?: string;
}

export function PageSkeleton({
  showHeader = true,
  showStats = true,
  showTable = true,
  showSidebar = false,
  variant = "pulse",
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {showHeader && (
        <div className="space-y-2">
          <Skeleton variant={variant} className="h-8 w-48" />
          <Skeleton variant={variant} className="h-4 w-96" />
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 space-y-4">
            <CardSkeleton variant={variant} showHeader={false} lines={5} />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Stats */}
          {showStats && (
            <StatCardSkeleton variant={variant} count={4} />
          )}

          {/* Table */}
          {showTable && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton variant={variant} className="h-6 w-32" />
                    <Skeleton variant={variant} className="h-4 w-64" />
                  </div>
                  <Skeleton variant={variant} className="h-9 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <TableSkeleton variant={variant} rows={8} columns={5} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Add shimmer animation to CSS (you might want to add this to your global CSS)
const shimmerKeyframes = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@keyframes wave {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Utility function to inject styles if not already present
export const injectSkeletonStyles = () => {
  if (typeof document !== 'undefined' && !document.querySelector('#skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = shimmerKeyframes;
    document.head.appendChild(style);
  }
};