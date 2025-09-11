// Service Worker for Face Recognition App
// Optimized caching strategy for better performance

const CACHE_NAME = 'face-recognition-v1'
const STATIC_CACHE = 'static-assets-v1'
const API_CACHE = 'api-responses-v1'
const MODEL_CACHE = 'face-models-v1'

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/register',
  '/recognize',
  '/attendance',
  '/auth/login',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

// Face-API model files to cache with long expiration
const MODEL_FILES = [
  '/models/tiny_face_detector_model-weights_manifest.json',
  '/models/tiny_face_detector_model-shard1',
  '/models/face_landmark_68_model-weights_manifest.json',
  '/models/face_landmark_68_model-shard1',
  '/models/face_recognition_model-weights_manifest.json',
  '/models/face_recognition_model-shard1',
  '/models/face_recognition_model-shard2',
  '/models/ssd_mobilenetv1_model-weights_manifest.json',
  '/models/ssd_mobilenetv1_model-shard1',
  '/models/ssd_mobilenetv1_model-shard2'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // Cache model files with error handling
      caches.open(MODEL_CACHE).then((cache) => {
        console.log('🧠 Caching Face-API models...')
        return Promise.allSettled(
          MODEL_FILES.map(url => 
            cache.add(url).catch(err => {
              console.warn(`⚠️ Failed to cache model: ${url}`, err)
              return null
            })
          )
        )
      })
    ]).then(() => {
      console.log('✅ Service Worker installed successfully')
      // Skip waiting to activate immediately
      self.skipWaiting()
    }).catch(err => {
      console.error('❌ Service Worker installation failed:', err)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, STATIC_CACHE, API_CACHE, MODEL_CACHE].includes(cacheName)) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated')
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }
  
  event.respondWith(handleRequest(request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Strategy 1: Model files - Cache First (long-term caching)
    if (url.pathname.startsWith('/models/')) {
      return await cacheFirst(request, MODEL_CACHE, { maxAge: 365 * 24 * 60 * 60 * 1000 }) // 1 year
    }
    
    // Strategy 2: Static assets - Cache First with fallback
    if (url.pathname.startsWith('/_next/static/') || 
        url.pathname.endsWith('.js') || 
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.svg')) {
      return await cacheFirst(request, STATIC_CACHE, { maxAge: 30 * 24 * 60 * 60 * 1000 }) // 30 days
    }
    
    // Strategy 3: API routes - Network First with cache fallback
    if (url.pathname.startsWith('/api/')) {
      return await networkFirst(request, API_CACHE, { maxAge: 5 * 60 * 1000 }) // 5 minutes
    }
    
    // Strategy 4: Pages - Network First with cache fallback
    return await networkFirst(request, STATIC_CACHE, { maxAge: 24 * 60 * 60 * 1000 }) // 24 hours
    
  } catch (error) {
    console.error('❌ Fetch error:', error)
    
    // Fallback to cache or offline page
    const cachedResponse = await getCachedResponse(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline fallback if available
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

// Cache First strategy - good for static assets
async function cacheFirst(request, cacheName, options = {}) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse && !isExpired(cachedResponse, options.maxAge)) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Clone before caching
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Return stale cache if network fails
    if (cachedResponse) {
      console.warn('⚠️ Using stale cache for:', request.url)
      return cachedResponse
    }
    throw error
  }
}

// Network First strategy - good for dynamic content
async function networkFirst(request, cacheName, options = {}) {
  const cache = await caches.open(cacheName)
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Clone before caching
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse && !isExpired(cachedResponse, options.maxAge)) {
      console.warn('⚠️ Using cached fallback for:', request.url)
      return cachedResponse
    }
    throw error
  }
}

// Get cached response for any request
async function getCachedResponse(request) {
  const cacheNames = [MODEL_CACHE, STATIC_CACHE, API_CACHE, CACHE_NAME]
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
  }
  
  return null
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  if (!maxAge) return false
  
  const cachedTime = response.headers.get('sw-cached-time')
  if (!cachedTime) return false
  
  return Date.now() - parseInt(cachedTime) > maxAge
}

// Add timestamp to cached responses
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      handleRequest(event.request).then(response => {
        // Add cache timestamp to response headers
        const responseWithTimestamp = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            'sw-cached-time': Date.now().toString()
          }
        })
        return responseWithTimestamp
      })
    )
  }
})

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered')
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  // Handle offline actions when connection is restored
  // This could include syncing attendance data, registration data, etc.
  console.log('📊 Handling background sync...')
}

// Handle push notifications (for future features)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    console.log('📬 Push notification received:', data)
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.message,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png'
      })
    )
  }
})

console.log('📋 Service Worker script loaded')