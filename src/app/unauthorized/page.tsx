'use client'

import { useRouter } from 'next/navigation'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <ShieldX className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          
          <div className="space-y-4 text-gray-600">
            <p>
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm">
              This page requires specific permissions that your account doesn&apos;t currently have. 
              Please contact an administrator if you believe this is an error.
            </p>
          </div>
          
          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}