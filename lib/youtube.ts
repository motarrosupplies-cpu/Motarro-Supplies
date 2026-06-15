import "server-only"
import { unstable_cache } from "next/cache"

/** Public channel page URL for “Subscribe” / footer links (optional). */
export function getYouTubeChannelPageUrl(): string | undefined {
  const u = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL?.trim()
  return u || undefined
}

export type ChannelVideo = {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: string
  /** ISO 8601 duration e.g. PT3M45S (for schema.org) */
  durationIso: string
  /** Human-readable e.g. 3:45 */
  durationLabel: string
  watchUrl: string
  embedUrl: string
}

const YT_API = "https://www.googleapis.com/youtube/v3"

/** Do not use fetch() revalidate here — Next caches HTTP responses separately from unstable_cache, which hid new uploads for up to an hour. */
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`YouTube API ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

function parseIso8601Duration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return ""
  const h = m[1] ? parseInt(m[1], 10) : 0
  const min = m[2] ? parseInt(m[2], 10) : 0
  const s = m[3] ? parseInt(m[3], 10) : 0
  if (h > 0) {
    return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }
  return `${min}:${String(s).padStart(2, "0")}`
}

function pickThumbnail(snippet: {
  thumbnails?: Record<string, { url?: string }>
}): string {
  const t = snippet.thumbnails
  if (!t) return ""
  return (
    t.maxres?.url ||
    t.high?.url ||
    t.medium?.url ||
    t.default?.url ||
    ""
  )
}

type PlaylistEntry = {
  videoId: string
  title: string
  description: string
  publishedAt: string
  thumbnails: Record<string, { url?: string }>
}

type VideoResource = {
  id: string
  snippet?: {
    title?: string
    description?: string
    publishedAt?: string
    thumbnails?: Record<string, { url?: string }>
  }
  contentDetails?: { duration?: string }
}

async function resolveUploadsPlaylistId(apiKey: string): Promise<string | null> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim()
  const handleRaw = process.env.YOUTUBE_CHANNEL_HANDLE?.trim()

  if (channelId) {
    const url = `${YT_API}/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`
    const data = await fetchJson<{
      items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>
    }>(url)
    return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null
  }

  if (handleRaw) {
    const handle = handleRaw.replace(/^@/, "")
    const url = `${YT_API}/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(apiKey)}`
    const data = await fetchJson<{
      items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>
    }>(url)
    return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null
  }

  return null
}

/**
 * Uploads playlist order (newest first). Includes regular uploads and Shorts.
 */
async function fetchUploadPlaylistEntries(
  apiKey: string,
  playlistId: string,
  maxTotal: number
): Promise<PlaylistEntry[]> {
  const entries: PlaylistEntry[] = []
  let pageToken: string | undefined

  while (entries.length < maxTotal) {
    const pageSize = Math.min(50, maxTotal - entries.length)
    const u = new URL(`${YT_API}/playlistItems`)
    u.searchParams.set("part", "snippet")
    u.searchParams.set("playlistId", playlistId)
    u.searchParams.set("maxResults", String(pageSize))
    u.searchParams.set("key", apiKey)
    if (pageToken) u.searchParams.set("pageToken", pageToken)

    const data = await fetchJson<{
      nextPageToken?: string
      items?: Array<{
        snippet?: {
          publishedAt?: string
          title?: string
          description?: string
          thumbnails?: Record<string, { url?: string }>
          resourceId?: { videoId?: string }
        }
      }>
    }>(u.toString())

    for (const it of data.items ?? []) {
      const vid = it.snippet?.resourceId?.videoId
      if (!vid) continue
      entries.push({
        videoId: vid,
        title: it.snippet?.title ?? "Video",
        description: (it.snippet?.description ?? "").trim(),
        publishedAt: it.snippet?.publishedAt ?? "",
        thumbnails: it.snippet?.thumbnails ?? {},
      })
      if (entries.length >= maxTotal) break
    }
    pageToken = data.nextPageToken
    if (!pageToken) break
  }

  return entries
}

async function fetchVideosDetailsMap(
  apiKey: string,
  videoIds: string[]
): Promise<Map<string, VideoResource>> {
  const map = new Map<string, VideoResource>()
  if (videoIds.length === 0) return map

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const u = new URL(`${YT_API}/videos`)
    u.searchParams.set("part", "snippet,contentDetails")
    u.searchParams.set("id", batch.join(","))
    u.searchParams.set("key", apiKey)

    const data = await fetchJson<{ items?: VideoResource[] }>(u.toString())
    for (const v of data.items ?? []) {
      map.set(v.id, v)
    }
  }

  return map
}

function channelVideoFromParts(
  videoId: string,
  pl: PlaylistEntry,
  api?: VideoResource
): ChannelVideo {
  if (api) {
    const dur = api.contentDetails?.duration ?? "PT0S"
    const snippet = api.snippet ?? {}
    const thumb =
      pickThumbnail(snippet) ||
      pickThumbnail(pl) ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    return {
      id: videoId,
      title: snippet.title ?? pl.title,
      description: (snippet.description ?? pl.description).trim(),
      thumbnailUrl: thumb,
      publishedAt: snippet.publishedAt ?? pl.publishedAt,
      durationIso: dur,
      durationLabel: parseIso8601Duration(dur),
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    }
  }

  const thumb =
    pickThumbnail(pl) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  return {
    id: videoId,
    title: pl.title,
    description: pl.description,
    thumbnailUrl: thumb,
    publishedAt: pl.publishedAt,
    durationIso: "PT0S",
    durationLabel: "",
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
  }
}

/**
 * Merge uploads playlist order with videos.list. If a video is still processing,
 * videos.list may omit it — we still show it using playlist snippet data.
 */
function mergePlaylistWithDetails(
  ordered: PlaylistEntry[],
  details: Map<string, VideoResource>
): ChannelVideo[] {
  return ordered.map((pl) =>
    channelVideoFromParts(pl.videoId, pl, details.get(pl.videoId))
  )
}

/**
 * Fetches recent uploads from your channel (YouTube Data API v3).
 * Env: YOUTUBE_API_KEY, and either YOUTUBE_CHANNEL_ID or YOUTUBE_CHANNEL_HANDLE (with or without @).
 * Optional: YOUTUBE_MAX_VIDEOS (default 24).
 */
export async function fetchChannelVideos(): Promise<ChannelVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[youtube] YOUTUBE_API_KEY is not set — video section will be empty until configured."
      )
    }
    return []
  }

  const max = Math.min(
    50,
    Math.max(1, parseInt(process.env.YOUTUBE_MAX_VIDEOS ?? "24", 10) || 24)
  )

  try {
    const uploadsPlaylistId = await resolveUploadsPlaylistId(apiKey)
    if (!uploadsPlaylistId) {
      console.error(
        "[youtube] Could not resolve uploads playlist. Set YOUTUBE_CHANNEL_ID or YOUTUBE_CHANNEL_HANDLE."
      )
      return []
    }

    const entries = await fetchUploadPlaylistEntries(
      apiKey,
      uploadsPlaylistId,
      max
    )
    const ids = entries.map((e) => e.videoId)
    const detailsMap = await fetchVideosDetailsMap(apiKey, ids)
    return mergePlaylistWithDetails(entries, detailsMap)
  } catch (e) {
    console.error("[youtube] fetchChannelVideos failed:", e)
    return []
  }
}

const CACHE_SECONDS = Math.min(
  86400,
  Math.max(
    60,
    parseInt(process.env.YOUTUBE_CACHE_SECONDS ?? "300", 10) || 300
  )
)

export const getCachedChannelVideos = unstable_cache(
  async () => fetchChannelVideos(),
  ["youtube-channel-videos-v3"],
  { revalidate: CACHE_SECONDS }
)
