'use client'

import * as faceapi from '@vladmandic/face-api'

// Model loading state management
class ModelLoader {
  private static instance: ModelLoader
  private modelsLoaded = false
  private loadingPromise: Promise<void> | null = null
  private modelCache: Map<string, any> = new Map()

  static getInstance(): ModelLoader {
    if (!ModelLoader.instance) {
      ModelLoader.instance = new ModelLoader()
    }
    return ModelLoader.instance
  }

  // Progressive model loading strategy
  async loadModelsProgressive(): Promise<void> {
    if (this.modelsLoaded) return
    if (this.loadingPromise) return this.loadingPromise

    this.loadingPromise = this.performModelLoading()
    return this.loadingPromise
  }

  private async performModelLoading(): Promise<void> {
    try {
      const MODEL_URL = '/models'
      
      // Load models in priority order for better UX
      console.log('🚀 Loading Face-API models...')
      
      // Phase 1: Essential models first (for basic detection)
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // Face detection
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL), // Lightweight landmarks
      ])
      console.log('✓ Phase 1: Basic detection models loaded')

      // Phase 2: Recognition model (heavier)
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      console.log('✓ Phase 2: Recognition model loaded')

      // Phase 3: Optional models (can be loaded in background)
      Promise.all([
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL), // Full landmarks
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL), // Age/Gender (optional)
      ]).then(() => {
        console.log('✓ Phase 3: Optional models loaded')
      })

      this.modelsLoaded = true
      console.log('🎉 Face-API models loading completed!')
    } catch (error) {
      console.error('❌ Error loading Face-API models:', error)
      this.loadingPromise = null
      throw error
    }
  }

  // Check if models are loaded
  isModelsLoaded(): boolean {
    return this.modelsLoaded
  }

  // Get optimized face detection options
  getDetectionOptions() {
    return new faceapi.SsdMobilenetv1Options({
      minConfidence: 0.5,
      maxResults: 1 // Optimize for single face detection
    })
  }

  // Get optimized face matching options
  getMatchingOptions() {
    return {
      useTinyModel: false, // Use full model for better accuracy in recognition
      scoreThreshold: 0.6, // Balanced threshold
    }
  }

  // Cache face descriptors to avoid recomputation
  cacheDescriptor(key: string, descriptor: any): void {
    this.modelCache.set(key, descriptor)
  }

  getCachedDescriptor(key: string): any | null {
    return this.modelCache.get(key) || null
  }

  clearCache(): void {
    this.modelCache.clear()
  }
}

// Export singleton instance
export const modelLoader = ModelLoader.getInstance()

// Hook for using face api models
export const useFaceAPI = () => {
  return {
    loadModels: () => modelLoader.loadModelsProgressive(),
    isLoaded: () => modelLoader.isModelsLoaded(),
    getDetectionOptions: () => modelLoader.getDetectionOptions(),
    getMatchingOptions: () => modelLoader.getMatchingOptions(),
    cacheDescriptor: (key: string, descriptor: any) => modelLoader.cacheDescriptor(key, descriptor),
    getCachedDescriptor: (key: string) => modelLoader.getCachedDescriptor(key),
    clearCache: () => modelLoader.clearCache(),
  }
}

// Preload models on app start (optional)
export const preloadModels = () => {
  if (typeof window !== 'undefined') {
    // Only in browser environment
    modelLoader.loadModelsProgressive().catch(console.error)
  }
}