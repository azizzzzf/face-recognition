'use client'

import dynamic from 'next/dynamic'
import { FaceRecognitionLoader } from './LoadingSpinner'

// Lazy load heavy components with loading states
export const DynamicUserManager = dynamic(() => import('./UserManager'), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false // Disable SSR for heavy client-side components
})

export const DynamicAdminDashboard = dynamic(() => 
  import('./AdminDashboard').then(mod => ({ default: mod.AdminDashboard })), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false
})

export const DynamicUserDashboard = dynamic(() => 
  import('./UserDashboard').then(mod => ({ default: mod.UserDashboard })), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false
})

export const DynamicRecognizeFaceClient = dynamic(() => 
  import('../app/recognize/recognize-face-client'), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false
})

export const DynamicRegisterFaceClient = dynamic(() => 
  import('../app/register/register-face-client'), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false
})

export const DynamicAttendanceManager = dynamic(() => import('./AttendanceManager'), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false
})

export const DynamicAttendanceTable = dynamic(() => import('./AttendanceTable'), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false
})

// Lazy load UI components that might not be needed immediately
export const DynamicAuthForm = dynamic(() => 
  import('./auth/AuthForm').then(mod => ({ default: mod.AuthForm })), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse space-y-4 w-full max-w-sm">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-blue-200 rounded"></div>
      </div>
    </div>
  ),
  ssr: false
})

// Enhanced dynamic loading with better error handling and performance hints
export const DynamicMultiAngleCapture = dynamic(() => 
  import('./MultiAngleCapture').then(mod => ({ default: mod.MultiAngleCapture })), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false
})

// Critical performance components - load with high priority
export const DynamicFaceAPILoader = dynamic(() => 
  import('../lib/faceapi-loader').then(() => ({ default: () => null })), {
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-sm text-gray-600">Loading AI models...</span>
    </div>
  ),
  ssr: false
})

// Image optimization components
export const DynamicImageUpload = dynamic(() => 
  import('./ImageUpload').then(mod => ({ default: mod.ImageUpload })), {
  loading: () => <FaceRecognitionLoader />,
  ssr: false
})

// User selection components
export const DynamicUserSelectionCombobox = dynamic(() => 
  import('./UserSelectionCombobox').then(mod => ({ default: mod.UserSelectionCombobox })), {
  loading: () => (
    <div className="h-10 bg-gray-100 rounded border animate-pulse"></div>
  ),
  ssr: false
})