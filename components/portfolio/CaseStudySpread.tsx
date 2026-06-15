"use client"

import Image from "next/image"
import { CheckCircle2, Star, Users } from "lucide-react"
import { FlipbookPage } from "./FlipbookPage"
import type { CaseStudy } from "@/lib/portfolio-data"

interface CaseStudySpreadProps {
  study: CaseStudy
  index: number
}

export function CaseStudySpread({ study, index }: CaseStudySpreadProps) {
  const metricEntries = Object.entries(study.metrics).slice(0, 4)

  return (
    <FlipbookPage>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto md:gap-4">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={study.image}
            alt={study.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Case Study #{index + 1}</span>
          <h2 className="text-lg font-bold leading-tight md:text-xl">{study.title}</h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            {study.client} · {study.industry}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">{study.challenge}</p>
          <ul className="space-y-1 text-sm">
            {study.results.slice(0, 3).map((result, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{result}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            {metricEntries.map(([key, value]) => (
              <span
                key={key}
                className="rounded bg-muted px-2 py-1 text-xs font-medium text-foreground"
              >
                {String(value)}
              </span>
            ))}
          </div>
          <div className="mt-auto border-t pt-3">
            <p className="text-xs italic text-muted-foreground line-clamp-2">"{study.testimonial.quote}"</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium">
              {[...Array(study.testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              {study.testimonial.author}
            </p>
          </div>
        </div>
      </div>
    </FlipbookPage>
  )
}
