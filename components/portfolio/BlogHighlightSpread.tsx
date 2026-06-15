"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlipbookPage } from "./FlipbookPage"

export interface BlogPostForPortfolio {
  id: string
  title: string
  excerpt: string
  slug: string
  category?: string
  publish_date?: string
  images?: string[]
  image_url?: string
}

interface BlogHighlightSpreadProps {
  post: BlogPostForPortfolio
}

function getFirstImage(post: BlogPostForPortfolio): string {
  if (post.images?.length && post.images[0]) return post.images[0]
  if (post.image_url) return post.image_url
  return "/placeholder.jpg"
}

export function BlogHighlightSpread({ post }: BlogHighlightSpreadProps) {
  const imageSrc = getFirstImage(post)

  return (
    <FlipbookPage>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto md:gap-4">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={imageSrc}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            unoptimized={imageSrc.startsWith("http")}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {post.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {post.category}
            </span>
          )}
          <h2 className="text-lg font-bold leading-tight md:text-xl">{post.title}</h2>
          {post.publish_date && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              {new Date(post.publish_date).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <p className="line-clamp-4 text-sm text-muted-foreground">{post.excerpt}</p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-auto h-auto min-h-9 w-full max-w-full justify-start whitespace-normal px-3 py-2 text-left [&_svg]:shrink-0"
          >
            <Link
              href={`/blog/${post.slug}`}
              aria-label={`Read blog post: ${post.title}`}
              className="inline-flex items-start gap-1.5 break-words"
            >
              <span className="min-w-0">Read: {post.title}</span>
              <ArrowRight className="ml-0 mt-0.5 h-4 w-4 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </FlipbookPage>
  )
}
