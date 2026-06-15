"use client"

import { cn } from "@/lib/utils"

interface FlipbookPageProps {
  children: React.ReactNode
  className?: string
}

export function FlipbookPage({ children, className }: FlipbookPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full shrink-0 flex-col rounded-lg border border-border bg-background p-4 shadow-lg md:min-h-[70vh] md:p-6",
        "touch-manipulation select-none",
        className
      )}
      style={{ touchAction: "pan-y" }}
    >
      {children}
    </div>
  )
}
