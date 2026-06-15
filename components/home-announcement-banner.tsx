"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "motarro-home-announcement-dismissed"

const ANNOUNCEMENT_TEXT =
  "MOTARRO Supplies — premium stationery & craft supplies for South Africa. Shop plastic, paper, wooden, metal, acrylic, art supplies and more. Prices in Rands with nationwide delivery."

export function HomeAnnouncementBanner() {
  const [visible, setVisible] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        setVisible(false)
        return
      }
    } catch {
      /* private browsing */
    }
    setVisible(true)
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* ignore */
    }
  }

  if (visible !== true) return null

  return (
    <section
      className="relative border-b border-primary/10 bg-lavender"
      aria-label="Site announcement"
    >
      <div className="container relative mx-auto max-w-3xl px-10 py-3 text-center sm:px-12">
        <p className="text-sm text-muted-foreground md:text-base">{ANNOUNCEMENT_TEXT}</p>
        <button
          type="button"
          onClick={dismiss}
          className={cn(
            "absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full",
            "text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  )
}
