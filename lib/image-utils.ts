/**
 * Utility functions for optimizing Supabase images
 * Converts images to WebP/AVIF format and resizes them for better performance
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'origin';
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Converts a Supabase image URL to an optimized format
 * Uses Supabase's built-in image transformations
 */
export function optimizeSupabaseImage(
  originalUrl: string, 
  options: ImageTransformOptions = {}
): string {
  // If it's not a Supabase URL, return as-is
  if (!originalUrl.includes('supabase.co/storage/v1/object/public/')) {
    return originalUrl;
  }

  // TEMPORARY FIX: Use regular object/public endpoint instead of render endpoint
  // The render endpoint appears to be failing for detail pages
  // TODO: Re-enable render endpoint once Supabase image transformations are properly configured
  return originalUrl;

  // COMMENTED OUT: Render endpoint code (keeping for future use)
  /*
  const {
    width,
    height,
    quality = 80,
    format,
    resize = 'cover'
  } = options;

  // Extract the base URL and file path
  const urlParts = originalUrl.split('/storage/v1/object/public/');
  if (urlParts.length !== 2) {
    return originalUrl;
  }

  const [baseUrl, filePathWithParams] = urlParts;
  
  // Remove any existing query parameters from the file path
  const filePath = filePathWithParams.split('?')[0];
  
  // Ensure filePath doesn't have leading/trailing slashes
  const cleanFilePath = filePath.replace(/^\/+|\/+$/g, '');
  
  // Build transformation parameters
  const params = new URLSearchParams();
  
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  if (format) params.append('format', format);
  params.append('resize', resize);

  // Use Supabase's render endpoint for transformations
  // Format: https://project.supabase.co/storage/v1/render/image/public/bucket/path/to/image.jpg?params
  const optimizedUrl = `${baseUrl}/storage/v1/render/image/public/${cleanFilePath}?${params.toString()}`;
  
  return optimizedUrl;
  */
}

/**
 * Get responsive image URLs for different screen sizes
 * Returns an object with different sizes for srcset
 */
export function getResponsiveImageUrls(
  originalUrl: string,
  baseOptions: Omit<ImageTransformOptions, 'width' | 'height'> = {}
) {
  const sizes = [
    { width: 320, suffix: 'sm' },
    { width: 640, suffix: 'md' },
    { width: 1024, suffix: 'lg' },
    { width: 1920, suffix: 'xl' }
  ];

  const srcset = sizes.map(({ width, suffix }) => {
    const url = optimizeSupabaseImage(originalUrl, {
      ...baseOptions,
      width,
      height: width // Square aspect ratio
    });
    return `${url} ${width}w`;
  }).join(', ');

  return {
    srcset,
    defaultSrc: optimizeSupabaseImage(originalUrl, {
      ...baseOptions,
      width: 1024
    })
  };
}

/**
 * Optimize image for specific use cases
 */
export const ImagePresets = {
  // Hero images - high quality, large size
  hero: (url: string) => optimizeSupabaseImage(url, {
    width: 1920,
    height: 1080,
    quality: 85,
    resize: 'cover'
  }),

  // Product thumbnails - medium quality, square
  thumbnail: (url: string) => optimizeSupabaseImage(url, {
    width: 400,
    height: 400,
    quality: 80,
    resize: 'cover'
  }),

  // Product detail images - high quality, large
  detail: (url: string) => optimizeSupabaseImage(url, {
    width: 1200,
    height: 1200,
    quality: 90,
    resize: 'contain'
  }),

  // Category banners - wide format
  banner: (url: string) => optimizeSupabaseImage(url, {
    width: 1200,
    height: 600,
    quality: 85,
    resize: 'cover'
  }),

  // Avatar/profile images - small, square
  avatar: (url: string) => optimizeSupabaseImage(url, {
    width: 150,
    height: 150,
    quality: 80,
    resize: 'cover'
  })
};

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return true; // Server-side, assume support
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check if browser supports AVIF format
 */
export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false; // Server-side, assume no support
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
}

/**
 * Get the best format for the current browser
 * Defaults to WebP for server-side rendering
 */
export function getBestFormat(): 'avif' | 'webp' | 'jpeg' {
  if (typeof window === 'undefined') return 'webp'; // Server-side, default to WebP
  
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
}

export const APPARELY_LOGO_BASE_URL = 'https://hkervihhlhktjdxcekhi.supabase.co/storage/v1/object/public/product-images/LOGO.PNG'

export const APPARELY_LOGO_OPTIMIZED = optimizeSupabaseImage(APPARELY_LOGO_BASE_URL, {
  width: 200,
  quality: 75,
  resize: 'contain'
})
