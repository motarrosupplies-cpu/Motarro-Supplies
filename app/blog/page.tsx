import { Metadata } from "next"
import BlogPageClient from "./BlogPageClient"

import { MOTARRO_BRAND_NAME, MOTARRO_SITE_URL, MOTARRO_TAGLINE } from "@/lib/brand"

export const metadata: Metadata = {
  title: `Blog | Stationery & Craft Insights | ${MOTARRO_BRAND_NAME}`,
  description:
    "Tips, inspiration, and guides for stationery, craft projects, classroom supplies, and creative learning from MOTARRO Supplies South Africa.",
  keywords: [
    "motarro blog",
    "stationery blog south africa",
    "craft supplies tips",
    "school supplies ideas",
    "art supplies guides",
    "classroom organisation",
    "creative learning",
    "motarro stationery",
  ],
  openGraph: {
    title: `Blog | Stationery & Craft Insights | ${MOTARRO_BRAND_NAME}`,
    description:
      "Stationery, craft, and education insights from MOTARRO Supplies — unleash your imagination.",
    url: `${MOTARRO_SITE_URL}/blog`,
    type: "website",
    locale: "en_ZA"
  },
  alternates: {
    canonical: "/blog"
  }
}

export default function BlogPage() {
  return (
    <>
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-4">
          Blog – Stationery &amp; Craft Insights
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          {MOTARRO_TAGLINE}. Explore ideas for classrooms, crafters, and creative projects with MOTARRO Supplies — your guide to quality stationery and craft materials across South Africa.
        </p>
        <p className="text-muted-foreground mb-8">
          From art supplies and EVA foam crafts to classroom organisation and product guides, our blog helps you get the most from the MOTARRO catalogue.
        </p>
      </div>
      <BlogPageClient />
    </>
  )
}
