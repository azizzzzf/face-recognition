'use client'

import React, { useRef, useState, useCallback } from 'react'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Upload, X, Check, AlertCircle, Image } from 'lucide-react'

interface ImageUploadProps {
  onUploadComplete: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ onUploadComplete, maxImages = 10 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const validateImage = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, dll)')
      return false
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB')
      return false
    }

    return true
  }

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)
    
    if (uploadedImages.length + fileArray.length > maxImages) {
      setError(`Maksimal ${maxImages} foto yang dapat diupload`)
      return
    }

    const validFiles = fileArray.filter(validateImage)
    if (validFiles.length === 0) return

    try {
      const base64Images = await Promise.all(
        validFiles.map(convertFileToBase64)
      )

      const newImages = [...uploadedImages, ...base64Images]
      setUploadedImages(newImages)

      // For single image mode (maxImages = 1), complete immediately
      if (maxImages === 1 && newImages.length >= 1) {
        onUploadComplete([newImages[0]])
      } else if (newImages.length === maxImages) {
        onUploadComplete(newImages)
      }
    } catch (error) {
      setError('Gagal memproses gambar. Silakan coba lagi.')
      console.error('Image processing error:', error)
    }
  }, [uploadedImages, maxImages, onUploadComplete])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    setUploadedImages([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isComplete = uploadedImages.length === maxImages

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
          Upload Foto Wajah
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {maxImages === 1 
            ? 'Upload satu foto wajah yang jelas. Format yang didukung: JPG, PNG, WEBP. Ukuran maksimal: 5MB.' 
            : `Upload foto wajah anda dari berbagai sudut (maksimal ${maxImages} foto). Format yang didukung: JPG, PNG, WEBP. Ukuran maksimal: 5MB per file.`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center mb-4">
          <Badge variant={isComplete ? "default" : "outline"} className="text-base px-4 py-2">
            {uploadedImages.length} / {maxImages} foto
          </Badge>
        </div>

        {/* Upload area - optimized for single image mode */}
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'}
            ${isComplete ? 'opacity-50 pointer-events-none' : 'hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer'}
            ${maxImages === 1 ? 'min-h-[300px] flex items-center justify-center' : 'max-h-[40vh] sm:max-h-none'}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              <div className={`p-4 sm:p-6 bg-gray-100 rounded-full ${isDragActive ? 'bg-blue-100' : ''}`}>
                <Upload className={`h-8 w-8 sm:h-12 sm:w-12 text-gray-600 ${isDragActive ? 'text-blue-600' : ''}`} />
              </div>
            </div>
            
            <div>
              <p className="text-lg sm:text-xl font-semibold mb-2">
                {isDragActive ? 'Lepas foto di sini...' : (maxImages === 1 ? 'Upload Foto Wajah' : 'Drag & drop foto atau klik untuk pilih')}
              </p>
              <p className="text-sm sm:text-base text-gray-600">
                {maxImages === 1 
                  ? 'Klik atau seret foto wajah ke sini' 
                  : `Pilih ${maxImages - uploadedImages.length} foto lagi`}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Uploaded images preview */}
        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-medium mb-3">Foto yang Telah Diupload:</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-16 sm:h-24 object-cover rounded border shadow-sm"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <p className="text-xs text-center mt-1 hidden sm:block">
                    Foto {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 pt-4">
          {!isComplete && uploadedImages.length > 0 && (
            <Button
              onClick={handleUploadClick}
              variant="outline"
              size="lg"
              className="text-lg px-6 py-3"
            >
              <Image className="h-5 w-5 mr-2" />
              Tambah Foto Lagi
            </Button>
          )}

          {uploadedImages.length > 0 && (
            <Button
              onClick={resetUpload}
              variant="outline"
              size="lg"
              className="text-lg px-6 py-3"
            >
              <X className="h-5 w-5 mr-2" />
              Hapus Semua
            </Button>
          )}
        </div>

        {isComplete && (
          <div className="text-center p-6 bg-green-50 border border-green-200 rounded-xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-white" />
            </div>
            <p className="text-green-800 font-semibold text-xl mb-1">
              {maxImages === 1 ? 'Foto berhasil diupload!' : 'Semua foto berhasil diupload!'}
            </p>
            <p className="text-green-700 text-sm">
              Foto siap untuk registrasi
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}