'use client'

import React, { memo, useMemo, useCallback } from 'react'
import { useDebounce } from '@/lib/performance-utils'

// Optimized StatCard component
interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export const OptimizedStatCard = memo<StatCardProps>(({ 
  title, 
  value, 
  icon, 
  description, 
  trend 
}) => {
  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    return value
  }, [value])

  const trendColor = useMemo(() => {
    if (!trend) return ''
    return trend.isPositive ? 'text-green-600' : 'text-red-600'
  }, [trend])

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <p className={`text-sm mt-1 ${trendColor}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
})

OptimizedStatCard.displayName = 'OptimizedStatCard'

// Optimized search filter with debouncing
interface SearchFilterProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
}

export const OptimizedSearchFilter = memo<SearchFilterProps>(({ 
  placeholder = 'Search...', 
  onSearch,
  debounceMs = 300 
}) => {
  const debouncedSearch = useDebounce(onSearch, debounceMs)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }, [debouncedSearch])

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        onChange={handleInputChange}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="absolute left-3 top-2.5 h-5 w-5 text-gray-400">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
})

OptimizedSearchFilter.displayName = 'OptimizedSearchFilter'

// Virtual list component for large datasets
interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
}

export function VirtualList<T>({ items, height, itemHeight, renderItem }: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(height / itemHeight) + 1,
      items.length
    )
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }))
  }, [items, scrollTop, itemHeight, height])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div 
      style={{ height }}
      className="overflow-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: top,
              width: '100%',
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading skeleton component
interface LoadingSkeletonProps {
  lines?: number
  avatar?: boolean
}

export const LoadingSkeleton = memo<LoadingSkeletonProps>(({ 
  lines = 3, 
  avatar = false 
}) => {
  const skeletonLines = useMemo(() => 
    Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded animate-pulse ${
          i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'
        }`}
      />
    )), [lines]
  )

  return (
    <div className="p-4">
      <div className="flex space-x-4">
        {avatar && (
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        )}
        <div className="flex-1 space-y-2">
          {skeletonLines}
        </div>
      </div>
    </div>
  )
})

LoadingSkeleton.displayName = 'LoadingSkeleton'

// Optimized error boundary
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class OptimizedErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Component Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            An error occurred while loading this component
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}