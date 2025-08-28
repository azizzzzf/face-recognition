'use client'

/**
 * Face Capture Component
 * Optimized for single high-quality face capture with responsive design
 * Features: 75vh camera view, responsive SVG circle guide, enhanced image quality
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, RotateCcw, Check, AlertCircle } from 'lucide-react'

interface FaceCaptureProps {
  onCaptureComplete: (images: string[]) => void
  isCapturing?: boolean
}

export function MultiAngleCapture({ onCaptureComplete, isCapturing = false }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [streamQuality, setStreamQuality] = useState<{ width: number; height: number } | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user',
          aspectRatio: { ideal: 16/9, min: 4/3, max: 21/9 },
          frameRate: { ideal: 30, max: 30 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Optimize video playback settings
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current
            setStreamQuality({ width: videoWidth, height: videoHeight })
            console.log(`Camera initialized: ${videoWidth}x${videoHeight}`)
          }
        }
        
        // Optimize memory usage
        videoRef.current.onended = () => {
          setIsStreaming(false)
        }
        
        await videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err) {
      setError('Gagal mengakses kamera. Mohon periksa izin akses kamera dan pastikan halaman ini diakses melalui HTTPS.')
      console.error('Camera access error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => {
        track.stop()
        console.log(`Camera track stopped: ${track.kind}`)
      })
      videoRef.current.srcObject = null
      videoRef.current.load() // Reset video element
      setIsStreaming(false)
      setStreamQuality(null)
    }
  }, [])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (!context) return null

    // Capture at optimized quality for horizontal layout
    const targetWidth = Math.min(video.videoWidth, 1920)
    const targetHeight = Math.min(video.videoHeight, 1080)
    
    canvas.width = targetWidth
    canvas.height = targetHeight
    
    // Apply image enhancement for better face detection
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.filter = 'contrast(1.1) brightness(1.05)'
    
    // Scale and center the image if needed
    const scaleX = targetWidth / video.videoWidth
    const scaleY = targetHeight / video.videoHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = video.videoWidth * scale
    const scaledHeight = video.videoHeight * scale
    const offsetX = (targetWidth - scaledWidth) / 2
    const offsetY = (targetHeight - scaledHeight) / 2
    
    context.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight)
    context.filter = 'none'

    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  const handleCapture = useCallback(() => {
    if (isCapturing || countdown > 0) return
    
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          
          // Capture with requestAnimationFrame for better performance
          requestAnimationFrame(() => {
            const imageData = captureImage()
            if (imageData) {
              setCapturedImage(imageData)
              // Delay camera stop to prevent flickering
              setTimeout(() => {
                stopCamera()
                onCaptureComplete([imageData])
              }, 100)
            }
          })
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [captureImage, stopCamera, onCaptureComplete, isCapturing, countdown])

  const resetCapture = useCallback(() => {
    // Batch state updates for better performance
    setCapturedImage(null)
    setCountdown(0)
    setError(null)
    
    if (!isStreaming) {
      // Debounce camera restart to prevent multiple calls
      setTimeout(() => {
        startCamera()
      }, 150)
    }
  }, [isStreaming, startCamera])

  useEffect(() => {
    startCamera()
    
    // Cleanup function with memory optimization
    return () => {
      stopCamera()
      // Clear any potential memory leaks
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
  }, [startCamera, stopCamera])

  // Memoize expensive computations
  const isComplete = useMemo(() => capturedImage !== null, [capturedImage])
  
  const canShowControls = useMemo(() => {
    return !isComplete && isStreaming && countdown === 0
  }, [isComplete, isStreaming, countdown])
  
  const shouldShowResetButton = useMemo(() => {
    return capturedImage || !isStreaming
  }, [capturedImage, isStreaming])

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Error notification */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 p-4 bg-red-900 bg-opacity-90 border border-red-600 rounded-lg text-red-200 backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Full Screen Camera View - optimized for horizontal layout */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-gray-800"
          style={{
            aspectRatio: '16/9',
            objectPosition: 'center center'
          }}
          autoPlay
          playsInline
          muted
        />
        
        {/* Circle Guide Overlay - optimized for horizontal layout */}
        {!isComplete && isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex flex-col items-center">
              {/* Responsive SVG circle - scaled for larger horizontal camera view */}
              <svg 
                className="w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] text-white drop-shadow-2xl" 
                viewBox="0 0 500 500"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                }}
              >
                {/* Enhanced glow effect with better visibility */}
                <defs>
                  <filter id="enhanced-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                  <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                
                {/* Outer guide ring for better visibility */}
                <circle
                  cx="250"
                  cy="250"
                  r="180"
                  fill="none"
                  stroke="url(#circleGradient)"
                  strokeWidth="6"
                  strokeDasharray="20,12"
                  className="animate-pulse"
                  filter="url(#enhanced-glow)"
                  opacity="0.9"
                />
                
                {/* Main circle guide */}
                <circle
                  cx="250"
                  cy="250"
                  r="140"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeDasharray="16,10"
                  className="animate-pulse"
                  filter="url(#enhanced-glow)"
                  style={{
                    animationDelay: '0.5s',
                    animationDuration: '2s'
                  }}
                />
                
                {/* Inner reference circle for face positioning */}
                <circle
                  cx="250"
                  cy="250"
                  r="100"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  strokeDasharray="10,6"
                />
                
                {/* Corner markers for better alignment */}
                <g stroke="#ffffff" strokeWidth="3" strokeOpacity="0.7">
                  <line x1="170" y1="170" x2="185" y2="170" />
                  <line x1="170" y1="170" x2="170" y2="185" />
                  <line x1="330" y1="170" x2="315" y2="170" />
                  <line x1="330" y1="170" x2="330" y2="185" />
                  <line x1="170" y1="330" x2="185" y2="330" />
                  <line x1="170" y1="330" x2="170" y2="315" />
                  <line x1="330" y1="330" x2="315" y2="330" />
                  <line x1="330" y1="330" x2="330" y2="315" />
                </g>
              </svg>
              
              {/* Instruction text - positioned below circle with better visibility */}
              <div className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2 text-center max-w-xs">
                <p className="text-white text-sm sm:text-base lg:text-lg font-semibold px-6 py-3 bg-black bg-opacity-75 rounded-2xl backdrop-blur-md shadow-2xl border border-white border-opacity-20">
                  Posisikan wajah dalam lingkaran
                </p>
                <div className="mt-2 text-xs sm:text-sm text-gray-300 bg-black bg-opacity-50 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Pastikan pencahayaan cukup terang
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-white text-6xl sm:text-7xl lg:text-8xl font-bold mb-4 animate-pulse">
                {countdown}
              </div>
              <p className="text-white text-lg lg:text-xl font-medium">
                Bersiaplah...
              </p>
            </div>
          </div>
        )}

        {/* Success overlay */}
        {isComplete && capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
            <div className="text-center text-white p-6">
              <div className="mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                  <Check className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <p className="text-xl lg:text-2xl font-bold mb-2">Foto berhasil diambil!</p>
                <p className="text-gray-300 text-sm lg:text-base">Foto wajah telah tersimpan dengan baik</p>
              </div>
              <img
                src={capturedImage}
                alt="Captured face"
                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-cover rounded-full mx-auto border-4 border-green-400 shadow-xl"
              />
            </div>
          </div>
        )}

        {/* Bottom Controls Bar - optimized for horizontal layout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-6 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-sm">
          <div className="flex justify-center items-center gap-3 md:gap-4">
            {/* Stream Quality Indicator */}
            {streamQuality && isStreaming && (
              <div className="hidden lg:flex items-center text-xs text-gray-300 bg-black bg-opacity-50 px-3 py-1 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                {streamQuality.width}×{streamQuality.height}
              </div>
            )}
            
            {canShowControls && (
              <Button
                onClick={handleCapture}
                disabled={isCapturing || countdown > 0}
                size="lg"
                className="text-sm md:text-base lg:text-lg px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 h-10 md:h-12 lg:h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Camera className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mr-2 md:mr-3" />
                <span>Ambil Foto</span>
              </Button>
            )}

            {shouldShowResetButton && (
              <Button
                onClick={resetCapture}
                variant="outline"
                disabled={isCapturing || countdown > 0}
                size="lg"
                className="text-sm md:text-base lg:text-lg px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 h-10 md:h-12 lg:h-14 border-2 border-gray-300 bg-white hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mr-2 md:mr-3" />
                <span>{capturedImage ? 'Ambil Ulang' : 'Mulai Kamera'}</span>
              </Button>
            )}
            
            {/* Error indicator */}
            {error && (
              <div className="hidden md:flex items-center text-xs text-red-300 bg-red-900 bg-opacity-50 px-3 py-1 rounded-full backdrop-blur-sm">
                <AlertCircle className="w-3 h-3 mr-1" />
                Error
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        className="hidden" 
        style={{ 
          imageRendering: '-webkit-optimize-contrast'
        }} 
      />
    </div>
  )
}
