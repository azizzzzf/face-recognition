'use client'

import dynamic from 'next/dynamic'

const FaceBenchmark = dynamic(() => import('@/components/FaceBenchmark').then(mod => ({ default: mod.FaceBenchmark })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[400px]">Loading benchmark...</div>
})

export default function BenchmarkPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Performance Benchmark</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Bandingkan performa model Face-api.js (client-side) vs ArcFace (server-side) 
          berdasarkan akurasi dan latensi.
        </p>
      </div>
      
      <FaceBenchmark />
    </div>
  )
}
