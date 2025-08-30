'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as faceapi from '@vladmandic/face-api';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Alert, AlertDescription } from '@/ui/alert';
import { Card, CardContent } from '@/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { MultiAngleCapture } from '@/components/MultiAngleCapture';
import { ImageUpload } from '@/components/ImageUpload';
import { Camera, Upload, Check, AlertCircle, RotateCcw } from 'lucide-react';

interface FormData {
  name: string;
}

type RegistrationStatus = 'idle' | 'capturing' | 'processing' | 'success' | 'error';
type CaptureMode = 'camera' | 'upload';

export default function RegisterFace() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();
  const nameValue = watch('name');
  
  // Memoize status text to avoid conditional hook calls
  const statusText = useMemo(() => {
    switch (registrationStatus) {
      case 'capturing': return 'Mengambil foto...';
      case 'processing': return 'Memproses...';
      default: return 'Siap untuk foto';
    }
  }, [registrationStatus]);
  
  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Failed to load models:', error);
        setErrorMessage('Gagal memuat model deteksi wajah. Silakan muat ulang halaman.');
      }
    };
    
    loadModels();
  }, []);

  // Convert base64 image to image element for face-api processing
  const base64ToImage = (base64: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base64;
    });
  };

  // Extract face descriptor from base64 image using face-api.js
  const extractFaceDescriptor = async (base64Image: string): Promise<Float32Array | null> => {
    try {
      const img = await base64ToImage(base64Image);
      
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      return detection ? detection.descriptor : null;
    } catch (error) {
      console.error('Error extracting face descriptor:', error);
      return null;
    }
  };

  // Process multiple images and get average descriptor
  const processMultipleImages = async (images: string[]): Promise<Float32Array | null> => {
    const descriptors: Float32Array[] = [];
    
    for (const image of images) {
      const descriptor = await extractFaceDescriptor(image);
      if (descriptor) {
        descriptors.push(descriptor);
      }
    }
    
    if (descriptors.length === 0) {
      return null;
    }
    
    // Calculate average descriptor
    const averageDescriptor = new Float32Array(descriptors[0].length);
    for (let i = 0; i < averageDescriptor.length; i++) {
      let sum = 0;
      for (const descriptor of descriptors) {
        sum += descriptor[i];
      }
      averageDescriptor[i] = sum / descriptors.length;
    }
    
    return averageDescriptor;
  };

  const handleCaptureComplete = (images: string[]) => {
    setCapturedImages(images);
    setShowRegistrationForm(true);
  };

  const handleUploadComplete = (images: string[]) => {
    setCapturedImages(images);
    setShowRegistrationForm(true);
  };

  const onSubmit = async (data: FormData) => {
    if (!nameValue || capturedImages.length === 0) {
      setErrorMessage('Mohon masukkan nama dan ambil/upload foto wajah anda');
      return;
    }

    if (nameValue.length < 2) {
      setErrorMessage('Nama minimal 2 karakter');
      return;
    }

    setRegistrationStatus('processing');
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Process images with face-api.js with better error handling
      const faceApiDescriptor = await processMultipleImages(capturedImages);
      
      if (!faceApiDescriptor) {
        throw new Error('Gagal mendeteksi wajah pada foto. Pastikan foto menampilkan wajah dengan jelas dan pencahayaan yang cukup. Silakan coba lagi.');
      }
      
      // Remove backend registration - using only Face-API.js now
      
      // Register with local API
      const localResponse = await fetch('/api/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          descriptor: Array.from(faceApiDescriptor),
          enrollmentImages: capturedImages,
          multiAngle: capturedImages.length > 1
        }),
      });
      
      if (!localResponse.ok) {
        const localError = await localResponse.json();
        console.error('Failed to register with local API:', localError);
        throw new Error(localError.error || 'Gagal menyimpan registrasi. Silakan coba lagi.');
      }
      
      const localResult = await localResponse.json();
      
      setRegistrationStatus('success');
      setSuccessMessage(
        `Registrasi berhasil untuk ${data.name}! ` +
        `Memproses ${capturedImages.length} foto. ` +
        `Descriptor Face-API tersimpan dengan berhasil.`
      );
      
      // Reset form and state
      reset();
      setCapturedImages([]);
      setShowRegistrationForm(false);
      
    } catch (error: unknown) {
      console.error('Registration error:', error);
      setRegistrationStatus('error');
      
      let errorMsg = 'Registrasi gagal. Silakan coba lagi.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMsg = 'Koneksi bermasalah. Periksa koneksi internet anda dan coba lagi.';
        } else if (error.message.includes('wajah')) {
          errorMsg = error.message;
        } else if (error.message.includes('network')) {
          errorMsg = 'Gagal terhubung ke server. Pastikan koneksi internet stabil.';
        } else {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
    }
  };

  const handleReset = () => {
    setCapturedImages([]);
    setShowRegistrationForm(false);
    setRegistrationStatus('idle');
    setErrorMessage(null);
    setSuccessMessage(null);
    reset();
  };

  if (!isModelLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Memuat model deteksi wajah...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Professional Header - Optimized for Horizontal Layout */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/70 shadow-sm sticky top-0 z-10">
        <div className="max-w-[100rem] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center py-4 md:py-6 xl:py-8">
            <div className="mb-3 md:mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-2 md:mb-3 transition-all duration-300">
                <Camera className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 md:mb-2 transition-all duration-300">
                Registrasi Wajah
              </h1>
              <p className="text-gray-600 text-xs md:text-sm xl:text-base max-w-sm md:max-w-md xl:max-w-lg mx-auto leading-tight">
                Ambil foto wajah untuk registrasi sistem absensi dengan teknologi pengenalan wajah
              </p>
            </div>
            
            {/* Progress Indicator - Enhanced */}
            <div className="flex items-center justify-center space-x-2 mt-3 md:mt-4">
              <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                !showRegistrationForm 
                  ? 'bg-blue-500 shadow-lg shadow-blue-200' 
                  : 'bg-gray-300'
              }`}></div>
              <div className="w-6 md:w-8 h-0.5 bg-gray-300 transition-all duration-300"></div>
              <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                showRegistrationForm 
                  ? 'bg-blue-500 shadow-lg shadow-blue-200' 
                  : 'bg-gray-300'
              }`}></div>
            </div>
            <div className="flex items-center justify-between mt-1 md:mt-2 max-w-28 md:max-w-32 mx-auto">
              <span className="text-xs md:text-sm text-gray-500 font-medium">Foto</span>
              <span className="text-xs md:text-sm text-gray-500 font-medium">Data</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Professional Alerts Container - Enhanced */}
      <div className="max-w-[100rem] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {errorMessage && (
          <Alert variant="destructive" className="mt-4 md:mt-6 border-red-200/70 bg-red-50/90 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
            <AlertDescription className="text-red-800 font-medium text-sm md:text-base">{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mt-4 md:mt-6 border-green-200/70 bg-green-50/90 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2">
            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium text-sm md:text-base">{successMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      {!showRegistrationForm ? (
        // DASHBOARD MAIN CONTENT - Optimized Horizontal Layout
        <div className="flex-1 max-w-[100rem] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col xl:flex-row gap-4 md:gap-6 h-full min-h-0">
            {/* LEFT PANEL - Optimized Camera Section */}
            <div className="flex-[7] bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
              <div className="bg-gray-900 h-full flex flex-col min-h-[50vh] sm:min-h-[55vh] md:min-h-[65vh] lg:min-h-[70vh] xl:min-h-[calc(100vh-16rem)]">
                <Tabs defaultValue="camera" value={captureMode} onValueChange={(value) => setCaptureMode(value as CaptureMode)} className="flex-1 flex flex-col h-full">
                  <TabsContent value="camera" className="flex-1 m-0 h-full">
                    <MultiAngleCapture
                      onCaptureComplete={handleCaptureComplete}
                      isCapturing={registrationStatus === 'capturing'}
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="flex-1 m-0 h-full p-3 sm:p-4 md:p-6 xl:p-8">
                    <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                      <ImageUpload
                        onUploadComplete={handleUploadComplete}
                        maxImages={10}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* RIGHT PANEL - Responsive Dashboard Controls Card */}
            <div className="flex-[3] bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 flex flex-col min-h-[40vh] sm:min-h-[35vh] md:min-h-[45vh] xl:min-h-[calc(100vh-16rem)] transition-all duration-300">
              <div className="p-3 sm:p-4 md:p-6 xl:p-8 flex flex-col h-full">
                {/* Card Header - Responsive */}
                <div className="border-b border-gray-100 pb-3 md:pb-4 mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg xl:text-xl font-semibold text-gray-900 mb-1">Kontrol Kamera</h3>
                  <p className="text-xs md:text-sm text-gray-600">Pilih metode pengambilan foto</p>
                </div>

                {/* Method Selection Card - Enhanced Responsive */}
                <div className="mb-4 md:mb-6">
                  <Tabs defaultValue="camera" value={captureMode} onValueChange={(value) => setCaptureMode(value as CaptureMode)}>
                    <TabsList className="grid grid-cols-2 w-full h-9 md:h-11 p-1 bg-gray-100 transition-all duration-200">
                      <TabsTrigger value="camera" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                        <Camera className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Kamera</span>
                        <span className="sm:hidden">Cam</span>
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                        <Upload className="h-3 w-3 md:h-4 md:w-4" />
                        Upload
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Instructions Card - Optimized for All Screen Sizes */}
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg md:rounded-xl transition-all duration-200">
                  <h4 className="font-medium text-blue-900 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Panduan Foto
                  </h4>
                  <ul className="text-xs md:text-sm text-blue-800 space-y-1.5 md:space-y-2">
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 md:mt-2 mr-1.5 md:mr-2 flex-shrink-0"></span>
                      <span className="leading-tight">Wajah terlihat jelas dan tidak tertutup</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 md:mt-2 mr-1.5 md:mr-2 flex-shrink-0"></span>
                      <span className="leading-tight">Pencahayaan cukup terang</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 md:mt-2 mr-1.5 md:mr-2 flex-shrink-0"></span>
                      <span className="leading-tight">Upload hingga 10 foto dari sudut berbeda</span>
                    </li>
                    <li className="items-start hidden md:flex">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 md:mt-2 mr-1.5 md:mr-2 flex-shrink-0"></span>
                      <span className="leading-tight">Hindari bayangan atau silau pada wajah</span>
                    </li>
                  </ul>
                </div>

                {/* Status Card - Enhanced Responsive */}
                <div className="flex-1 flex flex-col justify-end">
                  <div className="p-3 md:p-4 bg-gradient-to-r from-gray-50 via-blue-50 to-gray-100 rounded-lg md:rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">Status Sistem</p>
                        <p className="text-xs md:text-sm lg:text-base font-semibold text-gray-900 truncate">
                          {statusText}
                        </p>
                      </div>
                      <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ml-2 flex-shrink-0 ${
                        registrationStatus === 'capturing' || registrationStatus === 'processing' 
                          ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-200' 
                          : 'bg-green-400 shadow-lg shadow-green-200'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // REGISTRATION FORM - Optimized Dashboard Layout
        <div className="flex-1 max-w-[100rem] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col xl:flex-row gap-4 md:gap-6 h-full min-h-0">
            {/* LEFT PANEL - Enhanced Photo Preview Card */}
            <div className="flex-[7] bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
              <div className="bg-gray-900 flex items-center justify-center min-h-[40vh] sm:min-h-[45vh] md:min-h-[55vh] xl:min-h-[calc(100vh-16rem)] p-3 sm:p-4 md:p-6 xl:p-8">
                <div className="text-center w-full">
                  {/* Multiple photos preview */}
                  {capturedImages.length === 1 ? (
                    // Single photo display
                    <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-72 xl:h-72 mx-auto mb-3 sm:mb-4 md:mb-6 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={capturedImages[0]}
                        alt="Foto wajah"
                        className="w-full h-full object-cover rounded-full border-4 border-green-500 shadow-2xl transition-transform duration-300 group-hover:scale-105"
                        style={{
                          aspectRatio: '1/1',
                          objectPosition: 'center center'
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 md:-bottom-3 md:-right-3 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-7 lg:h-7 text-white" />
                      </div>
                    </div>
                  ) : (
                    // Multiple photos grid display
                    <div className="mb-3 sm:mb-4 md:mb-6">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto">
                        {capturedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image}
                              alt={`Foto wajah ${index + 1}`}
                              className="w-full h-16 sm:h-20 md:h-24 lg:h-28 object-cover rounded-lg border-2 border-green-500 shadow-lg transition-transform duration-300 group-hover:scale-105"
                              style={{
                                aspectRatio: '1/1',
                                objectPosition: 'center center'
                              }}
                            />
                            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 sm:mt-4 flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-white mb-1 sm:mb-2 transition-all duration-300">
                    {capturedImages.length === 1 
                      ? `Foto berhasil ${captureMode === 'camera' ? 'diambil' : 'diupload'}`
                      : `${capturedImages.length} foto berhasil diupload`
                    }
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-300 hidden sm:block transition-all duration-300">
                    {capturedImages.length === 1 
                      ? 'Foto telah diproses dan siap untuk registrasi'
                      : `${capturedImages.length} foto dari berbagai sudut siap untuk registrasi`
                    }
                  </p>
                  <p className="text-xs text-gray-300 block sm:hidden">
                    Lengkapi formulir untuk melanjutkan
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL - Enhanced Registration Form Card */}
            <div className="flex-[3] bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 flex flex-col min-h-[45vh] sm:min-h-[40vh] md:min-h-[50vh] xl:min-h-[calc(100vh-16rem)] transition-all duration-300">
              <div className="p-3 sm:p-4 md:p-6 xl:p-8 flex flex-col h-full">
                {/* Form Header - Responsive */}
                <div className="border-b border-gray-100 pb-3 md:pb-4 mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 mb-1">Lengkapi Data</h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-tight">Masukkan informasi untuk menyelesaikan registrasi</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                  <div className="flex-1">
                    {/* Name Input Card - Enhanced Responsive */}
                    <div className="p-3 md:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg md:rounded-xl border border-gray-200 mb-4 md:mb-6 transition-all duration-200">
                      <label htmlFor="name" className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
                        Nama Lengkap *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap anda"
                        className={`h-10 md:h-12 text-sm md:text-base bg-white border-2 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 ${
                          errors.name 
                            ? "border-red-300 focus:border-red-500 shadow-red-100" 
                            : "border-gray-300 focus:border-blue-500 hover:border-gray-400"
                        }`}
                        {...register('name', { 
                          required: 'Nama wajib diisi',
                          minLength: { value: 2, message: 'Nama minimal 2 karakter' }
                        })}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons - Enhanced Responsive */}
                  <div className="space-y-2 md:space-y-3 pt-3 md:pt-4 border-t border-gray-100">
                    <Button
                      type="submit"
                      disabled={registrationStatus === 'processing'}
                      className="w-full h-10 md:h-12 text-sm md:text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {registrationStatus === 'processing' ? (
                        <div className="flex items-center">
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span>Memproses...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          <span>Daftar Wajah</span>
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={registrationStatus === 'processing'}
                      className="w-full h-10 md:h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-sm md:text-base font-medium transition-all duration-300 hover:shadow-md"
                    >
                      <RotateCcw className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      <span>Mulai Ulang</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}