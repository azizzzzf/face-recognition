import React, { useCallback, useMemo, useRef } from 'react'

// Utility untuk debouncing API calls
export function useDebounce<T extends (...args: any[]) => any>(
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
export function useThrottle<T extends (...args: any[]) => any>(
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
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useCachedFetch<T>(url: string, options?: RequestInit) {
  return useMemo(() => {
    const cachedEntry = apiCache.get(url)
    const now = Date.now()
    
    // Return cached data if still valid
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
      return Promise.resolve(cachedEntry.data)
    }
    
    // Fetch new data and cache it
    return fetch(url, options)
      .then(response => response.json())
      .then(data => {
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

// React component performance wrapper
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
    }, [result, endMeasure])
    
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