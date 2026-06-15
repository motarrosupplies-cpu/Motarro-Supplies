"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface VideoEmbedProps {
  /** YouTube video id (e.g. from watch URL ?v=...) */
  youtubeVideoId: string
  title: string
  description: string
  thumbnailUrl?: string
  duration?: string
  className?: string
}

export function VideoEmbed({
  youtubeVideoId,
  title,
  description,
  thumbnailUrl,
  duration,
  className = "",
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const [theaterOpen, setTheaterOpen] = useState(false)
  const thumb =
    thumbnailUrl?.trim() ||
    `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`

  return (
    <Card
      className={`shadow-lg border-0 group hover:shadow-xl transition ${className}`}
      id={`v-${youtubeVideoId}`}
    >
      {/* overflow-hidden only here so rounded video corners work; Card overflow was clipping the button row */}
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition hover:bg-primary shadow-lg"
                aria-label={`Play ${title}`}
              >
                <Play className="w-10 h-10 text-white ml-1" />
              </button>
            </div>
            {duration ? (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                {duration}
              </div>
            ) : null}
          </>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        {/* Stacked: nowrap buttons + narrow grid columns caused horizontal overflow and clipping */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center"
            onClick={() => setTheaterOpen(true)}
          >
            <Play className="w-4 h-4 mr-2 shrink-0" />
            Video on this page
          </Button>
          <Button asChild variant="secondary" className="w-full justify-center">
            <a
              href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on YouTube
            </a>
          </Button>
        </div>
      </CardContent>

      <Dialog open={theaterOpen} onOpenChange={setTheaterOpen}>
        <DialogContent className="max-h-[min(90vh,900px)] w-[min(100vw-1.5rem,56rem)] max-w-[min(100vw-1.5rem,56rem)] gap-0 overflow-hidden border-0 bg-background p-0 shadow-2xl sm:rounded-xl [&>button]:right-3 [&>button]:top-3 [&>button]:z-10 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:hover:text-white [&>button]:focus:ring-white/50">
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Video player. Press Escape or close to exit.
            </DialogDescription>
          </DialogHeader>
          <div className="relative bg-black">
            <div className="relative aspect-video w-full">
              {theaterOpen ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : null}
            </div>
          </div>
          <div className="border-t bg-background px-4 py-3">
            <p className="text-left text-sm font-medium leading-snug text-foreground line-clamp-2">
              {title}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
