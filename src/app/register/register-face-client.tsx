'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import NextImage from 'next/image';
import * as faceapi from '@vladmandic/face-api';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { Card, CardContent } from '@/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { MultiAngleCapture } from '@/components/MultiAngleCapture';
import { ImageUpload } from '@/components/ImageUpload';
import { UserSelectionCombobox } from '@/components/UserSelectionCombobox';
import { Camera, Upload, Check, AlertCircle, RotateCcw, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';

interface FormData {
  selectedUserId: string;
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  hasFaceRegistration: boolean;
  faceRegistration?: {
    id: string;
    registeredAt: string;
    hasValidDescriptor: boolean;
  };
}

type RegistrationStatus = 'idle' | 'capturing' | 'processing' | 'success' | 'error';
type CaptureMode = 'camera' | 'upload';

export default function RegisterFaceClient() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  
  const { user, loading } = useAuth();
  const { appUser } = useUser();
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();

  // Check admin permission
  useEffect(() => {
    if (!loading && (!user || !appUser)) {
      window.location.href = '/auth/login';
      return;
    }
    
    if (appUser && appUser.role !== 'ADMIN') {
      setErrorMessage('Akses ditolak. Hanya administrator yang dapat melakukan registrasi wajah.');
      return;
    }
  }, [user, appUser, loading]);
  
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
    
    console.log('Processing', images.length, 'images for face descriptors');
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`Processing image ${i + 1}/${images.length}`);
      
      const descriptor = await extractFaceDescriptor(image);
      if (descriptor) {
        descriptors.push(descriptor);
        console.log(`Successfully extracted descriptor from image ${i + 1}, length:`, descriptor.length);
      } else {
        console.warn(`Failed to extract descriptor from image ${i + 1}`);
      }
    }
    
    console.log(`Total descriptors extracted: ${descriptors.length}/${images.length}`);
    
    if (descriptors.length === 0) {
      console.error('No face descriptors could be extracted from any image');
      return null;
    }
    
    // Calculate average descriptor
    const avgDescriptor = new Float32Array(descriptors[0].length);
    for (let i = 0; i < avgDescriptor.length; i++) {
      let sum = 0;
      for (const descriptor of descriptors) {
        sum += descriptor[i];
      }
      avgDescriptor[i] = sum / descriptors.length;
    }
    
    console.log('Average descriptor calculated, length:', avgDescriptor.length);
    return avgDescriptor;
  };

  // Handle capture completion from MultiAngleCapture
  const handleCaptureComplete = (images: string[]) => {
    setCapturedImages(images);
    setShowRegistrationForm(true);
  };

  // Handle image upload completion from ImageUpload
  const handleUploadComplete = (images: string[]) => {
    setCapturedImages(images);
    setShowRegistrationForm(true);
  };

  // Handle registration form submission
  const onSubmit = async (data: FormData) => {
    if (capturedImages.length === 0) {
      setErrorMessage('Tidak ada gambar untuk diproses.');
      return;
    }

    if (!selectedUser) {
      setErrorMessage('Silakan pilih pengguna terlebih dahulu.');
      return;
    }

    setRegistrationStatus('processing');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Process images with face-api.js
      const faceDescriptor = await processMultipleImages(capturedImages);
      
      if (!faceDescriptor) {
        throw new Error('Tidak dapat mendeteksi wajah pada gambar. Pastikan wajah terlihat jelas dan coba lagi.');
      }

      // Ensure descriptor is properly converted to array
      const descriptorArray = Array.from(faceDescriptor);
      
      if (!descriptorArray || descriptorArray.length === 0) {
        throw new Error('Gagal mengekstrak descriptor wajah. Silakan coba lagi.');
      }

      console.log('Face descriptor extracted:', {
        descriptorLength: descriptorArray.length,
        descriptorType: typeof descriptorArray,
        isArray: Array.isArray(descriptorArray),
        firstFewValues: descriptorArray.slice(0, 5)
      });

      // Prepare unified registration data with user ID
      const registrationData = {
        name: selectedUser.name,
        descriptor: descriptorArray,
        enrollmentImages: capturedImages,
        userId: selectedUser.id, // Link to selected user
        multiAngle: true
      };

      // Single unified registration call
      console.log('Sending registration request:', {
        name: registrationData.name,
        descriptorLength: registrationData.descriptor.length,
        descriptorType: typeof registrationData.descriptor,
        isArray: Array.isArray(registrationData.descriptor),
        imagesCount: registrationData.enrollmentImages.length,
        multiAngle: registrationData.multiAngle
      });

      const response = await fetch('/api/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();
      
      console.log('Registration API Response:', {
        status: response.status,
        ok: response.ok,
        result: result
      });
      
      if (!response.ok) {
        console.error('Registration API Error Details:', result);
        
        // Handle specific error cases
        if (response.status === 409) {
          // Duplicate user error
          throw new Error(result.details || 'Pengguna dengan nama tersebut sudah terdaftar. Silakan gunakan nama yang berbeda.');
        } else if (result.details) {
          // Server provided detailed error message
          throw new Error(result.details);
        } else {
          // Generic error
          throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      setRegistrationStatus('success');
      // Show success message based on ArcFace processing result
      if (result.arcfaceEnabled) {
        setSuccessMessage(`Berhasil mendaftarkan wajah untuk ${selectedUser.name} dengan dukungan penuh sistem (Face-API + ArcFace)!`);
      } else {
        setSuccessMessage(`Berhasil mendaftarkan wajah untuk ${selectedUser.name} dengan Face-API! (ArcFace akan diproses di background)`);
      }
      
      // Reset form and images after successful registration
      setTimeout(() => {
        handleReset();
      }, 3000);

    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat mendaftarkan wajah');
    }
  };

  // Reset form and captured images
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
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Memuat model deteksi wajah...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Professional Alerts Container - Enhanced */}
      <div className="max-w-[100rem] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4 border-red-200/70 bg-red-50/90 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
            <AlertDescription className="text-red-800 font-medium text-sm md:text-base">{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-4 border-green-200/70 bg-green-50/90 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2">
            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium text-sm md:text-base">{successMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      {!showRegistrationForm ? (
        // DASHBOARD MAIN CONTENT - Optimized Horizontal Layout
        <div className="flex-1 max-w-[100rem] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col xl:flex-row gap-3 md:gap-4 h-full min-h-0">
            {/* LEFT PANEL - Optimized Camera Section */}
            <div className="flex-[7] bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
              <div className="bg-gray-900 h-full flex flex-col min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] lg:min-h-[65vh] xl:min-h-[calc(100vh-8rem)]">
                <Tabs defaultValue="camera" value={captureMode} onValueChange={(value) => setCaptureMode(value as CaptureMode)} className="flex-1 flex flex-col h-full">
                  <TabsContent value="camera" className="flex-1 m-0 h-full">
                    <MultiAngleCapture
                      onCaptureComplete={handleCaptureComplete}
                      isCapturing={registrationStatus === 'capturing'}
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="flex-1 m-0 h-full p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                      <ImageUpload onUploadComplete={handleUploadComplete} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* RIGHT PANEL - Responsive Dashboard Controls Card */}
            <div className="flex-[3] bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 flex flex-col min-h-[40vh] sm:min-h-[35vh] md:min-h-[45vh] xl:min-h-[calc(100vh-8rem)] transition-all duration-300">
              <div className="p-3 sm:p-4 md:p-5 flex flex-col h-full">
                {/* Card Header - Responsive */}
                <div className="border-b border-gray-100 pb-2 md:pb-3 mb-3 md:mb-4">
                  <h3 className="text-sm md:text-base xl:text-lg font-semibold text-gray-900 mb-1">Kontrol Kamera</h3>
                  <p className="text-xs md:text-sm text-gray-600">Pilih metode pengambilan foto</p>
                </div>

                {/* Method Selection Card - Enhanced Responsive */}
                <div className="mb-3 md:mb-4">
                  <Tabs defaultValue="camera" value={captureMode} onValueChange={(value) => setCaptureMode(value as CaptureMode)}>
                    <TabsList className="grid grid-cols-2 w-full h-8 md:h-10 p-1 bg-gray-100 transition-all duration-200">
                      <TabsTrigger value="camera" className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                        <Camera className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Camera</span>
                        <span className="sm:hidden">Cam</span>
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                        <Upload className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Upload</span>
                        <span className="sm:hidden">Up</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Instructions Card - Optimized for All Screen Sizes */}
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg md:rounded-xl transition-all duration-200">
                  <h4 className="font-medium text-blue-900 mb-1 md:mb-2 flex items-center text-xs md:text-sm">
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Panduan Foto
                  </h4>
                  <ul className="text-xs md:text-sm text-blue-800 space-y-1 md:space-y-1.5">
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Sistem akan mengambil 10 foto dengan angle berbeda</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Ikuti instruksi posisi untuk setiap foto</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Posisikan wajah di dalam lingkaran panduan</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Wajah terlihat jelas dan pencahayaan cukup</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span className="leading-tight">Bersiap saat muncul instruksi angle</span>
                    </li>
                  </ul>
                </div>

                {/* Preview Images */}
                {capturedImages.length > 0 && (
                  <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-xs md:text-sm font-medium text-gray-700 mb-2">Preview ({capturedImages.length} foto)</h4>
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
                      {capturedImages.slice(0, 6).map((image, index) => (
                        <div key={index} className="aspect-square rounded overflow-hidden bg-gray-100 relative">
                          <NextImage 
                            src={image} 
                            alt={`Foto ${index + 1}`} 
                            fill
                            className="object-cover"
                            unoptimized={true}
                          />
                        </div>
                      ))}
                    </div>
                    {capturedImages.length > 6 && (
                      <p className="text-xs text-gray-500 mt-1">+{capturedImages.length - 6} foto lainnya</p>
                    )}
                  </div>
                )}

                {/* Status Card - Enhanced Responsive */}
                <div className="flex-1 flex flex-col justify-end">
                  <div className="p-2 md:p-3 bg-gradient-to-r from-gray-50 via-blue-50 to-gray-100 rounded-lg border border-gray-200 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600 mb-1">Status Sistem</p>
                        <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                          {registrationStatus === 'capturing' ? 'Mengambil foto...' :
                           registrationStatus === 'processing' ? 'Memproses...' :
                           registrationStatus === 'success' ? 'Berhasil!' :
                           registrationStatus === 'error' ? 'Error' :
                           'Siap untuk foto'}
                        </p>
                      </div>
                      <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ml-2 flex-shrink-0 ${
                        registrationStatus === 'capturing' || registrationStatus === 'processing' 
                          ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-200' 
                          : registrationStatus === 'success' ? 'bg-green-400 shadow-lg shadow-green-200'
                          : registrationStatus === 'error' ? 'bg-red-400 shadow-lg shadow-red-200'
                          : 'bg-blue-400 shadow-lg shadow-blue-200'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // REGISTRATION FORM - Full Screen Overlay
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg shadow-2xl border-gray-200/70 bg-white">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Foto Berhasil Diambil</h2>
                <p className="text-sm text-gray-600">Pilih pengguna untuk registrasi wajah</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="mb-2">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Pilih Pengguna
                    </label>
                  </div>
                  <Controller
                    name="selectedUserId"
                    control={control}
                    rules={{ required: 'Silakan pilih pengguna terlebih dahulu' }}
                    render={({ field }) => (
                      <UserSelectionCombobox
                        value={field.value}
                        onValueChange={(value, user) => {
                          field.onChange(value);
                          setSelectedUser(user);
                        }}
                        placeholder="Pilih pengguna untuk registrasi wajah"
                        error={!!errors.selectedUserId}
                        disabled={registrationStatus === 'processing'}
                      />
                    )}
                  />
                  {errors.selectedUserId && (
                    <p className="text-sm text-red-600 mt-1">{errors.selectedUserId.message}</p>
                  )}
                </div>

                {selectedUser && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-blue-900">{selectedUser.name}</p>
                        <p className="text-xs text-blue-700 truncate">{selectedUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={registrationStatus === 'processing'}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Ambil Ulang
                  </Button>
                  <Button
                    type="submit"
                    disabled={registrationStatus === 'processing' || !selectedUser}
                    className="flex-1"
                  >
                    {registrationStatus === 'processing' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Daftar Wajah
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
