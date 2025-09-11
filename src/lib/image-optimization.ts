'use client'

// Image optimization utilities
export class ImageOptimizer {
  private static canvas: HTMLCanvasElement | null = null
  private static ctx: CanvasRenderingContext2D | null = null
  
  // Initialize canvas for image processing
  private static initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }
  }
  
  // Compress image to specified quality and max dimensions
  static compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.initCanvas()
        if (!this.canvas || !this.ctx) {
          reject(new Error('Canvas not supported'))
          return
        }
        
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        // Set canvas size
        this.canvas.width = width
        this.canvas.height = height
        
        // Draw and compress
        this.ctx.drawImage(img, 0, 0, width, height)
        
        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }
  
  // Convert image to WebP format (if supported)
  static convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.initCanvas()
        if (!this.canvas || !this.ctx) {
          reject(new Error('Canvas not supported'))
          return
        }
        
        this.canvas.width = img.width
        this.canvas.height = img.height
        this.ctx.drawImage(img, 0, 0)
        
        // Check if WebP is supported
        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              // Fallback to JPEG if WebP is not supported
              this.canvas!.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    resolve(jpegBlob)
                  } else {
                    reject(new Error('Failed to convert image'))
                  }
                },
                'image/jpeg',
                quality
              )
            }
          },
          'image/webp',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }
  
  // Create image thumbnail
  static createThumbnail(
    file: File,
    size: number = 150,
    quality: number = 0.7
  ): Promise<Blob> {
    return this.compressImage(file, size, size, quality)
  }
  
  // Optimize image for face detection (specific dimensions and quality)
  static optimizeForFaceDetection(file: File): Promise<Blob> {
    // Optimal size for face detection models
    return this.compressImage(file, 640, 480, 0.9)
  }
}

// Lazy image loading utility
export class LazyImageLoader {
  private static observer: IntersectionObserver | null = null
  private static images = new Set<HTMLImageElement>()
  
  static init() {
    if (typeof window === 'undefined' || this.observer) return
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          this.loadImage(img)
          this.observer!.unobserve(img)
          this.images.delete(img)
        }
      })
    }, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    })
  }
  
  static observe(img: HTMLImageElement) {
    if (!this.observer) this.init()
    if (this.observer) {
      this.observer.observe(img)
      this.images.add(img)
    }
  }
  
  private static loadImage(img: HTMLImageElement) {
    if (img.dataset.src) {
      img.src = img.dataset.src
      img.removeAttribute('data-src')
      
      // Add loading animation
      img.style.transition = 'opacity 0.3s ease'
      img.style.opacity = '0'
      
      img.onload = () => {
        img.style.opacity = '1'
      }
    }
  }
  
  static cleanup() {
    if (this.observer) {
      this.images.forEach(img => {
        this.observer!.unobserve(img)
      })
      this.observer.disconnect()
      this.observer = null
      this.images.clear()
    }
  }
}

// Icon optimization - import only used icons
export const optimizeIcons = () => {
  // This will be used in build process to tree-shake unused icons
  const iconUsage = {
    'lucide-react': [
      'Camera', 'Check', 'AlertCircle', 'CheckCircle2', 'Users',
      'UserPlus', 'BarChart3', 'ArrowRight', 'Calendar', 'Activity',
      'Shield', 'Clock', 'Info', 'Upload', 'RotateCcw', 'User',
      'Eye', 'EyeOff', 'XCircle', 'WifiOff', 'LogOut', 'Loader2'
    ]
  }
  
  return iconUsage
}

// Preload critical images
export const preloadCriticalImages = (imageUrls: string[]) => {
  if (typeof window === 'undefined') return
  
  imageUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

// CSS optimization - remove unused styles
export const optimizeCSS = () => {
  if (typeof window === 'undefined') return
  
  // Remove unused CSS classes in production
  const unusedClasses: string[] = [
    // Add classes that are not used
  ]
  
  const styleSheets = Array.from(document.styleSheets)
  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules)
      rules.forEach((rule, index) => {
        if (rule instanceof CSSStyleRule) {
          unusedClasses.forEach(unusedClass => {
            if (rule.selectorText && rule.selectorText.includes(unusedClass)) {
              sheet.deleteRule(index)
            }
          })
        }
      })
    } catch {
      // Cross-origin stylesheets can't be accessed
    }
  })
}