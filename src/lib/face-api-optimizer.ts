'use client'

import * as faceapi from '@vladmandic/face-api'

// Model cache and optimization utilities
class FaceAPIOptimizer {
  private static instance: FaceAPIOptimizer
  private isLoaded = false
  private loadingPromise: Promise<void> | null = null
  private modelCache = new Map<string, any>()
  
  private constructor() {}
  
  static getInstance(): FaceAPIOptimizer {
    if (!FaceAPIOptimizer.instance) {
      FaceAPIOptimizer.instance = new FaceAPIOptimizer()
    }
    return FaceAPIOptimizer.instance
  }
  
  // Optimized model loading with progressive enhancement
  async loadModelsProgressive(): Promise<void> {
    if (this.isLoaded) return
    if (this.loadingPromise) return this.loadingPromise
    
    this.loadingPromise = this.doLoadModels()
    await this.loadingPromise
  }
  
  private async doLoadModels(): Promise<void> {
    try {
      console.log('🚀 Starting optimized Face-API model loading...')
      const startTime = performance.now()
      
      // Load models in priority order - most essential first
      const modelPath = '/models'
      
      // 1. Load tiny detector first (fastest, smallest)
      console.log('📦 Loading TinyFaceDetector...')
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath)
      console.log('✅ TinyFaceDetector loaded')
      
      // 2. Load face landmarks (needed for descriptor)
      console.log('📦 Loading FaceLandmark68Net...')
      await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
      console.log('✅ FaceLandmark68Net loaded')
      
      // 3. Load face recognition (descriptor extraction)
      console.log('📦 Loading FaceRecognitionNet...')
      await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
      console.log('✅ FaceRecognitionNet loaded')
      
      // 4. Optional: Load SSD detector for better accuracy (background)
      this.loadBackgroundModels(modelPath)
      
      const loadTime = performance.now() - startTime
      console.log(`✅ Core Face-API models loaded in ${loadTime.toFixed(2)}ms`)
      
      this.isLoaded = true
      
      // Warm up the models with a dummy detection
      await this.warmUpModels()
      
    } catch (error) {
      console.error('❌ Failed to load Face-API models:', error)
      this.loadingPromise = null
      throw error
    }
  }
  
  // Background loading of heavy models
  private async loadBackgroundModels(modelPath: string): Promise<void> {
    try {
      // Load heavier models in background for better accuracy
      setTimeout(async () => {
        console.log('🔄 Loading background models for enhanced accuracy...')
        
        // SSD MobileNet for better detection
        if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
          await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath)
          console.log('✅ SSDMobilenetv1 loaded in background')
        }
        
        // Face expressions (optional)
        if (!faceapi.nets.faceExpressionNet.isLoaded) {
          await faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
          console.log('✅ FaceExpressionNet loaded in background')
        }
        
        console.log('🎯 All background models loaded')
      }, 100) // Small delay to not block main thread
      
    } catch (error) {
      console.warn('⚠️ Background model loading failed:', error)
      // Don't throw - background loading is optional
    }
  }
  
  // Warm up models with dummy data
  private async warmUpModels(): Promise<void> {
    try {
      console.log('🔥 Warming up models...')
      
      // Create a small dummy image
      const canvas = document.createElement('canvas')
      canvas.width = 160
      canvas.height = 160
      const ctx = canvas.getContext('2d')!
      
      // Draw a simple face-like pattern
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, 160, 160)
      ctx.fillStyle = '#333'
      ctx.beginPath()
      ctx.arc(80, 80, 60, 0, Math.PI * 2)
      ctx.fill()
      
      // Perform a quick detection to warm up
      await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
      
      console.log('✅ Models warmed up successfully')
    } catch (error) {
      console.warn('⚠️ Model warm-up failed:', error)
      // Warm-up failure is not critical
    }
  }
  
  // Get optimized detection options based on use case
  getDetectionOptions(useCase: 'registration' | 'recognition' = 'recognition') {
    const baseOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: useCase === 'registration' ? 512 : 416, // Higher quality for registration
      scoreThreshold: useCase === 'registration' ? 0.3 : 0.5
    })
    
    return baseOptions
  }
  
  // Progressive enhancement - use better detector if available
  getBestDetectionOptions() {
    if (faceapi.nets.ssdMobilenetv1.isLoaded) {
      return new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.5,
        maxResults: 1
      })
    }
    
    return this.getDetectionOptions()
  }
  
  // Memory management
  clearCache(): void {
    this.modelCache.clear()
    console.log('🧹 Face-API cache cleared')
  }
  
  // Check if models are ready
  get isModelsLoaded(): boolean {
    return this.isLoaded
  }
  
  // Performance monitoring
  async benchmarkDetection(image: HTMLImageElement | HTMLCanvasElement): Promise<number> {
    const startTime = performance.now()
    
    await faceapi
      .detectSingleFace(image, this.getDetectionOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
    
    return performance.now() - startTime
  }
}

// Export singleton instance
export const faceAPIOptimizer = FaceAPIOptimizer.getInstance()

// Hook for React components
export function useFaceAPIOptimized() {
  const loadModels = () => faceAPIOptimizer.loadModelsProgressive()
  const getDetectionOptions = faceAPIOptimizer.getDetectionOptions.bind(faceAPIOptimizer)
  const getBestDetectionOptions = faceAPIOptimizer.getBestDetectionOptions.bind(faceAPIOptimizer)
  const isLoaded = faceAPIOptimizer.isModelsLoaded
  
  return {
    loadModels,
    getDetectionOptions,
    getBestDetectionOptions,
    isLoaded,
    benchmark: faceAPIOptimizer.benchmarkDetection.bind(faceAPIOptimizer),
    clearCache: faceAPIOptimizer.clearCache.bind(faceAPIOptimizer)
  }
}

// Utility for preloading models
export function preloadFaceAPIModels() {
  // Only preload in browser environment
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise setTimeout
    const preload = () => faceAPIOptimizer.loadModelsProgressive()
    
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preload, { timeout: 5000 })
    } else {
      setTimeout(preload, 1000)
    }
  }
}