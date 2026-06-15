"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FlipbookPage } from "./FlipbookPage"
import type { AtAGlanceStats } from "@/lib/portfolio-data"
import { atAGlanceTagline, atAGlanceDescription } from "@/lib/portfolio-data"

interface AtAGlanceSpreadProps {
  stats: AtAGlanceStats
  /** Optional hero image path (placeholder if none) */
  heroImage?: string
  /** If true, show second spread with stats only */
  statsOnly?: boolean
}

const statGridClass =
  "grid w-full max-w-4xl gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,9.5rem),1fr))]"

const statCardClass =
  "flex min-h-[4.75rem] min-w-0 flex-col items-center justify-center rounded-lg border bg-muted/50 px-2 py-3 text-center sm:min-h-0 sm:px-3 sm:py-4"

const statValueClass =
  "max-w-full break-words text-2xl font-black leading-none tracking-tight text-primary tabular-nums sm:text-3xl"

const statValueHeroClass =
  "max-w-full break-words text-lg font-black leading-none tracking-tight text-primary tabular-nums sm:text-2xl md:text-3xl"

const statLabelClass =
  "mt-2 w-full text-pretty text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs md:text-sm"

export function AtAGlanceSpread({ stats, heroImage = "/placeholder.jpg", statsOnly }: AtAGlanceSpreadProps) {
  if (statsOnly) {
    return (
      <FlipbookPage>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <h2 className="text-2xl font-bold text-primary md:text-3xl">MOTARRO Supplies at a Glance</h2>
          <p className="text-muted-foreground max-w-md text-sm md:text-base">{atAGlanceDescription}</p>
          <div className={statGridClass}>
            {stats.highlights.map((h) => (
              <div key={h.label} className={statCardClass}>
                <div className={statValueClass}>{h.value}</div>
                <div className={statLabelClass}>{h.label}</div>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="mt-4">
            <Link href="/contact">Get a quote</Link>
          </Button>
        </div>
      </FlipbookPage>
    )
  }

  return (
    <FlipbookPage>
      <div className="flex flex-1 flex-col gap-4 md:gap-6">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-muted">
          <Image
            src={heroImage}
            alt="MOTARRO Supplies — Custom apparel and printing"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <h2 className="text-xl font-bold text-primary md:text-2xl">MOTARRO Supplies at a Glance</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{atAGlanceTagline}</p>
          <div className={`mt-4 ${statGridClass}`}>
            {stats.highlights.map((h) => (
              <div key={h.label} className={statCardClass}>
                <div className={statValueHeroClass}>{h.value}</div>
                <div className={statLabelClass}>{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FlipbookPage>
  )
}
