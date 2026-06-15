"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SWIPE_THRESHOLD = 50
const REDUCED_MOTION_MS = 0

interface FlipbookProps {
  children: React.ReactNode[]
  className?: string
  /** Optional: disable 3D flip and use instant/slide only (for prefers-reduced-motion) */
  reducedMotion?: boolean
}

export function Flipbook({ children, className, reducedMotion: reducedMotionProp }: FlipbookProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalPages = React.Children.count(children)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < totalPages - 1

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches || reducedMotionProp === true)
  }, [reducedMotionProp])

  const goPrev = useCallback(() => {
    if (!canGoPrev || isFlipping) return
    setIsFlipping(true)
    setCurrentIndex((i) => i - 1)
    setTimeout(() => setIsFlipping(false), reducedMotion ? REDUCED_MOTION_MS : 400)
  }, [canGoPrev, isFlipping, reducedMotion])

  const goNext = useCallback(() => {
    if (!canGoNext || isFlipping) return
    setIsFlipping(true)
    setCurrentIndex((i) => i + 1)
    setTimeout(() => setIsFlipping(false), reducedMotion ? REDUCED_MOTION_MS : 400)
  }, [canGoNext, isFlipping, reducedMotion])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goPrev, goNext])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) < SWIPE_THRESHOLD) return
    if (diff > 0) goNext()
    else goPrev()
  }

  return (
    <div className={cn("relative w-full overflow-hidden", className)} ref={containerRef}>
      {/* Sliding pages */}
      <div
        className="flex transition-transform ease-out will-change-transform"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transitionDuration: reducedMotion ? "0ms" : "400ms",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {React.Children.map(children, (child) => (
          <div className="w-full shrink-0 basis-full overflow-y-auto overflow-x-hidden">
            {child}
          </div>
        ))}
      </div>

      {/* Previous / Next buttons - min 44px tap target */}
      <div className="absolute inset-y-0 left-0 flex w-12 items-center justify-start md:w-20">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full opacity-80 hover:opacity-100 md:h-12 md:w-12"
          onClick={goPrev}
          disabled={!canGoPrev || isFlipping}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-0 flex w-12 items-center justify-end md:w-20">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full opacity-80 hover:opacity-100 md:h-12 md:w-12"
          onClick={goNext}
          disabled={!canGoNext || isFlipping}
          aria-label="Next page"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Page dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 pt-4 pb-2" aria-hidden>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "h-2 w-2 rounded-full transition-colors min-w-[8px] min-h-[8px]",
                i === currentIndex ? "bg-primary scale-125" : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
              )}
              aria-label={`Go to page ${i + 1}`}
              onClick={() => {
                if (!isFlipping) setCurrentIndex(i)
              }}
            />
          ))}
        </div>
      )}

      {/* Page counter for screen readers */}
      <p className="sr-only" aria-live="polite">
        Page {currentIndex + 1} of {totalPages}
      </p>
    </div>
  )
}
