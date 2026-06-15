"use client"

import Image, { ImageProps } from "next/image"
import { useMemo, useState } from "react"
import type { ImageTransformOptions } from "@/lib/image-utils"

interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string
  alt: string
  /**
   * Optional explicit Supabase transformation overrides.
   * Useful when the rendered width differs from the provided width prop (e.g. when using `fill`).
   */
  supabaseTransform?: Pick<ImageTransformOptions, "width" | "height" | "quality" | "format" | "resize">
}

const SUPABASE_URL_IDENTIFIER = "supabase.co/storage/v1/object/public/"
const PLACEHOLDER_BASE_URL = "https://placeholder.local"

function isSupabaseStorageUrl(src: string): boolean {
  return src.includes(SUPABASE_URL_IDENTIFIER)
}

function isExternalProductImage(src: string): boolean {
  return /^https?:\/\//i.test(src) && !isSupabaseStorageUrl(src)
}

function createTransformParam(
  src: string,
  transform: ImageTransformOptions | undefined
) {
  if (!src.includes(SUPABASE_URL_IDENTIFIER) || !transform) {
    return src
  }

  const hasProtocol = /^https?:\/\//.test(src)
  const url = new URL(hasProtocol ? src : `${PLACEHOLDER_BASE_URL}${src}`)
  const sanitizedEntries = Object.entries(transform).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  )

  if (sanitizedEntries.length === 0) {
    return src
  }

  url.searchParams.set(
    "supabaseTransform",
    JSON.stringify(Object.fromEntries(sanitizedEntries))
  )

  const finalUrl = url.toString()

  if (hasProtocol) {
    return finalUrl
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function OptimizedImage({
  src,
  alt,
  quality = 80,
  width,
  height,
  fill,
  supabaseTransform,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  const transformOptions = useMemo<ImageTransformOptions | undefined>(() => {
    if (!isSupabaseStorageUrl(src)) {
      return supabaseTransform
    }

    const transform: ImageTransformOptions = {
      ...supabaseTransform,
    }

    if (quality && transform.quality === undefined) {
      transform.quality = quality
    }

    if (fill && transform.resize === undefined) {
      transform.resize = "cover"
    }

    return transform
  }, [fill, quality, src, supabaseTransform])

  const finalSrc = useMemo(() => {
    if (imageError || useFallback) {
      // Fallback to original URL without transformations
      return src
    }
    return createTransformParam(src, transformOptions)
  }, [imageError, useFallback, src, transformOptions])

  const handleError = () => {
    // If render endpoint fails, fall back to regular object/public endpoint
    if (src.includes('supabase.co/storage/v1/object/public/') && !useFallback) {
      setUseFallback(true)
    } else {
      setImageError(true)
    }
  }

  return (
    <Image
      {...props}
      src={imageError ? "/placeholder.svg" : finalSrc}
      alt={alt}
      quality={quality}
      width={width}
      height={height}
      fill={fill}
      unoptimized={isExternalProductImage(src)}
      onError={handleError}
    />
  )
}

// Preset components for common use cases
export function HeroImage({ src, alt, supabaseTransform, ...props }: Omit<OptimizedImageProps, "preset">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      quality={supabaseTransform?.quality ?? 70}
      supabaseTransform={{ width: 1920, ...supabaseTransform }}
      {...props}
    />
  )
}

export function ProductThumbnail({ src, alt, supabaseTransform, ...props }: Omit<OptimizedImageProps, "preset">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      quality={supabaseTransform?.quality ?? 80}
      supabaseTransform={{ width: 400, height: 400, resize: "cover", ...supabaseTransform }}
      {...props}
    />
  )
}

export function ProductDetailImage({ src, alt, supabaseTransform, ...props }: Omit<OptimizedImageProps, "preset">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      quality={supabaseTransform?.quality ?? 90}
      supabaseTransform={{ width: 1200, height: 1200, resize: "cover", ...supabaseTransform }}
      {...props}
    />
  )
}

export function CategoryBanner({ src, alt, supabaseTransform, ...props }: Omit<OptimizedImageProps, "preset">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      quality={supabaseTransform?.quality ?? 85}
      supabaseTransform={{ width: 1200, resize: "cover", ...supabaseTransform }}
      {...props}
    />
  )
}
