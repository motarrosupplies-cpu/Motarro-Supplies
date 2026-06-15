import type { AtAGlanceStats } from "@/lib/portfolio-data"
import type { GooglePlaceSnapshot } from "@/lib/google-place"

/** Fills “Google rating” and “Google reviews” rows when Places data is available. */
export function mergeAtAGlanceWithGoogle(
  base: AtAGlanceStats,
  snapshot: GooglePlaceSnapshot | null
): AtAGlanceStats {
  const highlights = base.highlights.map((h) => ({ ...h }))
  if (!snapshot) return { highlights }

  const ratingIdx = highlights.findIndex((h) => h.label === "Google rating")
  const countIdx = highlights.findIndex((h) => h.label === "Google reviews")
  if (ratingIdx >= 0) {
    highlights[ratingIdx] = { value: snapshot.rating.toFixed(1), label: "Google rating" }
  }
  if (countIdx >= 0) {
    highlights[countIdx] = { value: String(snapshot.userRatingCount), label: "Google reviews" }
  }
  return { highlights }
}
