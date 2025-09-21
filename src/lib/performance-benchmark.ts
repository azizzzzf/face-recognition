'use client'

import { useState, useEffect } from 'react'

// Performance benchmarking utilities
export class PerformanceBenchmark {
  private static measurements: Map<string, number[]> = new Map()
  
  // Start measuring performance
  static start(label: string): () => number {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Store measurement
      const existing = this.measurements.get(label) || []
      existing.push(duration)
      this.measurements.set(label, existing)
      
      return duration
    }
  }

  // Measure async operations
  static async measureAsync<T>(
    label: string, 
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const end = this.start(label)
    const result = await operation()
    const duration = end()
    
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
    return { result, duration }
  }

  // Measure sync operations
  static measure<T>(
    label: string, 
    operation: () => T
  ): { result: T; duration: number } {
    const end = this.start(label)
    const result = operation()
    const duration = end()
    
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
    return { result, duration }
  }

  // Get performance statistics
  static getStats(label: string) {
    const measurements = this.measurements.get(label) || []
    if (measurements.length === 0) return null

    const sorted = [...measurements].sort((a, b) => a - b)
    const sum = measurements.reduce((a, b) => a + b, 0)
    
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  // Clear all measurements
  static clear() {
    this.measurements.clear()
  }

  // Get all measurements
  static getAllStats() {
    const stats: Record<string, unknown> = {}
    
    for (const [label] of this.measurements) {
      stats[label] = this.getStats(label)
    }
    
    return stats
  }

  // Memory usage monitoring
  static getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usedMB: (memory.usedJSHeapSize / 1048576).toFixed(2),
        totalMB: (memory.totalJSHeapSize / 1048576).toFixed(2),
        limitMB: (memory.jsHeapSizeLimit / 1048576).toFixed(2)
      }
    }
    return null
  }

  // Core Web Vitals monitoring
  static setupWebVitalsMonitoring() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (entry.entryType === 'layout-shift' && !layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0
        }
      }
    })
    
    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch {
      console.warn('CLS monitoring not supported')
    }

    // LCP (Largest Contentful Paint)
    let lcpValue = 0
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      lcpValue = lastEntry.startTime
    })
    
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {
      console.warn('LCP monitoring not supported')
    }

    // FID (First Input Delay)
    let fidValue = 0
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEntry & { processingStart?: number };
        if (fidEntry.processingStart && fidEntry.startTime) {
          fidValue = fidEntry.processingStart - fidEntry.startTime;
        }
      }
    })
    
    try {
      fidObserver.observe({ type: 'first-input', buffered: true })
    } catch {
      console.warn('FID monitoring not supported')
    }

    // Report metrics after page load
    setTimeout(() => {
      const vitals = {
        CLS: parseFloat(clsValue.toFixed(4)),
        LCP: parseFloat(lcpValue.toFixed(2)),
        FID: parseFloat(fidValue.toFixed(2))
      }
      
      console.log('📊 Core Web Vitals:', vitals)
      
      // Store in sessionStorage for reporting
      if ('sessionStorage' in window) {
        sessionStorage.setItem('webVitals', JSON.stringify(vitals))
      }
      
      return vitals
    }, 5000)
  }
}

// Resource loading performance
export class ResourceLoader {
  static async preloadImage(src: string): Promise<number> {
    return PerformanceBenchmark.measureAsync(`preload-image-${src}`, () => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = src
      })
    }).then(result => result.duration)
  }

  static async preloadScript(src: string): Promise<number> {
    return PerformanceBenchmark.measureAsync(`preload-script-${src}`, () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.onload = () => resolve()
        script.onerror = reject
        script.src = src
        document.head.appendChild(script)
      })
    }).then(result => result.duration)
  }

  static async measureNetworkLatency(url: string): Promise<number> {
    const start = performance.now()
    
    try {
      await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      return performance.now() - start
    } catch (error) {
      console.error('Network latency measurement failed:', error)
      return -1
    }
  }
}

// Application-specific benchmarks
export class AppBenchmarks {
  // Benchmark face detection performance
  static async benchmarkFaceDetection(
    image: HTMLImageElement | HTMLCanvasElement,
    iterations = 5
  ): Promise<{
    avg: number,
    min: number,
    max: number,
    results: number[]
  }> {
    const results: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const duration = await PerformanceBenchmark.measureAsync(
        `face-detection-${i}`,
        async () => {
          // Simulate face detection - replace with actual face-api call
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        }
      ).then(result => result.duration)
      
      results.push(duration)
    }
    
    const avg = results.reduce((a, b) => a + b, 0) / results.length
    const min = Math.min(...results)
    const max = Math.max(...results)
    
    console.log(`🎯 Face Detection Benchmark (${iterations} runs):`, {
      avg: `${avg.toFixed(2)}ms`,
      min: `${min.toFixed(2)}ms`, 
      max: `${max.toFixed(2)}ms`
    })
    
    return { avg, min, max, results }
  }

  // Benchmark database operations
  static async benchmarkDatabaseQuery(
    queryName: string,
    queryFn: () => Promise<unknown>
  ): Promise<number> {
    return PerformanceBenchmark.measureAsync(`db-${queryName}`, queryFn)
      .then(result => result.duration)
  }

  // Benchmark component rendering
  static benchmarkComponentRender(componentName: string) {
    return PerformanceBenchmark.start(`render-${componentName}`)
  }

  // Run full application benchmark suite
  static async runBenchmarkSuite() {
    console.log('🚀 Starting performance benchmark suite...')
    
    const results = {
      timestamp: new Date().toISOString(),
      memory: PerformanceBenchmark.getMemoryUsage(),
      measurements: {} as Record<string, unknown>
    }

    // Benchmark network latency
    const networkLatency = await ResourceLoader.measureNetworkLatency('/api/health')
    console.log(`🌐 Network latency: ${networkLatency.toFixed(2)}ms`)
    
    // Get all performance stats
    results.measurements = PerformanceBenchmark.getAllStats()
    
    console.log('📊 Benchmark results:', results)
    
    // Store results
    if ('localStorage' in window) {
      localStorage.setItem('benchmarkResults', JSON.stringify(results))
    }
    
    return results
  }
}

// Performance monitoring hook for React components
export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: null as ReturnType<typeof PerformanceBenchmark.getMemoryUsage>
  })

  useEffect(() => {
    const endMeasurement = PerformanceBenchmark.start(`${componentName}-mount`)
    
    return () => {
      const renderTime = endMeasurement()
      const memoryUsage = PerformanceBenchmark.getMemoryUsage()
      
      setMetrics({ renderTime, memoryUsage })
      
      if (renderTime > 100) {
        console.warn(`⚠️ Slow component mount: ${componentName} took ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  return metrics
}

// Export singleton
export const benchmark = PerformanceBenchmark

// Auto-initialize web vitals monitoring
if (typeof window !== 'undefined') {
  PerformanceBenchmark.setupWebVitalsMonitoring()
}