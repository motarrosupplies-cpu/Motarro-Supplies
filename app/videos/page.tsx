import Link from "next/link"
import { Film, Youtube, CheckCircle2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"
import { VideoObjectSchema } from "@/components/seo/schema-org"
import { VideoEmbed } from "@/components/video-embed"
import { getCachedChannelVideos, getYouTubeChannelPageUrl } from "@/lib/youtube"

export const metadata: Metadata = {
  title: "Video Gallery | Custom Printing Process Videos | MOTARRO Supplies Johannesburg",
  description:
    "Watch our custom printing process videos, design mockups, order packing, and customer testimonials. See how we create quality custom apparel in Johannesburg.",
  keywords: [
    "custom printing videos",
    "t-shirt printing process",
    "printing method videos",
    "motarro videos",
    "custom printing tutorials",
  ],
  alternates: {
    canonical: "/videos",
  },
}

/** Align with lib/youtube.ts cache so new uploads can appear within a few minutes. */
export const revalidate = 300

function schemaDescription(text: string, max = 500): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export default async function VideosPage() {
  const videos = await getCachedChannelVideos()
  const channelUrl = getYouTubeChannelPageUrl()

  return (
    <>
      {videos.map((video) => (
        <VideoObjectSchema
          key={video.id}
          name={video.title}
          description={schemaDescription(video.description)}
          thumbnailUrl={video.thumbnailUrl}
          contentUrl={video.watchUrl}
          uploadDate={video.publishedAt.slice(0, 10)}
          duration={video.durationIso}
          embedUrl={video.embedUrl}
        />
      ))}
      <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
        <div className="container px-4 py-12 mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Film className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
                Video Gallery
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Watch our latest videos from YouTube — custom printing, behind the
              scenes, and customer stories from Johannesburg.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Youtube className="w-4 h-4 inline mr-1" />
                From our YouTube channel
              </Badge>
              {channelUrl ? (
                <Button asChild variant="outline" size="sm">
                  <a href={channelUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Subscribe on YouTube
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          {videos.length === 0 ? (
            <Card className="mb-12 border-dashed">
              <CardHeader>
                <CardTitle>Videos coming soon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We could not load videos from YouTube yet. This usually means
                  the YouTube Data API is not configured for this deployment, or
                  the channel has no public uploads.
                </p>
                <p className="text-sm">
                  Add{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                    YOUTUBE_API_KEY
                  </code>{" "}
                  and either{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                    YOUTUBE_CHANNEL_ID
                  </code>{" "}
                  or{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                    YOUTUBE_CHANNEL_HANDLE
                  </code>{" "}
                  in your environment (e.g. Vercel project settings), then
                  redeploy.
                </p>
                {channelUrl ? (
                  <Button asChild>
                    <a href={channelUrl} target="_blank" rel="noopener noreferrer">
                      <Youtube className="w-4 h-4 mr-2" />
                      Watch our channel on YouTube
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="mb-12">
              <h2 className="text-2xl font-black mb-6">Latest videos</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <VideoEmbed
                    key={video.id}
                    youtubeVideoId={video.id}
                    title={video.title}
                    description={video.description}
                    duration={video.durationLabel}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                ))}
              </div>
            </div>
          )}

          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Video Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Process Videos
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    See how we create your custom apparel from start to finish.
                    Watch our printing process, quality control, and order
                    fulfillment.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Printing process walkthrough
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Design consultation process
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Quality control & packing
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-primary" />
                    Educational Videos
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn about different printing methods, design tips, and how
                    to choose the right option for your project.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Printing methods comparison
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Design file preparation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Choosing the right method
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Customer Stories
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hear from satisfied customers across Johannesburg about their
                    experience with MOTARRO Supplies and the results they achieved.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Corporate client testimonials
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      School & sports team stories
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Event organizer reviews
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-3xl font-black mb-4">
              Ready to Create Your Custom Apparel?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Watch our videos to learn more about our process, then contact us
              to get started on your custom printing project.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link href="/contact">Get Free Quote</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
