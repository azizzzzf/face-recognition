import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2", 
  lg: "h-8 w-8 border-3",
  xl: "h-12 w-12 border-4"
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent",
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )
}

export function LoadingSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted/50", className)}
      {...props}
    />
  )
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border border-border/50 p-6 shadow-md">
      <div className="space-y-4">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-3 w-full" />
        <LoadingSkeleton className="h-3 w-2/3" />
        <div className="flex justify-between">
          <LoadingSkeleton className="h-8 w-20" />
          <LoadingSkeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}

interface LoadingStateProps {
  children: React.ReactNode
  isLoading: boolean
  loadingComponent?: React.ReactNode
  error?: string | null
}

export function LoadingState({ children, isLoading, loadingComponent, error }: LoadingStateProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Terjadi Kesalahan</h3>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        {loadingComponent || <LoadingSpinner size="lg" text="Memuat data..." />}
      </div>
    )
  }

  return <>{children}</>
}