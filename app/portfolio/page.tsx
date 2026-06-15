import type { Metadata } from "next"
import PortfolioFlipbookClient from "./PortfolioFlipbookClient"

export const metadata: Metadata = {
  title: "Portfolio | MOTARRO Supplies – Custom Apparel & Printing | Reviews & Blog",
  description:
    "Flip through MOTARRO Supplies at a glance, blog highlights, and real Google reviews. Custom printing across South Africa.",
  keywords: [
    "portfolio",
    "custom printing portfolio",
    "Google reviews",
    "MOTARRO Supplies blog",
    "apparel printing Johannesburg",
  ],
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: "Portfolio | MOTARRO Supplies – Custom Apparel & Printing",
    description:
      "Google reviews, blog highlights, and business updates. Custom apparel and printing across South Africa.",
    url: "/portfolio",
  },
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-6 md:py-10">
      <div className="container mx-auto px-2 sm:px-4">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-black tracking-tight text-primary md:text-4xl">
            Our Portfolio
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Real Google reviews, articles from our blog, and verified stats—flip through to see what
            customers and our team share.
          </p>
        </header>
        <PortfolioFlipbookClient />
      </div>
    </div>
  )
}
