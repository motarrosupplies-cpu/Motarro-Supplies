"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

/** Shown once per browser; bump version if copy or timing changes. */
const STORAGE_KEY = "motarro-custom-mockup-preview-toast-v2"
const DELAY_MS = 3000

export function MockupPreviewAnnouncement() {
  const pathname = usePathname()

  useEffect(() => {
    const path = (pathname ?? "").toLowerCase()
    if (!path.startsWith("/custom-printing")) return

    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      /* private browsing */
    }

    const timer = window.setTimeout(() => {
      toast("New: Custom mockup preview", {
        description:
          "Upload your designs on any custom printing product, then use Create mockup preview to place artwork, text, and colours on a 3D T-shirt or hoodie before you order.",
        duration: 14000,
        important: true,
      })
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()))
      } catch {
        /* ignore */
      }
    }, DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [pathname])

  return null
}
