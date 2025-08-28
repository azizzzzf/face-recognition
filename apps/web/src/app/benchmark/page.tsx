'use client'

import dynamic from 'next/dynamic'

const FaceBenchmark = dynamic(() => import('@/components/FaceBenchmark').then(mod => ({ default: mod.FaceBenchmark })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-[400px]">Loading benchmark...</div>
})

export default function BenchmarkPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Face Recognition Performance Benchmark</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare the performance of Face-api.js (client-side) vs ArcFace (server-side) 
            face recognition models in terms of accuracy and latency.
          </p>
        </div>
        
        <FaceBenchmark />
      </div>
    </div>
  )
}
