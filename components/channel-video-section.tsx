import { VideoEmbed } from "@/components/video-embed"
import { getCachedChannelVideos } from "@/lib/youtube"
import { cn } from "@/lib/utils"

type Props = {
  /** How many videos to show */
  limit?: number
  /** Skip first N (e.g. show videos 2–3 with skip=1, limit=2) */
  skip?: number
  className?: string
}

/**
 * Server component: loads channel uploads via YouTube Data API and renders {@link VideoEmbed} cards.
 */
export async function ChannelVideoSection({
  limit = 2,
  skip = 0,
  className = "",
}: Props) {
  const videos = await getCachedChannelVideos()
  const items = videos.slice(skip, skip + limit)

  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn("grid md:grid-cols-2 gap-8 mb-8", className)}>
      {items.map((v) => (
        <VideoEmbed
          key={v.id}
          youtubeVideoId={v.id}
          title={v.title}
          description={v.description}
          duration={v.durationLabel}
          thumbnailUrl={v.thumbnailUrl}
        />
      ))}
    </div>
  )
}
