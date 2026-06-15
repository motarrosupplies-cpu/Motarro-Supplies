"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, ExternalLink, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlipbookPage } from "./FlipbookPage"
import type { GmbPost } from "@/lib/portfolio-data"

interface GmbPostSpreadProps {
  post: GmbPost
  /** Fallback link when post.url is missing (e.g. Google Maps place URL) */
  mapsLink?: string
}

export function GmbPostSpread({ post, mapsLink }: GmbPostSpreadProps) {
  const imageSrc = post.imageUrl?.trim()
  const externalHref = post.url?.trim() || mapsLink

  return (
    <FlipbookPage>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto md:gap-4">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              unoptimized={imageSrc.startsWith("http")}
            />
          ) : (
            <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-muted to-secondary/10 p-4">
              <Megaphone className="h-10 w-10 text-primary/70" aria-hidden />
              <span className="text-xs text-muted-foreground">From your Google Business profile</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Google Business update
          </span>
          <h2 className="text-lg font-bold leading-tight md:text-xl">{post.title}</h2>
          {post.publishedAt && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              {new Date(post.publishedAt).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <p className="line-clamp-5 text-sm text-muted-foreground">{post.excerpt}</p>
          {externalHref ? (
            <Button asChild variant="outline" size="sm" className="mt-auto w-full">
              <Link href={externalHref} target="_blank" rel="noopener noreferrer" className="gap-2">
                View on Google
                <ExternalLink className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </FlipbookPage>
  )
}
