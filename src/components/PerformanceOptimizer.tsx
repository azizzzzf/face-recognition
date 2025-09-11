'use client'

import { useEffect } from 'react'

// Resource preloader and performance optimizer
export function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = async () => {
      try {
        // 1. Preload Face-API models in background (client-side only)
        console.log('🚀 Starting background resource preloading...')
        
        if (typeof window !== 'undefined') {
          // Dynamic import to avoid SSR issues
          const { preloadFaceAPIModels } = await import('@/lib/face-api-optimizer')
          preloadFaceAPIModels()
        }
        
        // 2. Preload critical images
        preloadImages([
          '/icons/icon-192.png',
          '/icons/icon-512.png'
        ])
        
        // 3. Preload critical fonts (if any)
        preloadFonts()
        
        // 4. Setup service worker for caching (if supported)
        setupServiceWorker()
        
        console.log('✅ Resource preloading initiated')
      } catch (error) {
        console.warn('⚠️ Resource preloading failed:', error)
      }
    }
    
    // Start preloading after initial render
    const timer = setTimeout(preloadCriticalResources, 100)
    return () => clearTimeout(timer)
  }, [])
  
  return null // This component doesn't render anything
}

// Image preloading utility
function preloadImages(imagePaths: string[]) {
  imagePaths.forEach(path => {
    const img = new Image()
    img.src = path
    img.onload = () => console.log(`✅ Preloaded image: ${path}`)
    img.onerror = () => console.warn(`⚠️ Failed to preload image: ${path}`)
  })
}

// Font preloading utility
function preloadFonts() {
  // Check if fonts are already loaded
  if (document.fonts) {
    document.fonts.ready.then(() => {
      console.log('✅ Fonts loaded')
    })
  }
}

// Service worker setup for caching
function setupServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration)
      })
      .catch(error => {
        console.warn('⚠️ Service Worker registration failed:', error)
      })
  }
}

// Performance monitoring component
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined') {
      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsEntries: PerformanceEntry[] = []
      
      // First Input Delay (FID) - replaced with INP in newer metrics
      let fidValue = 0
      
      // Largest Contentful Paint (LCP)
      let lcpValue = 0
      
      // Performance observer for Web Vitals
      if ('PerformanceObserver' in window) {
        try {
          // CLS Observer
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                clsValue += (entry as any).value
                clsEntries.push(entry)
              }
            }
          })
          clsObserver.observe({ type: 'layout-shift', buffered: true })
          
          // LCP Observer
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            lcpValue = lastEntry.startTime
          })
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
          
          // FID Observer
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const fidEntry = entry as any
              if (fidEntry.processingStart && fidEntry.startTime) {
                fidValue = fidEntry.processingStart - fidEntry.startTime
              }
            }
          })
          fidObserver.observe({ type: 'first-input', buffered: true })
          
          // Report metrics after page load
          setTimeout(() => {
            console.log('📊 Core Web Vitals:', {
              CLS: clsValue.toFixed(4),
              LCP: `${lcpValue.toFixed(2)}ms`,
              FID: `${fidValue.toFixed(2)}ms`
            })
            
            // Alert if metrics are poor
            if (clsValue > 0.1) {
              console.warn('⚠️ Poor CLS detected:', clsValue.toFixed(4))
            }
            if (lcpValue > 2500) {
              console.warn('⚠️ Poor LCP detected:', `${lcpValue.toFixed(2)}ms`)
            }
            if (fidValue > 100) {
              console.warn('⚠️ Poor FID detected:', `${fidValue.toFixed(2)}ms`)
            }
          }, 5000)
          
        } catch (error) {
          console.warn('⚠️ Performance monitoring setup failed:', error)
        }
      }
      
      // Memory usage monitoring (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log('💾 Memory usage:', {
          used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`
        })
      }
    }
  }, [])
  
  return <>{children}</>
}

// Resource hints component
export function ResourceHints() {
  useEffect(() => {
    // Add resource hints to document head
    const addResourceHint = (rel: string, href: string, as?: string) => {
      const link = document.createElement('link')
      link.rel = rel
      link.href = href
      if (as) link.setAttribute('as', as)
      document.head.appendChild(link)
    }
    
    // DNS prefetch for external domains
    addResourceHint('dns-prefetch', 'https://fonts.googleapis.com')
    
    // Preconnect to critical domains
    addResourceHint('preconnect', 'https://fonts.gstatic.com')
    
    // Prefetch likely navigation targets
    addResourceHint('prefetch', '/register')
    addResourceHint('prefetch', '/recognize')
    addResourceHint('prefetch', '/attendance')
    
  }, [])
  
  return null
}