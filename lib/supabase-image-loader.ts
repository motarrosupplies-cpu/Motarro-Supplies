import type { ImageLoaderProps } from 'next/image'
import { optimizeSupabaseImage, type ImageTransformOptions } from '@/lib/image-utils'

const SUPABASE_IDENTIFIER = 'supabase.co/storage/v1/object/public/'
const FALLBACK_QUALITY = 80

interface ParsedTransform extends ImageTransformOptions {
  aspectRatio?: number
}

function parseTransform(src: string) {
  const hasProtocol = /^https?:\/\//.test(src)
  const url = new URL(hasProtocol ? src : `https://placeholder.local${src}`)
  const transformParam = url.searchParams.get('supabaseTransform')

  let transform: ParsedTransform = {}

  if (transformParam) {
    try {
      const parsed = JSON.parse(transformParam) as ImageTransformOptions & { aspectRatio?: number }

      const sanitizedEntries = Object.entries(parsed).filter(([, value]) =>
        value !== undefined && value !== null && value !== ''
      )

      transform = Object.fromEntries(sanitizedEntries) as ParsedTransform

      if (transform.width && transform.height) {
        transform.aspectRatio = transform.height / transform.width
      }
    } catch (error) {
      console.warn('[supabase-image-loader] Failed to parse supabaseTransform param:', error)
    }

    url.searchParams.delete('supabaseTransform')
  }

  const cleanedSrc = hasProtocol
    ? url.toString()
    : `${url.pathname}${url.search}${url.hash}` || url.pathname

  return { cleanedSrc, transform }
}

export default function supabaseImageLoader({ src, width, quality }: ImageLoaderProps) {
  const { cleanedSrc, transform } = parseTransform(src)
  const finalQuality = typeof transform.quality === 'number' ? transform.quality : quality ?? FALLBACK_QUALITY

  if (cleanedSrc.includes(SUPABASE_IDENTIFIER)) {
    const targetWidth = transform.width ? Math.min(width, transform.width) : width
    const targetHeight = typeof transform.aspectRatio === 'number'
      ? Math.round(targetWidth * transform.aspectRatio)
      : transform.height

    const options: ImageTransformOptions = {
      width: targetWidth,
      height: targetHeight,
      quality: finalQuality,
      resize: transform.resize ?? (targetHeight ? 'cover' : 'inside'),
    }

    if (transform.format) {
      options.format = transform.format
    }

    return optimizeSupabaseImage(cleanedSrc, options)
  }

  // External (non-Supabase) images — return unchanged. Appending width/quality breaks
  // WordPress and other CDNs (e.g. Titan Jet product photos).
  if (/^https?:\/\//.test(cleanedSrc)) {
    return cleanedSrc
  }

  return cleanedSrc
}
