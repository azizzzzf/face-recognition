import React, { useCallback, useMemo, useRef } from 'react'

// Utility untuk debouncing API calls
/**
 * Creates a debounced version of the provided callback.
 *
 * The returned function delays invoking `callback` until `delay` milliseconds have
 * elapsed since the last call; each invocation resets the timer. The returned
 * function preserves the argument types and arity of `callback`.
 *
 * @param callback - Function to debounce; will be called with the latest arguments after the delay
 * @param delay - Delay in milliseconds to wait after the last call before invoking `callback`
 * @returns A debounced version of `callback` with the same call signature
 */
export function useDebounce<T extends (...args: any) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}

// Utility untuk throttling expensive operations
/**
 * Returns a throttled version of `callback` that invokes at most once per `delay` milliseconds.
 *
 * The returned function forwards arguments to `callback` when the previous invocation was at least
 * `delay` ms ago. Subsequent calls within the delay window are ignored.
 *
 * @param callback - Function to be throttled.
 * @param delay - Minimum interval in milliseconds between allowed invocations.
 * @returns A throttled function with the same call signature as `callback`.
 */
export function useThrottle<T extends (...args: any) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0)
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now
      callback(...args)
    }
  }, [callback, delay]) as T
}

// Memoized API cache untuk menghindari duplicate calls
const apiCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches JSON from a URL with in-memory caching and returns a Promise of the parsed result.
 *
 * This hook-style helper returns a Promise<T> that resolves to the fetched JSON. Responses are cached in an internal
 * in-memory cache for CACHE_DURATION milliseconds and served from the cache when a fresh entry exists.
 *
 * Important details:
 * - The cache key is the request URL only; `options` are not part of the cache key. Requests made with different
 *   options but the same URL may return the cached response.
 * - Successful fetch responses are parsed via `response.json()` and cached as the value returned by the Promise.
 * - Network or JSON parsing errors are not handled here and will reject the returned Promise.
 *
 * @param url - The resource URL to fetch and use as the cache key.
 * @param options - Optional fetch init options passed to `fetch`.
 * @returns A Promise that resolves to the parsed JSON result typed as `T`.
 */
export function useCachedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  return useMemo(() => {
    const cachedEntry = apiCache.get(url)
    const now = Date.now()
    
    // Return cached data if still valid
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
      return Promise.resolve(cachedEntry.data as T)
    }
    
    // Fetch new data and cache it
    return fetch(url, options)
      .then(response => response.json())
      .then((data: T) => {
        apiCache.set(url, { data, timestamp: now })
        return data
      })
  }, [url, options])
}

// Performance monitoring utility
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map()
  
  static startMeasure(name: string): () => number {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      const duration = end - start
      
      if (!this.measurements.has(name)) {
        this.measurements.set(name, [])
      }
      
      this.measurements.get(name)!.push(duration)
      
      // Keep only last 10 measurements
      const measurements = this.measurements.get(name)!
      if (measurements.length > 10) {
        measurements.shift()
      }
      
      return duration
    }
  }
  
  static getAverageTime(name: string): number {
    const measurements = this.measurements.get(name) || []
    if (measurements.length === 0) return 0
    
    const sum = measurements.reduce((acc, val) => acc + val, 0)
    return sum / measurements.length
  }
  
  static logPerformanceReport() {
    console.group('📊 Performance Report')
    this.measurements.forEach((times, name) => {
      const avg = this.getAverageTime(name)
      console.log(`${name}: ${avg.toFixed(2)}ms (avg of ${times.length} measurements)`)
    })
    console.groupEnd()
  }
}

/**
 * Wraps a React component to measure and report render duration.
 *
 * The returned component records render start and end times using PerformanceMonitor and logs a console warning if a single render exceeds ~50ms.
 *
 * @param Component - The React component to wrap.
 * @param componentName - Human-readable name used in measurement labels and warning messages.
 * @returns A component that renders `Component` and records its render time.
 */
export function withPerformanceMonitor<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const endMeasure = useMemo(() => 
      PerformanceMonitor.startMeasure(`${componentName}-render`), []
    )
    
    const result = useMemo(() => React.createElement(Component, props), [props])
    
    // Measure render time
    useMemo(() => {
      const time = endMeasure()
      if (time > 50) { // Log slow renders
        console.warn(`🐌 Slow render: ${componentName} took ${time.toFixed(2)}ms`)
      }
    }, [endMeasure])
    
    return result
  }
}

// Image preloading utility
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      })
    )
  )
}