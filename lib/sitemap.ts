import type { MetadataRoute } from "next"
import type { SupabaseClient } from "@supabase/supabase-js"

import { MOTARRO_CATEGORIES } from "@/lib/motarro/categories"

const baseUrl = "https://www.motarro.co.za"

// Prefer service role for sitemap generation (full catalog, bypasses RLS).
async function getSitemapSupabaseClient(): Promise<SupabaseClient | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return null
    }

    const { supabaseAdmin, supabase } = await import("@/lib/supabaseClient")

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseAdmin) {
      try {
        if (typeof supabaseAdmin.from === "function") {
          return supabaseAdmin as SupabaseClient
        }
      } catch {
        // fall through to anon
      }
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null
    }

    try {
      if (supabase && typeof supabase.from === "function") {
        return supabase as SupabaseClient
      }
    } catch {
      return null
    }

    return supabase as SupabaseClient
  } catch {
    return null
  }
}

// Keep in sync with app/**/page.tsx – only include paths that have a corresponding page
const staticRoutes: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  ...MOTARRO_CATEGORIES.map((cat) => ({
    path: `/shop/${cat.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  })),
  { path: "/sale", changeFrequency: "daily", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shipping", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.4 },
  { path: "/blog", changeFrequency: "daily", priority: 0.7 },
  { path: "/business-info", changeFrequency: "monthly", priority: 0.4 },
  { path: "/help", changeFrequency: "monthly", priority: 0.3 },
]

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // Get Supabase client once and reuse for all queries (optimization)
  let supabase: SupabaseClient | null = null
  try {
    supabase = await getSitemapSupabaseClient()
  } catch (error) {
    console.warn('Failed to initialize Supabase client for sitemap:', error)
  }

  // Try to fetch products, but don't fail if it errors
  if (supabase) {
    try {
      const { data: products, error: productsError } = await supabase
        .from("all_products_unified")
        .select("id, updated_at, category, status")

      if (!productsError && products) {
        for (const product of products) {
          if (product.status !== "active" || !product.id) continue
          const category = (product.category || "").toLowerCase().trim()
          if (category === "custom printing") continue
          const path = `/products/${(product as { slug?: string; seoSlug?: string }).slug || (product as { seoSlug?: string }).seoSlug || product.id}`

          entries.push({
            url: `${baseUrl}${path}`,
            lastModified: product.updated_at
              ? new Date(product.updated_at)
              : now,
            changeFrequency: "weekly",
            priority: 0.8,
          })
        }
      }
    } catch (queryError) {
      // Query failed - continue without products
      console.warn('Supabase query failed for products:', queryError)
    }
  }

  // Try to fetch blog posts, but don't fail if it errors
  if (supabase) {
    try {
      const { data: blogPosts, error: blogError } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, status")

      if (!blogError && blogPosts) {
        for (const post of blogPosts) {
          if (post.status !== "published" || !post.slug) continue
          entries.push({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updated_at
              ? new Date(post.updated_at)
              : now,
            changeFrequency: "weekly",
            priority: 0.6,
          })
        }
      }
    } catch (queryError) {
      // Query failed - continue without blog posts
      console.warn('Supabase query failed for blog posts:', queryError)
    }
  }

  return entries
}

