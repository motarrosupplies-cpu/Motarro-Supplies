// Service Worker for MOTARRO Supplies — Advanced Caching Strategy
const CACHE_NAME = 'motarro-v1';
const STATIC_CACHE = 'motarro-static-v1';
const IMAGE_CACHE = 'motarro-images-v1';

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  static: 365 * 24 * 60 * 60 * 1000, // 1 year
  images: 30 * 24 * 60 * 60 * 1000,  // 30 days
  api: 60 * 60 * 1000,               // 1 hour
  pages: 24 * 60 * 60 * 1000         // 24 hours
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip checkout, payment, cart pages and API endpoints - these should never be cached
  if (url.pathname.includes('/api/checkout') || 
      url.pathname.includes('/api/payments') ||
      url.pathname.includes('/api/orders') ||
      url.pathname.includes('/api/cart') ||
      url.pathname.startsWith('/checkout') ||
      url.pathname.startsWith('/cart') ||
      url.pathname.includes('/payfast')) {
    return; // Let browser handle these requests normally
  }
  
  // Skip external domains (analytics, ads, etc.) - let browser handle them
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (isImageRequest(url)) {
    return handleImageRequest(request);
  } else if (isAPIRequest(url)) {
    return handleAPIRequest(request);
  } else if (isStaticAsset(url)) {
    return handleStaticAsset(request);
  } else {
    return handlePageRequest(request);
  }
}

function isImageRequest(url) {
  return url.hostname.includes('supabase.co') && 
         url.pathname.includes('/storage/v1/object/public/') ||
         url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i);
}

function isAPIRequest(url) {
  // Exclude checkout, payment, and order APIs from caching
  if (url.pathname.includes('/api/checkout') || 
      url.pathname.includes('/api/payments') ||
      url.pathname.includes('/api/orders') ||
      url.pathname.includes('/api/cart')) {
    return false; // Don't cache these
  }
  return url.pathname.startsWith('/api/');
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i);
}

async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheDate = new Date(cachedResponse.headers.get('date') || 0);
    const now = new Date();
    const age = now.getTime() - cacheDate.getTime();
    
    if (age < CACHE_DURATIONS.images) {
      return cachedResponse;
    }
  }

  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Clone response before caching
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  // Never cache checkout, payment, or order APIs
  if (url.pathname.includes('/api/checkout') || 
      url.pathname.includes('/api/payments') ||
      url.pathname.includes('/api/orders') ||
      url.pathname.includes('/api/cart')) {
    // Always fetch fresh from network for these endpoints
    try {
      return await fetch(request);
    } catch (error) {
      throw error;
    }
  }
  
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    const cacheDate = new Date(cachedResponse.headers.get('date') || 0);
    const now = new Date();
    const age = now.getTime() - cacheDate.getTime();
    
    if (age < CACHE_DURATIONS.api) {
      return cachedResponse;
    }
  }

  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Static assets are cached indefinitely
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fetch and cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

async function handlePageRequest(request) {
  // Skip cart and checkout pages - they should always be fresh
  const url = new URL(request.url);
  if (url.pathname.startsWith('/cart') || url.pathname.startsWith('/checkout')) {
    // Always fetch fresh for cart/checkout pages
    try {
      return await fetch(request);
    } catch (error) {
      // If fetch fails, let browser handle it
      return fetch(request);
    }
  }
  
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    const cacheDate = new Date(cachedResponse.headers.get('date') || 0);
    const now = new Date();
    const age = now.getTime() - cacheDate.getTime();
    
    if (age < CACHE_DURATIONS.pages) {
      return cachedResponse;
    }
  }

  // Fetch from network
  try {
    const networkResponse = await fetch(request, {
      // Don't cache failed requests
      cache: 'default'
    });
    
    // Only cache successful responses
    if (networkResponse.ok && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache).catch(err => {
        // Silently fail if caching fails
        console.warn('Failed to cache response:', err);
      });
    }
    return networkResponse;
  } catch (error) {
    // If network fails and we have a cached response, use it
    if (cachedResponse) {
      return cachedResponse;
    }
    // For CSP violations or network errors, let browser handle the original request
    // Don't wrap in another fetch - just let it fail naturally
    throw error;
  }
}

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== IMAGE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
