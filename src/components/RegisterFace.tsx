'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as faceapi from '@vladmandic/face-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiAngleCapture } from '@/components/MultiAngleCapture';

interface FormData {
  name: string;
}

type RegistrationStatus = 'idle' | 'capturing' | 'processing' | 'success' | 'error';

export default function RegisterFace() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();
  const nameValue = watch('name');
  
  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        setIsModelLoaded(true);
        console.log('Face-api.js models loaded successfully');
      } catch (error) {
        console.error('Failed to load models:', error);
        setErrorMessage('Failed to load face detection models. Please reload the page.');
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

  const onSubmit = async (data: FormData) => {
    if (!nameValue || capturedImages.length === 0) {
      setErrorMessage('Please provide your name and capture face images');
      return;
    }

    setRegistrationStatus('processing');
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Process images with face-api.js
      const faceApiDescriptor = await processMultipleImages(capturedImages);
      
      if (!faceApiDescriptor) {
        throw new Error('Failed to detect face in captured images. Please try again.');
      }
      
      // Try to register with backend (ArcFace) - but don't fail if backend is unavailable
      let backendResult = null;
      let arcfaceDescriptor = null;
      
      try {
        const backendResponse = await fetch('http://localhost:8000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            enrollment_images: capturedImages,
            face_api_descriptor: Array.from(faceApiDescriptor)
          }),
        });
        
        if (backendResponse.ok) {
          backendResult = await backendResponse.json();
          arcfaceDescriptor = backendResult.arcface_descriptor;
        } else {
          console.warn('Backend registration failed, continuing with face-api only');
        }
      } catch (backendError) {
        console.warn('Backend server unavailable, continuing with face-api only:', backendError);
      }
      
      // Register with local API
      const localResponse = await fetch('/api/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          descriptor: Array.from(faceApiDescriptor),
          arcfaceDescriptor: arcfaceDescriptor || undefined,
          enrollmentImages: capturedImages,
          userId: backendResult?.user_id,
          multiAngle: capturedImages.length > 1
        }),
      });
      
      if (!localResponse.ok) {
        const localError = await localResponse.json();
        console.error('Failed to register with local API:', localError);
        throw new Error(localError.error || 'Failed to save registration locally. Please try again.');
      }
      
      const localResult = await localResponse.json();
      
      setRegistrationStatus('success');
      setSuccessMessage(
        `Registration successful for ${data.name}! ` +
        `Processed ${capturedImages.length} images. ` +
        `ArcFace enabled: ${localResult.arcfaceEnabled ? 'Yes' : 'No'}. ` +
        (backendResult?.arcface_latency_ms ? `ArcFace latency: ${backendResult.arcface_latency_ms.toFixed(2)}ms` : 'Face-API only mode.')
      );
      
      // Reset form and state
      reset();
      setCapturedImages([]);
      setShowRegistrationForm(false);
      
    } catch (error: unknown) {
      console.error('Registration error:', error);
      setRegistrationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed. Please try again.');
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
              <p className="text-muted-foreground">Loading face detection models...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full p-6 max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Multi-Angle Face Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {!showRegistrationForm ? (
            <div className="mt-6">
              <MultiAngleCapture
                onCaptureComplete={handleCaptureComplete}
                isCapturing={registrationStatus === 'capturing'}
              />
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  {capturedImages.length} images captured successfully
                </p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {capturedImages.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Captured ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className={errors.name ? "border-destructive" : ""}
                    {...register('name', { 
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={registrationStatus === 'processing'}
                    className="flex-1"
                  >
                    {registrationStatus === 'processing' 
                      ? 'Registering...' 
                      : 'Register Face'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={registrationStatus === 'processing'}
                  >
                    Start Over
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}