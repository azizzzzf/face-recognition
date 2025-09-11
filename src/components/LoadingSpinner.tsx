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

// Face Recognition App Loading Screen
interface FaceRecognitionLoaderProps {
  className?: string
}

export function FaceRecognitionLoader({ className }: FaceRecognitionLoaderProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background px-4", className)}>
      <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-md w-full">
        {/* Face Recognition Icon with Animation */}
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-primary/20 animate-pulse"></div>
          {/* Spinning Ring */}
          <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          {/* Inner Face Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* App Title and Loading Text */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Face Recognition
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Attendance System
            </p>
          </div>
          
          {/* Loading Text with Dots Animation */}
          <div className="flex items-center justify-center space-x-1">
            <span className="text-sm text-muted-foreground">Loading</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="sr-only" role="status" aria-live="polite">
          Loading Face Recognition Attendance System
        </div>
      </div>
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